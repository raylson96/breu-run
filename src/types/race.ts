export type ChipCompany = 
  | 'Chip Chronos' 
  | 'Chip Cronos'
  | 'Chip Breu Branco' 
  | 'Chip Pará' 
  | 'Chip Amazônia'
  | 'A Definir'
  | 'Outra';

export interface RaceCategory {
  distance: string;     // Ex: "5 km", "21 km", "3 km Caminhada"
  price: number;        // Ex: 60.00
  lot_name?: string;    // Ex: "1º Lote", "Lote Promocional"
}

export type RaceStatus = 
  | 'open'          // Inscrições abertas com link ativo
  | 'confirmed'     // Confirmada no calendário, aguardando liberação do link
  | 'soon'          // Em breve (abertura com data marcada)
  | 'closing_soon'  // Últimas vagas / virada de lote iminente
  | 'closed'        // Inscrições encerradas ou esgotadas
  | 'finished';     // Prova já realizada

export interface Race {
  id: string;
  title: string;
  organizer: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  city: string;
  state: string;
  location: string;
  region?: string; // Polo Sudeste, Polo PA-150, Polo Metropolitano, etc.
  distances: string[];
  chipCompany: ChipCompany;
  status: RaceStatus;
  registrationUrl?: string; // Pode ser vazio se o evento for recém confirmado no calendário anual
  regulationUrl?: string;   // Link direto do regulamento oficial (PDF)
  rulesUrl?: string;
  resultsUrl?: string;     // Link para resultados / tempos após a corrida
  featured?: boolean;
  price?: number;          // Valor numérico em reais
  priceFrom?: number;
  priceWithoutShirt?: number; // Valor sem camisa (ex: Kit Padrão R$ 54,90)
  priceWithShirt?: number;    // Valor com camisa (ex: Kit Premium R$ 84,90)
  currentBatch?: string;
  batchDeadline?: string;
  badge?: string;
  description?: string;
  kitItems?: string[];
  awardsInfo?: string;
  prizeTotal?: number;
  elevation?: string;
  imageUrl?: string;
  bannerUrl?: string;
  categories?: RaceCategory[];
}

export type ViewMode = 'grid' | 'table' | 'timeline';

export type FilterState = {
  viewMode: ViewMode;
  region: string;
  city: string;
  month: string;
  distance: string;
  chipCompany: string;
  status: string;
  search: string;
  onlyFavorites: boolean;
  sortBy: 'date_asc' | 'date_desc' | 'prize_desc';
  tab: 'upcoming' | 'results'; // 'upcoming': Provas Ativas / Calendário; 'results': Provas Passadas & Resultados
};
