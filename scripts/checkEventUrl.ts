import axios from 'axios';

async function checkUrl() {
  const urls = [
    'https://www.chipbreubranco.com.br/evento/2026/corrida-de-rua/corrida-de-rua-nova-ipixuna-run-33-anos',
    'https://www.chippara.com.br/evento/1682/1-corrida-do-amor-em-prol-da-vida',
    'https://www.superachipcrono.com.br/evento/5800/1-corrida-satlinkplay'
  ];

  for (const u of urls) {
    try {
      const res = await axios.get(u, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        maxRedirects: 5,
        validateStatus: () => true
      });
      console.log(`URL: ${u}`);
      console.log(`  Status: ${res.status}`);
      console.log(`  Length: ${typeof res.data === 'string' ? res.data.length : 'not string'}`);
      console.log(`  Snippet:`, typeof res.data === 'string' ? res.data.slice(0, 300) : res.data);
    } catch (e) {
      console.log(`URL ${u} ERROR:`, e.message);
    }
  }
}

checkUrl();
