const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scripts/detailed_awards_extracted.json', 'utf8'));

data.forEach((item) => {
  if (item.fullTextLength > 0) {
    console.log(`\n================================================================`);
    console.log(`[${item.index}] ${item.title} (${item.city})`);
    console.log(`R$ Encontrados:`, item.prizesFound);
    
    // Procura no fullText por palavras chave e imprime trechos com R$
    const lines = item.fullText.split(/\r?\n/);
    const relevantLines = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/R\$\s*\d+|1[º°]\s*lugar|2[º°]\s*lugar|3[º°]\s*lugar|p[óo]dio|premia[çc][ãa]o/i.test(line)) {
        // pega 2 linhas antes e 4 linhas depois
        const start = Math.max(0, i - 1);
        const end = Math.min(lines.length, i + 6);
        relevantLines.push(lines.slice(start, end).join(' '));
        i += 4;
      }
    }
    console.log(`Linhas Relevantes de Premiação / Valores:`);
    console.log(relevantLines.slice(0, 8).join('\n---\n'));
  }
});
