// ==============================================================================
// Types e Contratos do Sistema de Sincronização & Web Scraping de Corridas
// ==============================================================================

export type TimingCompany = 
  | 'CHIP_AMAZONIA'
  | 'CHIP_PARA'
  | 'CHIP_BRANCO'
  | 'SUPERA_CHRONOS'
  | 'OUTRO';

export type RaceStatus = 
  | 'UPCOMING'   // Confirmada no calendário preliminar / Em breve
  | 'OPEN'       // Inscrições abertas no site da cronometragem
  | 'CLOSED'     // Inscrições encerradas ou esgotadas
  | 'CANCELLED'; // Evento cancelado ou adiado

export interface ExtractedRace {
  title: string;
  eventDate: string; // Formato ISO YYYY-MM-DD
  eventTime?: string; // Ex: '06:00'
  city: string;
  state: string; // Padrão 'PA'
  location?: string;
  timingCompany: TimingCompany;
  registrationUrl: string | null; // Apenas se for página ativa de compra/inscrição
  bannerUrl?: string;
  rulesUrl?: string | null;
  regulationUrl?: string | null; // Link direto do regulamento em PDF
  distances: string[]; // Ex: ['5 km', '7 km', '10 km']
  status: RaceStatus;
  currentBatch?: string | null;
  price: number | null; // Preço numérico da inscrição (ex: 65.00)
  priceFrom?: number | null; // Alias de compatibilidade
  priceWithoutShirt?: number | null; // Valor sem camisa
  priceWithShirt?: number | null;    // Valor com camisa
  isRegistrationOpen: boolean; // Confirmação de inscrição ativa
  organizer?: string;
  rawData: Record<string, unknown>;
}

/**
 * Modelo de corrida persistido no banco de dados
 */
export interface RaceRecord {
  id: string;
  title: string;
  slug: string;
  eventDate: string; // YYYY-MM-DD
  eventTime?: string;
  city: string;
  state: string;
  location?: string;
  timingCompany: TimingCompany;
  registrationUrl: string | null;
  bannerUrl?: string;
  rulesUrl?: string | null;
  regulationUrl?: string | null;
  distances: string[];
  status: RaceStatus;
  currentBatch?: string | null;
  price?: number | null;
  priceFrom?: number | null;
  priceWithoutShirt?: number | null;
  priceWithShirt?: number | null;
  isRegistrationOpen?: boolean;
  featured: boolean;
  organizer: string;
  rawData?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface obrigatória para qualquer Scraper de empresa de cronometragem
 */
export interface RaceScraperInterface {
  readonly company: TimingCompany;
  readonly name: string;
  readonly sourceUrl: string;
  scrape(): Promise<ExtractedRace[]>;
}

/**
 * Sumário da execução de um portal específico
 */
export interface ScraperSiteSummary {
  company: TimingCompany;
  name: string;
  sourceUrl: string;
  success: boolean;
  foundCount: number;
  error?: string;
  durationMs: number;
}

/**
 * Sumário consolidado do Job de Sincronização
 */
export interface SyncSummary {
  totalScraped: number;
  insertedCount: number;
  updatedCount: number;
  skippedCount: number;
  errorCount: number;
  durationMs: number;
  sites: ScraperSiteSummary[];
  timestamp: string;
}

/**
 * Resultado do cálculo de similaridade e correspondência
 */
export interface MatchResult {
  isMatch: boolean;
  matchedRace: RaceRecord | null;
  similarityScore: number;
  matchReasons: string[];
}
