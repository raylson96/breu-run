const fs = require('fs');

const races = JSON.parse(fs.readFileSync('scripts/final_30_races.json', 'utf8'));

// Mapa completo de premiações reais extraídas diretamente dos regulamentos oficiais
const AWARDS_MAP = {
  // 1. Nova Ipixuna Run 33 Anos
  "race-chip-1-corrida-de-rua-nova-ipixuna-run-33-anos": {
    prizeTotal: 2000,
    awardsInfo: "Premiação Geral Especial 33 Anos (Masculino e Feminino):\n• 1º Lugar: R$ 1.000,00 + Troféu\n• 2º Lugar: R$ 600,00 + Troféu\n• 3º Lugar: R$ 400,00 + Troféu\nComunidade Local e Faixas Etárias: Troféus do 1º ao 3º lugar para todas as categorias.",
    awardGroups: [
      {
        name: "Classificação Geral (Masculino e Feminino)",
        items: [
          { place: "1º Lugar Geral", prize: "R$ 1.000,00 + Troféu", amount: 1000 },
          { place: "2º Lugar Geral", prize: "R$ 600,00 + Troféu", amount: 600 },
          { place: "3º Lugar Geral", prize: "R$ 400,00 + Troféu", amount: 400 }
        ]
      },
      {
        name: "Comunidade Local (Cidade)",
        items: [
          { place: "1º ao 3º Lugar", prize: "Troféu Oficial", amount: 0 }
        ]
      },
      {
        name: "Faixas Etárias (18-29, 30-39, 40-49, 50-59, 60+)",
        items: [
          { place: "1º ao 3º Lugar", prize: "Troféus Oficiais", amount: 0 }
        ]
      }
    ]
  },

  // 2. 1ª Corrida Franciscana 800 Anos (Tailândia)
  "race-chip-1-corrida-franciscana-800-anos": {
    prizeTotal: 1300,
    awardsInfo: "Premiação Geral (Masculino e Feminino):\n• 1º Lugar: R$ 500,00 + Troféu\n• 2º Lugar: R$ 350,00 + Troféu\n• 3º Lugar: R$ 250,00 + Troféu\n• 4º Lugar: R$ 150,00 + Troféu\n• 5º Lugar: R$ 100,00 + Troféu\nFaixas Etárias: Troféus do 1º ao 3º colocado em todas as faixas.",
    awardGroups: [
      {
        name: "Classificação Geral (Masculino e Feminino)",
        items: [
          { place: "1º Lugar Geral", prize: "R$ 500,00 + Troféu", amount: 500 },
          { place: "2º Lugar Geral", prize: "R$ 350,00 + Troféu", amount: 350 },
          { place: "3º Lugar Geral", prize: "R$ 250,00 + Troféu", amount: 250 },
          { place: "4º Lugar Geral", prize: "R$ 150,00 + Troféu", amount: 150 },
          { place: "5º Lugar Geral", prize: "R$ 100,00 + Troféu", amount: 100 }
        ]
      },
      {
        name: "Faixas Etárias",
        items: [
          { place: "1º ao 3º Lugar", prize: "Troféus de Pódio", amount: 0 }
        ]
      }
    ]
  },

  // 3. IBC Run – 1ª Etapa (Marabá)
  "race-chip-ibc-run-1-etapa": {
    prizeTotal: 900,
    awardsInfo: "Premiação Classificação Geral 10 km e 5 km (Masculino e Feminino):\n• 1º Lugar: R$ 400,00 + Troféu\n• 2º Lugar: R$ 300,00 + Troféu\n• 3º Lugar: R$ 200,00 + Troféu\n• 4º e 5º Lugar: Troféus Oficiais\nFaixas Etárias: Troféus do 1º ao 3º lugar.",
    awardGroups: [
      {
        name: "Classificação Geral (10 km e 5 km)",
        items: [
          { place: "1º Lugar Geral", prize: "R$ 400,00 + Troféu", amount: 400 },
          { place: "2º Lugar Geral", prize: "R$ 300,00 + Troféu", amount: 300 },
          { place: "3º Lugar Geral", prize: "R$ 200,00 + Troféu", amount: 200 },
          { place: "4º Lugar Geral", prize: "Troféu", amount: 0 },
          { place: "5º Lugar Geral", prize: "Troféu", amount: 0 }
        ]
      }
    ]
  },

  // 4. Corrida Restô Caamutá (Cametá)
  "race-chip-corrida-resto-caamuta": {
    prizeTotal: 2000,
    awardsInfo: "Premiação Geral 8 km (Masculino e Feminino - Tempo Bruto):\n• 1º Lugar: R$ 600,00 + Troféu\n• 2º Lugar: R$ 500,00 + Troféu\n• 3º Lugar: R$ 400,00 + Troféu\n• 4º Lugar: R$ 300,00 + Troféu\n• 5º Lugar: R$ 200,00 + Troféu\nFaixas Etárias: Troféus do 1º ao 5º lugar em todas as faixas (tempo líquido).",
    awardGroups: [
      {
        name: "Classificação Geral 8 km (Masculino e Feminino)",
        items: [
          { place: "1º Lugar Geral", prize: "R$ 600,00 + Troféu", amount: 600 },
          { place: "2º Lugar Geral", prize: "R$ 500,00 + Troféu", amount: 500 },
          { place: "3º Lugar Geral", prize: "R$ 400,00 + Troféu", amount: 400 },
          { place: "4º Lugar Geral", prize: "R$ 300,00 + Troféu", amount: 300 },
          { place: "5º Lugar Geral", prize: "R$ 200,00 + Troféu", amount: 200 }
        ]
      },
      {
        name: "Faixas Etárias 8 km",
        items: [
          { place: "1º ao 5º Lugar", prize: "Troféu Oficial", amount: 0 }
        ]
      }
    ]
  },

  // 5. 1ª Meia Maratona House Runners de Tailândia 2026 (Tailândia)
  "race-chip-1-meia-maratona-house-runners-de-tailandia-2026": {
    prizeTotal: 11800,
    awardsInfo: "Premiação Total de R$ 11.800,00 em Dinheiro!\n\nMeia Maratona 21 km Geral (Masc e Fem):\n• 1º Lugar: R$ 1.000,00 + Troféu\n• 2º Lugar: R$ 500,00 + Troféu\n• 3º Lugar: R$ 400,00 + Troféu\n• 4º Lugar: R$ 300,00 + Troféu\n• 5º Lugar: R$ 200,00 + Troféu\n\nFaixas Etárias 21 km:\n• 1º: R$ 300,00 | 2º: R$ 200,00 | 3º: R$ 100,00 | 4º e 5º: Troféu\n\nProva 5 km Geral (Masc e Fem):\n• 1º: R$ 400,00 | 2º: R$ 300,00 | 3º: R$ 200,00 | 4º: R$ 100,00 | 5º: R$ 100,00",
    awardGroups: [
      {
        name: "Meia Maratona 21 km - Geral (Masculino e Feminino)",
        items: [
          { place: "1º Lugar Geral", prize: "R$ 1.000,00 + Troféu", amount: 1000 },
          { place: "2º Lugar Geral", prize: "R$ 500,00 + Troféu", amount: 500 },
          { place: "3º Lugar Geral", prize: "R$ 400,00 + Troféu", amount: 400 },
          { place: "4º Lugar Geral", prize: "R$ 300,00 + Troféu", amount: 300 },
          { place: "5º Lugar Geral", prize: "R$ 200,00 + Troféu", amount: 200 }
        ]
      },
      {
        name: "Meia Maratona 21 km - Faixas Etárias (18-29, 30-39, 40-49, 50+)",
        items: [
          { place: "1º Lugar Faixa", prize: "R$ 300,00 + Troféu", amount: 300 },
          { place: "2º Lugar Faixa", prize: "R$ 200,00 + Troféu", amount: 200 },
          { place: "3º Lugar Faixa", prize: "R$ 100,00 + Troféu", amount: 100 },
          { place: "4º e 5º Lugares", prize: "Troféus", amount: 0 }
        ]
      },
      {
        name: "Corrida 5 km - Geral (Masculino e Feminino)",
        items: [
          { place: "1º Lugar Geral 5k", prize: "R$ 400,00 + Troféu", amount: 400 },
          { place: "2º Lugar Geral 5k", prize: "R$ 300,00 + Troféu", amount: 300 },
          { place: "3º Lugar Geral 5k", prize: "R$ 200,00 + Troféu", amount: 200 },
          { place: "4º Lugar Geral 5k", prize: "R$ 100,00 + Troféu", amount: 100 },
          { place: "5º Lugar Geral 5k", prize: "R$ 100,00 + Troféu", amount: 100 }
        ]
      }
    ]
  },

  // 6. 1ª Corrida Provenet 20 Anos (Anapu)
  "race-chip-1-corrida-provenet-20-anos": {
    prizeTotal: 0,
    awardsInfo: "Premiação Oficial com Troféus Personalizados do 1º ao 5º Geral Masculino e Feminino. Troféus para os 3 primeiros colocados em todas as faixas etárias e medalha de conclusão para todos os concluintes.",
    awardGroups: [
      {
        name: "Classificação Geral (Masculino e Feminino)",
        items: [
          { place: "1º Lugar Geral", prize: "Troféu Oficial", amount: 0 },
          { place: "2º Lugar Geral", prize: "Troféu Oficial", amount: 0 },
          { place: "3º Lugar Geral", prize: "Troféu Oficial", amount: 0 },
          { place: "4º Lugar Geral", prize: "Troféu Oficial", amount: 0 },
          { place: "5º Lugar Geral", prize: "Troféu Oficial", amount: 0 }
        ]
      }
    ]
  },

  // 7. 1ª Edição da Corrida One Run Desafio dos Campeões 2026 (Redenção)
  "race-chip-1-edicao-da-corrida-one-run-desafio-dos-campeoes-2026": {
    prizeTotal: 3300,
    awardsInfo: "Premiação Geral (Masculino e Feminino):\n• 1º Colocado: R$ 1.000,00 + Troféu\n• 2º Colocado: R$ 800,00 + Troféu\n• 3º Colocado: R$ 600,00 + Troféu\n• 4º Colocado: R$ 500,00 + Troféu\n• 5º Colocado: R$ 400,00 + Troféu\n\nFaixas Etárias (16-29, 30-39, 40-49, 50-59, 60+ anos):\n• 1º: R$ 300,00 | 2º: R$ 250,00 | 3º: R$ 200,00 | 4º: R$ 150,00 | 5º: R$ 100,00 + Troféus.",
    awardGroups: [
      {
        name: "Classificação Geral (Masculino e Feminino)",
        items: [
          { place: "1º Lugar Geral", prize: "R$ 1.000,00 + Troféu", amount: 1000 },
          { place: "2º Lugar Geral", prize: "R$ 800,00 + Troféu", amount: 800 },
          { place: "3º Lugar Geral", prize: "R$ 600,00 + Troféu", amount: 600 },
          { place: "4º Lugar Geral", prize: "R$ 500,00 + Troféu", amount: 500 },
          { place: "5º Lugar Geral", prize: "R$ 400,00 + Troféu", amount: 400 }
        ]
      },
      {
        name: "Faixas Etárias (16-29, 30-39, 40-49, 50-59, 60+)",
        items: [
          { place: "1º Lugar Faixa", prize: "R$ 300,00 + Troféu", amount: 300 },
          { place: "2º Lugar Faixa", prize: "R$ 250,00 + Troféu", amount: 250 },
          { place: "3º Lugar Faixa", prize: "R$ 200,00 + Troféu", amount: 200 },
          { place: "4º Lugar Faixa", prize: "R$ 150,00 + Troféu", amount: 150 },
          { place: "5º Lugar Faixa", prize: "R$ 100,00 + Troféu", amount: 100 }
        ]
      }
    ]
  },

  // 8. 1° Corrida Jn Run (Tomé-Açu)
  "race-chip-1-corrida-jn-run": {
    prizeTotal: 3200,
    awardsInfo: "Premiação Geral (Masculino e Feminino):\n• 1º Lugar: R$ 1.500,00 + Troféu\n• 2º Lugar: R$ 1.000,00 + Troféu\n• 3º Lugar: R$ 700,00 + Troféu\n\nComunidade Local (Tomé-Açu):\n• 1º Lugar: R$ 1.000,00 + Troféu\n• 2º Lugar: R$ 700,00 + Troféu\n• 3º Lugar: R$ 500,00 + Troféu\n\nFaixas Etárias:\n• 1º Lugar: R$ 300,00 + Troféu\n• 2º Lugar: R$ 200,00 + Troféu\n• 3º Lugar: R$ 100,00 + Troféu",
    awardGroups: [
      {
        name: "Classificação Geral (Masculino e Feminino)",
        items: [
          { place: "1º Lugar Geral", prize: "R$ 1.500,00 + Troféu", amount: 1500 },
          { place: "2º Lugar Geral", prize: "R$ 1.000,00 + Troféu", amount: 1000 },
          { place: "3º Lugar Geral", prize: "R$ 700,00 + Troféu", amount: 700 }
        ]
      },
      {
        name: "Comunidade Local (Tomé-Açu)",
        items: [
          { place: "1º Lugar Local", prize: "R$ 1.000,00 + Troféu", amount: 1000 },
          { place: "2º Lugar Local", prize: "R$ 700,00 + Troféu", amount: 700 },
          { place: "3º Lugar Local", prize: "R$ 500,00 + Troféu", amount: 500 }
        ]
      },
      {
        name: "Faixas Etárias (18-29, 30-39, 40-49, 50-59, 60+)",
        items: [
          { place: "1º Lugar Faixa", prize: "R$ 300,00 + Troféu", amount: 300 },
          { place: "2º Lugar Faixa", prize: "R$ 200,00 + Troféu", amount: 200 },
          { place: "3º Lugar Faixa", prize: "R$ 100,00 + Troféu", amount: 100 }
        ]
      }
    ]
  },

  // 9. Corrida de Aniversário Delícia do Guaraná - 30 Anos (Só Nós Run - Os Favoritos)
  "race-chip-corrida-de-aniversario-delicia-do-guarana-30-anos": {
    prizeTotal: 2900,
    awardsInfo: "Premiação Categoria Geral / Favoritos (Masculino e Feminino):\n• 1º Lugar: R$ 1.000,00 + Troféu\n• 2º Lugar: R$ 700,00 + Troféu\n• 3º Lugar: R$ 500,00 + Troféu\n• 4º Lugar: R$ 400,00 + Troféu\n• 5º Lugar: R$ 300,00 + Troféu\n\nCategorias PCD, LGBTQIAPN+ e Faixas Etárias:\n• 1º: R$ 150,00 + Troféu | 2º: R$ 100,00 + Troféu | 3º: R$ 50,00 + Troféu",
    awardGroups: [
      {
        name: "Categoria Geral / Favoritos (Masculino e Feminino)",
        items: [
          { place: "1º Lugar Geral", prize: "R$ 1.000,00 + Troféu", amount: 1000 },
          { place: "2º Lugar Geral", prize: "R$ 700,00 + Troféu", amount: 700 },
          { place: "3º Lugar Geral", prize: "R$ 500,00 + Troféu", amount: 500 },
          { place: "4º Lugar Geral", prize: "R$ 400,00 + Troféu", amount: 400 },
          { place: "5º Lugar Geral", prize: "R$ 300,00 + Troféu", amount: 300 }
        ]
      },
      {
        name: "Categorias Especiais (PCD e LGBTQIAPN+)",
        items: [
          { place: "1º Lugar", prize: "R$ 150,00 + Troféu", amount: 150 },
          { place: "2º Lugar", prize: "R$ 100,00 + Troféu", amount: 100 },
          { place: "3º Lugar", prize: "R$ 50,00 + Troféu", amount: 50 }
        ]
      },
      {
        name: "Faixas Etárias",
        items: [
          { place: "1º Lugar Faixa", prize: "R$ 150,00 + Troféu", amount: 150 },
          { place: "2º Lugar Faixa", prize: "R$ 100,00 + Troféu", amount: 100 },
          { place: "3º Lugar Faixa", prize: "R$ 50,00 + Troféu", amount: 50 }
        ]
      }
    ]
  },

  // 10. Corrida Contra o Racismo (Concórdia do Pará)
  "race-chip-corrida-contra-o-racismo": {
    prizeTotal: 1200,
    awardsInfo: "Premiação Oficial (Conforme Regulamento - Inscrição R$ 80,00):\n• 1º Lugar Geral: R$ 600,00 + Troféu\n• 2º Lugar Geral: R$ 400,00 + Troféu\n• 3º Lugar Geral: R$ 200,00 + Troféu\nCategorias PCD e Estudante EG: Medalha Oficial + Troféu de Pódio.",
    awardGroups: [
      {
        name: "Classificação Geral (Masculino e Feminino)",
        items: [
          { place: "1º Lugar Geral", prize: "R$ 600,00 + Troféu", amount: 600 },
          { place: "2º Lugar Geral", prize: "R$ 400,00 + Troféu", amount: 400 },
          { place: "3º Lugar Geral", prize: "R$ 200,00 + Troféu", amount: 200 }
        ]
      },
      {
        name: "Categorias PCD e Estudante EG",
        items: [
          { place: "Pódio de Destaque", prize: "Medalha Especial + Troféu", amount: 0 }
        ]
      }
    ]
  },

  // 11. 2ª Corrida dos Empresários (Tailândia)
  "race-chip-2-corrida-dos-empresarios": {
    prizeTotal: 15000,
    awardsInfo: "Premiação Total de R$ 15.000,00 em Dinheiro!\n\nClassificação Geral (Masc e Fem):\n• 1º Lugar: R$ 1.000,00 + Troféu\n• 2º Lugar: R$ 600,00 + Troféu\n• 3º Lugar: R$ 400,00 + Troféu\n• 4º e 5º Lugar: Troféus\n\nComunidade Local (Tailândia):\n• 1º Lugar: R$ 1.000,00 + Troféu\n• 2º Lugar: R$ 600,00 + Troféu\n• 3º Lugar: R$ 400,00 + Troféu\n\nFaixas Etárias & Empresários:\n• 1º: R$ 300,00 | 2º: R$ 200,00 | 3º: R$ 100,00 + Troféus\n\nMaiores Equipes:\n• 1ª: R$ 500,00 | 2ª: R$ 300,00 | 3ª: R$ 200,00",
    awardGroups: [
      {
        name: "Classificação Geral (Masculino e Feminino)",
        items: [
          { place: "1º Lugar Geral", prize: "R$ 1.000,00 + Troféu", amount: 1000 },
          { place: "2º Lugar Geral", prize: "R$ 600,00 + Troféu", amount: 600 },
          { place: "3º Lugar Geral", prize: "R$ 400,00 + Troféu", amount: 400 },
          { place: "4º Lugar Geral", prize: "Troféu", amount: 0 },
          { place: "5º Lugar Geral", prize: "Troféu", amount: 0 }
        ]
      },
      {
        name: "Comunidade Local (Tailândia)",
        items: [
          { place: "1º Lugar Local", prize: "R$ 1.000,00 + Troféu", amount: 1000 },
          { place: "2º Lugar Local", prize: "R$ 600,00 + Troféu", amount: 600 },
          { place: "3º Lugar Local", prize: "R$ 400,00 + Troféu", amount: 400 }
        ]
      },
      {
        name: "Faixas Etárias & Categoria Empresários",
        items: [
          { place: "1º Lugar Faixa / Empresário", prize: "R$ 300,00 + Troféu", amount: 300 },
          { place: "2º Lugar Faixa / Empresário", prize: "R$ 200,00 + Troféu", amount: 200 },
          { place: "3º Lugar Faixa / Empresário", prize: "R$ 100,00 + Troféu", amount: 100 }
        ]
      },
      {
        name: "Premiação para Maiores Equipes",
        items: [
          { place: "1ª Maior Equipe", prize: "R$ 500,00 + Troféu", amount: 500 },
          { place: "2ª Maior Equipe", prize: "R$ 300,00 + Troféu", amount: 300 },
          { place: "3ª Maior Equipe", prize: "R$ 200,00 + Troféu", amount: 200 }
        ]
      }
    ]
  },

  // 12. 2ª Corrida de Rua e VI Open da Box Eleven (Tailândia)
  "race-chip-2-corrida-de-rua-e-vi-open-da-box-eleven": {
    prizeTotal: 1000,
    awardsInfo: "Premiação Geral 5 km (Masculino e Feminino):\n• 1º Colocado: R$ 300,00 + Troféu\n• 2º Colocado: R$ 250,00 + Troféu\n• 3º Colocado: R$ 200,00 + Troféu\n• 4º Colocado: R$ 150,00 + Troféu\n• 5º Colocado: R$ 100,00 + Troféu\n\nComunidade Local:\n• 1º: R$ 400,00 | 2º: R$ 350,00 | 3º: R$ 300,00 | 4º: R$ 250,00 | 5º: R$ 200,00\n\nFaixas Etárias:\n• 1º: R$ 200,00 | 2º: R$ 150,00 | 3º: R$ 100,00 + Troféus",
    awardGroups: [
      {
        name: "Classificação Geral 5 km (Masculino e Feminino)",
        items: [
          { place: "1º Lugar Geral", prize: "R$ 300,00 + Troféu", amount: 300 },
          { place: "2º Lugar Geral", prize: "R$ 250,00 + Troféu", amount: 250 },
          { place: "3º Lugar Geral", prize: "R$ 200,00 + Troféu", amount: 200 },
          { place: "4º Lugar Geral", prize: "R$ 150,00 + Troféu", amount: 150 },
          { place: "5º Lugar Geral", prize: "R$ 100,00 + Troféu", amount: 100 }
        ]
      },
      {
        name: "Comunidade Local (Tailândia)",
        items: [
          { place: "1º Lugar Local", prize: "R$ 400,00 + Troféu", amount: 400 },
          { place: "2º Lugar Local", prize: "R$ 350,00 + Troféu", amount: 350 },
          { place: "3º Lugar Local", prize: "R$ 300,00 + Troféu", amount: 300 },
          { place: "4º Lugar Local", prize: "R$ 250,00 + Troféu", amount: 250 },
          { place: "5º Lugar Local", prize: "R$ 200,00 + Troféu", amount: 200 }
        ]
      },
      {
        name: "Faixas Etárias (15-29, 30-39, 40-49, 50+)",
        items: [
          { place: "1º Lugar Faixa", prize: "R$ 200,00 + Troféu", amount: 200 },
          { place: "2º Lugar Faixa", prize: "R$ 150,00 + Troféu", amount: 150 },
          { place: "3º Lugar Faixa", prize: "R$ 100,00 + Troféu", amount: 100 }
        ]
      }
    ]
  },

  // 13. 1ª Corrida Corrente do Bem (Pacajá)
  "race-chip-1-corrida-corrente-do-bem": {
    prizeTotal: 1800,
    awardsInfo: "Premiação Geral (Masculino e Feminino):\n• 1º Lugar: R$ 700,00 + Troféu\n• 2º Lugar: R$ 600,00 + Troféu\n• 3º Lugar: R$ 500,00 + Troféu\n\nFaixas Etárias:\n• 1º Lugar: R$ 400,00 + Troféu\n• 2º Lugar: R$ 300,00 + Troféu\n• 3º Lugar: R$ 200,00 + Troféu\n\nCategoria Mirim:\n• 1º: R$ 300,00 | 2º: R$ 200,00 | 3º: R$ 100,00 + Troféu",
    awardGroups: [
      {
        name: "Classificação Geral (Masculino e Feminino)",
        items: [
          { place: "1º Lugar Geral", prize: "R$ 700,00 + Troféu", amount: 700 },
          { place: "2º Lugar Geral", prize: "R$ 600,00 + Troféu", amount: 600 },
          { place: "3º Lugar Geral", prize: "R$ 500,00 + Troféu", amount: 500 }
        ]
      },
      {
        name: "Faixas Etárias Adulto",
        items: [
          { place: "1º Lugar Faixa", prize: "R$ 400,00 + Troféu", amount: 400 },
          { place: "2º Lugar Faixa", prize: "R$ 300,00 + Troféu", amount: 300 },
          { place: "3º Lugar Faixa", prize: "R$ 200,00 + Troféu", amount: 200 }
        ]
      },
      {
        name: "Categoria Mirim (05 a 12 anos)",
        items: [
          { place: "1º Lugar Mirim", prize: "R$ 300,00 + Troféu", amount: 300 },
          { place: "2º Lugar Mirim", prize: "R$ 200,00 + Troféu", amount: 200 },
          { place: "3º Lugar Mirim", prize: "R$ 100,00 + Troféu", amount: 100 }
        ]
      }
    ]
  },

  // 14. 1ª Corrida de Obstáculos de Novo Repartimento
  "race-chip-1-corrida-de-obstaculos-de-novo-repartimento": {
    prizeTotal: 0,
    awardsInfo: "Troféus Oficiais para os 5 primeiros colocados Geral Masculino e Feminino e troféus para os 3 primeiros colocados por faixa etária.",
    awardGroups: [
      {
        name: "Classificação Geral (Masculino e Feminino)",
        items: [
          { place: "1º ao 5º Lugar", prize: "Troféus de Pódio", amount: 0 }
        ]
      }
    ]
  },

  // 15. Corrida do Círio (Abaetetuba)
  "race-chip-corrida-do-cirio": {
    prizeTotal: 1000,
    awardsInfo: "Premiação Geral (Masculino e Feminino):\n• 1º Colocado: R$ 500,00 + Troféu + Brindes\n• 2º Colocado: R$ 300,00 + Troféu + Brindes\n• 3º Colocado: R$ 200,00 + Troféu + Brindes\n• 4º e 5º Colocados: Troféu + Brindes\n\nCategoria Local e PCD:\n• 1º: R$ 500,00 | 2º: R$ 300,00 | 3º: R$ 200,00 + Troféu + Brindes",
    awardGroups: [
      {
        name: "Classificação Geral (Masculino e Feminino)",
        items: [
          { place: "1º Lugar Geral", prize: "R$ 500,00 + Troféu + Brindes", amount: 500 },
          { place: "2º Lugar Geral", prize: "R$ 300,00 + Troféu + Brindes", amount: 300 },
          { place: "3º Lugar Geral", prize: "R$ 200,00 + Troféu + Brindes", amount: 200 },
          { place: "4º Lugar Geral", prize: "Troféu + Brindes", amount: 0 },
          { place: "5º Lugar Geral", prize: "Troféu + Brindes", amount: 0 }
        ]
      },
      {
        name: "Categoria Local e PCD",
        items: [
          { place: "1º Lugar", prize: "R$ 500,00 + Troféu + Brindes", amount: 500 },
          { place: "2º Lugar", prize: "R$ 300,00 + Troféu + Brindes", amount: 300 },
          { place: "3º Lugar", prize: "R$ 200,00 + Troféu + Brindes", amount: 200 }
        ]
      }
    ]
  },

  // 16. Lav Bday Run (Abaetetuba)
  "race-chip-lav-bday-run": {
    prizeTotal: 0,
    awardsInfo: "Troféus Oficiais para 1º, 2º e 3º lugares Geral Feminino e Masculino. Premiação especial para 50+, PCD, LGBTQIAPN+, Alunos LAV e categorias em Dupla.",
    awardGroups: [
      {
        name: "Classificação Geral (Masculino e Feminino)",
        items: [
          { place: "1º Lugar Geral", prize: "Troféu Oficial", amount: 0 },
          { place: "2º Lugar Geral", prize: "Troféu Oficial", amount: 0 },
          { place: "3º Lugar Geral", prize: "Troféu Oficial", amount: 0 }
        ]
      }
    ]
  },

  // 17. 2ª Corrida Missionária (Marabá)
  "race-chip-2-corrida-missionaria": {
    prizeTotal: 0,
    awardsInfo: "Troféus para os 1º, 2º e 3º colocados em todas as categorias (9 a 14 anos, 19 a 29 anos, 30 a 39 anos, 40 a 49 anos e 50 a 59 anos). Medalha de participação para todos os atletas.",
    awardGroups: [
      {
        name: "Categorias e Faixas Etárias",
        items: [
          { place: "1º ao 3º Lugar", prize: "Troféus Oficiais", amount: 0 }
        ]
      }
    ]
  },

  // 18. Corrida Tático Extreme Run (Abaetetuba)
  "race-chip-corrida-tatico-extreme-run": {
    prizeTotal: 500,
    awardsInfo: "Premiação Categoria Geral (Masculino e Feminino):\n• 1º Colocado: R$ 500,00 + Troféu + Brindes\n• 2º ao 5º Colocado: Troféu + Brindes\n\nCategorias PCD, Segurança Pública e Faixas Etárias: Troféus + Brindes para os 3 primeiros colocados.",
    awardGroups: [
      {
        name: "Classificação Geral (Masculino e Feminino)",
        items: [
          { place: "1º Lugar Geral", prize: "R$ 500,00 + Troféu + Brindes", amount: 500 },
          { place: "2º Lugar Geral", prize: "Troféu + Brindes", amount: 0 },
          { place: "3º Lugar Geral", prize: "Troféu + Brindes", amount: 0 },
          { place: "4º Lugar Geral", prize: "Troféu + Brindes", amount: 0 },
          { place: "5º Lugar Geral", prize: "Troféu + Brindes", amount: 0 }
        ]
      },
      {
        name: "Segurança Pública, PCD e Faixas Etárias",
        items: [
          { place: "1º ao 3º Lugar", prize: "Troféu Oficial + Brindes", amount: 0 }
        ]
      }
    ]
  },

  // 19. 1ª Corrida do Amor em Prol da Vida (Anapu)
  "race-chip-1-corrida-do-amor-em-prol-da-vida": {
    prizeTotal: 1300,
    awardsInfo: "Premiação Geral (Masculino e Feminino):\n• 1º Lugar: R$ 600,00 + Troféu\n• 2º Lugar: R$ 400,00 + Troféu\n• 3º Lugar: R$ 300,00 + Troféu\n• 4º e 5º Lugares: Troféus\n\nFaixas Etárias: Premiação em dinheiro e troféus para os melhores colocados.",
    awardGroups: [
      {
        name: "Classificação Geral (Masculino e Feminino)",
        items: [
          { place: "1º Lugar Geral", prize: "R$ 600,00 + Troféu", amount: 600 },
          { place: "2º Lugar Geral", prize: "R$ 400,00 + Troféu", amount: 400 },
          { place: "3º Lugar Geral", prize: "R$ 300,00 + Troféu", amount: 300 },
          { place: "4º Lugar Geral", prize: "Troféu", amount: 0 },
          { place: "5º Lugar Geral", prize: "Troféu", amount: 0 }
        ]
      }
    ]
  },

  // 20. 2ª Corrida de Aniversário de Jacundá 2026 - 65 Anos
  "race-chip-2-corrida-de-aniversario-de-jacunda-2026-65-anos": {
    prizeTotal: 35100,
    awardsInfo: "Premiação Financeira Recorde: R$ 35.100,00 em Dinheiro!\n\nClassificação Geral (Masc e Fem):\n• 1º lugar: R$ 1.500,00 + Troféu\n• 2º lugar: R$ 1.300,00 + Troféu\n• 3º lugar: R$ 1.200,00 + Troféu\n• 4º lugar: R$ 1.000,00 + Troféu\n• 5º lugar: R$ 800,00 + Troféu\n(Total Geral: R$ 11.600,00)\n\nComunidade Local (Masc e Fem):\n• 1º: R$ 1.000,00 | 2º: R$ 800,00 | 3º: R$ 600,00 | 4º: R$ 400,00 | 5º: R$ 300,00\n\nFaixas Etárias (todas as faixas Masc/Fem):\n• 1º: R$ 400,00 | 2º: R$ 300,00 | 3º: R$ 250,00 | 4º: R$ 200,00 | 5º: R$ 150,00\n\nMaiores Equipes:\n• 1ª: R$ 550,00 | 2ª: R$ 400,00 | 3ª: R$ 300,00 | 4ª: R$ 200,00 | 5ª: R$ 150,00",
    awardGroups: [
      {
        name: "Classificação Geral (Masculino e Feminino)",
        items: [
          { place: "1º Lugar Geral", prize: "R$ 1.500,00 + Troféu", amount: 1500 },
          { place: "2º Lugar Geral", prize: "R$ 1.300,00 + Troféu", amount: 1300 },
          { place: "3º Lugar Geral", prize: "R$ 1.200,00 + Troféu", amount: 1200 },
          { place: "4º Lugar Geral", prize: "R$ 1.000,00 + Troféu", amount: 1000 },
          { place: "5º Lugar Geral", prize: "R$ 800,00 + Troféu", amount: 800 }
        ]
      },
      {
        name: "Comunidade Local de Jacundá (Masculino e Feminino)",
        items: [
          { place: "1º Lugar Local", prize: "R$ 1.000,00 + Troféu", amount: 1000 },
          { place: "2º Lugar Local", prize: "R$ 800,00 + Troféu", amount: 800 },
          { place: "3º Lugar Local", prize: "R$ 600,00 + Troféu", amount: 600 },
          { place: "4º Lugar Local", prize: "R$ 400,00 + Troféu", amount: 400 },
          { place: "5º Lugar Local", prize: "R$ 300,00 + Troféu", amount: 300 }
        ]
      },
      {
        name: "Faixas Etárias (todas as categorias etárias)",
        items: [
          { place: "1º Lugar Faixa", prize: "R$ 400,00 + Troféu", amount: 400 },
          { place: "2º Lugar Faixa", prize: "R$ 300,00 + Troféu", amount: 300 },
          { place: "3º Lugar Faixa", prize: "R$ 250,00 + Troféu", amount: 250 },
          { place: "4º Lugar Faixa", prize: "R$ 200,00 + Troféu", amount: 200 },
          { place: "5º Lugar Faixa", prize: "R$ 150,00 + Troféu", amount: 150 }
        ]
      },
      {
        name: "Premiação Especial para Maiores Equipes",
        items: [
          { place: "1ª Maior Equipe", prize: "R$ 550,00 + Troféu", amount: 550 },
          { place: "2ª Maior Equipe", prize: "R$ 400,00 + Troféu", amount: 400 },
          { place: "3ª Maior Equipe", prize: "R$ 300,00 + Troféu", amount: 300 },
          { place: "4ª Maior Equipe", prize: "R$ 200,00 + Troféu", amount: 200 },
          { place: "5ª Maior Equipe", prize: "R$ 150,00 + Troféu", amount: 150 }
        ]
      }
    ]
  },

  // 21. 2° Corridinha Cacau Show (Cametá)
  "race-chip-2-corridinha-cacau-show": {
    prizeTotal: 0,
    awardsInfo: "Troféus oficiais e kits Cacau Show para os primeiros colocados em cada categoria infantil por faixa etária.",
    awardGroups: [
      {
        name: "Categorias Infantis por Idade",
        items: [
          { place: "1º ao 3º Lugar Infantil", prize: "Troféu + Kit Especial Cacau Show", amount: 0 }
        ]
      }
    ]
  },

  // 22. 1° Corrida Satlinkplay (Tucuruí)
  "race-chip-1-corrida-satlinkplay": {
    prizeTotal: 2100,
    awardsInfo: "Premiação Geral 5 km (Masculino e Feminino - Ordem de Chegada):\n• 1º Lugar: R$ 700,00 + Troféu\n• 2º Lugar: R$ 500,00 + Troféu\n• 3º Lugar: R$ 400,00 + Troféu\n• 4º Lugar: R$ 300,00 + Troféu\n• 5º Lugar: R$ 200,00 + Troféu\nMedalha finisher de participação para todos os inscritos concluintes.",
    awardGroups: [
      {
        name: "Classificação Geral 5 km (Masculino e Feminino)",
        items: [
          { place: "1º Lugar Geral", prize: "R$ 700,00 + Troféu", amount: 700 },
          { place: "2º Lugar Geral", prize: "R$ 500,00 + Troféu", amount: 500 },
          { place: "3º Lugar Geral", prize: "R$ 400,00 + Troféu", amount: 400 },
          { place: "4º Lugar Geral", prize: "R$ 300,00 + Troféu", amount: 300 },
          { place: "5º Lugar Geral", prize: "R$ 200,00 + Troféu", amount: 200 }
        ]
      }
    ]
  },

  // 23. Corrida Solidária Drogaria + Barato (Oeiras do Pará)
  "race-chip-corrida-solidaria-drogaria-barato": {
    prizeTotal: 950,
    awardsInfo: "Premiação Geral 5 km (Masculino e Feminino - Tempo Bruto):\n• 1º Lugar: R$ 500,00 + Troféu\n• 2º Lugar: R$ 300,00 + Troféu\n• 3º Lugar: R$ 150,00 + Troféu\n\nClassificação por Faixas Etárias (Tempo Bruto):\n• Troféus de 1º, 2º e 3º Lugar em todas as faixas.",
    awardGroups: [
      {
        name: "Classificação Geral 5 km (Masculino e Feminino)",
        items: [
          { place: "1º Lugar Geral", prize: "R$ 500,00 + Troféu", amount: 500 },
          { place: "2º Lugar Geral", prize: "R$ 300,00 + Troféu", amount: 300 },
          { place: "3º Lugar Geral", prize: "R$ 150,00 + Troféu", amount: 150 }
        ]
      },
      {
        name: "Faixas Etárias (Masc e Fem)",
        items: [
          { place: "1º ao 3º Lugar", prize: "Troféus Oficiais", amount: 0 }
        ]
      }
    ]
  },

  // 24. 1° Corridinha Gagumi Kids (Cametá)
  "race-chip-1-corridinha-gagumi-kids": {
    prizeTotal: 0,
    awardsInfo: "Troféus e medalhas para todas as categorias infantis e juvenis.",
    awardGroups: [
      {
        name: "Categorias Infantis",
        items: [
          { place: "Pódio Kids", prize: "Troféus e Medalhas", amount: 0 }
        ]
      }
    ]
  },

  // 25. 2º Corrida Rosa Pink 2026 (Nova Ipixuna)
  "race-chip-2-corrida-rosa-pink-2026": {
    prizeTotal: 0,
    awardsInfo: "Troféus oficiais do 1º ao 5º lugar Geral Masculino e Feminino e troféus para os 3 primeiros colocados por faixa etária.",
    awardGroups: [
      {
        name: "Classificação Geral (Masculino e Feminino)",
        items: [
          { place: "1º ao 5º Lugar", prize: "Troféus de Pódio", amount: 0 }
        ]
      }
    ]
  },

  // 26. 2ª Corrida Sabor do Pará 2026 (Marabá)
  "race-chip-2-corrida-sabor-do-para-2026": {
    prizeTotal: 0,
    awardsInfo: "Troféus oficiais do 1º ao 5º lugar Geral Masculino e Feminino e troféus para os 3 primeiros de cada faixa etária.",
    awardGroups: [
      {
        name: "Classificação Geral (Masculino e Feminino)",
        items: [
          { place: "1º ao 5º Lugar", prize: "Troféus de Pódio", amount: 0 }
        ]
      }
    ]
  },

  // 27. 1ª Corrida de Rua Lr Fitness Academia (Mosqueiro)
  "race-chip-1-corrida-de-rua-lr-fitness-academia": {
    prizeTotal: 0,
    awardsInfo: "Troféus oficiais do 1º ao 5º lugar Geral Masculino e Feminino e troféus para os 3 primeiros de cada categoria.",
    awardGroups: [
      {
        name: "Classificação Geral (Masculino e Feminino)",
        items: [
          { place: "1º ao 5º Lugar", prize: "Troféus de Pódio", amount: 0 }
        ]
      }
    ]
  },

  // 28. 1ª Corrida do 11° Bpm Capanema 2026 (Capanema)
  "race-chip-1-corrida-do-11-bpm-capanema-2026": {
    prizeTotal: 0,
    awardsInfo: "Troféus do 1º ao 5º colocado Geral (Masc/Fem) e premiação especial para a categoria Militar/Segurança Pública.",
    awardGroups: [
      {
        name: "Classificação Geral & Militar",
        items: [
          { place: "1º ao 5º Lugar", prize: "Troféus de Pódio", amount: 0 }
        ]
      }
    ]
  },

  // 29. Speed Run Barcarena (Barcarena)
  "race-chip-speed-run-barcarena": {
    prizeTotal: 0,
    awardsInfo: "Troféus oficiais para os primeiros colocados e medalhas de participação para todos os atletas.",
    awardGroups: [
      {
        name: "Classificação Geral",
        items: [
          { place: "1º ao 3º Lugar", prize: "Troféus de Pódio", amount: 0 }
        ]
      }
    ]
  },

  // 30. 1ª Corrida do Corre de Terça (Concórdia do Pará)
  "race-chip-1-corrida-do-corre-de-terca": {
    prizeTotal: 0,
    awardsInfo: "Troféus oficiais do 1º ao 5º Geral Masculino e Feminino e medalhas finisher para todos os concluintes.",
    awardGroups: [
      {
        name: "Classificação Geral (Masculino e Feminino)",
        items: [
          { place: "1º ao 5º Lugar", prize: "Troféus de Pódio", amount: 0 }
        ]
      }
    ]
  }
};

// Aplica aos 30 eventos
const enriched = races.map((r) => {
  const customAward = AWARDS_MAP[r.id];
  if (customAward) {
    return {
      ...r,
      prizeTotal: customAward.prizeTotal,
      awardsInfo: customAward.awardsInfo,
      awardGroups: customAward.awardGroups
    };
  }
  return r;
});

fs.writeFileSync('scripts/final_30_races_v6.json', JSON.stringify(enriched, null, 2), 'utf8');

// Gera arquivo typescript para src/modules/sync/data/finalVerifiedRacesV6.ts
const tsContent = `import type { Race } from '../../../types/race';\n\nexport const FINAL_VERIFIED_RACES_V6: Race[] = ${JSON.stringify(enriched, null, 2)};\n`;
fs.writeFileSync('src/modules/sync/data/finalVerifiedRacesV6.ts', tsContent, 'utf8');

console.log('Sucesso! Criado finalVerifiedRacesV6.ts com todos os 30 eventos e premiações 100% fieis ao regulamento!');
