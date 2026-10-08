const fs = require('fs');

const upcoming = JSON.parse(fs.readFileSync('scripts/final_30_races_v7.json', 'utf8'));
const past = JSON.parse(fs.readFileSync('scripts/extracted_past_results.json', 'utf8'));

const all = [...upcoming, ...past];

const tsContent = `import type { Race } from '../../../types/race';\n\nexport const FINAL_VERIFIED_RACES_V7: Race[] = ${JSON.stringify(all, null, 2)};\n`;

fs.writeFileSync('src/modules/sync/data/finalVerifiedRacesV7.ts', tsContent, 'utf8');

console.log(`Snapshot atualizado com sucesso! Total: ${all.length} corridas (${upcoming.length} ativas no calendário + ${past.length} finalizadas na aba de resultados).`);
