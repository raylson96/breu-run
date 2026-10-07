import axios from 'axios';

async function inspectData() {
  const breuRes = await axios.get('https://www.chipbreubranco.com.br/session/20261007_chipbreubranco_events.json');
  console.log('BREU BRANCO ITEM 0:', JSON.stringify(breuRes.data[0], null, 2));

  const superaRes = await axios.get('https://www.superachipcrono.com.br/session/20261007_superachipcrono_events.json');
  console.log('SUPERA ITEM 0:', JSON.stringify(superaRes.data[0], null, 2));

  const amzRes = await axios.get('https://www.chipamazonia.com.br/eventos');
  const pushes = amzRes.data.match(/listEventos\.push\s*\(\s*({[\s\S]*?})\s*\);?/g);
  if (pushes) {
    console.log('AMAZONIA PUSH 0:', pushes[0]);
  }
}

inspectData();
