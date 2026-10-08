const fs = require('fs');

const races = JSON.parse(fs.readFileSync('scripts/final_30_races.json', 'utf8'));
console.log('Total races:', races.length);

races.slice(0, 17).forEach((r, i) => {
  console.log(`\n========================================`);
  console.log(`#${i + 1}: ${r.title} | ${r.city} | ${r.chipCompany}`);
  console.log(`PDF: ${r.regulationUrl || 'Nenhum'}`);
  console.log(`PrizeTotal: ${r.prizeTotal}`);
  console.log(`AwardsInfo: ${r.awardsInfo || 'VAZIO'}`);
});
