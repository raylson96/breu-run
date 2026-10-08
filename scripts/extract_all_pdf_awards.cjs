const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function extractAllPdfAwards() {
  const races = JSON.parse(fs.readFileSync('scripts/final_30_races.json', 'utf8'));
  const results = [];

  for (let i = 0; i < races.length; i++) {
    const race = races[i];
    console.log(`\n================================================================`);
    console.log(`[${i + 1}/${races.length}] ${race.title} (${race.city}) - Chip: ${race.chipCompany}`);
    console.log(`URL: ${race.regulationUrl || 'Nenhum'}`);

    let extractedAwards = '';
    let extractedPrizes = [];
    let fullText = '';

    if (race.regulationUrl && race.regulationUrl.endsWith('.pdf')) {
      try {
        const res = await fetch(race.regulationUrl);
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          const parser = new PDFParse({ data: buf });
          const parsed = await parser.getText();
          fullText = parsed.text || '';
          console.log(`  Sucesso! PDF lido com ${fullText.length} caracteres.`);

          // Procura seções de premiação
          const lower = fullText.toLowerCase();
          const pIdx = lower.indexOf('premia');
          if (pIdx !== -1) {
            // Pega o trecho do capítulo de premiação até o próximo capítulo ou 3000 chars
            const sub = fullText.substring(pIdx, pIdx + 3500);
            extractedAwards = sub;
            console.log(`  --- TRECHO DA PREMIAÇÃO ---`);
            console.log(sub.substring(0, 1000));
          } else {
            console.log('  Palavra "premia" não encontrada.');
          }
        } else {
          console.log(`  HTTP status: ${res.status}`);
        }
      } catch (err) {
        console.log(`  Erro: ${err.message}`);
      }
    } else {
      console.log('  Sem PDF disponível.');
    }

    results.push({
      id: race.id,
      title: race.title,
      city: race.city,
      chipCompany: race.chipCompany,
      regulationUrl: race.regulationUrl,
      awardsRaw: extractedAwards,
      fullTextSnippet: fullText.substring(0, 500)
    });
  }

  fs.writeFileSync('scripts/all_pdf_awards_raw.json', JSON.stringify(results, null, 2), 'utf8');
  console.log('\nSalvo em scripts/all_pdf_awards_raw.json');
}

extractAllPdfAwards();
