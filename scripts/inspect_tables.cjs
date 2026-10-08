const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scripts/detailed_awards_extracted.json', 'utf8'));

// Vamos extrair a tabela de premiação de cada corrida
data.forEach((r) => {
  if (!r.fullText) return;
  console.log(`\n========================================================`);
  console.log(`[#${r.index}] ${r.title} (${r.city})`);
  
  // Procura por "1º", "2º", "3º", "R$", "Troféu", "Premiação"
  const lines = r.fullText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const awardLines = [];
  let capturing = false;
  let captureCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/(?:DA\s+)?PREMIA[ÇC][ÃA]O|CLASSIFICA[ÇC][ÃA]O\s+GERAL|P[ÓO]DIO/i.test(line)) {
      capturing = true;
      captureCount = 0;
    }
    if (capturing) {
      awardLines.push(line);
      captureCount++;
      if (captureCount > 40 && /(?:DISPOSITIVOS\s+GERAIS|DO\s+KIT|INSCRI[ÇC][ÕO]ES|Art\.\s*2\d|Art\.\s*3\d)/i.test(line)) {
        capturing = false;
      }
    }
  }

  console.log(awardLines.slice(0, 30).join('\n'));
});
