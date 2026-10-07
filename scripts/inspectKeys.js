import axios from 'axios';

async function inspectData() {
  const breuRes = await axios.get('https://www.chipbreubranco.com.br/session/20261007_chipbreubranco_events.json');
  console.log('BREU BRANCO data type:', typeof breuRes.data, Array.isArray(breuRes.data));
  console.log('BREU BRANCO keys:', Object.keys(breuRes.data));
  if (breuRes.data.listEventos) {
    console.log('BREU BRANCO listEventos length:', breuRes.data.listEventos.length);
    console.log('BREU BRANCO listEventos[0]:', JSON.stringify(breuRes.data.listEventos[0], null, 2));
  } else {
    const firstKey = Object.keys(breuRes.data)[0];
    console.log('BREU BRANCO first property:', firstKey, JSON.stringify(breuRes.data[firstKey], null, 2));
  }

  const superaRes = await axios.get('https://www.superachipcrono.com.br/session/20261007_superachipcrono_events.json');
  console.log('SUPERA data keys:', Object.keys(superaRes.data));
  if (superaRes.data.listEventos) {
    console.log('SUPERA listEventos[0]:', JSON.stringify(superaRes.data.listEventos[0], null, 2));
  }
}

inspectData();
