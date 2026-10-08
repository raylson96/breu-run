const fs = require('fs');

const detailed = JSON.parse(fs.readFileSync('scripts/detailed_awards_extracted.json', 'utf8'));

console.log('Total detailed races loaded:', detailed.length);

detailed.forEach(r => {
  console.log(`\n========================================================`);
  console.log(`[#${r.index}] ${r.title} (${r.city})`);
  
  if (!r.fullText) {
    console.log('Sem texto de regulamento.');
    return;
  }

  const text = r.fullText;

  // 1. Procura distâncias / modalidades
  const modalidadeMatch = text.match(/(?:modalidade|dist[âa]ncia|percurso)[\s\S]{50,300}/i);
  if (modalidadeMatch) {
    console.log('Percursos/Modalidades:', modalidadeMatch[0].replace(/\r?\n/g, ' '));
  }

  // 2. Procura kit do atleta
  const kitMatch = text.match(/(?:kit|sacola|camisa|n[úu]mero\s+de\s+peito)[\s\S]{50,300}/i);
  if (kitMatch) {
    console.log('Kit do Atleta:', kitMatch[0].replace(/\r?\n/g, ' '));
  }

  // 3. Procura taxas / valores / lotes
  const loteMatch = text.match(/(?:lote|inscri[çc][ãa]o|taxa|valor)[\s\S]{50,300}/i);
  if (loteMatch) {
    console.log('Taxa/Lotes:', loteMatch[0].replace(/\r?\n/g, ' '));
  }
});
