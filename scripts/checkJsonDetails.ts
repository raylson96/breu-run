import axios from 'axios';

async function checkJsonDetails() {
  const breuRes = await axios.get('https://www.chipbreubranco.com.br/session/20261007_chipbreubranco_events.json');
  console.log('Sample event from Breu JSON:', JSON.stringify(breuRes.data.listEventos[0], null, 2));

  // Let's also check if there are other fields in listEventos items:
  const allKeys = new Set();
  breuRes.data.listEventos.forEach(item => Object.keys(item).forEach(k => allKeys.add(k)));
  console.log('All keys present across listEventos:', Array.from(allKeys));
}

checkJsonDetails();
