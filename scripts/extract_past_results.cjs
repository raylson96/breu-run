const fs = require('fs');
const { fetch } = require('./inspect_results_endpoint.cjs');

async function extractAllResults() {
  const sources = [
    {
      chipCompany: 'Chip Breu Branco',
      url: 'https://www.chipbreubranco.com.br/session/20261008_chipbreubranco_events.json'
    },
    {
      chipCompany: 'Chip Pará',
      url: 'https://www.chippara.com.br/session/20261008_chippara_events.json'
    }
  ];

  const pastRaces = [];

  for (const src of sources) {
    try {
      const res = await fetch(src.url);
      const json = JSON.parse(res.data);
      const items = json.listResults || [];
      console.log(`[${src.chipCompany}] Found ${items.length} result events`);

      items.forEach((item, idx) => {
        // Find result url in item.link
        let resultsUrl = '';
        if (item.link) {
          if (typeof item.link === 'object') {
            for (const key of Object.keys(item.link)) {
              if (item.link[key] && item.link[key].url) {
                resultsUrl = item.link[key].url;
                break;
              }
            }
          } else if (typeof item.link === 'string') {
            resultsUrl = item.link;
          }
        }

        // Parse date DD/MM/YYYY to YYYY-MM-DD
        let isoDate = '2026-01-01';
        if (item.data && item.data.includes('/')) {
          const parts = item.data.trim().split('/');
          if (parts.length === 3) {
            isoDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
        }

        // City & State
        let city = 'Pará';
        let state = 'PA';
        if (item.cidade) {
          const cParts = item.cidade.split('-');
          city = cParts[0].trim();
          if (cParts[1]) state = cParts[1].trim();
        }

        const id = `past-race-${src.chipCompany.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${idx + 1}-${item.nome.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)}`;

        pastRaces.push({
          id,
          title: item.nome.trim(),
          organizer: src.chipCompany,
          date: isoDate,
          time: '06:00',
          city,
          state,
          location: city,
          distances: ['5 km'],
          chipCompany: src.chipCompany,
          status: 'finished',
          resultsUrl: resultsUrl || undefined,
          imageUrl: item.imagem || undefined,
          bannerUrl: item.imagem || undefined,
          featured: false,
          currentBatch: 'Encerrado',
          price: 0,
          priceFrom: 0,
          categories: [{ distance: '5 km', price: 0, lot_name: 'Encerrado' }],
          kitItems: [],
          awardsInfo: 'Resultados e classificação oficial apurados.',
          awardGroups: []
        });
      });
    } catch (e) {
      console.error(`Error loading from ${src.chipCompany}:`, e.message);
    }
  }

  console.log('Total extracted past races:', pastRaces.length);
  fs.writeFileSync('scripts/extracted_past_results.json', JSON.stringify(pastRaces, null, 2), 'utf8');
}

extractAllResults();
