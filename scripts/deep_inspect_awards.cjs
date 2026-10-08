const fs = require('fs');
const pdfParse = require('pdf-parse');

async function inspectAllPdfs() {
  const races = JSON.parse(fs.readFileSync('scripts/final_30_races.json', 'utf8'));

  for (let i = 0; i < races.length; i++) {
    const race = races[i];
    console.log(`\n================================================================`);
    console.log(`[${i + 1}/30] ${race.title} (${race.city}) - Chip: ${race.chipCompany}`);
    console.log(`URL: ${race.regulationUrl || 'Nenhum'}`);

    if (!race.regulationUrl || !race.regulationUrl.endsWith('.pdf')) {
      console.log('Sem PDF para inspecionar.');
      continue;
    }

    try {
      const res = await fetch(race.regulationUrl);
      if (!res.ok) {
        console.log(`HTTP erro: ${res.status}`);
        continue;
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      const data = await pdfParse(buffer);
      const text = data.text;

      // Procura por seções de premiação
      const premiacaoIdx = text.toLowerCase().indexOf('premia');
      if (premiacaoIdx !== -1) {
        // Pega 1500 caracteres a partir de premiação
        const snippet = text.substring(premiacaoIdx, premiacaoIdx + 1500).replace(/\r?\n/g, ' ');
        console.log(`TRECHO PREMIAÇÃO:`);
        console.log(snippet);
      } else {
        console.log('Palavra "premia" não encontrada no PDF.');
      }
    } catch (err) {
      console.log(`Erro ao baixar/ler PDF: ${err.message}`);
    }
  }
}

inspectAllPdfs();
