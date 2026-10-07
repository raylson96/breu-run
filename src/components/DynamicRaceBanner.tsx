import React, { useState } from 'react';
import type { Race } from '../types/race';
import { ShieldCheck, Calendar, MapPin, Zap } from 'lucide-react';
import { formatDecimalDistance, getTimingChipBadge } from '../utils/raceFormatters';

interface DynamicRaceBannerProps {
  race: Race;
  className?: string;
  heightClass?: string;
}

export const DynamicRaceBanner: React.FC<DynamicRaceBannerProps> = ({
  race,
  className = '',
  heightClass = 'h-48'
}) => {
  const [hasImageError, setHasImageError] = useState(false);
  const imageUrl = race.bannerUrl || race.imageUrl;
  const chipBadge = getTimingChipBadge(race.chipCompany);

  // Formata data abreviada
  const [, monthStr, dayStr] = (race.date || '2026-05-15').split('-');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const formattedDate = `${dayStr} ${months[parseInt(monthStr, 10) - 1]}`;

  // Se houver URL válida e sem erro de carregamento, exibe a imagem
  if (imageUrl && !hasImageError) {
    return (
      <div className={`relative w-full overflow-hidden bg-slate-950 ${heightClass} ${className}`}>
        <img
          src={imageUrl}
          alt={race.title}
          onError={() => setHasImageError(true)}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradiente escuro para legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
      </div>
    );
  }

  // GERADOR DE BANNER DINÂMICO ESPORTIVO DE ALTA RESOLUÇÃO
  return (
    <div 
      className={`relative w-full overflow-hidden flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-br from-slate-950 via-zinc-900 to-slate-950 border border-slate-800 ${heightClass} ${className}`}
    >
      {/* 1. Texturas Geométricas Vetoriais & Linhas de Velocidade Atléticas */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`race-grid-${race.id}`} width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 40 M 0 0 L 40 40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            </pattern>
            <linearGradient id={`grad-glow-${race.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#eab308" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill={`url(#race-grid-${race.id})`} />
        </svg>
      </div>

      {/* Brilho Radial Dinâmico nos Cantos */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Linhas de Pista de Corrida Diagonais */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none overflow-hidden">
        <div className="w-[150%] h-32 border-y-2 border-dashed border-white transform -rotate-12" />
      </div>

      {/* Topo do Banner Dinâmico */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-bold border backdrop-blur-md ${chipBadge.badgeClass}`}>
          <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{chipBadge.name}</span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black text-orange-400 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-orange-500/30">
          <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span>CIRCUITO OFICIAL</span>
        </div>
      </div>

      {/* Centro: Nome Oficial da Corrida com Tipografia Limpa & Destaque */}
      <div className="relative z-10 my-auto py-2 text-center">
        <h3 className="font-black text-lg sm:text-2xl md:text-3xl text-white uppercase tracking-tight leading-tight drop-shadow-md line-clamp-2 px-2">
          {race.title}
        </h3>
        <p className="text-[11px] sm:text-xs font-bold text-orange-300/90 mt-1 uppercase tracking-wider">
          {race.city}, PA • {race.organizer || 'Organização Oficial'}
        </p>
      </div>

      {/* Rodapé do Banner Dinâmico */}
      <div className="relative z-10 flex items-center justify-between text-xs text-slate-300 pt-1 border-t border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-slate-300 font-bold text-[11px]">
            <Calendar className="w-3 h-3 text-orange-400" />
            {formattedDate} • {race.time}h
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1 text-slate-300 font-bold text-[11px]">
            <MapPin className="w-3 h-3 text-rose-400" />
            {race.city}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {race.distances.slice(0, 3).map((d, i) => (
            <span key={i} className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-800/90 text-amber-300 border border-slate-700">
              {formatDecimalDistance(d)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
