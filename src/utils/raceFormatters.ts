import type { Race, RaceCategory } from '../types/race';

/**
 * Formata distâncias garantindo decimais exatos (ex: 5,5 km e 21,1 km) sem arredondamento
 */
export function formatDecimalDistance(dist: string): string {
  if (!dist) return '';
  const trimmed = dist.trim();
  // Se contiver decimal com ponto (ex: 5.5 ou 21.195) converte para vírgula
  let formatted = trimmed.replace(/(\d+)\.(\d+)/g, '$1,$2');
  // Se terminar com número ou k sem km
  formatted = formatted.replace(/\b(\d+(?:,\d+)?)\s*(?:km|k)?\b/gi, '$1 km');
  return formatted;
}

/**
 * Padroniza rigorosamente os 4 chips oficiais do estado do Pará:
 * 1. Chip Chronos (Supera Chip Chronos)
 * 2. Chip Breu Branco
 * 3. Chip Pará
 * 4. Chip Amazônia
 */
export function getTimingChipBadge(company: string) {
  const c = (company || '').toLowerCase();

  if (c.includes('chronos') || c.includes('supera')) {
    return {
      name: 'Supera Chip Chronos',
      shortName: 'Chip Chronos',
      badgeClass: 'bg-slate-950/90 text-amber-400 border border-amber-500/50 shadow-xs',
      tagColor: 'text-amber-400',
      pillClass: 'bg-slate-900 text-amber-400 border-amber-500/40'
    };
  }
  if (c.includes('branco')) {
    return {
      name: 'Chip Breu Branco',
      shortName: 'Chip Breu Branco',
      badgeClass: 'bg-blue-950/90 text-amber-300 border border-amber-400/50 shadow-xs',
      tagColor: 'text-amber-300',
      pillClass: 'bg-blue-950 text-amber-300 border-amber-400/40'
    };
  }
  if (c.includes('pará') || c.includes('para')) {
    return {
      name: 'Chip Pará',
      shortName: 'Chip Pará',
      badgeClass: 'bg-rose-950/90 text-rose-200 border border-blue-500/50 shadow-xs',
      tagColor: 'text-rose-200',
      pillClass: 'bg-rose-950 text-rose-200 border-blue-500/40'
    };
  }
  if (c.includes('amazônia') || c.includes('amazonia')) {
    return {
      name: 'Chip Amazônia',
      shortName: 'Chip Amazônia',
      badgeClass: 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 shadow-xs',
      tagColor: 'text-emerald-300',
      pillClass: 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
    };
  }
  return {
    name: 'Chip Breu Branco',
    shortName: 'Chip Breu Branco',
    badgeClass: 'bg-blue-950/90 text-amber-300 border border-amber-400/50 shadow-xs',
    tagColor: 'text-amber-300',
    pillClass: 'bg-blue-950 text-amber-300 border-amber-400/40'
  };
}

/**
 * Vincula cada distância ao seu respectivo valor/lote real
 * É terminantemente proibido preço único (5km != 21km)
 */
export function getRaceCategories(race: Race): RaceCategory[] {
  if (race.categories && race.categories.length > 0) {
    return race.categories;
  }

  const basePrice = race.priceWithoutShirt || race.priceFrom || race.price || 60;
  const currentLot = race.currentBatch || '1º Lote';

  if (!race.distances || race.distances.length === 0) {
    return [
      {
        distance: '5 km',
        price: basePrice,
        lot_name: currentLot
      }
    ];
  }

  // Escalonamento de preço por quilometragem e complexidade
  return race.distances.map((distRaw) => {
    const formatted = formatDecimalDistance(distRaw);
    const num = parseFloat(distRaw.replace(',', '.').replace(/[^0-9.]/g, '')) || 5;

    let price = basePrice;
    if (num <= 3) {
      price = Math.max(35, basePrice - 10);
    } else if (num >= 21) {
      price = Math.max(basePrice, 110);
    } else if (num >= 15) {
      price = Math.max(basePrice, 95);
    } else if (num >= 10) {
      price = Math.max(basePrice, 80);
    } else if (num > 5) {
      price = Math.max(basePrice, 70);
    } else {
      price = basePrice;
    }

    return {
      distance: formatted,
      price: price,
      lot_name: currentLot
    };
  });
}

/**
 * Retorna o valor de piso base da prova ("A partir de R$ XX,XX")
 */
export function getBasePrice(race: Race): number {
  if (race.priceWithoutShirt) return race.priceWithoutShirt;
  const categories = getRaceCategories(race);
  if (categories.length > 0) {
    return Math.min(...categories.map((c) => c.price));
  }
  return race.priceFrom || race.price || 60;
}

/**
 * Calcula dias restantes para a data da corrida
 */
export function calculateDaysLeft(targetDate: string): number {
  try {
    const [year, month, day] = targetDate.split('-').map(Number);
    const target = new Date(year, month - 1, day, 23, 59, 59).getTime();
    const now = new Date().getTime();
    const diff = target - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  } catch {
    return 0;
  }
}

/**
 * Detecta tag de virada de lote se aplicável: "Virada de lote em X dias"
 */
export function getBatchCountdownTag(race: Race): string | null {
  if (race.status === 'finished' || race.status === 'closed') return null;

  if (race.batchDeadline) {
    const days = calculateDaysLeft(race.batchDeadline);
    if (days > 0 && days <= 15) {
      return `Virada de lote em ${days} ${days === 1 ? 'dia' : 'dias'}`;
    }
  }

  // Se o lote for 1º lote ou promocional e faltar menos de 20 dias para o evento
  const daysLeft = calculateDaysLeft(race.date);
  if (race.status === 'closing_soon') {
    return 'Últimas Vagas do Lote';
  }

  if (daysLeft > 0 && daysLeft <= 10) {
    return `Virada de lote em ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}`;
  }

  return null;
}

/**
 * Extrai o valor monetário de premiação para ordenação por "Maior Premiação"
 */
export function extractPrizeValue(race: Race): number {
  if ((race as any).prizeTotal && typeof (race as any).prizeTotal === 'number') {
    return (race as any).prizeTotal;
  }
  const text = `${race.awardsInfo || ''} ${race.description || ''} ${race.title || ''}`;
  const matches = text.match(/R\$\s*(\d+(?:[.,]\d+)?(?:\.\d+)?)/gi);
  if (matches) {
    let maxVal = 0;
    matches.forEach((m) => {
      const numStr = m.replace(/R\$\s*/i, '').replace(/\./g, '').replace(',', '.');
      const val = parseFloat(numStr);
      if (val > maxVal && val < 500000) maxVal = val;
    });
    if (maxVal > 0) return maxVal;
  }
  if (text.toLowerCase().includes('dinheiro') || text.toLowerCase().includes('troféu')) {
    return 100;
  }
  return 0;
}
