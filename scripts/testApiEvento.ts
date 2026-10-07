import axios from 'axios';

async function testApiEvento() {
  const tests = [
    {
      name: 'Chip Breu Branco',
      url: 'https://www.chipbreubranco.com.br/api_evento.php?url=' + encodeURIComponent('2026/corrida-de-rua/corrida-de-rua-nova-ipixuna-run-33-anos')
    },
    {
      name: 'Chip Amazônia',
      url: 'https://www.chipamazonia.com.br/api_evento.php?url=' + encodeURIComponent('2026/corrida-de-rua/2-corridarosapink2026')
    },
    {
      name: 'Chip Pará',
      url: 'https://www.chippara.com.br/api_evento.php?url=' + encodeURIComponent('1682/1-corrida-do-amor-em-prol-da-vida')
    },
    {
      name: 'Supera Chip Chronos',
      url: 'https://www.superachipcrono.com.br/api_evento.php?url=' + encodeURIComponent('5800/1-corrida-satlinkplay')
    }
  ];

  for (const t of tests) {
    console.log(`\n=================== Testing: ${t.name} ===================`);
    console.log(`Endpoint: ${t.url}`);
    try {
      const res = await axios.get(t.url, { timeout: 10000 });
      console.log('Response type:', typeof res.data);
      if (typeof res.data === 'object' && res.data !== null) {
        console.log('Keys:', Object.keys(res.data));
        console.log('Sample data:\n', JSON.stringify(res.data, null, 2).slice(0, 1500));
      } else {
        console.log('String snippet:', String(res.data).slice(0, 500));
      }
    } catch (e) {
      console.error('Error:', e.message);
    }
  }
}

testApiEvento();
