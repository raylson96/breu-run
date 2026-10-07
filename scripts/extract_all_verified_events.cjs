const axios = require('axios');
const fs = require('fs');

async function extractAll() {
  const sites = [
    { base: 'https://www.chipbreubranco.com.br', company: 'CHIP_BRANCO', chipName: 'Chip Breu Branco' },
    { base: 'https://www.chippara.com.br', company: 'CHIP_PARA', chipName: 'Chip Pará' },
    { base: 'https://www.superachipcrono.com.br', company: 'SUPERA_CHRONOS', chipName: 'Chip Chronos' },
    { base: 'https://www.chipamazonia.com.br', company: 'CHIP_AMAZONIA', chipName: 'Chip Amazônia' }
  ];

  const allExtracted = [];

  for (const s of sites) {
    try {
      const html = (await axios.get(s.base + '/eventos')).data;
      let list = [];
      const jsonMatch = html.match(/url_arquivo_events\s*=\s*['"]([^'"]+)['"]/);
      if (jsonMatch) {
        const eventsData = (await axios.get(jsonMatch[1])).data;
        list = eventsData.listEventos || [];
      } else {
        const regex = /listEventos\.push\((\{[\s\S]*?\})\);/g;
        let m;
        while ((m = regex.exec(html)) !== null) {
          list.push(JSON.parse(m[1]));
        }
      }

      console.log(`\n=== ${s.chipName} (${list.length} eventos) ===`);

      for (const ev of list) {
        if (!ev.url_evento) continue;
        const relativeUrl = ev.url_evento.replace(/^https?:\/\/[^\/]+\//, '');
        let detail = null;
        try {
          const detailUrl = `${s.base}/api_evento.php?url=${encodeURIComponent(relativeUrl)}`;
          const res = await axios.get(detailUrl, { timeout: 10000 });
          detail = res.data;
        } catch (e) {
          console.log(`  Failed api_evento for ${ev.eve_nome}: ${e.message}`);
        }

        allExtracted.push({
          site: s.base,
          company: s.company,
          chipName: s.chipName,
          eventListItem: ev,
          detail: detail
        });
        console.log(`  Processed: ${ev.eve_nome}`);
      }
    } catch (err) {
      console.error(`Error on ${s.chipName}: ${err.message}`);
    }
  }

  fs.writeFileSync('scripts/extracted_raw_events.json', JSON.stringify(allExtracted, null, 2));
  console.log(`\nSaved ${allExtracted.length} events to scripts/extracted_raw_events.json`);
}

extractAll().catch(console.error);
