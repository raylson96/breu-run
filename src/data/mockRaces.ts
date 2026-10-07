import type { Race } from '../types/race';

// Base zerada para inserção real de novas corridas via upload de cartaz IA ou formulário
export const INITIAL_RACES: Race[] = [];

export const REGIONS_POLOS = [
  'Todas as Regiões',
  'Sudeste do Pará',
  'Eixo PA-150 & Lago',
  'Região Metropolitana',
  'Baixo Tocantins & Salgado',
  'Oeste do Pará'
];

export const REGIONS_CITIES = [
  'Todas',
  'Tailândia',
  'Marabá',
  'Breu Branco',
  'Parauapebas',
  'Belém',
  'Castanhal',
  'Tucuruí',
  'Canaã dos Carajás',
  'Paragominas',
  'Barcarena',
  'Santarém',
  'Ananindeua',
  'Abaetetuba',
  'Bragança'
];

export const MONTHS = [
  { value: 'all', label: 'Todos os Meses' },
  { value: '2026-09', label: 'Setembro 2026' },
  { value: '2026-10', label: 'Outubro 2026' },
  { value: '2026-11', label: 'Novembro 2026' },
  { value: '2026-12', label: 'Dezembro 2026' },
  { value: '2027-01', label: 'Janeiro 2027' },
  { value: '2027-02', label: 'Fevereiro 2027' },
  { value: '2027-03', label: 'Março 2027' },
  { value: '2027-04', label: 'Abril 2027' },
  { value: '2027-05', label: 'Maio 2027' },
  { value: '2027-06', label: 'Junho 2027' },
];

export const CHIP_COMPANIES = [
  'Todas',
  'Chip Amazônia',
  'Chip Breu Branco',
  'Chip Pará',
  'Chip Cronos',
  'A Definir'
];

export const DISTANCE_OPTIONS = [
  'Todas',
  '5 km',
  '10 km',
  '15 km',
  '21 km',
  '42 km',
  'Outras'
];

export const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos os Status' },
  { value: 'open', label: 'Inscrições Abertas (com link)' },
  { value: 'closing_soon', label: 'Últimos Dias / Virando Lote' },
  { value: 'confirmed', label: 'Confirmada no Calendário' },
  { value: 'soon', label: 'Em Breve' },
  { value: 'closed', label: 'Inscrições Encerradas' },
  { value: 'finished', label: 'Provas Realizadas' },
];
