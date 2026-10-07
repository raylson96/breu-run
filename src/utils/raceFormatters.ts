import type { Race } from '../types/race';

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
 * Padroniza os selos das empresas de cronometragem oficiais
 * - Supera Chip Chronos (dark blue / orange)
 * - Chip Amazônia (emerald green)
 * - Chip Pará (red / blue)
 * - Chip do Branco (slate / yellow)
 */
export function getTimingChipBadge(company: string) {
  const c = (company || '').toLowerCase();

  if (c.includes('chronos') || c.includes('supera')) {
    return {
      name: 'Supera Chip Chronos',
      badgeClass: 'bg-slate-950/90 text-amber-400 border border-amber-500/50 shadow-xs',
      tagColor: 'text-amber-400'
    };
  }
  if (c.includes('amazônia') || c.includes('amazonia')) {
    return {
      name: 'Chip Amazônia',
      badgeClass: 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 shadow-xs',
      tagColor: 'text-emerald-300'
    };
  }
  if (c.includes('pará') || c.includes('para')) {
    return {
      name: 'Chip Pará',
      badgeClass: 'bg-rose-950/90 text-rose-200 border border-blue-500/50 shadow-xs',
      tagColor: 'text-rose-200'
    };
  }
  if (c.includes('branco')) {
    return {
      name: 'Chip do Branco',
      badgeClass: 'bg-slate-900/90 text-amber-300 border border-amber-400/50 shadow-xs',
      tagColor: 'text-amber-300'
    };
  }
  return {
    name: company || 'Chip Cronometragem',
    badgeClass: 'bg-slate-900/90 text-slate-200 border border-slate-700 shadow-xs',
    tagColor: 'text-slate-200'
  };
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
 * Detecta tag de virada de lote se aplicável: "Lote vira em X dias"
 */
export function getBatchCountdownTag(race: Race): string | null {
  if (race.status === 'finished' || race.status === 'closed') return null;

  if (race.batchDeadline) {
    const days = calculateDaysLeft(race.batchDeadline);
    if (days > 0 && days <= 15) {
      return `Lote vira em ${days} ${days === 1 ? 'dia' : 'dias'}`;
    }
  }

  // Se o lote for 1º lote ou promocional e faltar menos de 20 dias para o evento
  const daysLeft = calculateDaysLeft(race.date);
  if (race.status === 'closing_soon') {
    return 'Últimas Vagas do Lote';
  }

  if (daysLeft > 0 && daysLeft <= 10) {
    return `Lote vira em ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}`;
  }

  return null;
}

export const DEFAULT_RACE_BANNER = 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80';
