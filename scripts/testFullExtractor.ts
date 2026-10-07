import axios from 'axios';
import { parseChipPayload } from '../src/modules/sync/scrapers/chipDataExtractor.ts';

async function testAll() {
  const configs = [
    {
      company: 'CHIP_AMAZONIA',
      name: 'Chip Amazônia',
      baseUrl: 'https://www.chipamazonia.com.br',
      url: 'https://www.chipamazonia.com.br/eventos'
    },
    {
      company: 'CHIP_BRANCO',
      name: 'Chip Breu Branco',
      baseUrl: 'https://www.chipbreubranco.com.br',
      url: 'https://www.chipbreubranco.com.br/eventos'
    },
    {
      company: 'CHIP_PARA',
      name: 'Chip Pará',
      baseUrl: 'https://www.chippara.com.br',
      url: 'https://www.chippara.com.br/eventos'
    },
    {
      company: 'SUPERA_CHRONOS',
      name: 'Supera Chip Chronos',
      baseUrl: 'https://www.superachipcrono.com.br',
      url: 'https://www.superachipcrono.com.br/eventos'
    }
  ];

  for (const cfg of configs) {
    console.log(`\n=================== ${cfg.name} ===================`);
    try {
      const res = await axios.get(cfg.url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 15000
      });
      const html = res.data;

      let extracted = parseChipPayload(html, cfg.baseUrl, cfg.company, cfg.name);

      const jsonMatch = html.match(/url_arquivo_events\s*=\s*['"]([^'"]+)['"]/);
      if (jsonMatch) {
        console.log(`Found JSON endpoint: ${jsonMatch[1]}`);
        const jsonRes = await axios.get(jsonMatch[1], { timeout: 10000 });
        const fromJson = parseChipPayload(jsonRes.data, cfg.baseUrl, cfg.company, cfg.name);
        extracted = [...extracted, ...fromJson];
      }

      console.log(`Total extraído de ${cfg.name}: ${extracted.length}`);
      extracted.forEach((r, i) => {
        console.log(`  [${i + 1}] "${r.title}" | ${r.eventDate} | ${r.city}/PA | ${r.status} | Link: ${r.registrationUrl}`);
      });
    } catch (e) {
      console.error(`Erro em ${cfg.name}:`, e.message);
    }
  }
}

testAll();
