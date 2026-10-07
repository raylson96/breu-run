import React from 'react';
import type { Race } from '../types/race';
import { 
  MapPin, 
  Heart, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles,
  Calendar,
  Share2
} from 'lucide-react';
import { 
  formatDecimalDistance, 
  getTimingChipBadge, 
  getBatchCountdownTag, 
  getBasePrice 
} from '../utils/raceFormatters';
import { DynamicRaceBanner } from './DynamicRaceBanner';

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
  onToggleFeatured
}) => {
  // Parse data
  const [, monthStr, dayStr] = (race.date || '2026-05-15').split('-');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const formattedDate = `${dayStr} de ${months[parseInt(monthStr, 10) - 1]}`;

  const chipBadge = getTimingChipBadge(race.chipCompany);
  const batchCountdown = getBatchCountdownTag(race);
  const basePrice = getBasePrice(race);

  return (
    <div 
      onClick={() => onSelectRace(race)}
      className={`flex flex-col h-full w-full max-w-sm sm:max-w-none mx-auto bg-white rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md overflow-hidden group cursor-pointer relative ${
        race.featured ? 'border-orange-300 ring-2 ring-orange-200/70' : 'border-slate-100'
      }`}
    >
      {/* 1. Imagem Padrão Fixa (h-48 w-full object-cover) com Fallback Dinâmico Esportivo */}
      <div className="h-48 w-full relative overflow-hidden bg-slate-900 flex-shrink-0">
        <DynamicRaceBanner
          race={race}
          heightClass="h-48"
          className="w-full"
        />

        {/* Selo Padronizado da Empresa de Cronometragem (Canto Superior Esquerdo) */}
        <div className={`absolute top-3 left-3 z-10 font-bold px-2.5 py-1 rounded-xl text-[11px] backdrop-blur-md border shadow-md flex items-center gap-1.5 ${chipBadge.badgeClass}`}>
          <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{chipBadge.name}</span>
        </div>

        {/* Ações Rápidas no Canto Superior Direito (Favorito + WhatsApp + Featured) */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          {onToggleFeatured && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFeatured(race.id);
              }}
              className={`p-1.5 rounded-xl backdrop-blur-md transition cursor-pointer ${
                race.featured
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-slate-950/60 text-white/70 hover:text-amber-300 hover:bg-slate-950'
              }`}
              title={race.featured ? "Remover do destaque" : "Fixar no topo"}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onShareWhatsApp(race);
            }}
            className="p-1.5 rounded-xl bg-slate-950/60 hover:bg-slate-950 text-white/80 hover:text-emerald-400 backdrop-blur-md transition cursor-pointer"
            title="Compartilhar no WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(race.id);
            }}
            className={`p-1.5 rounded-xl backdrop-blur-md transition cursor-pointer ${
              isFavorite
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-950/60 text-white/80 hover:text-rose-400 hover:bg-slate-950'
            }`}
            title={isFavorite ? 'Remover dos salvos' : 'Salvar corrida'}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white text-white' : ''}`} />
          </button>
        </div>

        {/* Data da Prova no Canto Inferior Esquerdo da Imagem */}
        <div className="absolute bottom-2.5 left-3 z-10 flex items-center gap-1.5 text-white font-bold text-xs drop-shadow-md">
          <Calendar className="w-3.5 h-3.5 text-orange-400" />
          <span>{formattedDate} • {race.time}h</span>
        </div>

        {/* Tag de Virada de Lote no Canto Inferior Direito da Imagem */}
        {batchCountdown && (
          <span className="absolute bottom-2.5 right-3 z-10 font-black text-[10px] bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-lg shadow-md uppercase tracking-wider">
            {batchCountdown}
          </span>
        )}
      </div>

      {/* 2. Corpo do Card */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Título Padronizado com line-clamp-2 e min-h-[3.5rem] */}
          <h3 className="font-black text-base sm:text-lg text-slate-900 leading-snug line-clamp-2 min-h-[3.5rem] group-hover:text-orange-600 transition tracking-tight mb-2">
            {race.title}
          </h3>

          {/* Local e Cidade */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2.5">
            <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
            <span className="font-extrabold text-slate-900">{race.city}, PA</span>
            <span className="text-slate-300">•</span>
            <span className="truncate text-slate-500">{race.location}</span>
          </div>

          {/* Percursos Tags com formato decimal exato */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            {race.distances.map((dist, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-orange-50 text-orange-700 border border-orange-200/80"
              >
                {formatDecimalDistance(dist)}
              </span>
            ))}
          </div>
        </div>

        {/* 3. Rodapé do Card: Piso Base Exclusivo ("A partir de R$ XX,XX") + Botão Único */}
        <div className="border-t border-slate-100 pt-3 mt-auto space-y-3">
          {/* Preço de Piso Base */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">A partir de</span>
              <span className="text-base sm:text-lg font-black text-emerald-950">
                R$ {basePrice.toFixed(2).replace('.', ',')}
              </span>
            </div>

            {race.currentBatch && !batchCountdown && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80 truncate max-w-[120px]">
                {race.currentBatch}
              </span>
            )}
          </div>

          {/* Botão de Ação ÚNICO (Abre a tela cheia oficial de inscrição) */}
          <div>
            {race.status === 'open' || race.status === 'closing_soon' ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRace(race);
                }}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition shadow-sm shadow-orange-950/20 active:scale-95 cursor-pointer"
              >
                <span>Inscrever-se</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            ) : race.status === 'finished' ? (
              race.resultsUrl ? (
                <a
                  href={race.resultsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-full py-2.5 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer active:scale-95"
                >
                  <span>Ver Resultados ↗</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <button
                  disabled
                  className="w-full py-2.5 px-3 bg-slate-100 text-slate-400 rounded-xl text-xs sm:text-sm font-bold cursor-not-allowed"
                >
                  Prova Realizada
                </button>
              )
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRace(race);
                }}
                className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <span>Inscrições em Breve</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
