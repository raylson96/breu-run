import React, { useState, useEffect, useRef } from 'react';
import type { Race } from '../types/race';
import { 
  Calendar, 
  MapPin, 
  Sparkles, 
  Timer, 
  ShieldCheck, 
  Star
} from 'lucide-react';
import { 
  getTimingChipBadge, 
  calculateDaysLeft, 
  getRaceCategories 
} from '../utils/raceFormatters';
import { DynamicRaceBanner } from './DynamicRaceBanner';

interface FeaturedRacesSectionProps {
  races: Race[];
  onSelectRace: (race: Race) => void;
  onOpenAdminModal?: () => void;
  onOpenRegistration?: (race: Race) => void;
  onToggleFeatured?: (raceId: string) => void;
}

export const FeaturedRacesSection: React.FC<FeaturedRacesSectionProps> = ({
  races,
  onSelectRace,
  onToggleFeatured
}) => {
  // Provas marcadas como featured ou fallback para todas com inscrições abertas/confirmadas (sem limite fixo)
  const manuallyFeatured = races.filter((r) => r.featured && r.status !== 'finished');
  const displayRaces = manuallyFeatured.length > 0 
    ? manuallyFeatured 
    : races.filter((r) => r.status === 'open' || r.status === 'closing_soon' || r.status === 'confirmed');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Controle de arraste (Touch & Mouse Drag)
  const dragStartXRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  // Auto-play suave de ~5 segundos, pausado ao interagir
  useEffect(() => {
    if (displayRaces.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayRaces.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [displayRaces.length, isPaused]);

  if (displayRaces.length === 0) {
    return null;
  }

  const currentRace = displayRaces[currentIndex] || displayRaces[0];
  const chipBadge = getTimingChipBadge(currentRace.chipCompany);
  const daysLeft = calculateDaysLeft(currentRace.date);
  const categories = getRaceCategories(currentRace);

  const formatDate = (dateStr: string) => {
    const [, month, day] = (dateStr || '2026-05-15').split('-');
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${day} de ${months[parseInt(month, 10) - 1]}`;
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + displayRaces.length) % displayRaces.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayRaces.length);
  };

  // Clique no card principal inteiro funciona como link direto para 'Inscrever-se'
  const handleCardClick = () => {
    if (currentRace.registrationUrl) {
      window.open(currentRace.registrationUrl, '_blank', 'noopener,noreferrer');
    } else {
      onSelectRace(currentRace);
    }
  };

  // Suporte a swipe tátil no mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragStartXRef.current !== null) {
      const diff = dragStartXRef.current - e.changedTouches[0].clientX;
      if (diff > 40) {
        handleNext();
      } else if (diff < -40) {
        handlePrev();
      }
    }
    dragStartXRef.current = null;
  };

  // Suporte a arraste com mouse no desktop (drag)
  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartXRef.current = e.clientX;
    isDraggingRef.current = true;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDraggingRef.current && dragStartXRef.current !== null) {
      const diff = dragStartXRef.current - e.clientX;
      if (diff > 50) {
        handleNext();
      } else if (diff < -50) {
        handlePrev();
      }
    }
    dragStartXRef.current = null;
    isDraggingRef.current = false;
  };

  return (
    <div 
      className="mb-6 w-full select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false);
        isDraggingRef.current = false;
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* 1. Modo Teatro Panorâmico (w-full 100%, altura controlada sem setas invasivas) */}
      <div 
        onClick={handleCardClick}
        className="relative w-full h-56 sm:h-72 md:h-80 lg:h-96 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-slate-950 border border-slate-800 group cursor-pointer"
        title="Clique para ir direto à inscrição oficial"
      >
        
        {/* Renderiza imagem real ou Fallback Dinâmico Esportivo caso não exista arte oficial */}
        {currentRace.bannerUrl || currentRace.imageUrl ? (
          <>
            <img
              key={currentRace.id}
              src={currentRace.bannerUrl || currentRace.imageUrl}
              alt={currentRace.title}
              className="absolute inset-0 w-full h-full object-cover object-center transform transition-transform duration-1000 ease-out scale-100 group-hover:scale-105"
            />
            {/* Gradientes Panorâmicos de Alta Legibilidade */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/20 md:bg-gradient-to-r md:from-slate-950/95 md:via-slate-950/80 md:to-transparent" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
          </>
        ) : (
          <DynamicRaceBanner 
            race={currentRace} 
            heightClass="h-full" 
            className="absolute inset-0 w-full h-full"
          />
        )}

        {/* Botão sutil de Destaque no Canto Superior Direito */}
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-30 flex items-center gap-2">
          {onToggleFeatured && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFeatured(currentRace.id);
              }}
              className="p-2 rounded-xl bg-slate-950/70 hover:bg-slate-900 text-amber-400 border border-white/10 backdrop-blur-md transition cursor-pointer"
              title={currentRace.featured ? "Remover do destaque" : "Fixar no destaque"}
            >
              <Star className={`w-3.5 h-3.5 ${currentRace.featured ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
            </button>
          )}
        </div>

        {/* Conteúdo Principal do Slide Panorâmico */}
        <div className="relative z-20 h-full flex flex-col justify-between p-4 sm:p-6 md:p-8 max-w-4xl pointer-events-auto">
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
                <span>Faltam {daysLeft} dias para a prova</span>
              </span>
            )}
          </div>

          {/* Centro: Título, Data, Local e Distâncias com Valores Detalhados */}
          <div className="space-y-2 sm:space-y-2.5 my-auto py-1">
            <h2 
              className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight hover:text-orange-400 transition line-clamp-2 drop-shadow-md"
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

            {/* Quilometragem e valor: detalhar cada percurso com seu respectivo valor */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {categories.map((cat, idx) => (
                <span
                  key={idx}
                  className="bg-slate-900/90 text-white text-[11px] sm:text-xs font-black px-3 py-1 rounded-xl border border-slate-700/90 backdrop-blur-md shadow-xs flex items-center gap-1.5"
                >
                  <span className="text-orange-300">{cat.distance}:</span>
                  <span className="text-emerald-400">R$ {cat.price.toFixed(2).replace('.', ',')}</span>
                </span>
              ))}

              {currentRace.organizer && (
                <span className="text-[11px] text-slate-400 hidden lg:inline ml-2">
                  Org: <strong className="text-slate-300">{currentRace.organizer}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Rodapé do Banner: Chamada para Inscrição e Bullets de Navegação */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
            {/* Informações de Inscrição Oficial */}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-orange-400 flex items-center gap-1">
                <span>Inscrever-se no site oficial</span>
                <span>↗</span>
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                • {currentRace.currentBatch || '1º Lote'}
              </span>
            </div>

            {/* Paginação por Bullets integrada no rodapé à direita */}
            {displayRaces.length > 1 && (
              <div 
                className="flex items-center gap-1.5 bg-slate-950/70 px-2.5 py-1.5 rounded-full border border-white/10 backdrop-blur-md"
                onClick={(e) => e.stopPropagation()}
              >
                {displayRaces.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(idx);
                    }}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      currentIndex === idx
                        ? 'w-5 h-2 bg-orange-500 shadow-sm'
                        : 'w-2 h-2 bg-white/40 hover:bg-white/80'
                    }`}
                    title={`Ir para destaque ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

