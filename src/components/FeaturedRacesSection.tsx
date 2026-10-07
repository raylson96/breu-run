import React, { useState, useEffect, useRef } from 'react';
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
  Star,
  Tag
} from 'lucide-react';
import { 
  formatDecimalDistance, 
  getTimingChipBadge, 
  calculateDaysLeft, 
  DEFAULT_RACE_BANNER 
} from '../utils/raceFormatters';

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
  // Provas marcadas como featured ou fallback para as primeiras com inscrições abertas/confirmadas
  const manuallyFeatured = races.filter((r) => r.featured);
  const displayRaces = manuallyFeatured.length > 0 
    ? manuallyFeatured 
    : races.filter((r) => r.status === 'open' || r.status === 'closing_soon' || r.status === 'confirmed').slice(0, 5);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Auto-play suave com pausa ao passar o mouse
  useEffect(() => {
    if (displayRaces.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayRaces.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [displayRaces.length, isPaused]);

  if (displayRaces.length === 0) {
    return null;
  }

  const currentRace = displayRaces[currentIndex] || displayRaces[0];
  const chipBadge = getTimingChipBadge(currentRace.chipCompany);
  const daysLeft = calculateDaysLeft(currentRace.date);

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

  // Suporte a swipe tátil no mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current !== null && touchEndXRef.current !== null) {
      const diff = touchStartXRef.current - touchEndXRef.current;
      if (diff > 45) {
        handleNext();
      } else if (diff < -45) {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const hasPrice = typeof currentRace.price === 'number' || typeof currentRace.priceFrom === 'number';
  const priceValue = (currentRace.price ?? currentRace.priceFrom)?.toFixed(2).replace('.', ',');
  const bannerImage = currentRace.bannerUrl || currentRace.imageUrl || DEFAULT_RACE_BANNER;

  return (
    <div 
      className="mb-6 w-full select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 1. Banner Principal Panorâmico (Desktop Teatro h-64 md:h-80 lg:h-96 / Mobile h-52 sm:h-60) */}
      <div className="relative w-full h-56 sm:h-72 md:h-80 lg:h-96 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-slate-950 border border-slate-800 group">
        {/* Imagem de Fundo em Alta Resolução com transição suave */}
        <img
          key={currentRace.id}
          src={bannerImage}
          alt={currentRace.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_RACE_BANNER;
          }}
          className="absolute inset-0 w-full h-full object-cover object-center transform transition-transform duration-1000 ease-out scale-100 group-hover:scale-105"
        />

        {/* Gradientes Panorâmicos de Alta Legibilidade (Fundo escurecido sem perder a arte) */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/20 md:bg-gradient-to-r md:from-slate-950/95 md:via-slate-950/80 md:to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Botão de Anunciar Corrida no Canto Superior Direito */}
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-30 flex items-center gap-2">
          {onToggleFeatured && (
            <button
              onClick={() => onToggleFeatured(currentRace.id)}
              className="p-2 rounded-xl bg-slate-950/70 hover:bg-slate-900 text-amber-400 border border-white/10 backdrop-blur-md transition cursor-pointer"
              title={currentRace.featured ? "Remover do destaque" : "Fixar no destaque"}
            >
              <Star className={`w-3.5 h-3.5 ${currentRace.featured ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
            </button>
          )}

          <button
            onClick={onOpenAdminModal}
            className="px-3 sm:px-3.5 py-1.5 sm:py-2 bg-slate-950/70 hover:bg-slate-900 text-orange-400 hover:text-orange-300 border border-orange-500/30 rounded-xl text-[11px] sm:text-xs font-bold transition backdrop-blur-md flex items-center gap-1.5 shadow-md cursor-pointer"
            title="Divulgue sua prova para corredores de todo o Pará"
          >
            <Megaphone className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden sm:inline">Anunciar Prova</span>
          </button>
        </div>

        {/* Conteúdo Principal do Slide Panorâmico */}
        <div className="relative z-20 h-full flex flex-col justify-between p-4 sm:p-6 md:p-8 max-w-2xl lg:max-w-3xl">
          {/* Top Tags: Selo do Chip Oficial + Em Evidência + Contagem Regressiva */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-black bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3 h-3" />
              Em Evidência
            </span>

            {/* Badge Padronizado do Chip */}
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-bold backdrop-blur-md border ${chipBadge.badgeClass}`}>
              <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{chipBadge.name}</span>
            </div>

            {daysLeft > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-bold bg-slate-900/90 text-orange-300 border border-slate-700/80 backdrop-blur-md">
                <Timer className="w-3 h-3 text-amber-400" />
                <span>{daysLeft} dias para a prova</span>
              </span>
            )}
          </div>

          {/* Centro: Título, Data, Local e Distâncias */}
          <div className="space-y-1.5 sm:space-y-2 my-auto py-1">
            <h2 
              onClick={() => onSelectRace(currentRace)}
              className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight cursor-pointer hover:text-orange-400 transition line-clamp-2 drop-shadow-md"
            >
              {currentRace.title}
            </h2>

            {/* Data e Local em linha limpa */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-1.5 text-orange-400 font-bold">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400" />
                <span>{formatDate(currentRace.date)} • {currentRace.time}h</span>
              </div>

              <span className="text-slate-600 hidden sm:inline">•</span>

              <div className="flex items-center gap-1.5 text-slate-200">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 flex-shrink-0" />
                <span className="truncate">{currentRace.location}, <strong className="text-white">{currentRace.city}/PA</strong></span>
              </div>
            </div>

            {/* Percursos Tags com formato decimal exato */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {currentRace.distances.map((dist, idx) => (
                <span
                  key={idx}
                  className="bg-slate-900/90 text-orange-300 text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-lg border border-slate-700/90 backdrop-blur-sm"
                >
                  {formatDecimalDistance(dist)}
                </span>
              ))}

              {currentRace.organizer && (
                <span className="text-[11px] text-slate-400 hidden md:inline ml-2">
                  Org: <strong className="text-slate-300">{currentRace.organizer}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Rodapé do Banner: Preço e Botões de Ação */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
            {/* Informações de Preço */}
            <div>
              {currentRace.priceWithShirt && currentRace.priceWithoutShirt ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-slate-300">
                    Sem camisa: <strong className="text-white font-bold">R$ {currentRace.priceWithoutShirt.toFixed(2).replace('.', ',')}</strong>
                  </span>
                  <span className="text-xs sm:text-sm font-black text-amber-300">
                    Com camisa: R$ {currentRace.priceWithShirt.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              ) : hasPrice ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[10px] sm:text-xs text-slate-400 uppercase font-semibold">A partir de</span>
                  <span className="text-base sm:text-xl font-black text-white">
                    R$ {priceValue}
                  </span>
                </div>
              ) : (
                <span className="text-xs sm:text-sm font-bold text-amber-400 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {currentRace.status === 'confirmed' ? 'Inscrições em Breve' : 'Valor sob consulta'}
                </span>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectRace(currentRace)}
                className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-bold rounded-xl border border-slate-700 transition cursor-pointer backdrop-blur-md"
              >
                Ver Detalhes
              </button>

              {currentRace.status === 'open' || currentRace.status === 'closing_soon' ? (
                onOpenRegistration ? (
                  <button
                    onClick={() => onOpenRegistration(currentRace)}
                    className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs sm:text-sm font-black rounded-xl shadow-lg shadow-orange-950/50 transition flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
                  >
                    <span>Inscrever-se</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <a
                    href={currentRace.registrationUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs sm:text-sm font-black rounded-xl shadow-lg shadow-orange-950/50 transition flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
                  >
                    <span>Inscrever-se</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )
              ) : (
                <button
                  onClick={() => onSelectRace(currentRace)}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-black rounded-xl transition cursor-pointer whitespace-nowrap shadow-md"
                >
                  Em Breve 🔔
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Setas de Navegação Lateral Suaves (Desktop) */}
        {displayRaces.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-slate-950/60 hover:bg-slate-900 text-white/80 hover:text-white border border-white/10 backdrop-blur-md items-center justify-center cursor-pointer transition shadow-lg hover:scale-105"
              title="Prova anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleNext}
              className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-slate-950/60 hover:bg-slate-900 text-white/80 hover:text-white border border-white/10 backdrop-blur-md items-center justify-center cursor-pointer transition shadow-lg hover:scale-105"
              title="Próxima prova"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Paginação por Bullets no Centro Inferior */}
        {displayRaces.length > 1 && (
          <div className="absolute bottom-2.5 sm:bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-slate-950/50 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10">
            {displayRaces.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentIndex === idx
                    ? 'w-6 h-2 bg-orange-500 shadow-sm'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/80'
                }`}
                title={`Ir para destaque ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
