import type { ExtractedRace, RaceRecord, MatchResult } from '../types';
import { isValidRegistrationUrl } from '../utils/parsingHelpers';

const STOP_WORDS = new Set([
  'de', 'da', 'do', 'das', 'dos', 'em', 'no', 'na', 'nos', 'nas',
  'a', 'o', 'as', 'os', 'e', 'para', 'com', 'por', 'corrida',
  'etapa', 'circuito', 'desafio', 'trofeu', 'prova', 'rua', 'anual'
]);

/**
 * Normaliza e limpa títulos removendo acentos, pontuação e stopwords
 */
export function cleanAndNormalizeTitle(title: string): string {
  if (!title) return '';

  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .replace(/\b(\d+)[ªº°a]\b/g, '$1') // 4ª -> 4
    .replace(/[^a-z0-9\s]/g, ' ')     // remove pontuação
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word))
    .join(' ')
    .trim();
}

/**
 * Normaliza cidades para comparação
 */
export function normalizeCity(city: string): string {
  if (!city) return '';
  return city
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Calcula a distância de Levenshtein entre duas strings
 */
export function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const d: number[][] = [];
  for (let i = 0; i <= m; i++) {
    d[i] = [i];
  }
  for (let j = 0; j <= n; j++) {
    d[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,      // remoção
        d[i][j - 1] + 1,      // inserção
        d[i - 1][j - 1] + cost // substituição
      );
    }
  }

  return d[m][n];
}

/**
 * Similaridade de Levenshtein normalizada no intervalo [0.0, 1.0]
 */
export function levenshteinSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;
  const distance = levenshteinDistance(s1, s2);
  return 1.0 - distance / maxLen;
}

/**
 * Similaridade de Tokens baseada no Coeficiente de Sorensen-Dice
 */
export function tokenSimilarity(s1: string, s2: string): number {
  const tokens1 = new Set(s1.split(/\s+/).filter(Boolean));
  const tokens2 = new Set(s2.split(/\s+/).filter(Boolean));

  if (tokens1.size === 0 && tokens2.size === 0) return 1.0;
  if (tokens1.size === 0 || tokens2.size === 0) return 0.0;

  let intersection = 0;
  tokens1.forEach((t) => {
    if (tokens2.has(t)) intersection++;
  });

  return (2.0 * intersection) / (tokens1.size + tokens2.size);
}

/**
 * Similaridade combinada (50% Levenshtein + 50% Token Overlap)
 */
export function combinedSimilarity(s1: string, s2: string): number {
  const norm1 = cleanAndNormalizeTitle(s1);
  const norm2 = cleanAndNormalizeTitle(s2);

  if (norm1 === norm2) return 1.0;
  if (!norm1 || !norm2) return 0.0;

  const lev = levenshteinSimilarity(norm1, norm2);
  const tok = tokenSimilarity(norm1, norm2);

  return 0.4 * lev + 0.6 * tok;
}

/**
 * Compara se duas datas são próximas dentro de uma tolerância em dias
 */
export function isDateMatching(dateA: string, dateB: string, toleranceDays = 2): boolean {
  if (dateA === dateB) return true;

  try {
    const tA = new Date(dateA).getTime();
    const tB = new Date(dateB).getTime();
    if (isNaN(tA) || isNaN(tB)) return false;

    const diffDays = Math.abs(tA - tB) / (1000 * 60 * 60 * 24);
    return diffDays <= toleranceDays;
  } catch {
    return false;
  }
}

/**
 * Avalia se uma corrida extraída já existe no banco de dados e retorna a correspondência
 */
export function matchExistingRace(
  extracted: ExtractedRace,
  existingRaces: RaceRecord[]
): MatchResult {
  let bestMatch: RaceRecord | null = null;
  let highestScore = 0;
  const matchReasons: string[] = [];

  const normExtractedTitle = cleanAndNormalizeTitle(extracted.title);
  const normExtractedCity = normalizeCity(extracted.city);

  for (const existing of existingRaces) {
    // 1. Match Exato por URL de inscrição
    if (
      extracted.registrationUrl &&
      existing.registrationUrl &&
      extracted.registrationUrl.toLowerCase() === existing.registrationUrl.toLowerCase()
    ) {
      return {
        isMatch: true,
        matchedRace: existing,
        similarityScore: 1.0,
        matchReasons: ['URL de inscrição idêntica']
      };
    }

    // 2. Avaliação de Título, Cidade e Data
    const titleScore = combinedSimilarity(extracted.title, existing.title);
    const dateMatch = isDateMatching(extracted.eventDate, existing.eventDate, 2);
    const cityMatch = normExtractedCity === normalizeCity(existing.city);

    let currentScore = 0;
    const currentReasons: string[] = [];

    // Cenário A: Mesma data (+-2 dias) + Mesma cidade + Título razoavelmente similar (>= 0.60)
    if (dateMatch && cityMatch && titleScore >= 0.60) {
      currentScore = 0.5 * titleScore + 0.3 * (dateMatch ? 1 : 0) + 0.2 * (cityMatch ? 1 : 0);
      currentReasons.push('Data coincidente', 'Mesma cidade', `Similaridade de título: ${(titleScore * 100).toFixed(0)}%`);
    }

    // Cenário B: Título muito similar (>= 0.80) mesmo que cidade ou data variem levemente
    else if (titleScore >= 0.80) {
      currentScore = titleScore;
      currentReasons.push(`Similaridade forte de título: ${(titleScore * 100).toFixed(0)}%`);
      if (dateMatch) currentReasons.push('Data aproximada');
      if (cityMatch) currentReasons.push('Mesma cidade');
    }

    // Cenário C: Título contém o outro como substring e mesma cidade
    else if (cityMatch && (normExtractedTitle.includes(cleanAndNormalizeTitle(existing.title)) || cleanAndNormalizeTitle(existing.title).includes(normExtractedTitle))) {
      currentScore = 0.75;
      currentReasons.push('Sub-string do título coincide', 'Mesma cidade');
    }

    if (currentScore > highestScore && currentScore >= 0.65) {
      highestScore = currentScore;
      bestMatch = existing;
      matchReasons.length = 0;
      matchReasons.push(...currentReasons);
    }
  }

  return {
    isMatch: bestMatch !== null,
    matchedRace: bestMatch,
    similarityScore: highestScore,
    matchReasons
  };
}

/**
 * Mescla os dados de uma corrida extraída com o registro existente,
 * enriquecendo o registro sem perder dados manuais anteriores.
 */
export function mergeRaceData(
  existing: RaceRecord,
  extracted: ExtractedRace
): Partial<RaceRecord> {
  // Une percursos sem duplicatas
  const combinedDistances = Array.from(
    new Set([...existing.distances, ...extracted.distances])
  );

  // Sanitiza qualquer link antigo existente que possa ter sido de resultados/tempos
  const cleanExistingUrl = isValidRegistrationUrl(existing.registrationUrl) ? existing.registrationUrl : null;
  const finalRegUrl = extracted.registrationUrl || cleanExistingUrl;

  const resolvedRegulationUrl = extracted.regulationUrl || existing.regulationUrl || extracted.rulesUrl || existing.rulesUrl || null;
  const resolvedPrice = extracted.price ?? existing.price ?? (extracted.priceFrom ?? existing.priceFrom);

  return {
    registrationUrl: finalRegUrl,
    timingCompany: extracted.timingCompany || existing.timingCompany,
    bannerUrl: extracted.bannerUrl || existing.bannerUrl,
    regulationUrl: resolvedRegulationUrl,
    rulesUrl: resolvedRegulationUrl,
    distances: combinedDistances.length > 0 ? combinedDistances : existing.distances,
    status: extracted.status === 'OPEN' && finalRegUrl ? 'OPEN' : (existing.status === 'CLOSED' ? 'CLOSED' : extracted.status),
    currentBatch: extracted.currentBatch || (extracted.status === 'OPEN' ? '1º Lote Aberto' : existing.currentBatch),
    price: resolvedPrice ?? null,
    priceFrom: resolvedPrice ?? undefined,
    isRegistrationOpen: Boolean(finalRegUrl && extracted.status === 'OPEN'),
    location: extracted.location || existing.location,
    eventTime: extracted.eventTime || existing.eventTime,
    rawData: {
      ...(existing.rawData || {}),
      lastSync: {
        timestamp: new Date().toISOString(),
        extractedFrom: extracted.registrationUrl,
        timingCompany: extracted.timingCompany,
        status: extracted.status,
        price: extracted.price,
        regulationUrl: extracted.regulationUrl
      }
    },
    updatedAt: new Date().toISOString()
  };
}
