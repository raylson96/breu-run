import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Activity,
  ChevronDown,
  Check
} from 'lucide-react';
import { formatDecimalDistance } from '../utils/raceFormatters';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  cityCounts: Record<string, number>;
  totalFiltered: number;
}

// 1. As 5 cidades principais fixas na barra rápida
const PRIMARY_CITIES = [
  'Todas',
  'Breu Branco',
  'Novo Repartimento',
  'Tailândia',
  'Tucuruí'
];

// Base regional ampliada de cidades do Pará para o menu alfabético
const DEFAULT_OTHER_CITIES = [
  'Abaetetuba',
  'Altamira',
  'Ananindeua',
  'Barcarena',
  'Belém',
  'Bragança',
  'Cametá',
  'Canaã dos Carajás',
  'Capanema',
  'Castanhal',
  'Concórdia do Pará',
  'Curionópolis',
  'Dom Eliseu',
  'Eldorado do Carajás',
  'Goianésia do Pará',
  'Igarapé-Miri',
  'Itaituba',
  'Itupiranga',
  'Jacundá',
  'Marabá',
  'Marituba',
  'Moju',
  'Mosqueiro',
  'Nova Ipixuna',
  'Ourilândia do Norte',
  'Pacajá',
  'Paragominas',
  'Parauapebas',
  'Redenção',
  'Rondon do Pará',
  'Salinópolis',
  'Santa Izabel do Pará',
  'Santarém',
  'São Félix do Xingu',
  'São Geraldo do Araguaia',
  'Tomé-Açu',
  'Ulianópolis',
  'Xinguara'
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  cityCounts,
  totalFiltered
}) => {
  const [isMoreCitiesOpen, setIsMoreCitiesOpen] = useState(false);
  const [isMoreChipsOpen, setIsMoreChipsOpen] = useState(false);
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const chipsPopoverRef = useRef<HTMLDivElement>(null);

  // Lista dinâmica e unificada de "Outras Cidades" em ordem alfabética estrita
  const otherCitiesSorted = useMemo(() => {
    const set = new Set<string>();

    // Adiciona cidades da base ampliada que não estejam nas principais
    DEFAULT_OTHER_CITIES.forEach((c) => {
      if (!PRIMARY_CITIES.includes(c)) set.add(c);
    });

    // Adiciona qualquer cidade cadastrada no banco com corridas
    Object.keys(cityCounts).forEach((c) => {
      if (c && !PRIMARY_CITIES.includes(c)) set.add(c);
    });

    REGIONS_CITIES.forEach((c) => {
      if (c && !PRIMARY_CITIES.includes(c)) set.add(c);
    });

    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [cityCounts]);

  // Filtra cidades dentro do popover se o usuário digitar
  const filteredOtherCities = useMemo(() => {
    if (!citySearchTerm.trim()) return otherCitiesSorted;
    const term = citySearchTerm.toLowerCase();
    return otherCitiesSorted.filter((c) => c.toLowerCase().includes(term));
  }, [otherCitiesSorted, citySearchTerm]);

  // Fecha os popovers ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsMoreCitiesOpen(false);
      }
      if (chipsPopoverRef.current && !chipsPopoverRef.current.contains(event.target as Node)) {
        setIsMoreChipsOpen(false);
      }
    }
    if (isMoreCitiesOpen || isMoreChipsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMoreCitiesOpen, isMoreChipsOpen]);

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

  const handleSelectOtherCity = (city: string) => {
    onFilterChange({
      ...filters,
      city
    });
    setIsMoreCitiesOpen(false);
    setCitySearchTerm('');
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

  const isSelectedCityInMore = !PRIMARY_CITIES.includes(filters.city);

  const hasActiveFilters = 
    filters.city !== 'Todas' ||
    filters.chipCompany !== 'Todas' ||
    filters.distance !== 'Todas' ||
    filters.search !== '' ||
    filters.onlyFavorites;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-sm border border-slate-200 mb-6 space-y-3 w-full">
      {/* 1. Abas Principais & Alternador de Modo PC (Cards vs Tabela) */}
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

      {/* 2. Campo de Busca + Ordenação + Contador + Limpar */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
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
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Seletor de Ordenação: Data do Evento vs Maior Premiação */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200 flex-shrink-0">
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, sortBy: 'date_asc' })}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              filters.sortBy === 'date_asc'
                ? 'bg-white text-orange-600 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Ordenar por data do evento"
          >
            <Calendar className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-[11px] sm:text-xs">Data</span>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, sortBy: 'prize_desc' })}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              filters.sortBy === 'prize_desc'
                ? 'bg-white text-orange-600 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Ordenar por maior premiação em dinheiro"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] sm:text-xs">Maior Premiação</span>
          </button>
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

      {/* 3. BARRA EXCLUSIVA DE CIDADES */}
      <div className="flex items-center gap-1.5 overflow-x-visible py-0.5 -mx-1 px-1 relative">
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 flex-shrink-0 pr-1">
          <MapPin className="w-3 h-3 text-rose-500" />
          <span>Cidades:</span>
        </span>

        {/* No Mobile: Exibe estritamente "Todas" e "Ver Mais" */}
        <div className="flex sm:hidden items-center gap-1.5">
          <button
            onClick={() => onFilterChange({ ...filters, city: 'Todas' })}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex-shrink-0 ${
              filters.city === 'Todas'
                ? 'bg-orange-600 text-white font-black shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60'
            }`}
          >
            Todas
          </button>
        </div>

        {/* No Desktop: 5 Cidades Principais Fixas */}
        <div className="hidden sm:flex items-center gap-1.5">
          {PRIMARY_CITIES.map((city) => {
            const isSelected = filters.city === city;
            const count = city === 'Todas' ? '' : ` (${cityCounts[city] || 0})`;
            
            return (
              <button
                key={city}
                onClick={() => onFilterChange({ ...filters, city })}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex-shrink-0 ${
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

        {/* Botão 'Ver Mais' com Dropdown Alfabético */}
        <div className="relative inline-block" ref={popoverRef}>
          <button
            onClick={() => setIsMoreCitiesOpen(!isMoreCitiesOpen)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 flex-shrink-0 border ${
              isSelectedCityInMore || (filters.city !== 'Todas')
                ? 'bg-orange-600 text-white font-black border-orange-600 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/60'
            }`}
            title="Ver todas as outras cidades da região em ordem alfabética"
          >
            <span className="max-w-[130px] truncate">
              {filters.city !== 'Todas' && !PRIMARY_CITIES.includes(filters.city)
                ? filters.city
                : filters.city !== 'Todas' 
                ? filters.city 
                : 'Ver Mais'}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMoreCitiesOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Popover Elegante com Pesquisa e Lista Alfabética */}
          {isMoreCitiesOpen && (
            <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 mt-2 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-400" />
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                    Cidades do Pará
                  </span>
                </div>
                <button
                  onClick={() => setIsMoreCitiesOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Busca rápida dentro das cidades */}
              <div className="p-2.5 border-b border-slate-100 bg-slate-50">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={citySearchTerm}
                    onChange={(e) => setCitySearchTerm(e.target.value)}
                    placeholder="Filtrar cidade..."
                    className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
                    autoFocus
                  />
                </div>
              </div>

              {/* Lista em Ordem Alfabética com Scroll */}
              <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5">
                {filteredOtherCities.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    Nenhuma cidade encontrada
                  </div>
                ) : (
                  filteredOtherCities.map((c) => {
                    const isSelected = filters.city === c;
                    const count = cityCounts[c] || 0;

                    return (
                      <button
                        key={c}
                        onClick={() => handleSelectOtherCity(c)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs transition flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-orange-500 text-white font-black'
                            : 'hover:bg-slate-100 text-slate-700 font-medium'
                        }`}
                      >
                        <span className="truncate">{c}</span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {count > 0 && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              isSelected ? 'bg-orange-700 text-white' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {count} {count === 1 ? 'prova' : 'provas'}
                            </span>
                          )}
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Chips de Cronometragem & Percursos */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1 text-xs border-t border-slate-100 pt-2">
        {/* Chips de Cronometragem */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 flex-shrink-0 pr-1">
            <ShieldCheck className="w-3 h-3 text-blue-500" />
            <span>Chips:</span>
          </span>

          {/* No Mobile: Exibe estritamente "Todos os Chips" e "Ver Mais" */}
          <div className="flex sm:hidden items-center gap-1.5">
            <button
              onClick={() => onFilterChange({ ...filters, chipCompany: 'Todas' })}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition whitespace-nowrap cursor-pointer flex-shrink-0 ${
                filters.chipCompany === 'Todas'
                  ? 'bg-slate-900 text-orange-400 font-black shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/60'
              }`}
            >
              Todos os Chips
            </button>

            {/* Popover de Chips no Mobile */}
            <div className="relative inline-block" ref={chipsPopoverRef}>
              <button
                onClick={() => setIsMoreChipsOpen(!isMoreChipsOpen)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 flex-shrink-0 border ${
                  filters.chipCompany !== 'Todas'
                    ? 'bg-slate-900 text-orange-400 font-black border-slate-900 shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/60'
                }`}
              >
                <span className="max-w-[120px] truncate">
                  {filters.chipCompany !== 'Todas' ? filters.chipCompany : 'Ver Mais'}
                </span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isMoreChipsOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMoreChipsOpen && (
                <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Cronometragens Oficiais:</span>
                    <button onClick={() => setIsMoreChipsOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {CHIP_COMPANIES.slice(1).map((chip) => {
                    const isSelected = filters.chipCompany === chip;
                    return (
                      <button
                        key={chip}
                        onClick={() => {
                          onFilterChange({ ...filters, chipCompany: chip });
                          setIsMoreChipsOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-orange-400'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span>{chip}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-orange-400" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* No Desktop: Exibe todos os 4 chips + Todos os Chips */}
          <div className="hidden sm:flex items-center gap-1.5">
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
        </div>

        <div className="w-[1px] h-4 bg-slate-200 flex-shrink-0" />

        {/* Distâncias */}
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
                {formatDecimalDistance(dist)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
