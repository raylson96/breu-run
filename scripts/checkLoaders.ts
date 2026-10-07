import axios from 'axios';

async function checkLoaders() {
  const base = 'https://www.chipbreubranco.com.br/';
  const res = await axios.get(base + 'new/js/loaders/page-config.js');
  console.log('page-config.js:\n', res.data);
}

checkLoaders();
