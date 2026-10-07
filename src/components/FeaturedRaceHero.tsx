import React from 'react';
import type { Race } from '../types/race';
import { Calendar, MapPin, Sparkles, ExternalLink, Timer, ShieldCheck, Flame } from 'lucide-react';

interface FeaturedRaceHeroProps {
  race: Race;
  onSelectRace: (race: Race) => void;
}

export const FeaturedRaceHero: React.FC<FeaturedRaceHeroProps> = ({ race, onSelectRace }) => {
  // Simple countdown calculation
  const calculateDaysLeft = (targetDate: string) => {
    const diff = new Date(targetDate).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const daysLeft = calculateDaysLeft(race.date);

  const formatDate = (dateStr: string) => {
    const [, month, day] = dateStr.split('-');
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${day} de ${months[parseInt(month, 10) - 1]}`;
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-zinc-900 to-orange-950 text-white p-6 sm:p-8 border border-orange-500/30 shadow-2xl mb-8 w-full">
      {/* Background glow graphics */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Information */}
        <div className="space-y-3 max-w-3xl">
          {/* Top Tags */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Grande Prova em Destaque no Pará
            </span>

            {race.badge && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-orange-950/80 text-orange-300 border border-orange-700/60">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                {race.badge}
              </span>
            )}

            {daysLeft > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-900/90 text-slate-300 border border-slate-700">
                <Timer className="w-3.5 h-3.5 text-amber-400" />
                Faltam <strong>{daysLeft}</strong> dias para a largada
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
            {race.title}
          </h2>

          {/* Details Row */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-sm sm:text-base text-slate-300">
            <div className="flex items-center gap-1.5 text-orange-400 font-bold">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(race.date)} • {race.time}h</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-200">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>{race.location}, <strong className="text-white">{race.city}/PA</strong></span>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>{race.chipCompany}</span>
            </div>
          </div>

          {/* Description summary */}
          {race.description && (
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl line-clamp-2">
              {race.description}
            </p>
          )}

          {/* Distances tags */}
          <div className="flex flex-wrap gap-2 pt-1">
            {race.distances.map((dist, idx) => (
              <span
                key={idx}
                className="bg-slate-800/90 text-orange-300 text-xs sm:text-sm font-extrabold px-3 py-1 rounded-xl border border-slate-700 shadow-sm"
              >
                {dist}
              </span>
            ))}
          </div>
        </div>

        {/* Right CTA Card Box */}
        <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-5 border border-slate-800 lg:min-w-[320px] flex flex-col justify-between space-y-4 shadow-xl">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">
              {race.currentBatch || 'Inscrições Abertas'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white">
                {race.priceFrom ? `R$ ${race.priceFrom.toFixed(2).replace('.', ',')}` : 'Sob Consulta'}
              </span>
              <span className="text-xs text-slate-400">1º Lote</span>
            </div>
            {race.batchDeadline && (
              <p className="text-xs text-amber-400 font-semibold mt-1">
                Aproveite o valor atual até {race.batchDeadline}
              </p>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            {race.registrationUrl ? (
              <a
                href={race.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs sm:text-sm font-black rounded-xl shadow-lg shadow-orange-950 transition flex items-center justify-center gap-2 text-center active:scale-95 cursor-pointer"
              >
                <span>Inscrever-se Agora</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <button
                onClick={() => onSelectRace(race)}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold rounded-xl transition text-center cursor-pointer"
              >
                Avisar Quando Abrir
              </button>
            )}

            <button
              onClick={() => onSelectRace(race)}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition text-center cursor-pointer"
            >
              Ver Regulamento, Kit e Premiação
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
