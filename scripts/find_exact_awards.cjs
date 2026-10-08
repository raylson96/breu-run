const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('scripts/all_pdf_awards_raw.json', 'utf8'));

// Vamos carregar cada PDF baixado e achar o capítulo exato de premiação
// Vamos re-executar buscando por seções específicas
const { PDFParse } = require('pdf-parse');

async function findExactAwards() {
  const races = JSON.parse(fs.readFileSync('scripts/final_30_races.json', 'utf8'));
  const detailed = [];

  for (let i = 0; i < races.length; i++) {
    const r = races[i];
    let fullText = '';
    let awardsSection = '';
    let prizeMatches = [];

    if (r.regulationUrl && r.regulationUrl.endsWith('.pdf')) {
      try {
        const res = await fetch(r.regulationUrl);
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          const parser = new PDFParse({ data: buf });
          const parsed = await parser.getText();
          fullText = parsed.text || '';

          // Procura por "DA PREMIAÇÃO", "PREMIAÇÃO", "PREMIACOES", "8. DA PREMIAÇÃO", "10. DA PREMIAÇÃO"
          const regexes = [
            /(?:cap[íi]tulo\s*\d+|art\.?\s*\d+|\d+\.?\s*)?\s*(?:da\s+)?premia[çc][ãa]o[\s\S]{100,2500}/gi,
            /(?:p[óo]dio|classifica[çc][ãa]o\s+geral)[\s\S]{100,1500}/gi
          ];

          let found = [];
          for (const reg of regexes) {
            const matches = [...fullText.matchAll(reg)];
            for (const m of matches) {
              found.push(m[0]);
            }
          }

          // Se achar termos com R$
          const moneyMatches = [...fullText.matchAll(/R\$\s*[\d.,]+/gi)].map(m => m[0]);

          awardsSection = found.join('\n---\n');
          prizeMatches = moneyMatches;
        }
      } catch (e) {
        console.error(e.message);
      }
    }

    console.log(`\n================================================================`);
    console.log(`[${i+1}] ${r.title} (${r.city})`);
    console.log(`PDF: ${r.regulationUrl || 'Nenhum'}`);
    console.log(`Valores em R$ encontrados:`, prizeMatches.slice(0, 10));
    console.log(`Amostra do Trecho de Premiação:`);
    console.log(awardsSection.substring(0, 500) || '(Nenhum trecho específico)');

    detailed.push({
      index: i + 1,
      id: r.id,
      title: r.title,
      city: r.city,
      chipCompany: r.chipCompany,
      regulationUrl: r.regulationUrl,
      prizesFound: prizeMatches,
      awardsText: awardsSection,
      fullTextLength: fullText.length,
      fullText: fullText
    });
  }

  fs.writeFileSync('scripts/detailed_awards_extracted.json', JSON.stringify(detailed, null, 2), 'utf8');
  console.log('\nFinalizado e salvo em scripts/detailed_awards_extracted.json');
}

findExactAwards();
