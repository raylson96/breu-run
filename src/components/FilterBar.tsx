import React from 'react';
import type { FilterState } from '../types/race';
import { 
  REGIONS_CITIES, 
  CHIP_COMPANIES, 
  DISTANCE_OPTIONS 
} from '../data/mockRaces';
import { 
  Search, 
  X, 
  Heart, 
  LayoutGrid, 
  Table, 
  Trophy,
  Calendar,
  Zap,
  RotateCcw,
  MapPin,
  ShieldCheck,
  Activity
} from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  cityCounts: Record<string, number>;
  totalFiltered: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  cityCounts,
  totalFiltered
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      search: e.target.value
    });
  };

  const handleTabChange = (tab: 'upcoming' | 'results') => {
    onFilterChange({
      ...filters,
      tab,
      status: tab === 'results' ? 'finished' : (filters.status === 'finished' ? 'all' : filters.status)
    });
  };

  const handleResetFilters = () => {
    onFilterChange({
      viewMode: filters.viewMode,
      region: 'Todas as Regiões',
      city: 'Todas',
      month: 'all',
      distance: 'Todas',
      chipCompany: 'Todas',
      status: 'all',
      search: '',
      onlyFavorites: false,
      sortBy: 'date_asc',
      tab: 'upcoming'
    });
  };

  // Verifica se há filtros além do padrão
  const hasActiveFilters = 
    filters.city !== 'Todas' ||
    filters.chipCompany !== 'Todas' ||
    filters.distance !== 'Todas' ||
    filters.search !== '' ||
    filters.onlyFavorites;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-sm border border-slate-200 mb-6 space-y-3 w-full overflow-hidden">
      {/* 1. Abas de Navegação & Modo de Exibição (Cards vs Tabela) */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5 overflow-x-auto no-scrollbar">
        {/* Abas Principais em Scroll Horizontal Suave */}
        <div className="flex items-center gap-1.5 flex-nowrap">
          <button
            onClick={() => {
              onFilterChange({
                ...filters,
                tab: 'upcoming',
                status: 'all',
                onlyFavorites: false
              });
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer flex-shrink-0 ${
              filters.tab === 'upcoming' && filters.status !== 'open' && !filters.onlyFavorites
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-orange-400" />
            <span>Calendário Breu Run</span>
          </button>

          <button
            onClick={() => {
              onFilterChange({
                ...filters,
                tab: 'upcoming',
                status: 'open',
                onlyFavorites: false
              });
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer flex-shrink-0 ${
              filters.tab === 'upcoming' && filters.status === 'open'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-300" />
            <span>Inscrições Abertas</span>
          </button>

          <button
            onClick={() => handleTabChange('results')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer flex-shrink-0 ${
              filters.tab === 'results'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-purple-300" />
            <span>Resultados</span>
          </button>

          <button
            onClick={() => {
              onFilterChange({
                ...filters,
                onlyFavorites: !filters.onlyFavorites
              });
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 whitespace-nowrap cursor-pointer flex-shrink-0 ${
              filters.onlyFavorites
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
            title="Minhas corridas salvas"
          >
            <Heart className={`w-3.5 h-3.5 ${filters.onlyFavorites ? 'fill-white text-white' : 'text-rose-500'}`} />
            <span className="hidden sm:inline">Salvas</span>
          </button>
        </div>

        {/* Alternador de Modo PC (Cards vs Tabela) */}
        <div className="bg-slate-100 p-0.5 rounded-xl border border-slate-200 flex items-center flex-shrink-0">
          <button
            onClick={() => onFilterChange({ ...filters, viewMode: 'grid' })}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              filters.viewMode === 'grid'
                ? 'bg-white text-orange-600 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Grade de Cards"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cards</span>
          </button>

          <button
            onClick={() => onFilterChange({ ...filters, viewMode: 'table' })}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              filters.viewMode === 'table'
                ? 'bg-white text-orange-600 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Tabela Completa"
          >
            <Table className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tabela</span>
          </button>
        </div>
      </div>

      {/* 2. Campo de Busca Compacto + Contador + Botão Limpar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder={filters.tab === 'results' ? "Buscar resultados por corrida ou ano..." : "Buscar corrida, organizador ou cidade..."}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white text-slate-900 transition font-medium"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-xl whitespace-nowrap">
            {totalFiltered} {totalFiltered === 1 ? 'evento' : 'eventos'}
          </span>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-2.5 py-1.5 rounded-xl bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-200 text-xs font-bold transition cursor-pointer flex items-center gap-1 whitespace-nowrap"
              title="Limpar todos os filtros"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Fileira Direta de CIDADES (Aquele jeito antigo, 1 toque direto na tela) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 flex-shrink-0 pr-1">
          <MapPin className="w-3 h-3 text-rose-500" />
          <span>Cidades:</span>
        </span>

        {REGIONS_CITIES.map((city) => {
          const isSelected = filters.city === city;
          const count = city === 'Todas' ? '' : ` (${cityCounts[city] || 0})`;
          
          return (
            <button
              key={city}
              onClick={() => onFilterChange({ ...filters, city })}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex-shrink-0 ${
                isSelected
                  ? 'bg-orange-600 text-white font-black shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60'
              }`}
            >
              {city}{count}
            </button>
          );
        })}
      </div>

      {/* 4. Fileira Direta de CHIPS & PERCURSOS (Tudo direto, sem abrir menu) */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1 text-xs border-t border-slate-100 pt-2">
        {/* Grupo Chips */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 flex-shrink-0 pr-1">
            <ShieldCheck className="w-3 h-3 text-blue-500" />
            <span>Chips:</span>
          </span>

          {CHIP_COMPANIES.map((chip) => {
            const isSelected = filters.chipCompany === chip;
            return (
              <button
                key={chip}
                onClick={() => onFilterChange({ ...filters, chipCompany: chip })}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition whitespace-nowrap cursor-pointer flex-shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-orange-400 font-black shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/60'
                }`}
              >
                {chip === 'Todas' ? 'Todos os Chips' : chip}
              </button>
            );
          })}
        </div>

        <div className="w-[1px] h-4 bg-slate-200 flex-shrink-0" />

        {/* Grupo Distâncias */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 flex-shrink-0 pr-1">
            <Activity className="w-3 h-3 text-emerald-500" />
            <span>Distâncias:</span>
          </span>

          {DISTANCE_OPTIONS.map((dist) => {
            const isSelected = filters.distance === dist;
            return (
              <button
                key={dist}
                onClick={() => onFilterChange({ ...filters, distance: dist })}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition whitespace-nowrap cursor-pointer flex-shrink-0 ${
                  isSelected
                    ? 'bg-emerald-600 text-white font-black shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/60'
                }`}
              >
                {dist}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
