import axios from 'axios';
import { parseChipPayload } from '../src/modules/sync/scrapers/chipDataExtractor.ts';

async function testAmz() {
  const res = await axios.get('https://www.chipamazonia.com.br/eventos', {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    timeout: 15000
  });
  const html = res.data;
  const extracted = parseChipPayload(html, 'https://www.chipamazonia.com.br', 'CHIP_AMAZONIA', 'Chip Amazônia');
  console.log('Chip Amazônia total extraído:', extracted.length);
  extracted.forEach((r, i) => {
    console.log(`  [${i + 1}] "${r.title}" | ${r.eventDate} | ${r.city}/PA | ${r.status} | Link: ${r.registrationUrl}`);
  });
}

testAmz();
