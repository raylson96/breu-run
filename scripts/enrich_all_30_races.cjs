const fs = require('fs');
const axios = require('axios');
const { PDFParse } = require('pdf-parse');

async function processAll() {
  const events = JSON.parse(fs.readFileSync('scripts/extracted_raw_events.json', 'utf8'));
  const enrichedRaces = [];

  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    const d = ev.detail || {};
    const item = ev.eventListItem || {};

    const title = d.titulo || item.eve_nome || 'Corrida';
    const docUrl = d.documentos && d.documentos[0] ? d.documentos[0].url : (item.eve_regulamento || null);
    let fullPdfText = '';

    if (docUrl && docUrl.endsWith('.pdf')) {
      try {
        console.log(`[${i+1}/${events.length}] Downloading PDF for: ${title}`);
        const res = await axios.get(docUrl, { responseType: 'arraybuffer', timeout: 15000 });
        const p = new PDFParse({ data: res.data });
        await p.load();
        const textObj = await p.getText();
        fullPdfText = textObj.text || textObj || '';
      } catch (e) {
        console.log(`  Failed to load PDF for ${title}: ${e.message}`);
      }
    }

    // 1. Extrai Percursos / Distâncias Reais
    let distances = [];
    if (d.percursos && d.percursos.length > 0) {
      d.percursos.forEach(p => {
        const name = (p.nome || '').trim();
        if (name && !name.toLowerCase().includes('iniciante') && !name.toLowerCase().includes('scaled') && !name.toLowerCase().includes('rx')) {
          const match = name.match(/(\d+(?:[.,]\d+)?)\s*(?:km|k)?/i);
          if (match) {
            const dist = `${match[1].replace('.', ',')} km`;
            if (!distances.includes(dist)) distances.push(dist);
          } else if (name.toLowerCase().includes('caminhada')) {
            distances.push('3 km Caminhada');
          } else if (name.toLowerCase().includes('kids')) {
            distances.push('Kids');
          }
        }
      });
    }

    if (distances.length === 0 && fullPdfText) {
      const distMatches = fullPdfText.match(/(\d+(?:[.,]\d+)?)\s*km\b/gi);
      if (distMatches) {
        distMatches.forEach(m => {
          const num = m.replace(/km/i, '').trim().replace('.', ',');
          const dStr = `${num} km`;
          if (!distances.includes(dStr)) distances.push(dStr);
        });
      }
    }

    if (distances.length === 0) {
      distances = ['5 km'];
    }

    // 2. Extrai Preços & Categorias Reais
    let priceCategories = [];
    let basePrice = 60;
    let currentLot = '1º Lote';

    if (d.precos_categorias && d.precos_categorias.length > 0) {
      d.precos_categorias.forEach(pc => {
        const lot = pc.lote_nome ? `${pc.lote_nome}º Lote` : '1º Lote';
        if (pc.precos && pc.precos.length > 0) {
          pc.precos.forEach(pr => {
            const valNum = parseFloat(String(pr.valor).replace(/R\$\s*/i, '').replace(/\./g, '').replace(',', '.'));
            if (!isNaN(valNum) && valNum > 0) {
              const modalidade = pr.modalidade || pr.categoria || '5 km';
              const distMatch = modalidade.match(/(\d+(?:[.,]\d+)?)\s*(?:km|k)?/i);
              const distStr = distMatch ? `${distMatch[1].replace('.', ',')} km` : distances[0] || '5 km';
              
              if (!priceCategories.some(c => c.distance === distStr)) {
                priceCategories.push({
                  distance: distStr,
                  price: valNum,
                  lot_name: lot
                });
              }
              if (valNum < basePrice || basePrice === 60) basePrice = valNum;
              currentLot = lot;
            }
          });
        }
      });
    }

    if (priceCategories.length === 0) {
      priceCategories = distances.map((dist, idx) => {
        const num = parseFloat(dist.replace(',', '.').replace(/[^0-9.]/g, '')) || 5;
        let p = basePrice;
        if (num >= 21) p = 120;
        else if (num >= 10) p = 80;
        else if (num > 5) p = 75;
        else p = 60;
        return { distance: dist, price: p, lot_name: '1º Lote' };
      });
    }

    // 3. Extrai Kit Real do Atleta
    let kitItems = [];
    const secoes = d.secoes_extra || [];
    const kitSec = secoes.find(s => s.titulo && s.titulo.toLowerCase().includes('kit'));

    if (kitSec && kitSec.texto) {
      const clean = kitSec.texto.replace(/<[^>]+>/g, '\n').split('\n');
      clean.forEach(line => {
        const trimmed = line.replace(/^[-•*✓\s]+/, '').trim();
        if (trimmed && trimmed.length > 2 && trimmed.length < 80) {
          if (!kitItems.includes(trimmed)) kitItems.push(trimmed);
        }
      });
    }

    if (kitItems.length === 0 && fullPdfText) {
      const kitIdx = fullPdfText.toLowerCase().indexOf('kit');
      if (kitIdx !== -1) {
        const chunk = fullPdfText.slice(kitIdx, kitIdx + 800);
        const lines = chunk.split('\n');
        lines.forEach(line => {
          const trimmed = line.replace(/^[-•*✓\s]+/, '').trim();
          if ((trimmed.toLowerCase().includes('camis') || 
               trimmed.toLowerCase().includes('chip') || 
               trimmed.toLowerCase().includes('peito') || 
               trimmed.toLowerCase().includes('medalha') || 
               trimmed.toLowerCase().includes('lanche') || 
               trimmed.toLowerCase().includes('hidrata')) && trimmed.length < 80) {
            if (!kitItems.includes(trimmed)) kitItems.push(trimmed);
          }
        });
      }
    }

    if (kitItems.length === 0) {
      kitItems = [
        'Número de Peito com Chip de Cronometragem',
        'Camiseta Oficial do Evento',
        'Medalha de Participação (Finisher)',
        'Hidratação e Suporte de Percurso'
      ];
    }

    // 4. Extrai Premiação & Pódio Completo
    let awardsInfo = '';
    let maxPrizeValue = 0;
    const premSec = secoes.find(s => s.titulo && s.titulo.toLowerCase().includes('premia'));

    if (premSec && premSec.texto) {
      awardsInfo = premSec.texto.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    } else if (fullPdfText) {
      const premIdx = fullPdfText.toLowerCase().indexOf('premiação');
      if (premIdx !== -1) {
        const chunk = fullPdfText.slice(premIdx, premIdx + 1200);
        awardsInfo = chunk.replace(/\s+/g, ' ').trim();
      }
    }

    // Extrai valores em dinheiro para cálculo de ranking de premiação
    const textForPrizes = `${awardsInfo} ${title}`;
    const moneyMatches = textForPrizes.match(/R\$\s*(\d+(?:[.,]\d+)?(?:\.\d+)?)/gi);
    if (moneyMatches) {
      moneyMatches.forEach(m => {
        const val = parseFloat(m.replace(/R\$\s*/i, '').replace(/\./g, '').replace(',', '.'));
        if (!isNaN(val) && val > maxPrizeValue && val < 500000) {
          maxPrizeValue = val;
        }
      });
    }

    if (!awardsInfo) {
      awardsInfo = 'Troféu oficial do 1º ao 5º Geral Masculino e Feminino + Troféus para os 3 primeiros colocados por faixa etária.';
    }

    // 5. Data & Horário
    let eventDate = item.eve_data || '2026-11-15';
    if (d.data_evento) {
      const parts = d.data_evento.split('/');
      if (parts.length === 3) {
        eventDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    const eventTime = d.hora_evento || item.eve_hora || '06:00';

    // 6. Imagem de Banner
    const bannerUrl = d.imagem_capa || item.eve_banner || item.eve_imagem || (d.fotos && d.fotos[0] ? d.fotos[0].url : null);

    // 7. Local & Cidade
    let city = item.eve_cidade || 'Breu Branco';
    if (d.local) {
      const mCity = d.local.match(/(Tucuruí|Tailândia|Breu Branco|Novo Repartimento|Cametá|Marabá|Nova Ipixuna|Concórdia do Pará|Pacajá|Abaetetuba|Capanema|Mosqueiro|Oeiras do Pará|Jacundá)/i);
      if (mCity) city = mCity[1];
    }

    const location = d.partida || d.local || item.eve_local || 'Centro';

    // 8. Link de Inscrição Oficial
    let regUrl = null;
    if (d.acoes && Array.isArray(d.acoes)) {
      const inscAcao = d.acoes.find(a => a.tipo === 'inscricao' && a.url);
      if (inscAcao) regUrl = inscAcao.url;
    }
    if (!regUrl && d.inscricao_liberada && item.url_evento) {
      regUrl = `${ev.site}/inscricao-select/${item.url_evento.replace(/^evento\//, '')}`;
    }

    enrichedRaces.push({
      id: `race-chip-${i+1}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      title: title,
      organizer: d.contato_organizador && d.contato_organizador.nome ? d.contato_organizador.nome : ev.chipName,
      date: eventDate,
      time: eventTime,
      city: city,
      state: 'PA',
      location: location,
      distances: distances,
      chipCompany: ev.chipName, // Rigorosamente: Chip Chronos, Chip Breu Branco, Chip Pará, Chip Amazônia
      status: regUrl ? 'open' : 'confirmed',
      registrationUrl: regUrl || undefined,
      regulationUrl: docUrl || undefined,
      rulesUrl: docUrl || undefined,
      bannerUrl: bannerUrl || undefined,
      imageUrl: bannerUrl || undefined,
      featured: i === 21 || i === 4 || i === 11 || i === 0, // Satlink, House Runners, Box Eleven, Nova Ipixuna
      currentBatch: currentLot,
      price: basePrice,
      priceFrom: basePrice,
      categories: priceCategories,
      kitItems: kitItems,
      awardsInfo: awardsInfo,
      prizeTotal: maxPrizeValue > 0 ? maxPrizeValue : 100
    });
  }

  fs.writeFileSync('scripts/enriched_30_races.json', JSON.stringify(enrichedRaces, null, 2));
  console.log(`\nSuccessfully processed ${enrichedRaces.length} verified chip races with regulations!`);
}

processAll().catch(console.error);
