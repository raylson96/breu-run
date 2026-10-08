const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scripts/detailed_awards_extracted.json', 'utf8'));

data.forEach((item) => {
  console.log(`\n================================================================`);
  console.log(`[${item.index}] ${item.title} (${item.city}) - Chip: ${item.chipCompany}`);
  
  if (!item.fullText || item.fullText.length === 0) {
    console.log('Sem PDF.');
    return;
  }

  // Acha onde tem PREMIAÇÃO no texto
  const text = item.fullText;
  const pRegex = /(?:cap[íi]tulo\s*[\w\d]+|art\.?\s*\d+|\d+\.?\s*)?\s*(?:da\s+)?premia[çc][ãa]o/gi;
  let match;
  let matches = [];
  while ((match = pRegex.exec(text)) !== null) {
    matches.push(match.index);
  }

  if (matches.length > 0) {
    // Pega o último ou o mais relevante match (muitas vezes o capítulo formal é mais pro final)
    console.log(`Encontradas ${matches.length} ocorrências de "premiação".`);
    matches.forEach((idx, i) => {
      const snippet = text.substring(idx, idx + 1200).replace(/\r?\n/g, ' \n ');
      // Se contiver R$ ou troféu ou 1º
      if (/R\$|trof|1[º°]|p[óo]dio/i.test(snippet)) {
        console.log(`--- Match ${i+1} (idx: ${idx}) ---`);
        console.log(snippet);
      }
    });
  } else {
    console.log('Sem ocorrências explícitas.');
  }
});
