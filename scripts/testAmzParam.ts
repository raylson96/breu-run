import axios from 'axios';

async function testAmzParam() {
  const urls = [
    'https://www.chipamazonia.com.br/api_evento.php?url=2-corridarosapink2026',
    'https://www.chipamazonia.com.br/api_evento.php?id=2',
    'https://www.chipamazonia.com.br/api_evento.php?event_slug=2-corridarosapink2026'
  ];

  for (const u of urls) {
    try {
      const res = await axios.get(u, { validateStatus: () => true });
      console.log(`URL: ${u} -> Status ${res.status}`);
      if (res.status === 200) console.log('Data:', typeof res.data, Object.keys(res.data));
    } catch (e) {
      console.log(u, e.message);
    }
  }
}

testAmzParam();
