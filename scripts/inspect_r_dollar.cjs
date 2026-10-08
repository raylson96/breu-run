const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scripts/detailed_awards_extracted.json', 'utf8'));

data.forEach((r) => {
  if (r.prizesFound && r.prizesFound.length > 0) {
    console.log(`\n========================================================`);
    console.log(`[#${r.index}] ${r.title} (${r.city})`);
    console.log(`Prizes:`, r.prizesFound);

    // Encontra todos os índices onde "R$" aparece e mostra o parágrafo
    const full = r.fullText;
    const matches = [...full.matchAll(/R\$\s*[\d.,]+/g)];
    const printedSnippets = new Set();

    matches.forEach((m) => {
      const start = Math.max(0, m.index - 120);
      const end = Math.min(full.length, m.index + 200);
      const snip = full.substring(start, end).replace(/\r?\n/g, ' ');
      // Evita duplicar se estiver no mesmo trecho
      const key = snip.substring(0, 40);
      if (!printedSnippets.has(key)) {
        printedSnippets.add(key);
        console.log(`   > ${snip}`);
      }
    });
  }
});
