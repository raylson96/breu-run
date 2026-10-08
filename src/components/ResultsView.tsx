import React, { useState, useMemo } from 'react';
import type { Race } from '../types/race';
import { 
  Trophy, 
  Search, 
  ExternalLink, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  ArrowLeft,
  FilterX
} from 'lucide-react';
import { getTimingChipBadge } from '../utils/raceFormatters';

interface ResultsViewProps {
  races: Race[];
  onBackToCalendar: () => void;
  onSelectRace?: (race: Race) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  races,
  onBackToCalendar,
  onSelectRace
}) => {
  const [search, setSearch] = useState('');
  const [selectedChip, setSelectedChip] = useState('Todas');
  const [selectedCity, setSelectedCity] = useState('Todas');

  // Apenas provas finalizadas
  const finishedRaces = useMemo(() => {
    return races.filter((r) => r.status === 'finished');
  }, [races]);

  // Cidades presentes nas provas finalizadas
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    finishedRaces.forEach((r) => {
      if (r.city) set.add(r.city);
    });
    return ['Todas', ...Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'))];
  }, [finishedRaces]);

  // Lista filtrada
  const filteredResults = useMemo(() => {
    return finishedRaces.filter((race) => {
      if (selectedChip !== 'Todas' && race.chipCompany !== selectedChip) {
        return false;
      }
      if (selectedCity !== 'Todas' && race.city !== selectedCity) {
        return false;
      }
      if (search.trim() !== '') {
        const q = search.toLowerCase();
        const matches = 
          race.title.toLowerCase().includes(q) ||
          race.city.toLowerCase().includes(q) ||
          race.location.toLowerCase().includes(q) ||
          race.chipCompany.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [finishedRaces, selectedChip, selectedCity, search]);

  const formatDate = (dateStr: string) => {
    const [, month, day] = (dateStr || '2026-05-15').split('-');
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${day} de ${months[parseInt(month, 10) - 1]} de ${(dateStr || '2026').split('-')[0]}`;
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* 1. Header da Tela Secundária de Resultados */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 text-white rounded-3xl p-5 sm:p-8 shadow-xl border border-purple-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <button
                onClick={onBackToCalendar}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold transition cursor-pointer active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar ao Calendário</span>
              </button>

              <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Página Secundária • Resultados Oficiais
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <Trophy className="w-7 h-7 sm:w-9 sm:h-9 text-amber-400 flex-shrink-0" />
              <span>Resultados & Classificações Oficiais</span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Consulte os tempos oficiais, pace, ritmo e colocações das corridas já realizadas pelas cronometristas oficiais de Breu Branco e do estado do Pará.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-700/80 backdrop-blur-md rounded-2xl p-4 text-center sm:text-right flex-shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Provas Apuradas
            </span>
            <span className="text-2xl sm:text-3xl font-black text-purple-300">
              {finishedRaces.length}
            </span>
            <span className="text-[11px] text-slate-400 block">eventos cadastrados</span>
          </div>
        </div>
      </div>

      {/* 2. Barra de Busca e Filtros Exclusiva da Tela de Resultados */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 shadow-sm border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Campo de Busca */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome da corrida, cidade ou local..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
            />
          </div>

          {/* Filtro por Cidade */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition cursor-pointer"
          >
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city === 'Todas' ? 'Todas as Cidades' : city}
              </option>
            ))}
          </select>
        </div>

        {/* Chips Filtros Rápidos */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {['Todas', 'Chip Breu Branco', 'Chip Pará', 'Chip Chronos', 'Chip Amazônia'].map((chip) => (
            <button
              key={chip}
              onClick={() => setSelectedChip(chip)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedChip === chip
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {chip === 'Todas' ? 'Todos os Chips' : chip}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Listagem das Provas Finalizadas com Link Direto para o Resultado Oficial */}
      {filteredResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResults.map((race) => {
            const chipBadge = getTimingChipBadge(race.chipCompany);
            return (
              <div
                key={race.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group"
              >
                {/* Imagem / Banner do Evento */}
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden flex-shrink-0">
                  {race.bannerUrl || race.imageUrl ? (
                    <img
                      src={race.bannerUrl || race.imageUrl}
                      alt={race.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4 text-center">
                      <Trophy className="w-12 h-12 text-purple-400/40" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Badge do Chip */}
                  <div className={`absolute top-3 left-3 z-10 font-bold px-2.5 py-1 rounded-xl text-[11px] backdrop-blur-md border shadow-md flex items-center gap-1.5 ${chipBadge.badgeClass}`}>
                    <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{chipBadge.name}</span>
                  </div>

                  {/* Tag Prova Realizada */}
                  <span className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-purple-600 text-white shadow-md">
                    ✓ Concluída
                  </span>

                  {/* Data Realizada */}
                  <div className="absolute bottom-2.5 left-3 z-10 flex items-center gap-1.5 text-white font-bold text-xs drop-shadow-md">
                    <Calendar className="w-3.5 h-3.5 text-purple-300" />
                    <span>{formatDate(race.date)}</span>
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-black text-base sm:text-lg text-slate-900 leading-snug line-clamp-2 min-h-[3rem] group-hover:text-purple-600 transition tracking-tight mb-1.5">
                      {race.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                      <span className="font-extrabold text-slate-900">{race.city}, PA</span>
                      {race.location && race.location !== race.city && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="truncate text-slate-500">{race.location}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Botão Oficial de Consulta de Resultados */}
                  <div className="pt-2 border-t border-slate-100">
                    {race.resultsUrl ? (
                      <a
                        href={race.resultsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition shadow-md shadow-purple-950/20 active:scale-95 cursor-pointer leading-snug text-center"
                      >
                        <Trophy className="w-4 h-4 text-amber-300 flex-shrink-0" />
                        <span>Ver Resultados Oficiais na {chipBadge.shortName}</span>
                        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                      </a>
                    ) : (
                      <button
                        onClick={() => {
                          if (onSelectRace) onSelectRace(race);
                        }}
                        className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <span>Resultados em Apuração Oficial</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm my-6 space-y-3">
          <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto">
            <FilterX className="w-7 h-7" />
          </div>
          <h3 className="font-black text-lg text-slate-800">
            Nenhum resultado oficial encontrado para os filtros selecionados
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Tente selecionar outra cidade, empresa de cronometragem ou limpar a pesquisa.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedChip('Todas');
              setSelectedCity('Todas');
            }}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shadow-md"
          >
            Limpar Filtros de Resultados
          </button>
        </div>
      )}
    </div>
  );
};
