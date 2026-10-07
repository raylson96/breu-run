import axios from 'axios';
import * as cheerio from 'cheerio';

async function checkScripts() {
  const url = 'https://www.chipbreubranco.com.br/evento/2026/corrida-de-rua/corrida-de-rua-nova-ipixuna-run-33-anos';
  const res = await axios.get(url);
  const $ = cheerio.load(res.data);

  console.log('Script tags:');
  $('script').each((_, s) => {
    const src = $(s).attr('src');
    if (src) console.log('  SRC:', src);
    else console.log('  INLINE:\n', $(s).text().slice(0, 500));
  });
}

checkScripts();
