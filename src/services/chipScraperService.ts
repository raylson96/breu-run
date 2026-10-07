import type { Race, ChipCompany } from '../types/race';

export interface ChipSiteInfo {
  name: ChipCompany;
  domain: string;
  defaultUrl: string;
  description: string;
  badgeColor: string;
}

export const CHIP_SITES: ChipSiteInfo[] = [
  {
    name: 'Chip Amazônia',
    domain: 'chipamazonia.com.br',
    defaultUrl: 'https://chipamazonia.com.br',
    description: 'Atua fortemente em Marabá, Parauapebas, Canaã e sul/sudeste do Pará.',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  {
    name: 'Chip Breu Branco',
    domain: 'chipbreubranco.com.br',
    defaultUrl: 'https://chipbreubranco.com.br',
    description: 'Forte presença em Tailândia, Breu Branco, Tucuruí e região da Rodovia PA-150.',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  {
    name: 'Chip Pará',
    domain: 'chippara.com.br',
    defaultUrl: 'https://chippara.com.br',
    description: 'Cobertura em Belém metropolitana, Castanhal, Bragança e eventos estaduais.',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300'
  },
  {
    name: 'Chip Cronos',
    domain: 'chipcronos.com.br',
    defaultUrl: 'https://chipcronos.com.br',
    description: 'Cronometragem eletrônica em expansão no interior e eventos de rua.',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300'
  }
];

// Detecta a empresa de chip a partir de uma URL ou texto
export function detectChipFromUrl(urlOrText: string): ChipCompany {
  const lower = urlOrText.toLowerCase();

  if (lower.includes('chipamazonia') || lower.includes('chip amazonia') || lower.includes('chip amazônia')) {
    return 'Chip Amazônia';
  }
  if (lower.includes('chipbreubranco') || lower.includes('breu branco') || lower.includes('chipbreu')) {
    return 'Chip Breu Branco';
  }
  if (lower.includes('chippara') || lower.includes('chip para') || lower.includes('chip pará')) {
    return 'Chip Pará';
  }
  if (lower.includes('cronos') || lower.includes('chipcronos')) {
    return 'Chip Cronos';
  }

  return 'A Definir';
}

// Limpa e normaliza strings para comparação fonética/semelhante
export function normalizeTitle(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-z0-9\s]/g, ' ')     // remove pontuação
    .replace(/\b(\d+)[ªº°a]\b/g, '$1') // '4ª' -> '4'
    .replace(/\s+/g, ' ')
    .trim();
}

// Verifica se dois nomes de corrida se referem ao mesmo evento
export function isSameRace(titleA: string, titleB: string, cityA?: string, cityB?: string): boolean {
  const normA = normalizeTitle(titleA);
  const normB = normalizeTitle(titleB);

  // Match exato
  if (normA === normB) return true;

  // Se uma contém a outra (ex: "4 corrida noturna tailandia" contém "corrida noturna tailandia")
  if (normA.includes(normB) || normB.includes(normA)) {
    return true;
  }

  // Se a cidade for a mesma e houver palavras-chave coincidentes
  if (cityA && cityB && normalizeTitle(cityA) === normalizeTitle(cityB)) {
    const wordsA = new Set(normA.split(' ').filter((w) => w.length > 3));
    const wordsB = new Set(normB.split(' ').filter((w) => w.length > 3));

    let commonCount = 0;
    wordsA.forEach((w) => {
      if (wordsB.has(w)) commonCount++;
    });

    if (commonCount >= 2) return true;
  }

  return false;
}

export interface MergeResult {
  updatedRaces: Race[];
  addedCount: number;
  matchedCount: number;
}

// Algoritmo de Deduplicação e Cruzamento Inteligente:
// Quando um link é colado ou importado, procura se a prova já existe no calendário pelo Nome, Data ou Cidade.
// Se existir: ATUALIZA o link e status para 'open' sem criar duplicatas!
// Se não existir: cria uma nova prova!
export function mergeAndDeduplicateRaces(
  existingRaces: Race[],
  newEntries: Partial<Race>[]
): MergeResult {
  let updatedRaces = [...existingRaces];
  let addedCount = 0;
  let matchedCount = 0;

  for (const incoming of newEntries) {
    const incomingTitle = incoming.title;
    if (!incomingTitle) continue;

    const detectedChip = incoming.registrationUrl 
      ? detectChipFromUrl(incoming.registrationUrl) 
      : (incoming.chipCompany || 'A Definir');

    // 1. Tentar encontrar correspondência na base existente
    const matchIndex = updatedRaces.findIndex((existing) => {
      // Mesma data exata e cidade semelhante
      if (incoming.date && existing.date === incoming.date) {
        if (incoming.city && existing.city && normalizeTitle(incoming.city) === normalizeTitle(existing.city)) {
          return true;
        }
        if (isSameRace(existing.title, incomingTitle, existing.city, incoming.city)) {
          return true;
        }
      }

      // Mesmo nome de corrida (mesmo que a data tenha variado por 1 dia no cartaz preliminar)
      if (isSameRace(existing.title, incomingTitle, existing.city, incoming.city)) {
        return true;
      }

      return false;
    });

    if (matchIndex !== -1) {
      // ATUALIZA A CORRIDA EXISTENTE (DEDUPLICAÇÃO)
      const target = updatedRaces[matchIndex];
      updatedRaces[matchIndex] = {
        ...target,
        // Atualiza link se o novo tiver
        registrationUrl: incoming.registrationUrl || target.registrationUrl || '',
        // Se achou o link ou se veio como open, abre as inscrições
        status: incoming.registrationUrl 
          ? (target.status === 'closed' ? 'closed' : 'open') 
          : (incoming.status || target.status),
        // Atualiza chip se foi detectado pelo domínio do site
        chipCompany: detectedChip !== 'A Definir' ? detectedChip : target.chipCompany,
        // Atualiza preço ou lote se veio
        priceFrom: incoming.priceFrom || target.priceFrom,
        currentBatch: incoming.currentBatch || (incoming.registrationUrl && target.status === 'confirmed' ? '1º Lote Aberto' : target.currentBatch),
        distances: (incoming.distances && incoming.distances.length > 0) ? incoming.distances : target.distances
      };
      matchedCount++;
    } else {
      // INSERE COMO NOVA PROVA
      const newRace: Race = {
        id: incoming.id || `race-${Date.now()}-${addedCount}`,
        title: incomingTitle,
        organizer: incoming.organizer || 'Organização Oficial',
        date: incoming.date || new Date().toISOString().split('T')[0],
        time: incoming.time || '06:00',
        city: incoming.city || 'Tailândia',
        state: 'PA',
        location: incoming.location || `Centro, ${incoming.city || 'PA'}`,
        distances: incoming.distances || ['5 km'],
        chipCompany: detectedChip,
        status: incoming.registrationUrl ? 'open' : (incoming.status || 'confirmed'),
        registrationUrl: incoming.registrationUrl || '',
        currentBatch: incoming.currentBatch || (incoming.registrationUrl ? '1º Lote' : 'Confirmada no Calendário'),
        featured: incoming.featured || false,
        kitItems: ['Camiseta oficial', 'Medalha finisher', 'Número de peito com chip']
      };
      updatedRaces.push(newRace);
      addedCount++;
    }
  }

  return {
    updatedRaces,
    addedCount,
    matchedCount
  };
}

// Analisador de links em lote colados pelo usuário
export function parseLinksBatch(textWithUrls: string): Partial<Race>[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = textWithUrls.match(urlRegex) || [];
  const entries: Partial<Race>[] = [];

  urls.forEach((url, idx) => {
    const chip = detectChipFromUrl(url);

    // Tentar extrair o slug ou nome do evento a partir do caminho da URL
    // Ex: https://chipbreubranco.com.br/evento/4-corrida-noturna-tailandia
    let guessedTitle = 'Corrida Identificada pelo Link';
    let guessedCity = 'Tailândia';

    try {
      const urlObj = new URL(url);
      const segments = urlObj.pathname.split('/').filter(Boolean);
      const lastSegment = segments[segments.length - 1] || '';
      
      if (lastSegment) {
        // Converte "4-corrida-noturna-de-tailandia" em "4 Corrida Noturna De Tailandia"
        const words = lastSegment
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase())
          .trim();
        
        if (words.length > 5) {
          guessedTitle = words;
        }
      }
    } catch (e) {
      // Ignore URL parse error
    }

    entries.push({
      id: `link-extracted-${Date.now()}-${idx}`,
      title: guessedTitle,
      registrationUrl: url,
      chipCompany: chip,
      status: 'open',
      currentBatch: 'Inscrições Abertas (Link Oficial)',
      city: guessedCity
    });
  });

  return entries;
}
