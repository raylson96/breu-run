const fs = require('fs');
const axios = require('axios');
const pdfParse = require('pdf-parse');

async function parseAll() {
  const events = JSON.parse(fs.readFileSync('scripts/extracted_raw_events.json', 'utf8'));
  const results = [];

  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    const d = ev.detail;
    const docUrl = d && d.documentos && d.documentos[0] ? d.documentos[0].url : null;
    let pdfText = '';

    if (docUrl && docUrl.endsWith('.pdf')) {
      try {
        console.log(`Downloading PDF [${i + 1}/${events.length}]: ${ev.eventListItem.eve_nome}`);
        const res = await axios.get(docUrl, { responseType: 'arraybuffer', timeout: 15000 });
        const parsed = await pdfParse(res.data);
        pdfText = parsed.text;
        console.log(`  Parsed PDF (${pdfText.length} chars)`);
      } catch (err) {
        console.log(`  Failed PDF: ${err.message}`);
      }
    }

    results.push({
      index: i + 1,
      title: d ? (d.titulo || ev.eventListItem.eve_nome) : ev.eventListItem.eve_nome,
      company: ev.company,
      chipName: ev.chipName,
      date: d ? d.data_evento : null,
      time: d ? d.hora_evento : '06:00',
      location: d ? d.local : ev.eventListItem.eve_local,
      docUrl: docUrl,
      pdfTextSnippet: pdfText ? pdfText.slice(0, 5000) : '',
      pdfFullLength: pdfText.length,
      detail: d
    });
  }

  fs.writeFileSync('scripts/parsed_regulations.json', JSON.stringify(results, null, 2));
  console.log('Saved parsed regulations to scripts/parsed_regulations.json');
}

parseAll().catch(console.error);
