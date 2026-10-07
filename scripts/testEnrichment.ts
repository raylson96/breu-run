import axios from 'axios';
import { 
  isValidRegistrationUrl, 
  extractDistances, 
  extractPrice, 
  extractRegulationUrl 
} from '../src/modules/sync/utils/parsingHelpers.ts';

async function testEnrichment() {
  const sampleRaces = [
    {
      title: 'Corrida De Rua Nova Ipixuna Run 33 Anos',
      eventDate: '2026-10-11',
      baseUrl: 'https://www.chipbreubranco.com.br',
      eveId: 291,
      relativeUrl: 'evento/2026/corrida-de-rua/corrida-de-rua-nova-ipixuna-run-33-anos'
    },
    {
      title: '2º Corrida Rosa Pink 2026',
      eventDate: '2026-03-22',
      baseUrl: 'https://www.chipamazonia.com.br',
      eveId: 2,
      relativeUrl: 'evento/2026/corrida-de-rua/2-corridarosapink2026'
    },
    {
      title: '1ª Corrida Do Amor Em Prol Da Vida',
      eventDate: '2026-11-22',
      baseUrl: 'https://www.chippara.com.br',
      eveId: 9,
      relativeUrl: 'evento/1682/1-corrida-do-amor-em-prol-da-vida'
    },
    {
      title: '1° Corrida Satlinkplay',
      eventDate: '2026-10-18',
      baseUrl: 'https://www.superachipcrono.com.br',
      eveId: 267,
      relativeUrl: 'evento/5800/1-corrida-satlinkplay'
    }
  ];

  for (const item of sampleRaces) {
    console.log(`\n=================== Testando: ${item.title} ===================`);
    let details: any = null;

    // 1. Tenta API oficial
    try {
      const apiUrl = `${item.baseUrl}/api_evento.php?id=${item.eveId}`;
      const res = await axios.get(apiUrl, { timeout: 8000, validateStatus: () => true });
      if (res.status === 200 && typeof res.data === 'object') {
        details = res.data;
      }
    } catch {
      // continua
    }

    if (!details && item.relativeUrl) {
      try {
        const slug = item.relativeUrl.replace(/^evento\//, '');
        const apiUrl = `${item.baseUrl}/api_evento.php?url=${encodeURIComponent(slug)}`;
        const res = await axios.get(apiUrl, { timeout: 8000, validateStatus: () => true });
        if (res.status === 200 && typeof res.data === 'object') {
          details = res.data;
        }
      } catch {
        // continua
      }
    }

    if (details) {
      console.log('API Detalhes encontrada!');
      console.log('  Hora:', details.hora_evento);
      console.log('  Local de largada:', details.partida || details.local);
      console.log('  Inscrição liberada:', details.inscricao_liberada);

      // Preços
      let foundPrice: number | null = null;
      let loteName = '1º Lote';
      if (Array.isArray(details.precos_categorias)) {
        for (const cat of details.precos_categorias) {
          if (cat.lote_nome) loteName = `Lote ${cat.lote_nome}`;
          if (Array.isArray(cat.precos)) {
            for (const p of cat.precos) {
              const parsed = extractPrice(p.valor);
              if (parsed && (foundPrice === null || parsed < foundPrice)) {
                foundPrice = parsed;
              }
            }
          }
        }
      }
      console.log('  Preço extraído:', foundPrice, `(${loteName})`);

      // Distâncias
      const dists = new Set<string>();
      if (Array.isArray(details.percursos)) {
        details.percursos.forEach((p: any) => {
          extractDistances(p.nome + ' ' + (p.quilometragem || '')).forEach(d => dists.add(d));
        });
      }
      if (Array.isArray(details.precos_categorias)) {
        details.precos_categorias.forEach((cat: any) => {
          if (Array.isArray(cat.precos)) {
            cat.precos.forEach((p: any) => {
              extractDistances(p.modalidade || '').forEach(d => dists.add(d));
            });
          }
        });
      }
      console.log('  Distâncias extraídas:', Array.from(dists));

      // Regulamento
      let regUrl: string | null = null;
      if (Array.isArray(details.documentos) && details.documentos.length > 0) {
        regUrl = details.documentos[0].url || details.documentos[0].caminho || null;
      }
      console.log('  Regulamento PDF:', regUrl);

      // Link de inscrição
      let regLink: string | null = null;
      if (Array.isArray(details.acoes)) {
        const inscricaoAcao = details.acoes.find((a: any) => a.tipo === 'inscricao');
        if (inscricaoAcao?.url && isValidRegistrationUrl(inscricaoAcao.url, '2026')) {
          regLink = inscricaoAcao.url;
        }
      }
      console.log('  Link de Inscrição Oficial Valido:', regLink);
    } else {
      console.log('API não retornou, usando HTML fallback...');
    }
  }
}

testEnrichment();
