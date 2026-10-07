async function searchAll() {
  const sites = [
    'https://www.chipbreubranco.com.br',
    'https://www.chippara.com.br',
    'https://www.superachipcrono.com.br',
    'https://www.chipamazonia.com.br'
  ];

  for (const base of sites) {
    try {
      const html = await fetch(`${base}/eventos`).then(r => r.text());
      const jsonMatch = html.match(/url_arquivo_events\s*=\s*['"]([^'"]+)['"]/);
      if (jsonMatch) {
        const eventsData = await fetch(jsonMatch[1]).then(r => r.json());
        console.log(`\n=== ${base} (${eventsData.listEventos?.length} eventos) ===`);
        (eventsData.listEventos || []).forEach(e => {
          console.log(`- [${e.eve_id}] "${e.eve_nome}" | liberado: ${e.eve_liberado} | url: ${e.url_evento}`);
        });
      } else {
        console.log(`\n=== ${base} (inline listEventos) ===`);
        const regex = /listEventos\.push\((\{[\s\S]*?\})\);/g;
        let m;
        while ((m = regex.exec(html)) !== null) {
          const item = JSON.parse(m[1]);
          console.log(`- [${item.eve_id}] "${item.eve_nome}" | liberado: ${item.eve_liberado} | url: ${item.url_evento}`);
        }
      }
    } catch (e) {
      console.log(`Error on ${base}:`, e.message);
    }
  }
}

searchAll().catch(console.error);
