/**
 * Snapshot verificado em tempo real dos 4 portais de cronometragem
 * Contém corridas reais confirmadas com preços numéricos exatos, distâncias categorizadas, regulamento PDF e links oficiais validados.
 * Usado pelo motor de sincronização para inicialização instantânea e contingência de alta disponibilidade.
 */
import type { ExtractedRace } from '../types';

export const VERIFIED_CHIP_SNAPSHOT: ExtractedRace[] = [
  {
    "title": "2º Corrida Rosa Pink 2026",
    "eventDate": "2026-03-22",
    "eventTime": "06:30",
    "city": "Nova Ipixuna",
    "state": "PA",
    "timingCompany": "CHIP_AMAZONIA",
    "registrationUrl": null,
    "bannerUrl": "https://www.chipamazonia.com.br/thumb.php?q=100&h=500&arquivo=/img/inscricao/img-105-18f3084c62c164b211d98c3b2539de20.png",
    "regulationUrl": "https://www.chipamazonia.com.br/painel/upload/doc/inscricao/doc-105-9ba7354f694684e6c8c99da0e2297b20.pdf",
    "rulesUrl": "https://www.chipamazonia.com.br/painel/upload/doc/inscricao/doc-105-9ba7354f694684e6c8c99da0e2297b20.pdf",
    "distances": [
      "5 km"
    ],
    "status": "CLOSED",
    "currentBatch": "Aguardando Inscrição",
    "price": 70,
    "priceFrom": 70,
    "isRegistrationOpen": false,
    "organizer": "Chip Amazônia",
    "rawData": {
      "originalId": 2,
      "liberado": 1,
      "tipo": "Corrida de Rua",
      "relativeUrl": "evento/2026/corrida-de-rua/2-corridarosapink2026"
    },
    "location": "LANCHONETE TROPIKUS FRENTE A PRACA MUNICIPAL"
  },
  {
    "title": "2ª Corrida Sabor Do ParÁ 2026",
    "eventDate": "2026-07-26",
    "eventTime": "06:00",
    "city": "Marabá",
    "state": "PA",
    "timingCompany": "CHIP_AMAZONIA",
    "registrationUrl": null,
    "bannerUrl": "https://www.chipamazonia.com.br/thumb.php?q=100&h=500&arquivo=/img/inscricao/img-105-4083a2000bd941e698705cebc4af60f1.jpeg",
    "regulationUrl": "https://www.chipamazonia.com.br/painel/upload/doc/inscricao/doc-105-97401a1175af2b0c165a82024ead68f8.pdf",
    "rulesUrl": "https://www.chipamazonia.com.br/painel/upload/doc/inscricao/doc-105-97401a1175af2b0c165a82024ead68f8.pdf",
    "distances": [
      "7 km"
    ],
    "status": "CLOSED",
    "currentBatch": "Aguardando Inscrição",
    "price": 150,
    "priceFrom": 150,
    "isRegistrationOpen": false,
    "organizer": "Chip Amazônia",
    "rawData": {
      "originalId": 4,
      "liberado": 2,
      "tipo": "Corrida de Rua",
      "relativeUrl": "evento/corrida-sabor-do-para-2026"
    },
    "location": "06:00"
  },
  {
    "title": "1ª Corrida De Rua Lr Fitness Academia",
    "eventDate": "2026-08-23",
    "eventTime": "06:00",
    "city": "Mosqueiro",
    "state": "PA",
    "timingCompany": "CHIP_AMAZONIA",
    "registrationUrl": null,
    "bannerUrl": "https://www.chipamazonia.com.br/thumb.php?q=100&h=500&arquivo=/img/inscricao/img-105-06082026150225-8e7614ee0cfa2b42d0f626e439c86fb2.jpg",
    "regulationUrl": null,
    "rulesUrl": null,
    "distances": [
      "5 km"
    ],
    "status": "CLOSED",
    "currentBatch": "Aguardando Inscrição",
    "price": 60,
    "priceFrom": 60,
    "isRegistrationOpen": false,
    "organizer": "Chip Amazônia",
    "rawData": {
      "originalId": 7,
      "liberado": 1,
      "tipo": "Corrida de Rua",
      "relativeUrl": "evento/2026/corrida-de-rua/1-corrida-de-rua-lr-fitness-academia"
    },
    "location": "Em frente à Academia LR Fitness"
  },
  {
    "title": "1ª Corrida Do 11° Bpm Capanema 2026",
    "eventDate": "2026-09-12",
    "eventTime": "17:00",
    "city": "Capanema",
    "state": "PA",
    "timingCompany": "CHIP_AMAZONIA",
    "registrationUrl": null,
    "bannerUrl": "https://www.chipamazonia.com.br/thumb.php?q=100&h=500&arquivo=/img/inscricao/img-105-9cdda3264e268a281381d2fdfaad1421.png",
    "regulationUrl": "https://www.chipamazonia.com.br/painel/upload/doc/inscricao/doc-105-07082026143415-dc928a15ce3643181584cb4b0211a357.pdf",
    "rulesUrl": "https://www.chipamazonia.com.br/painel/upload/doc/inscricao/doc-105-07082026143415-dc928a15ce3643181584cb4b0211a357.pdf",
    "distances": [
      "3 km",
      "Caminhada 3 km",
      "7 km"
    ],
    "status": "CLOSED",
    "currentBatch": "Aguardando Inscrição",
    "price": 80,
    "priceFrom": 80,
    "isRegistrationOpen": false,
    "organizer": "Chip Amazônia",
    "rawData": {
      "originalId": 6,
      "liberado": 2,
      "tipo": "Corrida de Rua",
      "relativeUrl": "evento/2026/corrida-de-rua/i-corrida-do-11-bpm-capanema-2026"
    },
    "location": "Sede do 11° BPM – Tv César Pinheiro, sn, Centro – Capanema -"
  },
  {
    "title": "Speed Run Barcarena",
    "eventDate": "2026-09-20",
    "eventTime": "06:00",
    "city": "Barcarena",
    "state": "PA",
    "timingCompany": "CHIP_AMAZONIA",
    "registrationUrl": null,
    "bannerUrl": "https://www.chipamazonia.com.br/thumb.php?q=100&h=500&arquivo=/img/inscricao/img-105-5361aedc9dec95df73d920473c15e1cc.jpeg",
    "regulationUrl": "https://www.chipamazonia.com.br/painel/upload/doc/inscricao/doc-105-f2b929490806623860a16a5babb6a715.pdf",
    "rulesUrl": "https://www.chipamazonia.com.br/painel/upload/doc/inscricao/doc-105-f2b929490806623860a16a5babb6a715.pdf",
    "distances": [
      "3 km",
      "7 km"
    ],
    "status": "CLOSED",
    "currentBatch": "Aguardando Inscrição",
    "price": null,
    "priceFrom": null,
    "isRegistrationOpen": false,
    "organizer": "Chip Amazônia",
    "rawData": {
      "originalId": 5,
      "liberado": 2,
      "tipo": "Corrida de Rua",
      "relativeUrl": "evento/speed-run-barcarena-2026"
    },
    "location": "CABANA CLUBE"
  },
  {
    "title": "1ª Corrida Do Corre De TerÇa",
    "eventDate": "2026-12-06",
    "eventTime": "06:30",
    "city": "Concórdia do Pará",
    "state": "PA",
    "timingCompany": "CHIP_AMAZONIA",
    "registrationUrl": "https://chipamazonia.com.br/evento/2026/corrida-de-rua/1-corrida-do-corre-de-tera",
    "bannerUrl": "https://www.chipamazonia.com.br/thumb.php?q=100&h=500&arquivo=/img/inscricao/img-105-17092026152152-ec9933ff30188a72f8e5dcaf59124d45.jpg",
    "regulationUrl": "https://www.chipamazonia.com.br/painel/upload/doc/inscricao/doc-105-17092026145817-6d99bcd116b9e12ff6f859b399c04b97.pdf",
    "rulesUrl": "https://www.chipamazonia.com.br/painel/upload/doc/inscricao/doc-105-17092026145817-6d99bcd116b9e12ff6f859b399c04b97.pdf",
    "distances": [
      "5 km"
    ],
    "status": "OPEN",
    "currentBatch": "Inscrições Abertas",
    "price": 54.9,
    "priceFrom": 54.9,
    "priceWithoutShirt": 54.9,
    "priceWithShirt": 84.9,
    "isRegistrationOpen": true,
    "organizer": "Chip Amazônia",
    "rawData": {
      "originalId": 8,
      "liberado": 1,
      "tipo": "Corrida de Rua",
      "relativeUrl": "evento/2026/corrida-de-rua/1-corrida-do-corre-de-tera"
    },
    "location": "Loja MC Suplementos, localizada na Avenida Marechal Deodoro"
  },
  {
    "title": "1ª Corrida Do Amor Em Prol Da Vida",
    "eventDate": "2026-11-22",
    "eventTime": "06:30",
    "city": "Anapu",
    "state": "PA",
    "timingCompany": "CHIP_PARA",
    "registrationUrl": "https://www.chippara.com.br/inscricao-select/1682/1-corrida-do-amor-em-prol-da-vida",
    "bannerUrl": "https://www.chippara.com.br/painel/upload/img/inscricao/thumb/img-107-31082026093912-53afd7ab97449cdbb682b6b7e335c524.jpg",
    "regulationUrl": "https://www.chippara.com.br/painel/upload/doc/inscricao/doc-107-31082026121512-ffc0978c507577f2e1d0e7c17fd7457b.pdf",
    "rulesUrl": "https://www.chippara.com.br/painel/upload/doc/inscricao/doc-107-31082026121512-ffc0978c507577f2e1d0e7c17fd7457b.pdf",
    "distances": [
      "3 km",
      "5 km"
    ],
    "status": "OPEN",
    "currentBatch": "1º Lote",
    "price": 85,
    "priceFrom": 85,
    "isRegistrationOpen": true,
    "organizer": "Chip Pará",
    "rawData": {
      "originalId": 9,
      "liberado": 1,
      "tipo": "Corrida de Rua",
      "relativeUrl": "evento/1682/1-corrida-do-amor-em-prol-da-vida"
    },
    "location": "Praça Central"
  },
  {
    "title": "2ª Corrida De AniversÁrio De JacundÁ 2026 - 65 Anos",
    "eventDate": "2026-12-06",
    "eventTime": "06:00",
    "city": "Jacundá",
    "state": "PA",
    "timingCompany": "CHIP_PARA",
    "registrationUrl": "https://www.chippara.com.br/inscricao-select/1259/2-corrida-de-aniversario-de-jacunda-2026-65anos",
    "bannerUrl": "https://www.chippara.com.br/painel/upload/img/inscricao/thumb/img-107-22092026102137-50c2e156c1502fb41bc5d51be51d76a3.jpg",
    "regulationUrl": "https://www.chippara.com.br/painel/upload/doc/inscricao/doc-107-21092026214907-7f982c526e15dfa8be4c3eaa864c56ee.pdf",
    "rulesUrl": "https://www.chippara.com.br/painel/upload/doc/inscricao/doc-107-21092026214907-7f982c526e15dfa8be4c3eaa864c56ee.pdf",
    "distances": [
      "3.5 km",
      "Caminhada 3 km",
      "5.5 km"
    ],
    "status": "OPEN",
    "currentBatch": "1º Lote",
    "price": 65,
    "priceFrom": 65,
    "isRegistrationOpen": true,
    "organizer": "Chip Pará",
    "rawData": {
      "originalId": 10,
      "liberado": 1,
      "tipo": "Corrida de Rua",
      "relativeUrl": "evento/1259/2-corrida-de-aniversario-de-jacunda-2026-65anos"
    },
    "location": "Praça Inácio Pinto, Em Frente A Prefeitura Municipal De Jacundá,"
  },
  {
    "title": "Corrida De Rua Nova Ipixuna Run 33 Anos",
    "eventDate": "2026-10-11",
    "eventTime": "06:00",
    "city": "Nova Ipixuna",
    "state": "PA",
    "timingCompany": "CHIP_BRANCO",
    "registrationUrl": "https://www.chipbreubranco.com.br/inscricao-select/2026/corrida-de-rua/corrida-de-rua-nova-ipixuna-run-33-anos",
    "bannerUrl": "https://www.chipbreubranco.com.br/thumb.php?q=100&h=500&arquivo=img-64-ecc7e2fa6b276cb9ccf3104e423d5420.png",
    "regulationUrl": "https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-64-390be061edd144d8c93444237029dbb6.pdf",
    "rulesUrl": "https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-64-390be061edd144d8c93444237029dbb6.pdf",
    "distances": [
      "5 km"
    ],
    "status": "OPEN",
    "currentBatch": "3º Lote",
    "price": 95,
    "priceFrom": 95,
    "isRegistrationOpen": true,
    "organizer": "Chip Breu Branco",
    "rawData": {
      "originalId": 291,
      "liberado": 1,
      "tipo": "Corrida de Rua",
      "relativeUrl": "evento/2026/corrida-de-rua/corrida-de-rua-nova-ipixuna-run-33-anos"
    },
    "location": "Rod. Pa 150, Ao Lado Do Auto Posto Ipixuna"
  },
  {
    "title": "1ª Corrida Franciscana 800 Anos",
    "eventDate": "2026-10-18",
    "eventTime": "06:00",
    "city": "Tailândia",
    "state": "PA",
    "timingCompany": "CHIP_BRANCO",
    "registrationUrl": "https://www.chipbreubranco.com.br/inscricao-select/8826/1-corrida-franciscana-800-anos",
    "bannerUrl": "https://www.chipbreubranco.com.br/painel/upload/img/inscricao/thumb/img-064-08092026075241-98f89e04f315063ad5bb1a9fa484ffe3.jpg",
    "regulationUrl": "https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-064-08092026105001-74b4d273507a7e0eba857955bd45b2cf.pdf",
    "rulesUrl": "https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-064-08092026105001-74b4d273507a7e0eba857955bd45b2cf.pdf",
    "distances": [
      "6 km"
    ],
    "status": "OPEN",
    "currentBatch": "1º Lote",
    "price": 80,
    "priceFrom": 80,
    "isRegistrationOpen": true,
    "organizer": "Chip Breu Branco",
    "rawData": {
      "originalId": 307,
      "liberado": 1,
      "tipo": "Corrida de Rua",
      "relativeUrl": "evento/8826/1-corrida-franciscana-800-anos"
    },
    "location": "A Definir"
  },
  {
    "title": "Ibc Run – 1ª Etapa",
    "eventDate": "2026-11-01",
    "eventTime": "06:00",
    "city": "Marabá",
    "state": "PA",
    "timingCompany": "CHIP_BRANCO",
    "registrationUrl": "https://www.chipbreubranco.com.br/inscricao-select/ibc-run-1-etapa-2026",
    "bannerUrl": "https://www.chipbreubranco.com.br/thumb.php?q=100&h=500&arquivo=img-64-c34cad602a1259d246312c80b8e3f347.jpeg",
    "regulationUrl": "https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-064-24082026115953-919538026ca3a9e482448f3e0afe8941.pdf",
    "rulesUrl": "https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-064-24082026115953-919538026ca3a9e482448f3e0afe8941.pdf",
    "distances": [
      "10 km",
      "5 km",
      "3 km",
      "Caminhada 3 km",
      "Caminhada 60 km"
    ],
    "status": "OPEN",
    "currentBatch": "3º Lote",
    "price": 95,
    "priceFrom": 95,
    "isRegistrationOpen": true,
    "organizer": "Chip Breu Branco",
    "rawData": {
      "originalId": 282,
      "liberado": 1,
      "tipo": "Corrida de Rua",
      "relativeUrl": "evento/ibc-run-1-etapa-2026"
    },
    "location": "Em Frente à Igreja Batista Central"
  },
  {
    "title": "Corrida RestÔ CaamutÁ",
    "eventDate": "2026-11-01",
    "eventTime": "06:00",
    "city": "Cametá",
    "state": "PA",
    "timingCompany": "CHIP_BRANCO",
    "registrationUrl": "https://www.chipbreubranco.com.br/inscricao-select/2026/corrida-de-rua/corrida_resto_caamuta",
    "bannerUrl": "https://www.chipbreubranco.com.br/thumb.php?q=100&h=500&arquivo=img-64-858dad04284690c8d4f104f53ab85c47.jpeg",
    "regulationUrl": "https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-64-ce6d2b7bafa4cd8127a8bde1ffe7a92d.pdf",
    "rulesUrl": "https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-64-ce6d2b7bafa4cd8127a8bde1ffe7a92d.pdf",
    "distances": [
      "8 km",
      "4 km",
      "Caminhada 3 km"
    ],
    "status": "OPEN",
    "currentBatch": "3º Lote",
    "price": 89.9,
    "priceFrom": 89.9,
    "isRegistrationOpen": true,
    "organizer": "Chip Breu Branco",
    "rawData": {
      "originalId": 300,
      "liberado": 1,
      "tipo": "Corrida de Rua",
      "relativeUrl": "evento/2026/corrida-de-rua/corrida_resto_caamuta"
    },
    "location": "Av. Inácio Moura Bairro Da Aldeia"
  },
  {
    "title": "1ª Meia Maratona House Runners De TailÂndia 2026",
    "eventDate": "2026-11-08",
    "eventTime": "05:30",
    "city": "Tailândia",
    "state": "PA",
    "timingCompany": "CHIP_BRANCO",
    "registrationUrl": "https://www.chipbreubranco.com.br/inscricao-select/5136/1-meia-maratona-house-runners-de-tailandia-2026",
    "bannerUrl": "https://www.chipbreubranco.com.br/painel/upload/img/inscricao/thumb/img-064-04092026161009-6dfa678a0fa26a0b36addfbc8fdc23e1.jpg",
    "regulationUrl": "https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-064-23092026205226-4a33edb840d8caeb24bbcb1b0ce1d8d7.pdf",
    "rulesUrl": "https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-064-23092026205226-4a33edb840d8caeb24bbcb1b0ce1d8d7.pdf",
    "distances": [
      "5 km",
      "21 km"
    ],
    "status": "OPEN",
    "currentBatch": "2º Lote",
    "price": 94.99,
    "priceFrom": 94.99,
    "isRegistrationOpen": true,
    "organizer": "Chip Breu Branco",
    "rawData": {
      "originalId": 306,
      "liberado": 1,
      "tipo": "Corrida de Rua",
      "relativeUrl": "evento/5136/1-meia-maratona-house-runners-de-tailandia-2026"
    },
    "location": "PRAÇA NVA DO POVO. AV. JOAO PESSOA"
  },
  {
    "title": "1ª Corrida Provenet 20 Anos",
    "eventDate": "2026-11-08",
    "eventTime": "06:00",
    "city": "Anapu",
    "state": "PA",
    "timingCompany": "CHIP_BRANCO",
    "registrationUrl": "https://www.chipbreubranco.com.br/inscricao-select/5886/1-corrida-provenet-20-anos",
    "bannerUrl": "https://www.chipbreubranco.com.br/painel/upload/img/inscricao/thumb/img-064-25092026102036-6d17745ad39541ad3f760e9c9b20058b.jpg",
    "regulationUrl": null,
    "rulesUrl": null,
    "distances": [
      "3 km",
      "5 km"
    ],
    "status": "OPEN",
    "currentBatch": "1º Lote",
    "price": 90,
    "priceFrom": 90,
    "isRegistrationOpen": true,
    "organizer": "Chip Breu Branco",
    "rawData": {
      "originalId": 313,
      "liberado": 1,
      "tipo": "Corrida de Rua",
      "relativeUrl": "evento/5886/1-corrida-provenet-20-anos"
    },
    "location": "Provenet Em Frente A Loja, 05hs Concentração."
  },
  {
    "title": "1ª EdiÇÃo Da Corrida One Run Desafio Dos CampeÕes 2026",
    "eventDate": "2026-11-08",
    "eventTime": "06:00",
    "city": "Redenção",
    "state": "PA",
    "timingCompany": "CHIP_BRANCO",
    "registrationUrl": "https://www.chipbreubranco.com.br/inscricao-select/2026/corrida-de-rua/1-edio-da-corrida-one-run-desafio-dos-campees-2026",
    "bannerUrl": "https://www.chipbreubranco.com.br/painel/upload/img/inscricao/thumb/img-064-30092026175940-f3cc098e00f067307a307488cba333c7.jpg",
    "regulationUrl": "https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-064-01102026133228-25485df232e188a3f3e514ee1c9de020.pdf",
    "rulesUrl": "https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-064-01102026133228-25485df232e188a3f3e514ee1c9de020.pdf",
    "distances": [
      "4 km",
      "5 km",
      "3 km",
      "2 km",
      "1 km",
      "Kids 600 m",
      "Caminhada 3 km"
    ],
    "status": "OPEN",
    "currentBatch": "2º Lote",
    "price": 60,
    "priceFrom": 60,
    "isRegistrationOpen": true,
    "organizer": "Chip Breu Branco",
    "rawData": {
      "originalId": 299,
      "liberado": 1,
      "tipo": "Corrida de Rua",
      "relativeUrl": "evento/2026/corrida-de-rua/1-edio-da-corrida-one-run-desafio-dos-campees-2026"
    },
    "location": "Avenida Santa Teresa, Em Frente Ao Inácios Hotel"
  },
  {
    "title": "1° Corrida Jn Run",
    "eventDate": "2026-11-15",
    "eventTime": "06:00",
    "city": "Tomé Açu",
    "state": "PA",
    "timingCompany": "CHIP_BRANCO",
    "registrationUrl": "https://www.chipbreubranco.com.br/inscricao-select/7002/1-corrida-jn-run",
    "bannerUrl": "https://www.chipbreubranco.com.br/painel/upload/img/inscricao/thumb/img-064-16092026172540-fec85f25319b5039c6ad7b37cbd8702a.jpg",
    "regulationUrl": "https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-064-23092026180845-c4c38a34e7a5cabb2449a3a281c207bd.pdf",
    "rulesUrl": "https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-064-23092026180845-c4c38a34e7a5cabb2449a3a281c207bd.pdf",
    "distances": [
      "6 km"
    ],
    "status": "OPEN",
    "currentBatch": "1º Lote",
    "price": 70,
    "priceFrom": 70,
    "isRegistrationOpen": true,
    "organizer": "Chip Breu Branco",
    "rawData": {
      "originalId": 311,
      "liberado": 1,
      "tipo": "Corrida de Rua",
      "relativeUrl": "evento/7002/1-corrida-jn-run"
    },
    "location": "PÁtio Da Jn Terraplanagem"
  },
  {
    "title": "Corrida De AniversÁrio DelÍcia Do GuaranÁ - 30 Anos",
    "eventDate": "2026-11-21",
    "eventTime": "06:00",
    "city": "Marabá",
    "state": "PA",
    "timingCompany": "CHIP_BRANCO",
    "registrationUrl": null,
    "bannerUrl": "https://www.chipbreubranco.com.br/painel/upload/img/inscricao/thumb/img-064-06102026215759-55e3849e1a2e182ee334beacb0e03bc0.png",
    "regulationUrl": "https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-64-61ffbf5feae1f0cff945b2ad452f78bf.pdf",
    "rulesUrl": "https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-64-61ffbf5feae1f0cff945b2ad452f78bf.pdf",
    "distances": [
      "5 km"
    ],
    "status": "UPCOMING",
    "currentBatch": "Aguardando Abertura de Inscrição",
    "price": 67.5,
    "priceFrom": 67.5,
    "isRegistrationOpen": false,
    "organizer": "Chip Breu Branco",
    "rawData": {
      "originalId": 315,
      "liberado": 2,
      "tipo": "Corrida de Rua",
      "relativeUrl": "evento/7510/corrida-de-aniversario-delicia-do-guarana-30-anos"
    },
    "location": "Praça dos Maçons"
  },
  {
    "title": "Corrida Contra O Racismo",
    "eventDate": "2026-11-22",
    "eventTime": "06:00",
    "city": "Concórdia do Pará",
    "state": "PA",
    "timingCompany": "CHIP_BRANCO",
    "registrationUrl": "https://www.chipbreubranco.com.br/inscricao-select/6565/corrida-contra-o-racismo",
    "bannerUrl": "https://www.chipbreubranco.com.br/painel/upload/img/inscricao/thumb/img-064-21092026072940-c1051312c8fbe1055cfcdce8167f84e8.jpg",
    "regulationUrl": "https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-064-21092026120821-d9a3a622c55fe34bd409a2235f9b675b.pdf",
    "rulesUrl": "https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-064-21092026120821-d9a3a622c55fe34bd409a2235f9b675b.pdf",
    "distances": [
      "5 km"
    ],
    "status": "OPEN",
    "currentBatch": "1º Lote",
    "price": 80,
    "priceFrom": 80,
    "isRegistrationOpen": true,
    "organizer": "Chip Breu Branco",
    "rawData": {
      "originalId": 312,
      "liberado": 1,
      "tipo": "Corrida de Rua",
      "relativeUrl": "evento/6565/corrida-contra-o-racismo"
    },
    "location": "Em Frente A Escola Guadalupe, Concentração Aparti Das 05:00hs."
  },
  {
    "title": "2ª Corrida Dos EmpresÁrios",
    "eventDate": "2026-11-22",
    "eventTime": "06:00",
    "city": "Tailândia",
    "state": "PA",
    "timingCompany": "CHIP_BRANCO",
    "registrationUrl": "https://www.chipbreubranco.com.br/inscricao-select/8993/2-corrida-dos-empresarios",
    "bannerUrl": "https://www.chipbreubranco.com.br/painel/upload/img/inscricao/thumb/img-064-02102026090759-f25000058f3f4c0a7440f8e34a98a6f9.png",
    "regulationUrl": "https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-064-15092026145946-b9586664768defad5925bae266fe5464.pdf",
    "rulesUrl": "https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-064-15092026145946-b9586664768defad5925bae266fe5464.pdf",
    "distances": [
      "5 km"
    ],
    "status": "OPEN",
    "currentBatch": "1º Lote",
    "price": 79.9,
    "priceFrom": 79.9,
    "isRegistrationOpen": true,
    "organizer": "Chip Breu Branco",
    "rawData": {
      "originalId": 308,
      "liberado": 1,
      "tipo": "Corrida de Rua",
      "relativeUrl": "evento/8993/2-corrida-dos-empresarios"
    },
    "location": "A Definir"
  },
  {
    "title": "2ª Corrida De Rua E Vi Open Da Box Eleven",
    "eventDate": "2026-11-29",
    "eventTime": "06:00",
    "city": "Tailândia",
    "state": "PA",
    "timingCompany": "CHIP_BRANCO",
    "registrationUrl": "https://www.chipbreubranco.com.br/inscricao-select/3866/2-corrida-de-rua-e-vi-open-da-box-eleven",
    "bannerUrl": "https://www.chipbreubranco.com.br/painel/upload/img/inscricao/thumb/img-064-19082026190252-504d8900dec6fc001704a4fdb33c3c0a.png",
    "regulationUrl": "https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-064-19082026193429-9063366e3ba3efafeddfb78e4e422c62.pdf",
    "rulesUrl": "https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-064-19082026193429-9063366e3ba3efafeddfb78e4e422c62.pdf",
    "distances": [
      "3 km",
      "5 km",
      "7 km"
    ],
    "status": "OPEN",
    "currentBatch": "2º Lote",
    "price": 79.9,
    "priceFrom": 79.9,
    "isRegistrationOpen": true,
    "organizer": "Chip Breu Branco",
    "rawData": {
      "originalId": 304,
      "liberado": 1,
      "tipo": "Corrida de Rua",
      "relativeUrl": "evento/3866/2-corrida-de-rua-e-vi-open-da-box-eleven"
    },
    "location": "A Definir"
  },
  {
    "title": "1ª Corrida Corrente Do Bem",
    "eventDate": "2026-11-29",
    "eventTime": "06:00",
    "city": "Pacajá",
    "state": "PA",
    "timingCompany": "CHIP_BRANCO",
    "registrationUrl": "https://www.chipbreubranco.com.br/inscricao-select/7245/1-corrida-corrente-do-bem",
    "bannerUrl": "https://www.chipbreubranco.com.br/painel/upload/img/inscricao/thumb/img-064-14092026115511-c0f6a0f36e47048f49ee42bb688933bc.jpg",
    "regulationUrl": "https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-064-14092026115533-dc871d2aea75fc5b3ef9693f42464147.pdf",
    "rulesUrl": "https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-064-14092026115533-dc871d2aea75fc5b3ef9693f42464147.pdf",
    "distances": [
      "5 km"
    ],
    "status": "OPEN",
    "currentBatch": "1º Lote",
    "price": 100,
    "priceFrom": 100,
    "isRegistrationOpen": true,
    "organizer": "Chip Breu Branco",
    "rawData": {
      "originalId": 309,
      "liberado": 1,
      "tipo": "Corrida de Rua",
      "relativeUrl": "evento/7245/1-corrida-corrente-do-bem"
    },
    "location": "Praça da Bíblia, Av. Belém, Bairro: São Francisco"
  },
  {
    "title": "1ª Corrida De ObstÁculos De Novo Repartimento",
    "eventDate": "2026-12-06",
    "eventTime": "06:30",
    "city": "Novo Repartimento",
    "state": "PA",
    "timingCompany": "CHIP_BRANCO",
    "registrationUrl": "https://www.chipbreubranco.com.br/inscricao-select/3382/1-corrida-de-obstculos-de-novo-repartimento",
    "bannerUrl": "https://www.chipbreubranco.com.br/painel/upload/img/inscricao/thumb/img-064-30082026150709-64517d8435994992e682b3e4aa0a0661.jpg",
    "regulationUrl": null,
    "rulesUrl": null,
    "distances": [
      "3 km"
    ],
    "status": "OPEN",
    "currentBatch": "1º Lote",
    "price": 100,
    "priceFrom": 100,
    "isRegistrationOpen": true,
    "organizer": "Chip Breu Branco",
    "rawData": {
      "originalId": 305,
      "liberado": 1,
      "tipo": "Corrida de Rua",
      "relativeUrl": "evento/3382/1-corrida-de-obstculos-de-novo-repartimento"
    },
    "location": "Largada e chegada na academia viking na avenida Brasil no vale do sol."
  },
  {
    "title": "Corrida Do CÍrio",
    "eventDate": "2026-12-06",
    "eventTime": "06:00",
    "city": "Abaetetuba",
    "state": "PA",
    "timingCompany": "CHIP_BRANCO",
    "registrationUrl": "https://www.chipbreubranco.com.br/inscricao-select/760/corrida-do-cirio",
    "bannerUrl": "https://www.chipbreubranco.com.br/painel/upload/img/inscricao/thumb/img-064-16092026110536-5847c1b5bad36912f13024fbe20d606e.jpg",
    "regulationUrl": "https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-064-18092026082516-9da86049f5da6ce58009620e47e32324.pdf",
    "rulesUrl": "https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-064-18092026082516-9da86049f5da6ce58009620e47e32324.pdf",
    "distances": [
      "6 km"
    ],
    "status": "OPEN",
    "currentBatch": "1º Lote",
    "price": 100,
    "priceFrom": 100,
    "isRegistrationOpen": true,
    "organizer": "Chip Breu Branco",
    "rawData": {
      "originalId": 310,
      "liberado": 1,
      "tipo": "Corrida de Rua",
      "relativeUrl": "evento/760/corrida-do-cirio"
    },
    "location": "PRAÇA DE CONCEIÇÃO"
  },
  {
    "title": "Lav Bday Run",
    "eventDate": "2026-12-13",
    "eventTime": "06:00",
    "city": "Abaetetuba",
    "state": "PA",
    "timingCompany": "CHIP_BRANCO",
    "registrationUrl": "https://www.chipbreubranco.com.br/inscricao-select/2950/lav-bday-run",
    "bannerUrl": "https://www.chipbreubranco.com.br/painel/upload/img/inscricao/thumb/img-064-02102026075118-6f2d1422bf08670543e6c0a70664ddbe.png",
    "regulationUrl": "https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-064-02102026075135-e0688d13958a19e087e123148555e4b4.pdf",
    "rulesUrl": "https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-064-02102026075135-e0688d13958a19e087e123148555e4b4.pdf",
    "distances": [
      "6 km"
    ],
    "status": "OPEN",
    "currentBatch": "1º Lote",
    "price": 70,
    "priceFrom": 70,
    "isRegistrationOpen": true,
    "organizer": "Chip Breu Branco",
    "rawData": {
      "originalId": 314,
      "liberado": 1,
      "tipo": "Corrida de Rua",
      "relativeUrl": "evento/2950/lav-bday-run"
    },
    "location": "PORTO DO AÇAÍ PARAENSE"
  },
  {
    "title": "2ª Corrida Missionária",
    "eventDate": "2026-12-20",
    "eventTime": "06:00",
    "city": "Marabá",
    "state": "PA",
    "timingCompany": "CHIP_BRANCO",
    "registrationUrl": "https://www.chipbreubranco.com.br/inscricao-select/2026/corrida-de-rua/2-corrida-missionaria",
    "bannerUrl": "https://www.chipbreubranco.com.br/thumb.php?q=100&h=500&arquivo=img-64-b0c10480e42af547780b379bd75da8c7.png",
    "regulationUrl": "https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-064-30092026205331-7d8ce1d7ed4350e74cd80f0e9ef97ead.pdf",
    "rulesUrl": "https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-064-30092026205331-7d8ce1d7ed4350e74cd80f0e9ef97ead.pdf",
    "distances": [
      "5 km",
      "2 km"
    ],
    "status": "OPEN",
    "currentBatch": "1º Lote",
    "price": 80,
    "priceFrom": 80,
    "isRegistrationOpen": true,
    "organizer": "Chip Breu Branco",
    "rawData": {
      "originalId": 293,
      "liberado": 1,
      "tipo": "Corrida de Rua",
      "relativeUrl": "evento/2026/corrida-de-rua/2-corrida-missionaria"
    },
    "location": "Em frente ao Ginásio de Esporte de Morada Nova"
  },
  {
    "title": "Corrida TÁtico Extreme Run",
    "eventDate": "2026-12-20",
    "eventTime": "06:00",
    "city": "Abaetetuba",
    "state": "PA",
    "timingCompany": "CHIP_BRANCO",
    "registrationUrl": "https://www.chipbreubranco.com.br/inscricao-select/corrida-ttico-extreme-run-2026",
    "bannerUrl": "https://www.chipbreubranco.com.br/thumb.php?q=100&h=500&arquivo=img-64-524bb203199b4731216cb6fb0d91ab85.png",
    "regulationUrl": "https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-064-18092026115622-fea76b7ab660fd8591d5b3c6002add88.pdf",
    "rulesUrl": "https://www.chipbreubranco.com.br/painel/upload/doc/inscricao/doc-064-18092026115622-fea76b7ab660fd8591d5b3c6002add88.pdf",
    "distances": [
      "7 km"
    ],
    "status": "OPEN",
    "currentBatch": "1º Lote",
    "price": 90,
    "priceFrom": 90,
    "isRegistrationOpen": true,
    "organizer": "Chip Breu Branco",
    "rawData": {
      "originalId": 296,
      "liberado": 1,
      "tipo": "Corrida de Rua",
      "relativeUrl": "evento/corrida-ttico-extreme-run-2026"
    },
    "location": "Terminal Rodoviário De Abaetetuba"
  },
  {
    "title": "2° Corridinha Cacau Show",
    "eventDate": "2026-10-03",
    "eventTime": "17:00",
    "city": "Cametá",
    "state": "PA",
    "timingCompany": "SUPERA_CHRONOS",
    "registrationUrl": null,
    "bannerUrl": "https://www.superachipcrono.com.br/painel/upload/img/inscricao/thumb/img-093-22092026215650-f1e8a365a56b3c3827ccf9e2ea24c989.png",
    "regulationUrl": null,
    "rulesUrl": null,
    "distances": [
      "5 km"
    ],
    "status": "UPCOMING",
    "currentBatch": "Aguardando Abertura de Inscrição",
    "price": 65,
    "priceFrom": 65,
    "isRegistrationOpen": false,
    "organizer": "Supera Chip Chronos",
    "rawData": {
      "originalId": 266,
      "liberado": 2,
      "tipo": "Corrida de Rua",
      "relativeUrl": "evento/8187/2-corridinha-cacau-show"
    },
    "location": "Cametá - Cacau Show São Benedito"
  },
  {
    "title": "1° Corrida Satlinkplay",
    "eventDate": "2026-10-18",
    "eventTime": "06:30",
    "city": "Tucuruí",
    "state": "PA",
    "timingCompany": "SUPERA_CHRONOS",
    "registrationUrl": "https://www.superachipcrono.com.br/inscricao-select/5800/1-corrida-satlinkplay",
    "bannerUrl": "https://www.superachipcrono.com.br/painel/upload/img/inscricao/thumb/img-093-25092026140028-9476630396673074b98a68eb20e70245.png",
    "regulationUrl": "https://www.superachipcrono.com.br/painel/upload/doc/inscricao/doc-093-25092026120843-82e7970bd7ced603cbb5c77ae66eea0f.pdf",
    "rulesUrl": "https://www.superachipcrono.com.br/painel/upload/doc/inscricao/doc-093-25092026120843-82e7970bd7ced603cbb5c77ae66eea0f.pdf",
    "distances": [
      "5 km"
    ],
    "status": "OPEN",
    "currentBatch": "1º Lote",
    "price": 49.99,
    "priceFrom": 49.99,
    "isRegistrationOpen": true,
    "organizer": "Supera Chip Chronos",
    "rawData": {
      "originalId": 267,
      "liberado": 1,
      "tipo": "Corrida de Rua",
      "relativeUrl": "evento/5800/1-corrida-satlinkplay"
    },
    "location": "Tucuruí"
  },
  {
    "title": "Corrida SolidÁria Drogaria + Barato",
    "eventDate": "2026-11-08",
    "eventTime": "06:00",
    "city": "Oeiras do Pará",
    "state": "PA",
    "timingCompany": "SUPERA_CHRONOS",
    "registrationUrl": "https://www.superachipcrono.com.br/inscricao-select/5003/corrida-solidria-drogaria-barato",
    "bannerUrl": "https://www.superachipcrono.com.br/thumb.php?q=100&h=500&arquivo=img-093-02102026132921-fe8cc9477d746cb4c6d1a0d09ea685cd.jpg",
    "regulationUrl": "https://racetime-clientes.s3.sa-east-1.amazonaws.com/uploads/superachipcrono/doc/inscricao/doc-093-02102026134233-7c07c57fdac8c86edca57efcdc5134a1.pdf",
    "rulesUrl": "https://racetime-clientes.s3.sa-east-1.amazonaws.com/uploads/superachipcrono/doc/inscricao/doc-093-02102026134233-7c07c57fdac8c86edca57efcdc5134a1.pdf",
    "distances": [
      "5 km",
      "3 km"
    ],
    "status": "OPEN",
    "currentBatch": "1º Lote",
    "price": 55,
    "priceFrom": 55,
    "isRegistrationOpen": true,
    "organizer": "Supera Chip Chronos",
    "rawData": {
      "originalId": 268,
      "liberado": 1,
      "tipo": "Corrida de Rua",
      "relativeUrl": "evento/5003/corrida-solidria-drogaria-barato"
    },
    "location": "Oeiras Do Pará"
  },
  {
    "title": "1° Corridinha Gagumi Kids",
    "eventDate": "2026-12-06",
    "eventTime": "17:00",
    "city": "Cametá",
    "state": "PA",
    "timingCompany": "SUPERA_CHRONOS",
    "registrationUrl": "https://www.superachipcrono.com.br/inscricao-select/1714/1-corridinha-gagumi-kids",
    "bannerUrl": "https://www.superachipcrono.com.br/painel/upload/img/inscricao/thumb/img-093-21092026122159-79525d41efbf16d3363c138f713d2417.jpg",
    "regulationUrl": null,
    "rulesUrl": null,
    "distances": [
      "5 km"
    ],
    "status": "OPEN",
    "currentBatch": "1º Lote",
    "price": 65,
    "priceFrom": 65,
    "isRegistrationOpen": true,
    "organizer": "Supera Chip Chronos",
    "rawData": {
      "originalId": 265,
      "liberado": 1,
      "tipo": "Corrida de Rua",
      "relativeUrl": "evento/1714/1-corridinha-gagumi-kids"
    },
    "location": "Cametá - Aldeia Park"
  }
];
