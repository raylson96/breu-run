import React, { useState, useEffect } from 'react';
import type { Race } from '../types/race';
import { 
  Calendar, 
  MapPin, 
  Sparkles, 
  ExternalLink, 
  Timer, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  Megaphone, 
  Star 
} from 'lucide-react';

interface FeaturedRacesSectionProps {
  races: Race[];
  onSelectRace: (race: Race) => void;
  onOpenAdminModal: () => void;
  onOpenRegistration?: (race: Race) => void;
  onToggleFeatured?: (raceId: string) => void;
}

export const FeaturedRacesSection: React.FC<FeaturedRacesSectionProps> = ({
  races,
  onSelectRace,
  onOpenAdminModal,
  onOpenRegistration,
  onToggleFeatured
}) => {
  // 1. Provas marcadas manualmente como featured
  const manuallyFeatured = races.filter((r) => r.featured);

  // 2. Fallback inteligente: se nenhuma estiver marcada, pega as 3 primeiras provas com inscrições abertas ou confirmadas
  const displayRaces = manuallyFeatured.length > 0 
    ? manuallyFeatured 
    : races.filter((r) => r.status === 'open' || r.status === 'closing_soon' || r.status === 'confirmed').slice(0, 3);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play suave para mobile e desktop
  useEffect(() => {
    if (displayRaces.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayRaces.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [displayRaces.length]);

  if (displayRaces.length === 0) {
    return null;
  }

  const calculateDaysLeft = (targetDate: string) => {
    const diff = new Date(targetDate).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const formatDate = (dateStr: string) => {
    const [, month, day] = dateStr.split('-');
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${day} de ${months[parseInt(month, 10) - 1]}`;
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + displayRaces.length) % displayRaces.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayRaces.length);
  };

  return (
    <div className="mb-8 w-full space-y-4">
      {/* 1. Top Banner Promocional do Organizador (Centralizado no Topo) */}
      <div className="bg-gradient-to-r from-orange-950 via-slate-900 to-amber-950 rounded-3xl p-4 sm:p-5 border border-orange-500/40 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3 h-3" />
                Espaço Promocional de Destaque
              </span>
              <span className="text-[11px] text-orange-200/80 font-medium hidden sm:inline">
                • Vitrine Oficial Breu Run
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Corridas em Evidência no Circuito Paraense
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Provas em lote ativo e maior busca por atletas de Tailândia, Marabá, Breu Branco, Belém e todo o estado.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onOpenAdminModal}
              className="px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-black rounded-xl transition shadow-md shadow-orange-950/40 cursor-pointer active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Anunciar Minha Corrida</span>
            </button>
            
            {displayRaces.length > 3 && (
              <div className="hidden lg:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
                <button
                  onClick={handlePrev}
                  className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition cursor-pointer"
                  title="Anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition cursor-pointer"
                  title="Próxima"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Grid / Carousel de Provas em Destaque (Full Desktop / Framed Mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(displayRaces.length <= 3 
          ? displayRaces 
          : Array.from({ length: 3 }, (_, i) => displayRaces[(currentIndex + i) % displayRaces.length])
        ).map((race) => {
          const daysLeft = calculateDaysLeft(race.date);
          const hasPrice = typeof race.price === 'number' || typeof race.priceFrom === 'number';
          const priceValue = (race.price ?? race.priceFrom)?.toFixed(2).replace('.', ',');

          return (
            <div
              key={race.id}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-zinc-900 to-orange-950/90 text-white p-5 sm:p-6 border border-orange-500/40 shadow-xl flex flex-col justify-between group hover:border-orange-400 transition-all duration-300"
            >
              {/* Luz ambiente de fundo */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-orange-600/15 rounded-full blur-2xl pointer-events-none" />

              <div>
                {/* Top Badge & Countdown + Ação de Desafixar */}
                <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 uppercase tracking-wider shadow-sm">
                      <Sparkles className="w-3 h-3" />
                      Em Evidência
                    </span>
                    {onToggleFeatured && (
                      <button
                        onClick={() => onToggleFeatured(race.id)}
                        className="p-1 rounded-md text-amber-400/80 hover:text-amber-300 hover:bg-slate-800 transition cursor-pointer"
                        title={race.featured ? "Remover do topo" : "Fixar no topo"}
                      >
                        <Star className={`w-3.5 h-3.5 ${race.featured ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>
                    )}
                  </div>

                  {daysLeft > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-900/90 text-orange-300 border border-slate-700 shadow-xs">
                      <Timer className="w-3 h-3 text-amber-400" />
                      {daysLeft} dias
                    </span>
                  )}
                </div>

                {/* Título da Corrida */}
                <h3 
                  onClick={() => onSelectRace(race)}
                  className="text-lg sm:text-xl font-black text-white leading-tight tracking-tight mb-2 cursor-pointer hover:text-orange-400 transition line-clamp-2"
                >
                  {race.title}
                </h3>

                {/* Data, Horário e Local */}
                <div className="space-y-1.5 text-xs text-slate-300 mb-4">
                  <div className="flex items-center gap-1.5 text-orange-400 font-bold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(race.date)} • {race.time}h</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-200">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    <span className="truncate">{race.location}, <strong className="text-white">{race.city}/PA</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{race.chipCompany}</span>
                  </div>
                </div>

                {/* Percursos tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {race.distances.map((dist, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-800/90 text-orange-300 text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg border border-slate-700"
                    >
                      {dist}
                    </span>
                  ))}
                </div>
              </div>

              {/* Preço e CTA */}
              <div className="pt-3 border-t border-slate-800/80 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                      {race.currentBatch || 'Inscrições'}
                    </span>
                    <span className="text-base sm:text-lg font-black text-white">
                      {hasPrice ? `R$ ${priceValue}` : 'Sob Consulta'}
                    </span>
                  </div>

                  {race.batchDeadline && (
                    <span className="text-[10px] text-amber-400 font-bold">
                      Até {race.batchDeadline}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSelectRace(race)}
                    className="py-2.5 px-3 bg-slate-800/90 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition text-center cursor-pointer"
                  >
                    Regulamento & Kit
                  </button>

                  {race.status === 'open' || race.status === 'closing_soon' ? (
                    onOpenRegistration ? (
                      <button
                        onClick={() => onOpenRegistration(race)}
                        className="py-2.5 px-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-black rounded-xl shadow-md transition flex items-center justify-center gap-1.5 text-center cursor-pointer active:scale-95"
                      >
                        <span>Inscrever-se</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <a
                        href={race.registrationUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-black rounded-xl shadow-md transition flex items-center justify-center gap-1.5 text-center cursor-pointer active:scale-95"
                      >
                        <span>Inscrever-se</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )
                  ) : (
                    <button
                      onClick={() => onSelectRace(race)}
                      className="py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition text-center cursor-pointer"
                    >
                      Inscrições em Breve 🔔
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
