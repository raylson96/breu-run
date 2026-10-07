import * as cheerio from 'cheerio';
import type { ExtractedRace, RaceStatus } from '../types';
import { 
  isValidRegistrationUrl, 
  extractDistances, 
  extractPrice, 
  extractRegulationUrl 
} from '../utils/parsingHelpers';
import { fetchHtmlWithRetry, fetchJsonWithRetry } from '../utils/httpClient';

/**
 * Navega na página interna e/ou consulta o endpoint oficial de detalhes do evento
 * para extrair percursos confirmados, valor da inscrição, horário e regulamento PDF.
 */
export async function enrichRaceDetails(
  race: ExtractedRace,
  baseUrl: string
): Promise<ExtractedRace> {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const relativeUrl = race.rawData?.relativeUrl ? String(race.rawData.relativeUrl) : '';
  const currentYear = race.eventDate ? race.eventDate.split('-')[0] : '2026';

  let apiData: any = null;

  // 1. ESTRATÉGIA A: Consulta direta ao endpoint oficial api_evento.php?url=...
  if (relativeUrl) {
    try {
      const slug = relativeUrl.replace(/^evento\//, '').replace(/\/$/, '');
      const apiUrl = `${cleanBase}/api_evento.php?url=${slug}`;
      const json = await fetchJsonWithRetry<any>(apiUrl, { timeoutMs: 5000, retries: 1 });
      if (json && typeof json === 'object' && (json.id || json.titulo)) {
        apiData = json;
      }
    } catch {
      // continua para a próxima tentativa se a API do portal não responder
    }
  }

  // Se a API oficial retornou dados estruturados ricos
  if (apiData) {
    return applyApiDataToRace(race, apiData, cleanBase, currentYear);
  }

  // 2. ESTRATÉGIA B: Navegação na página interna HTML do evento (essencial para Chip Amazônia e páginas estáticas)
  const candidatePageUrl = race.registrationUrl || (relativeUrl ? `${cleanBase}/${relativeUrl.replace(/^\//, '')}` : null);
  if (candidatePageUrl && !isForbiddenUrl(candidatePageUrl)) {
    try {
      const html = await fetchHtmlWithRetry(candidatePageUrl, { timeoutMs: 6000, retries: 1 });
      return applyHtmlDataToRace(race, html, cleanBase, currentYear, candidatePageUrl);
    } catch {
      // fallback gracioso se a página não responder
    }
  }

  // Se nenhuma página respondeu, garante que o registrationUrl passe na validação estrita
  const isRegValid = isValidRegistrationUrl(race.registrationUrl, currentYear);
  return {
    ...race,
    registrationUrl: isRegValid ? race.registrationUrl : null,
    isRegistrationOpen: isRegValid && race.status === 'OPEN',
    status: isRegValid ? race.status : 'UPCOMING'
  };
}

function isForbiddenUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return lower.includes('resultado') || lower.includes('racetag') || lower.includes('racezone') || lower.includes('classificacao');
}

/**
 * Aplica os dados da API estruturada ao registro da corrida
 */
function applyApiDataToRace(
  race: ExtractedRace,
  data: any,
  cleanBase: string,
  currentYear: string
): ExtractedRace {
  // Horário da largada
  const eventTime = (data.hora_evento || race.eventTime || '06:00').trim();

  // Local exato de largada / concentração
  const location = (data.partida || data.local || race.location || 'Centro').trim();

  // Distâncias / Percursos confirmados
  const distancesSet = new Set<string>();
  if (Array.isArray(data.percursos) && data.percursos.length > 0) {
    data.percursos.forEach((p: any) => {
      const raw = `${p.nome || ''} ${p.quilometragem || ''}`;
      extractDistances(raw).forEach((d) => distancesSet.add(d));
    });
  }

  // Extrai também das categorias de preço (ex: Geral 5km, Caminhada 3km)
  if (Array.isArray(data.precos_categorias)) {
    data.precos_categorias.forEach((cat: any) => {
      if (Array.isArray(cat.precos)) {
        cat.precos.forEach((p: any) => {
          const raw = `${p.modalidade || ''} ${p.categoria || ''}`;
          extractDistances(raw).forEach((d) => distancesSet.add(d));
        });
      }
    });
  }

  // Se nada foi encontrado na API, preserva o que já havia sido extraído do título
  if (distancesSet.size === 0 && race.distances?.length > 0) {
    race.distances.forEach((d) => distancesSet.add(d));
  }

  const distances = distancesSet.size > 0 ? Array.from(distancesSet) : ['5 km'];

  // Preço e Lote atual
  let generalPrice: number | null = null;
  let lowestPrice: number | null = null;
  let finalExtractedPrice: number | null = null;
  let batchName = race.currentBatch || null;

  if (Array.isArray(data.precos_categorias) && data.precos_categorias.length > 0) {
    const now = Date.now();

    // 1. Filtra lotes expirados (onde data_fim já ficou no passado)
    const nonExpiredCategories = data.precos_categorias.filter((cat: any) => {
      if (!cat.data_fim) return true;
      try {
        const end = new Date(cat.data_fim.replace(' ', 'T')).getTime();
        return isNaN(end) || end >= now;
      } catch {
        return true;
      }
    });

    const categoriesPool = nonExpiredCategories.length > 0 ? nonExpiredCategories : data.precos_categorias;

    // 2. Identifica o lote que está exatamente dentro do período atual de vigência
    const currentlyActiveBatch = categoriesPool.find((cat: any) => {
      if (!cat.data_inicio || !cat.data_fim) return false;
      try {
        const start = new Date(cat.data_inicio.replace(' ', 'T')).getTime();
        const end = new Date(cat.data_fim.replace(' ', 'T')).getTime();
        return !isNaN(start) && !isNaN(end) && now >= start && now <= end;
      } catch {
        return false;
      }
    }) || categoriesPool[0];

    if (currentlyActiveBatch?.lote_nome) {
      batchName = `${currentlyActiveBatch.lote_nome}º Lote`;
    }

    // 3. Processa preços focando no lote ativo vigente
    const batchesToEvaluate = currentlyActiveBatch ? [currentlyActiveBatch] : categoriesPool;

    let explicitGeralPrice: number | null = null;

    for (const cat of batchesToEvaluate) {
      if (Array.isArray(cat.precos)) {
        for (const p of cat.precos) {
          const numPrice = extractPrice(p.valor);
          if (numPrice !== null && numPrice >= 20) {
            const catName = (p.categoria || '').trim().toLowerCase();
            const catDesc = `${p.categoria || ''} ${p.modalidade || ''}`.toLowerCase();
            
            // Verifica se é explicitamente a categoria "Geral"
            const isGeral = catName === 'geral' || catName.includes('geral') || catName.includes('individual');
            const isDiscount = /estudante|aluno|escola|pcd|defici[eê]ncia|60\+|idoso|infantil|kids|sem kit|solid[aá]ri|morador|mun[ií]cipe/i.test(catDesc);

            if (isGeral && !isDiscount) {
              if (explicitGeralPrice === null || numPrice > explicitGeralPrice) {
                explicitGeralPrice = numPrice;
              }
            }

            if (!isDiscount) {
              if (generalPrice === null || numPrice > generalPrice) {
                generalPrice = numPrice;
              }
            }

            if (lowestPrice === null || numPrice < lowestPrice) {
              lowestPrice = numPrice;
            }
          }
        }
      }
    }

    finalExtractedPrice = explicitGeralPrice ?? generalPrice ?? lowestPrice;
  }

  // Regulamento em PDF
  let regulationUrl: string | null = null;
  if (Array.isArray(data.documentos) && data.documentos.length > 0) {
    const docUrl = data.documentos[0].url || data.documentos[0].caminho;
    if (docUrl && typeof docUrl === 'string' && docUrl.toLowerCase().includes('.pdf')) {
      regulationUrl = docUrl.startsWith('http') ? docUrl : `${cleanBase}/${docUrl.replace(/^\//, '')}`;
    }
  }

  // Link de Inscrição Oficial e Status de Abertura
  let officialRegistrationUrl: string | null = null;
  const isLiberado = Boolean(data.inscricao_liberada);

  if (Array.isArray(data.acoes)) {
    const acaoInscricao = data.acoes.find((a: any) => a.tipo === 'inscricao');
    if (acaoInscricao?.url) {
      const candidate = String(acaoInscricao.url);
      if (isValidRegistrationUrl(candidate, currentYear)) {
        officialRegistrationUrl = candidate;
      }
    }
  }

  // Se não tem URL nas ações, verifica se a rota do evento é válida para inscrição
  if (!officialRegistrationUrl && race.registrationUrl) {
    if (isValidRegistrationUrl(race.registrationUrl, currentYear)) {
      officialRegistrationUrl = race.registrationUrl;
    }
  }

  // Status estrito da prova
  let status: RaceStatus = race.status;
  if (isLiberado && officialRegistrationUrl) {
    status = 'OPEN';
  } else if (!isLiberado) {
    status = 'UPCOMING';
    // Se a inscrição ainda não foi liberada pelo chip, registration_url DEVE ser null
    officialRegistrationUrl = null;
  }

  return {
    ...race,
    eventTime,
    location,
    distances,
    price: finalExtractedPrice ?? race.price,
    priceFrom: finalExtractedPrice ?? race.priceFrom,
    regulationUrl: regulationUrl || race.regulationUrl || race.rulesUrl || null,
    rulesUrl: regulationUrl || race.rulesUrl || null,
    registrationUrl: officialRegistrationUrl,
    isRegistrationOpen: status === 'OPEN' && Boolean(officialRegistrationUrl),
    status,
    currentBatch: status === 'OPEN' ? (batchName || 'Inscrições Abertas') : 'Aguardando Abertura de Inscrição'
  };
}

/**
 * Aplica os dados extraídos do HTML da página interna do evento
 */
function applyHtmlDataToRace(
  race: ExtractedRace,
  html: string,
  cleanBase: string,
  currentYear: string,
  pageUrl: string
): ExtractedRace {
  const $ = cheerio.load(html);
  const bodyText = $('body').text();

  // 1. Distâncias no corpo da página
  const distances = extractDistances(bodyText);

  // 2. Preço: Procura primeiro em tabelas HTML de valores/categorias
  let htmlGeneralPrice: number | null = null;
  let htmlLowestPrice: number | null = null;

  $('tr').each((_, tr) => {
    const rowText = $(tr).text();
    const rowPriceMatch = rowText.match(/R\$\s*(\d{1,3}(?:[.,]\d{1,2})?)/i);
    if (rowPriceMatch && rowPriceMatch[1]) {
      const parsed = parseFloat(rowPriceMatch[1].replace(',', '.'));
      if (!isNaN(parsed) && parsed >= 20 && parsed < 5000) {
        const isFee = /taxa|pix|cart[aã]o|cr[eé]dito|transa[çc]|banc[aá]ri|conveni[eê]ncia/i.test(rowText);
        if (isFee) return;

        const isDiscount = /pcd|defici[eê]ncia|60\+|idoso/i.test(rowText);
        if (!isDiscount) {
          if (htmlGeneralPrice === null || parsed < htmlGeneralPrice) {
            htmlGeneralPrice = parsed;
          }
        }
        if (htmlLowestPrice === null || parsed < htmlLowestPrice) {
          htmlLowestPrice = parsed;
        }
      }
    }
  });

  const price = htmlGeneralPrice ?? htmlLowestPrice ?? extractPrice(bodyText);

  // 3. Regulamento PDF
  const regulationUrl = extractRegulationUrl(html, cleanBase);

  // 4. Horário
  let eventTime = race.eventTime;
  const timeMatch = bodyText.match(/(?:hor[áa]rio|largada)[:\s]+(\d{1,2}[:h]\d{2})/i);
  if (timeMatch && timeMatch[1]) {
    eventTime = timeMatch[1].replace('h', ':');
  }

  // 5. Local
  let location = race.location;
  const locationMatch = bodyText.match(/(?:local|largada|concentra[çc][ãa]o)[:\s]+([^\n\r.<]{5,60})/i);
  if (locationMatch && locationMatch[1]) {
    location = locationMatch[1].trim();
  }

  // 6. Link de Inscrição Oficial
  let validRegUrl: string | null = null;
  const directLink = $('a[href*="inscricao"], a[href*="checkout"], a[href*="ticket"]').first().attr('href');
  if (directLink) {
    const absDirect = directLink.startsWith('http') ? directLink : `${cleanBase}/${directLink.replace(/^\//, '')}`;
    if (isValidRegistrationUrl(absDirect, currentYear)) {
      validRegUrl = absDirect;
    }
  }

  if (!validRegUrl && isValidRegistrationUrl(pageUrl, currentYear)) {
    validRegUrl = pageUrl;
  }

  const isClosed = /encerrad[ao]|esgotad[ao]|finalizad[ao]/i.test(bodyText);
  let status: RaceStatus = isClosed ? 'CLOSED' : validRegUrl ? 'OPEN' : 'UPCOMING';

  return {
    ...race,
    distances: distances.length > 0 ? distances : race.distances,
    price: price ?? race.price,
    priceFrom: price ?? race.priceFrom,
    regulationUrl: regulationUrl || race.regulationUrl || race.rulesUrl || null,
    rulesUrl: regulationUrl || race.rulesUrl || null,
    eventTime: eventTime || '06:00',
    location: location || 'Centro',
    registrationUrl: status === 'OPEN' ? validRegUrl : null,
    isRegistrationOpen: status === 'OPEN' && Boolean(validRegUrl),
    status,
    currentBatch: status === 'OPEN' ? (race.currentBatch || 'Inscrições Abertas') : 'Aguardando Inscrição'
  };
}
