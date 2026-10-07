import axios from 'axios';

async function testDocPercursos() {
  const url = 'https://www.superachipcrono.com.br/api_evento.php?url=' + encodeURIComponent('5800/1-corrida-satlinkplay');
  const res = await axios.get(url);
  console.log('Documentos:', JSON.stringify(res.data.documentos, null, 2));
  console.log('Percursos:', JSON.stringify(res.data.percursos, null, 2));
}

testDocPercursos();
