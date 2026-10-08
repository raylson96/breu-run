const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const nextUrl = res.headers.location.startsWith('http') 
          ? res.headers.location 
          : new URL(res.headers.location, url).href;
        return fetch(nextUrl).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ url, status: res.statusCode, data }));
    }).on('error', reject);
  });
}
module.exports = { fetch };


async function run() {
  const res = await fetch('https://www.chipbreubranco.com.br/session/20261008_chipbreubranco_events.json');
  try {
    const data = JSON.parse(res.data);
    console.log('Events length:', data.length);
    console.log('Fields:', Object.keys(data[0]));
    // Find events with results or status finished
    const withResults = data.filter(e => e.resultado || e.link_resultado || e.status === 'concluido' || e.status === 'finalizado');
    console.log('With results:', withResults.length);
    console.log('Sample event:', data[0]);
  } catch(e) {
    console.log('Error parsing:', e.message);
  }
}

if (require.main === module) {
  run();
}


