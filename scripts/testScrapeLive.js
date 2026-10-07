import axios from 'axios';

async function test() {
  const sites = [
    { name: 'Chip Amazônia', url: 'https://www.chipamazonia.com.br/eventos' },
    { name: 'Chip Breu Branco', url: 'https://www.chipbreubranco.com.br/eventos' },
    { name: 'Chip Pará', url: 'https://www.chippara.com.br/eventos' },
    { name: 'Supera Chip Chronos', url: 'https://www.superachipcrono.com.br/eventos' }
  ];

  for (const site of sites) {
    try {
      const res = await axios.get(site.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000
      });
      console.log(`[${site.name}] HTML fetched, length: ${res.data.length}`);
      
      const jsonMatch = res.data.match(/url_arquivo_events\s*=\s*['"]([^'"]+)['"]/);
      if (jsonMatch) {
        console.log(`  -> Found JSON endpoint: ${jsonMatch[1]}`);
        try {
          const jsonRes = await axios.get(jsonMatch[1], { timeout: 10000 });
          const count = Array.isArray(jsonRes.data) ? jsonRes.data.length : (jsonRes.data.listEventos?.length || 0);
          console.log(`  -> JSON fetched successfully! Events count: ${count}`);
          if (count > 0) {
            const first = Array.isArray(jsonRes.data) ? jsonRes.data[0] : jsonRes.data.listEventos[0];
            console.log(`  -> Sample:`, first.eve_nome || first.nome || first.title, first.eve_data_evento || first.data);
          }
        } catch (je) {
          console.log(`  -> Failed to fetch JSON endpoint:`, je.message);
        }
      }

      const pushMatches = res.data.match(/listEventos\.push\s*\(\s*({[\s\S]*?})\s*\);?/g);
      if (pushMatches) {
        console.log(`  -> Found inline listEventos.push statements: ${pushMatches.length}`);
      }
    } catch (e) {
      console.log(`[${site.name}] FAILED:`, e.message);
    }
  }
}

test();
