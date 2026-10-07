import axios from 'axios';

async function checkConfigLoader() {
  const base = 'https://www.chipbreubranco.com.br/';
  const res = await axios.get(base + 'new/js/config-loader.js');
  console.log('config-loader.js (lines 40-100):\n', res.data.slice(1500, 3500));
}

checkConfigLoader();
