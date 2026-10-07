const fs = require('fs');
const events = JSON.parse(fs.readFileSync('scripts/extracted_raw_events.json', 'utf8'));

console.log('Total extracted:', events.length);
events.forEach((e, idx) => {
  const d = e.detail;
  const secoes = d && d.secoes_extra ? d.secoes_extra : [];
  const premiacao = secoes.find(s => s.titulo && s.titulo.toLowerCase().includes('premia'));
  const kit = secoes.find(s => s.titulo && s.titulo.toLowerCase().includes('kit'));
  const docs = d && d.documentos ? d.documentos.map(doc => doc.url) : [];
  const percursos = d && d.percursos ? d.percursos.map(p => p.nome) : [];

  console.log(`[${idx+1}] [${e.chipName}] ${e.eventListItem.eve_nome} (${d ? d.data_evento : 'no date'})`);
  console.log(`    Percursos: ${percursos.join(', ') || 'Nenhum'}`);
  if (premiacao) {
    const textClean = premiacao.texto.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    console.log(`    Premiação: ${textClean.slice(0, 160)}...`);
  }
  if (kit) {
    const kitClean = kit.texto.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    console.log(`    Kit: ${kitClean.slice(0, 160)}...`);
  }
  if (docs.length) console.log(`    Doc: ${docs[0]}`);
});
