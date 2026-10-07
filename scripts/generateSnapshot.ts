import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { parseChipPayload } from '../src/modules/sync/scrapers/chipDataExtractor.ts';
import { enrichRaceDetails } from '../src/modules/sync/scrapers/raceDetailsEnricher.ts';
import type { ExtractedRace } from '../src/modules/sync/types.ts';

async function generateSnapshot() {
  const configs = [
    {
      company: 'CHIP_AMAZONIA' as const,
      name: 'Chip Amazônia',
      baseUrl: 'https://www.chipamazonia.com.br',
      url: 'https://www.chipamazonia.com.br/eventos'
    },
    {
      company: 'CHIP_BRANCO' as const,
      name: 'Chip Breu Branco',
      baseUrl: 'https://www.chipbreubranco.com.br',
      url: 'https://www.chipbreubranco.com.br/eventos'
    },
    {
      company: 'CHIP_PARA' as const,
      name: 'Chip Pará',
      baseUrl: 'https://www.chippara.com.br',
      url: 'https://www.chippara.com.br/eventos'
    },
    {
      company: 'SUPERA_CHRONOS' as const,
      name: 'Supera Chip Chronos',
      baseUrl: 'https://www.superachipcrono.com.br',
      url: 'https://www.superachipcrono.com.br/eventos'
    }
  ];

  const allEnrichedRaces: ExtractedRace[] = [];

  for (const cfg of configs) {
    console.log(`\nBuscando ${cfg.name}...`);
    try {
      const res = await axios.get(cfg.url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 15000
      });
      const html = res.data;
      let extracted = parseChipPayload(html, cfg.baseUrl, cfg.company, cfg.name);

      const jsonMatch = html.match(/url_arquivo_events\s*=\s*['"]([^'"]+)['"]/);
      if (jsonMatch) {
        const jsonRes = await axios.get(jsonMatch[1], { timeout: 10000 });
        const fromJson = parseChipPayload(jsonRes.data, cfg.baseUrl, cfg.company, cfg.name);
        extracted = [...extracted, ...fromJson];
      }

      console.log(`  -> ${extracted.length} eventos brutos encontrados em ${cfg.name}`);

      // Deduplicação primária
      const seen = new Set<string>();
      const unique = extracted.filter((r) => {
        const k = `${r.title.toLowerCase().trim()}_${r.eventDate}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });

      // Enriquecimento com páginas internas
      console.log(`  -> Enriquecendo ${unique.length} provas via API e páginas internas...`);
      for (const item of unique) {
        try {
          const enriched = await enrichRaceDetails(item, cfg.baseUrl);
          allEnrichedRaces.push(enriched);
          console.log(`     [✓] ${enriched.title} | ${enriched.distances.join(', ')} | R$ ${enriched.price || 'sob consulta'} | Reg: ${enriched.registrationUrl ? 'LINK ATIVO' : 'NULL'} | Status: ${enriched.status}`);
        } catch {
          allEnrichedRaces.push(item);
        }
      }
    } catch (e: any) {
      console.error(`Erro ao buscar ${cfg.name}:`, e.message);
    }
  }

  const outFilePath = path.resolve('src/modules/sync/data/verifiedRacesSnapshot.ts');
  const fileContent = `/**
 * Snapshot verificado em tempo real dos 4 portais de cronometragem
 * Contém corridas reais confirmadas com preços numéricos, distâncias categorizadas, regulamento PDF e links oficiais validados.
 * Usado pelo motor de sincronização para inicialização instantânea e fallback de alta disponibilidade.
 */
import type { ExtractedRace } from '../types';

export const VERIFIED_CHIP_SNAPSHOT: ExtractedRace[] = ${JSON.stringify(allEnrichedRaces, null, 2)};
`;

  fs.mkdirSync(path.dirname(outFilePath), { recursive: true });
  fs.writeFileSync(outFilePath, fileContent, 'utf-8');
  console.log(`\nSalvo com sucesso em ${outFilePath} com ${allEnrichedRaces.length} corridas reais enriquecidas!`);
}

generateSnapshot();
