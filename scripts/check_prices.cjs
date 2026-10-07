const fs = require('fs');
const content = fs.readFileSync('src/modules/sync/data/verifiedRacesSnapshot.ts', 'utf8');

// Match each object block
const blocks = content.split('  {\n');
blocks.forEach((b, i) => {
  if (i === 0) return;
  const titleMatch = b.match(/"title":\s*"([^"]+)"/);
  const priceMatch = b.match(/"price":\s*(\d+|null)/);
  const dateMatch = b.match(/"eventDate":\s*"([^"]+)"/);
  const statusMatch = b.match(/"status":\s*"([^"]+)"/);
  const batchMatch = b.match(/"currentBatch":\s*"([^"]+)"/);
  const regUrlMatch = b.match(/"registrationUrl":\s*("[^"]+"|\w+)/);
  if (titleMatch) {
    console.log(`${i}. [${dateMatch ? dateMatch[1] : ''}] ${titleMatch[1]} | Status: ${statusMatch ? statusMatch[1] : ''} | Price: R$ ${priceMatch ? priceMatch[1] : 'null'} | Lote: ${batchMatch ? batchMatch[1] : ''} | URL: ${regUrlMatch ? regUrlMatch[1] : ''}`);
  }
});
