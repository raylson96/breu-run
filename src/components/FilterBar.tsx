import React, { useState } from 'react';
import type { FilterState } from '../types/race';
import { 
  REGIONS_CITIES, 
  REGIONS_POLOS, 
  CHIP_COMPANIES, 
  DISTANCE_OPTIONS 
} from '../data/mockRaces';
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  Heart, 
  LayoutGrid, 
  Table, 
  Trophy,
  Calendar,
  Zap,
  RotateCcw
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
  const [showDropdowns, setShowDropdowns] = useState(false);

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
      // Se mudar para resultados, limpa o filtro de open
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

  // Conta filtros avançados ativos
  const activeFiltersCount = [
    filters.region !== 'Todas as Regiões',
    filters.city !== 'Todas',
    filters.chipCompany !== 'Todas',
    filters.distance !== 'Todas',
    filters.month !== 'all',
    filters.onlyFavorites
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200 mb-6 space-y-3.5 w-full">
      {/* 1. Categorias Principais em Destaque (Abas Limpas sem Poluir) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        {/* Abas Segmentadas: Calendário Ativo vs Resultados vs Inscrições Abertas */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => {
              onFilterChange({
                ...filters,
                tab: 'upcoming',
                status: 'all',
                onlyFavorites: false
              });
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer flex-shrink-0 ${
              filters.tab === 'upcoming' && filters.status !== 'open' && !filters.onlyFavorites
                ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/20'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-orange-400" />
            <span>Calendário Oficial</span>
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
            className={`px-3.5 py-2 rounded-2xl text-xs font-black transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer flex-shrink-0 ${
              filters.tab === 'upcoming' && filters.status === 'open'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-300" />
            <span>Inscrições Abertas</span>
          </button>

          {/* ABA DEDICADA DE RESULTADOS (Provas já realizadas separadas) */}
          <button
            onClick={() => handleTabChange('results')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer flex-shrink-0 ${
              filters.tab === 'results'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-purple-300" />
            <span>Resultados & Provas Realizadas</span>
          </button>

          <button
            onClick={() => {
              onFilterChange({
                ...filters,
                onlyFavorites: !filters.onlyFavorites
              });
            }}
            className={`px-3 py-2 rounded-2xl text-xs font-black transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer flex-shrink-0 ${
              filters.onlyFavorites
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
            title="Minhas corridas salvas"
          >
            <Heart className={`w-3.5 h-3.5 ${filters.onlyFavorites ? 'fill-white text-white' : 'text-rose-500'}`} />
            <span className="hidden sm:inline">Salvas</span>
          </button>
        </div>

        {/* Alternância de Visualização: Cards vs Tabela Executiva PC */}
        <div className="flex items-center gap-2 self-end md:self-auto flex-shrink-0">
          <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200 flex items-center">
            <button
              onClick={() => onFilterChange({ ...filters, viewMode: 'grid' })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filters.viewMode === 'grid'
                  ? 'bg-white text-orange-600 shadow-sm font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Visualização em Grade de Cards"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>

            <button
              onClick={() => onFilterChange({ ...filters, viewMode: 'table' })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filters.viewMode === 'table'
                  ? 'bg-white text-orange-600 shadow-sm font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Visualização em Tabela Completa para PC"
            >
              <Table className="w-3.5 h-3.5" />
              <span>Tabela PC</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Barra de Busca e Filtros Localizados (Compacta & Eficiente) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Campo de Busca Rápida */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder={filters.tab === 'results' ? "Buscar resultados por prova, cidade ou ano..." : "Buscar corrida, cidade, organizador ou chip..."}
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white text-slate-900 transition font-medium"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Contador de Eventos Encontrados */}
        <div className="hidden lg:flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-2.5 rounded-2xl whitespace-nowrap">
          <span>{totalFiltered} {totalFiltered === 1 ? 'evento' : 'eventos'}</span>
        </div>

        {/* Botão de Filtros Avançados / Localizados */}
        <button
          onClick={() => setShowDropdowns(!showDropdowns)}
          className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition border cursor-pointer flex-shrink-0 ${
            showDropdowns || activeFiltersCount > 0
              ? 'bg-orange-50 text-orange-700 border-orange-300 shadow-xs'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-orange-600" />
          <span>Filtros Regionais</span>
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-[10px] font-black flex items-center justify-center ml-0.5">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {activeFiltersCount > 0 && (
          <button
            onClick={handleResetFilters}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition cursor-pointer flex-shrink-0"
            title="Limpar todos os filtros"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 3. Painel Compacto de Filtros Regionais (Expandível para não Poluir a Tela) */}
      {showDropdowns && (
        <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in duration-150">
          {/* Região / Polo */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Polo / Região
            </label>
            <select
              value={filters.region}
              onChange={(e) => onFilterChange({ ...filters, region: e.target.value, city: 'Todas' })}
              className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {REGIONS_POLOS.map((polo) => (
                <option key={polo} value={polo}>
                  {polo}
                </option>
              ))}
            </select>
          </div>

          {/* Cidade Específica */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Cidade do Pará
            </label>
            <select
              value={filters.city}
              onChange={(e) => onFilterChange({ ...filters, city: e.target.value })}
              className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {REGIONS_CITIES.map((c) => {
                const count = c === 'Todas' ? '' : ` (${cityCounts[c] || 0})`;
                return (
                  <option key={c} value={c}>
                    {c}{count}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Empresa de Cronometragem */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Cronometragem / Chip
            </label>
            <select
              value={filters.chipCompany}
              onChange={(e) => onFilterChange({ ...filters, chipCompany: e.target.value })}
              className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {CHIP_COMPANIES.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </div>

          {/* Distância */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Percurso / Distância
            </label>
            <select
              value={filters.distance}
              onChange={(e) => onFilterChange({ ...filters, distance: e.target.value })}
              className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {DISTANCE_OPTIONS.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
