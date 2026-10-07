import React from 'react';
import type { Race } from '../types/race';
import { 
  MapPin, 
  Clock, 
  Share2, 
  Heart, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles,
  CalendarCheck,
  AlertCircle
} from 'lucide-react';

interface RaceCardProps {
  race: Race;
  isFavorite: boolean;
  onToggleFavorite: (raceId: string) => void;
  onSelectRace: (race: Race) => void;
  onShareWhatsApp: (race: Race) => void;
  onOpenRegistration?: (race: Race) => void;
  onToggleFeatured?: (raceId: string) => void;
}

export const RaceCard: React.FC<RaceCardProps> = ({
  race,
  isFavorite,
  onToggleFavorite,
  onSelectRace,
  onShareWhatsApp,
  onOpenRegistration,
  onToggleFeatured
}) => {
  // Parse date
  const [year, monthStr, dayStr] = race.date.split('-');
  const dateObj = new Date(parseInt(year), parseInt(monthStr) - 1, parseInt(dayStr));
  
  const monthNames = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  const weekDayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

  const monthAbbr = monthNames[parseInt(monthStr, 10) - 1];
  const weekDay = weekDayNames[dateObj.getDay()];

  // Status visual attributes
  const getStatusBadge = () => {
    switch (race.status) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Inscrições Abertas
          </span>
        );
      case 'closing_soon':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-orange-100 text-orange-800 border border-orange-300">
            <AlertCircle className="w-3 h-3 text-orange-600" />
            Últimas Vagas
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
            <CalendarCheck className="w-3 h-3 text-amber-700" />
            Data Confirmada
          </span>
        );
      case 'soon':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300">
            <Clock className="w-3 h-3 text-blue-600" />
            Em Breve
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-600 border border-slate-300">
            Inscrições Encerradas
          </span>
        );
      case 'finished':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-100 text-purple-800 border border-purple-300">
            Prova Realizada
          </span>
        );
    }
  };

  // Chip company badge styling
  const getChipStyle = () => {
    if (race.chipCompany.includes('Amazônia')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (race.chipCompany.includes('Breu Branco')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (race.chipCompany.includes('Pará')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    if (race.chipCompany.includes('Cronos')) {
      return 'bg-cyan-50 text-cyan-800 border-cyan-300 font-extrabold';
    }
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className={`bg-white rounded-3xl border transition-all duration-200 shadow-sm hover:shadow-md relative overflow-hidden flex flex-col justify-between ${
      race.featured ? 'border-orange-300 ring-2 ring-orange-200/80' : 'border-slate-200'
    }`}>
      {/* Featured Header Pill */}
      {race.featured && (
        <div className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Corrida Oficial em Destaque</span>
          </div>
          <span className="text-[10px] opacity-90 font-medium">Pará Run</span>
        </div>
      )}

      {/* Main Card Body */}
      <div className="p-4 sm:p-5 flex-1">
        {/* Top bar with Status + Favorite button */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {getStatusBadge()}
            {race.badge && !race.featured && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {race.badge}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {onToggleFeatured && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFeatured(race.id);
                }}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  race.featured 
                    ? 'text-amber-500 bg-amber-50 hover:bg-amber-100 ring-1 ring-amber-300' 
                    : 'text-slate-300 hover:text-amber-500 hover:bg-amber-50'
                }`}
                title={race.featured ? "Remover do destaque no topo" : "Fixar e destacar esta prova no topo"}
              >
                <Sparkles className={`w-4 h-4 ${race.featured ? 'fill-amber-500 text-amber-500' : ''}`} />
              </button>
            )}
            <button
              onClick={() => onShareWhatsApp(race)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
              title="Compartilhar no grupo de corrida do WhatsApp"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleFavorite(race.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition cursor-pointer"
              title={isFavorite ? 'Remover dos favoritos' : 'Salvar no meu calendário'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content layout: Left Date block + Right Info */}
        <div className="flex gap-3.5 items-start">
          {/* Big Date Badge */}
          <div className="w-14 sm:w-16 bg-slate-900 text-white rounded-2xl p-2.5 text-center flex-shrink-0 flex flex-col justify-center items-center shadow-md">
            <span className="text-[10px] font-black text-orange-400 tracking-wider block uppercase">
              {monthAbbr}
            </span>
            <span className="text-xl sm:text-2xl font-black leading-none my-0.5 block text-white">
              {dayStr}
            </span>
            <span className="text-[9px] font-bold text-slate-400 block uppercase">
              {weekDay}
            </span>
          </div>

          {/* Race Title, City & Organizer */}
          <div className="flex-1 min-w-0">
            <h3 
              onClick={() => onSelectRace(race)}
              className="font-black text-base sm:text-lg text-slate-900 leading-snug cursor-pointer hover:text-orange-600 transition line-clamp-2 mb-1"
            >
              {race.title}
            </h3>

            {/* City & Place */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
              <span className="font-extrabold text-slate-900">{race.city}, PA</span>
              <span className="text-slate-300">•</span>
              <span className="truncate text-slate-500">{race.location}</span>
            </div>

            {/* Organizer */}
            <div className="text-[11px] text-slate-500 truncate mb-1">
              Por: <span className="font-semibold text-slate-700">{race.organizer}</span>
            </div>
          </div>
        </div>

        {/* Distances Tags */}
        <div className="flex flex-wrap items-center gap-1.5 my-3">
          {race.distances.map((dist, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-orange-50 text-orange-700 border border-orange-200/80"
            >
              {dist}
            </span>
          ))}
          <span className="text-xs text-slate-400 font-medium ml-1">
            largada às {race.time}h
          </span>
        </div>

        {/* Bottom Metadata: Chip Company & Batch price */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
          {/* Chip Company */}
          <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${getChipStyle()}`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{race.chipCompany}</span>
          </div>

          {/* Pricing / Lote */}
          <div className="text-right">
            {race.currentBatch && (
              <span className="text-[10px] text-amber-700 font-bold block truncate max-w-[140px]">
                {race.currentBatch}
              </span>
            )}
            {(typeof race.price === 'number' || typeof race.priceFrom === 'number') ? (
              <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200/90 px-2 py-0.5 rounded-lg shadow-2xs">
                <span className="text-[10px] font-bold text-emerald-600">Inscrição:</span>
                <span className="text-xs font-black text-emerald-950">
                  R$ {(race.price ?? race.priceFrom)!.toFixed(2).replace('.', ',')}
                </span>
              </div>
            ) : (
              <span className="text-xs font-bold text-slate-500">
                {race.status === 'confirmed' ? 'Lote em breve' : 'Valor sob consulta'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Actions (Smart CTA Button based on Registration Link) */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
        <button
          onClick={() => onSelectRace(race)}
          className="flex-1 py-2.5 px-3 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 rounded-xl transition text-center cursor-pointer"
        >
          Ver Detalhes
        </button>

        {race.status === 'open' || race.status === 'closing_soon' ? (
          onOpenRegistration ? (
            <button
              onClick={() => onOpenRegistration(race)}
              className="flex-1 py-2.5 px-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition shadow-sm shadow-orange-600/30 text-center cursor-pointer active:scale-95"
            >
              <span>Inscreva-se Aqui</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          ) : (
            <a
              href={race.registrationUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition shadow-sm shadow-orange-600/30 text-center cursor-pointer active:scale-95"
            >
              <span>Inscreva-se Aqui</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )
        ) : race.status === 'confirmed' ? (
          <button
            onClick={() => onSelectRace(race)}
            className="flex-1 py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer"
            title="Data confirmada no calendário oficial, inscrições em breve"
          >
            <span>Inscrições em Breve 🔔</span>
          </button>
        ) : race.status === 'soon' ? (
          <button
            onClick={() => onSelectRace(race)}
            className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <span>Inscrições em Breve</span>
          </button>
        ) : race.status === 'finished' ? (
          race.resultsUrl ? (
            <a
              href={race.resultsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-sm shadow-purple-950/20 text-center active:scale-95"
            >
              <span>Ver Resultados ↗</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <button
              disabled
              className="flex-1 py-2.5 px-3 bg-slate-100 text-slate-400 border border-slate-200 rounded-xl text-xs font-bold cursor-not-allowed text-center"
            >
              Prova Realizada
            </button>
          )
        ) : (
          <button
            disabled
            className="flex-1 py-2.5 px-3 bg-slate-100 text-slate-400 border border-slate-200 rounded-xl text-xs font-bold cursor-not-allowed text-center"
          >
            Inscrições Encerradas
          </button>
        )}
      </div>
    </div>
  );
};
