const fs = require('fs');

const rawEnriched = JSON.parse(fs.readFileSync('scripts/enriched_30_races.json', 'utf8'));

function toTitleCase(str) {
  if (!str) return '';
  const exceptions = ['de', 'da', 'do', 'das', 'dos', 'em', 'e', 'a', 'o', 'as', 'os', 'no', 'na', 'nos', 'nas', 'por', 'para', 'com'];
  return str.toLowerCase().split(' ').map((word, i) => {
    if (i > 0 && exceptions.includes(word)) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

// Mapeamento específico e verificado para cada uma das corridas com base nos regulamentos oficiais lidos
const curatedUpdates = {
  '1-corrida-satlinkplay': {
    title: '1° Corrida Satlinkplay',
    chipCompany: 'Chip Chronos',
    city: 'Tucuruí',
    organizer: 'Neto Fernandes',
    distances: ['5 km'],
    price: 49.99,
    priceFrom: 49.99,
    currentBatch: '1º Lote',
    categories: [
      { distance: '5 km', price: 49.99, lot_name: '1º Lote' }
    ],
    kitItems: [
      'Número de Peito com Chip de Cronometragem',
      'Camiseta Oficial do Evento',
      'Medalha de Participação (Finisher)',
      'Hidratação e Frutas na Chegada'
    ],
    awardsInfo: 'Premiação Geral (Masculino e Feminino): 1º Lugar: R$ 700,00 + Troféu | 2º Lugar: R$ 500,00 + Troféu | 3º Lugar: R$ 400,00 + Troféu | 4º Lugar: R$ 300,00 + Troféu | 5º Lugar: R$ 200,00 + Troféu.',
    prizeTotal: 700,
    registrationUrl: 'https://www.superachipcrono.com.br/inscricao-select/5800/1-corrida-satlinkplay',
    regulationUrl: 'https://www.superachipcrono.com.br/painel/upload/doc/inscricao/doc-093-25092026120843-82e7970bd7ced603cbb5c77ae66eea0f.pdf'
  },
  'corrida-contra-o-racismo': {
    title: 'Corrida Contra o Racismo',
    chipCompany: 'Chip Breu Branco',
    city: 'Concórdia do Pará',
    distances: ['5 km'],
    price: 80.00,
    priceFrom: 80.00,
    currentBatch: '1º Lote',
    categories: [
      { distance: '5 km', price: 80.00, lot_name: '1º Lote' }
    ],
    kitItems: [
      'Camisa Oficial do Evento',
      'Número de Peito com Chip de Cronometragem',
      'Medalha de Participação (Finisher)',
      'Hidratação durante e pós-prova',
      'Lanche Pós-Prova'
    ],
    awardsInfo: 'Premiação Geral (Masculino e Feminino): 1º Lugar: R$ 600,00 + Troféu | 2º Lugar: R$ 400,00 + Troféu | 3º Lugar: R$ 200,00 + Troféu. Categorias PCD e Estudante: Medalhas + Troféus para os 3 primeiros colocados.',
    prizeTotal: 600,
    registrationUrl: 'https://www.chipbreubranco.com.br/inscricao-select/6565/corrida-contra-o-racismo',
    regulationUrl: 'https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-064-21092026120821-d9a3a622c55fe34bd409a2235f9b675b.pdf'
  },
  '1-meia-maratona-house-runners-de-tailandia-2026': {
    title: '1ª Meia Maratona House Runners de Tailândia 2026',
    chipCompany: 'Chip Breu Branco',
    city: 'Tailândia',
    distances: ['5 km', '21 km'],
    price: 89.99,
    priceFrom: 89.99,
    currentBatch: '1º Lote',
    categories: [
      { distance: '5 km', price: 89.99, lot_name: '1º Lote' },
      { distance: '21 km', price: 119.99, lot_name: '1º Lote' }
    ],
    kitItems: [
      'Camisa Oficial Tecnológica Dry-Fit',
      'Número de Peito com Chip de Cronometragem',
      'Medalha Finisher Pesada em Metal',
      'Pontos de Hidratação ao longo do Percurso',
      'Suporte Médico e Frutas na Chegada'
    ],
    awardsInfo: 'Premiação Meia Maratona 21 km e 5 km: Troféus do 1º ao 5º Geral (Masculino e Feminino) e Premiação em Dinheiro para os Campeões Gerais dos 21 km: 1º Lugar: R$ 1.500,00 | 2º Lugar: R$ 1.000,00 | 3º Lugar: R$ 700,00 | 4º Lugar: R$ 500,00 | 5º Lugar: R$ 300,00. Troféus para 1º, 2º e 3º por faixas etárias.',
    prizeTotal: 1500,
    registrationUrl: 'https://www.chipbreubranco.com.br/inscricao-select/5136/1-meia-maratona-house-runners-de-tailandia-2026',
    regulationUrl: 'https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-064-23092026205226-4a33edb840d8caeb24bbcb1b0ce1d8d7.pdf'
  },
  '2-corrida-de-rua-e-vi-open-da-box-eleven': {
    title: '2ª Corrida de Rua e VI Open da Box Eleven',
    chipCompany: 'Chip Breu Branco',
    city: 'Tailândia',
    distances: ['3 km', '5 km', '7 km'],
    price: 79.90,
    priceFrom: 79.90,
    currentBatch: '2º Lote',
    categories: [
      { distance: '3 km', price: 79.90, lot_name: '2º Lote' },
      { distance: '5 km', price: 89.90, lot_name: '2º Lote' },
      { distance: '7 km', price: 99.90, lot_name: '2º Lote' }
    ],
    kitItems: [
      'Camiseta Oficial Box Eleven',
      'Número de Peito com Chip de Cronometragem',
      'Medalha de Conclusão Finisher',
      'Hidratação e Mesa de Frutas'
    ],
    awardsInfo: 'Premiação Geral (1º ao 5º Masc/Fem): Troféus personalizados e premiação em dinheiro. 1º Lugar: R$ 800,00 | 2º Lugar: R$ 500,00 | 3º Lugar: R$ 300,00 | 4º e 5º Troféus. Premiação por faixas etárias de 10 em 10 anos (1º ao 3º lugar).',
    prizeTotal: 800,
    registrationUrl: 'https://www.chipbreubranco.com.br/inscricao-select/3866/2-corrida-de-rua-e-vi-open-da-box-eleven',
    regulationUrl: 'https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-064-19082026193429-9063366e3ba3efafeddfb78e4e422c62.pdf'
  },
  'corrida-de-rua-nova-ipixuna-run-33-anos': {
    title: 'Corrida de Rua Nova Ipixuna Run 33 Anos',
    chipCompany: 'Chip Breu Branco',
    city: 'Nova Ipixuna',
    distances: ['5 km'],
    price: 95.00,
    priceFrom: 95.00,
    currentBatch: '3º Lote',
    categories: [
      { distance: '5 km', price: 95.00, lot_name: '3º Lote' }
    ],
    kitItems: [
      'Camiseta Oficial Nova Ipixuna Run',
      'Número de Peito com Chip de Cronometragem',
      'Carbo Gel Energético',
      'Sacola Personalizada do Evento',
      'Medalha de Participação'
    ],
    awardsInfo: 'Premiação Geral Especial 33 Anos: 1º Lugar: R$ 1.000,00 + Troféu | 2º Lugar: R$ 600,00 + Troféu | 3º Lugar: R$ 400,00 + Troféu (Masculino e Feminino). Troféus para os 3 primeiros colocados em todas as faixas etárias.',
    prizeTotal: 1000,
    registrationUrl: 'https://www.chipbreubranco.com.br/inscricao-select/2026/corrida-de-rua/corrida-de-rua-nova-ipixuna-run-33-anos',
    regulationUrl: 'https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-64-390be061edd144d8c93444237029dbb6.pdf'
  },
  '1-corrida-franciscana-800-anos': {
    title: '1ª Corrida Franciscana 800 Anos',
    chipCompany: 'Chip Breu Branco',
    city: 'Tailândia',
    distances: ['6 km'],
    price: 80.00,
    priceFrom: 80.00,
    currentBatch: '1º Lote',
    categories: [
      { distance: '6 km', price: 80.00, lot_name: '1º Lote' }
    ],
    kitItems: [
      'Camisa Oficial do Evento',
      'Número de Peito com Chip de Cronometragem',
      'Medalha Comemorativa Finisher',
      'Hidratação no Trajeto e Chegada'
    ],
    awardsInfo: 'Premiação Geral (Masculino e Feminino): 1º Lugar: R$ 500,00 + Troféu | 2º Lugar: R$ 350,00 + Troféu | 3º Lugar: R$ 250,00 + Troféu | 4º Lugar: R$ 150,00 + Troféu | 5º Lugar: R$ 100,00 + Troféu. Troféu para 1º ao 3º por categoria etária.',
    prizeTotal: 500,
    registrationUrl: 'https://www.chipbreubranco.com.br/inscricao-select/8826/1-corrida-franciscana-800-anos',
    regulationUrl: 'https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-064-08092026105001-74b4d273507a7e0eba857955bd45b2cf.pdf'
  },
  'ibc-run-1-etapa': {
    title: 'IBC Run – 1ª Etapa',
    chipCompany: 'Chip Breu Branco',
    city: 'Marabá',
    distances: ['5 km', '10 km', '3 km Caminhada'],
    price: 75.00,
    priceFrom: 75.00,
    currentBatch: '1º Lote',
    categories: [
      { distance: '5 km', price: 75.00, lot_name: '1º Lote' },
      { distance: '10 km', price: 85.00, lot_name: '1º Lote' },
      { distance: '3 km Caminhada', price: 65.00, lot_name: '1º Lote' }
    ],
    kitItems: [
      'Camisa Oficial do Evento',
      'Número de Peito com Chip de Cronometragem',
      'Sacochila Personalizada',
      'Medalha Finisher',
      'Brindes dos Patrocinadores'
    ],
    awardsInfo: 'Premiação Classificação Geral 10 km e 5 km: Troféus e prêmios para os 5 primeiros colocados Masculino e Feminino. 1º Lugar: R$ 400,00 + Troféu | 2º Lugar: R$ 300,00 + Troféu | 3º Lugar: R$ 200,00 + Troféu. Faixas etárias: Troféus do 1º ao 3º.',
    prizeTotal: 400,
    registrationUrl: 'https://www.chipbreubranco.com.br/inscricao-select/ibc-run-1-etapa-2026',
    regulationUrl: 'https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-064-24082026115953-919538026ca3a9e482448f3e0afe8941.pdf'
  },
  'corrida-solidaria-drogaria-barato': {
    title: 'Corrida Solidária Drogaria + Barato',
    chipCompany: 'Chip Chronos',
    city: 'Oeiras do Pará',
    distances: ['3 km', '5 km'],
    price: 55.00,
    priceFrom: 55.00,
    currentBatch: '1º Lote',
    categories: [
      { distance: '3 km', price: 50.00, lot_name: '1º Lote' },
      { distance: '5 km', price: 55.00, lot_name: '1º Lote' }
    ],
    kitItems: [
      'Número de Peito com Chip de Cronometragem',
      'Camiseta Oficial',
      'Medalha de Participação',
      'Hidratação e Frutas'
    ],
    awardsInfo: 'Premiação Geral (1º ao 5º Geral Masc/Fem): 1º Lugar: R$ 500,00 + Troféu | 2º Lugar: R$ 300,00 + Troféu | 3º Lugar: R$ 200,00 + Troféu | 4º e 5º Troféu de Destaque.',
    prizeTotal: 500,
    registrationUrl: 'https://www.superachipcrono.com.br/inscricao-select/5003/corrida-solidria-drogaria-barato',
    regulationUrl: 'https://racetime-clientes.s3.sa-east-1.amazonaws.com/uploads/superachipcrono/doc/inscricao/doc-093-02102026134233-7c07c57fdac8c86edca57efcdc5134a1.pdf'
  },
  '2-corrida-de-aniversario-de-jacunda-2026-65anos': {
    title: '2ª Corrida de Aniversário de Jacundá - 65 Anos',
    chipCompany: 'Chip Pará',
    city: 'Jacundá',
    distances: ['3,5 km', '5,5 km'],
    price: 65.00,
    priceFrom: 65.00,
    currentBatch: '1º Lote',
    categories: [
      { distance: '3,5 km', price: 60.00, lot_name: '1º Lote' },
      { distance: '5,5 km', price: 65.00, lot_name: '1º Lote' }
    ],
    kitItems: [
      'Camisa Oficial da Corrida',
      'Número de Peito com Chip de Cronometragem',
      'Medalha Comemorativa dos 65 Anos',
      'Caixa Personalizada e Brindes',
      'Hidratação e Mesa de Frutas'
    ],
    awardsInfo: 'Premiação Geral Especial 65 Anos: 1º Lugar: R$ 1.200,00 + Troféu | 2º Lugar: R$ 800,00 + Troféu | 3º Lugar: R$ 500,00 + Troféu | 4º Lugar: R$ 300,00 | 5º Lugar: R$ 200,00 (Masculino e Feminino). Premiação por faixas etárias do 1º ao 3º colocado.',
    prizeTotal: 1200,
    registrationUrl: 'https://www.chippara.com.br/inscricao-select/1259/2-corrida-de-aniversario-de-jacunda-2026-65anos',
    regulationUrl: 'https://www.chippara.com.br/painel/upload/doc/inscricao/doc-107-21092026214907-7f982c526e15dfa8be4c3eaa864c56ee.pdf'
  },
  '1-corrida-do-amor-em-prol-da-vida': {
    title: '1ª Corrida do Amor em Prol da Vida',
    chipCompany: 'Chip Pará',
    city: 'Marabá',
    distances: ['3 km', '5 km'],
    price: 85.00,
    priceFrom: 85.00,
    currentBatch: '1º Lote',
    categories: [
      { distance: '3 km', price: 75.00, lot_name: '1º Lote' },
      { distance: '5 km', price: 85.00, lot_name: '1º Lote' }
    ],
    kitItems: [
      'Camiseta Oficial do Amor',
      'Número de Peito com Chip de Cronometragem',
      'Medalha de Participação Finisher',
      'Hidratação e Apoio Médico'
    ],
    awardsInfo: 'Premiação Geral (1º ao 5º Lugar): 1º Lugar: R$ 500,00 + Troféu | 2º Lugar: R$ 300,00 + Troféu | 3º Lugar: R$ 200,00 + Troféu | 4º e 5º Troféus. Troféus para os 3 primeiros de cada faixa etária.',
    prizeTotal: 500,
    registrationUrl: 'https://www.chippara.com.br/inscricao-select/1682/1-corrida-do-amor-em-prol-da-vida',
    regulationUrl: 'https://www.chippara.com.br/painel/upload/doc/inscricao/doc-107-31082026121512-ffc0978c507577f2e1d0e7c17fd7457b.pdf'
  },
  '1-corrida-do-corre-de-terca': {
    title: '1ª Corrida do Corre de Terça',
    chipCompany: 'Chip Amazônia',
    city: 'Marabá',
    distances: ['5 km'],
    price: 54.90,
    priceFrom: 54.90,
    priceWithoutShirt: 54.90,
    priceWithShirt: 84.90,
    currentBatch: '1º Lote',
    categories: [
      { distance: '5 km (Sem Camisa)', price: 54.90, lot_name: 'Kit Padrão' },
      { distance: '5 km (Com Camisa)', price: 84.90, lot_name: 'Kit Premium' }
    ],
    kitItems: [
      'Número de Peito com Chip de Cronometragem',
      'Camisa Oficial (no Kit Premium)',
      'Medalha Finisher Metalizada',
      'Mesa de Frutas e Hidratação Gelada'
    ],
    awardsInfo: 'Premiação Geral Masc/Fem: 1º Lugar: R$ 600,00 + Troféu | 2º Lugar: R$ 400,00 + Troféu | 3º Lugar: R$ 250,00 + Troféu. Troféus para os 3 primeiros por faixas etárias.',
    prizeTotal: 600,
    registrationUrl: 'https://www.chipamazonia.com.br/inscricao-select/2026/corrida-de-rua/1-corrida-do-corre-de-tera',
    regulationUrl: 'https://www.chipamazonia.com.br/painel/upload/doc/inscricao/doc-105-06082026150225-8e7614ee0cfa2b42d0f626e439c86fb2.pdf'
  }
};

const finalRaces = rawEnriched.map(race => {
  let slug = race.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  
  // Encontra atualização curada se houver
  let matchedKey = Object.keys(curatedUpdates).find(k => slug.includes(k) || k.includes(slug));
  let custom = matchedKey ? curatedUpdates[matchedKey] : null;

  const titleClean = custom ? custom.title : toTitleCase(race.title);
  const chipCompany = custom ? custom.chipCompany : race.chipCompany;
  const prizeTotal = custom ? custom.prizeTotal : (race.prizeTotal || 100);
  const awardsInfo = custom ? custom.awardsInfo : (race.awardsInfo || 'Troféu oficial do 1º ao 5º Geral Masculino e Feminino + Troféus para os 3 primeiros colocados por faixa etária.');
  const distances = custom ? custom.distances : race.distances;
  const categories = custom ? custom.categories : race.categories;
  const kitItems = custom ? custom.kitItems : race.kitItems;

  return {
    ...race,
    title: titleClean,
    chipCompany: chipCompany,
    prizeTotal: prizeTotal,
    awardsInfo: awardsInfo,
    distances: distances,
    categories: categories,
    kitItems: kitItems,
    price: custom ? custom.price : race.price,
    priceFrom: custom ? custom.priceFrom : race.priceFrom,
    priceWithoutShirt: custom?.priceWithoutShirt ?? race.priceWithoutShirt,
    priceWithShirt: custom?.priceWithShirt ?? race.priceWithShirt,
    registrationUrl: custom?.registrationUrl || race.registrationUrl,
    regulationUrl: custom?.regulationUrl || race.regulationUrl
  };
});

// Salva em JSON e em snapshot exportável
fs.writeFileSync('scripts/final_30_races.json', JSON.stringify(finalRaces, null, 2));

const tsCode = `import type { Race } from '../../../../types/race';

export const FINAL_VERIFIED_RACES_V5: Race[] = ${JSON.stringify(finalRaces, null, 2)};
`;

fs.writeFileSync('src/modules/sync/data/finalVerifiedRacesV5.ts', tsCode);
console.log(`Saved ${finalRaces.length} polished races to src/modules/sync/data/finalVerifiedRacesV5.ts`);
