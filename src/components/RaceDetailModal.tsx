import React, { useEffect } from 'react';
import type { Race } from '../types/race';
import { 
  ArrowLeft,
  Calendar, 
  MapPin, 
  Clock, 
  Trophy, 
  CheckCircle, 
  ExternalLink, 
  Share2, 
  FileText,
  CalendarPlus,
  ShieldCheck, 
  Tag, 
  Gift, 
  Award, 
  Shirt, 
  Sparkles
} from 'lucide-react';
import { 
  getTimingChipBadge, 
  getBatchCountdownTag, 
  calculateDaysLeft, 
  getRaceCategories 
} from '../utils/raceFormatters';
import { DynamicRaceBanner } from './DynamicRaceBanner';

interface RaceDetailModalProps {
  race: Race | null;
  onClose: () => void;
  onShareWhatsApp: (race: Race) => void;
  onOpenRegistration?: (race: Race) => void;
  onToggleFeatured?: (raceId: string) => void;
}

export const RaceDetailModal: React.FC<RaceDetailModalProps> = ({
  race,
  onClose,
  onShareWhatsApp,
  onToggleFeatured
}) => {
  // Trava o scroll do body quando a página de detalhes estiver ativa
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!race) return null;

  const [, monthStr, dayStr] = (race.date || '2026-05-15').split('-');
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const formattedFullDate = `${dayStr} de ${months[parseInt(monthStr, 10) - 1]} de ${(race.date || '2026').split('-')[0]}`;

  const chipBadge = getTimingChipBadge(race.chipCompany);
  const daysLeft = calculateDaysLeft(race.date);
  const batchCountdown = getBatchCountdownTag(race);
  const categories = getRaceCategories(race);

  // URL do Google Agenda
  const getGoogleCalendarUrl = () => {
    const startTimeFormatted = race.date.replace(/-/g, '') + 'T' + race.time.replace(':', '') + '00';
    const endHour = (parseInt(race.time.split(':')[0], 10) + 3).toString().padStart(2, '0');
    const endTimeFormatted = race.date.replace(/-/g, '') + 'T' + endHour + race.time.split(':')[1] + '00';
    
    const details = encodeURIComponent(
      `Corrida: ${race.title}\nDistâncias: ${categories.map((c) => `${c.distance} (R$ ${c.price.toFixed(2)})`).join(', ')}\nLocal: ${race.location}, ${race.city}/PA\nCronometragem: ${chipBadge.name}\nInscrição: ${race.registrationUrl || 'Aguardando abertura no Breu Run'}`
    );
    const location = encodeURIComponent(`${race.location}, ${race.city}, Pará, Brasil`);
    const title = encodeURIComponent(`🏃‍♂️ ${race.title}`);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTimeFormatted}/${endTimeFormatted}&details=${details}&location=${location}`;
  };

  const getMapsUrl = () => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${race.location}, ${race.city}, Pará`)}`;
  };

  // Itens do Kit Oficial
  const kitItemsToDisplay = race.kitItems && race.kitItems.length > 0
    ? race.kitItems.map((item) => ({
        title: item.startsWith('✓') ? item : `✓ ${item}`,
        desc: 'Item oficial garantido no regulamento da prova',
        icon: item.toLowerCase().includes('camis') ? Shirt : item.toLowerCase().includes('chip') || item.toLowerCase().includes('peito') ? ShieldCheck : Award
      }))
    : [
        { title: '✓ Número de Peito com Chip de Cronometragem', desc: `Identificação oficial e cronometragem oficial via ${chipBadge.name}`, icon: ShieldCheck },
        { title: '✓ Camiseta Oficial do Evento', desc: 'Tecido tecnológico dry-fit leve de alta performance', icon: Shirt },
        { title: '✓ Medalha de Participação Finisher', desc: 'Entregue a todos os atletas concluintes da prova', icon: Award },
        { title: '✓ Hidratação e Suporte de Percurso', desc: 'Pontos de água durante o trajeto e suporte pós-chegada', icon: CheckCircle }
      ];

  // Helper visual para medalhas do pódio geral
  const getPodiumBadgeProps = (index: number) => {
    switch (index) {
      case 0:
        return {
          icon: '🏆',
          labelBg: 'bg-amber-400 text-amber-950 font-black ring-2 ring-amber-300',
          cardBg: 'bg-gradient-to-b from-amber-50 to-white border-amber-300 shadow-md',
          prizeColor: 'text-amber-950'
        };
      case 1:
        return {
          icon: '🥈',
          labelBg: 'bg-slate-300 text-slate-900 font-black ring-1 ring-slate-200',
          cardBg: 'bg-gradient-to-b from-slate-50 to-white border-slate-300 shadow-sm',
          prizeColor: 'text-slate-900'
        };
      case 2:
        return {
          icon: '🥉',
          labelBg: 'bg-amber-700 text-white font-black ring-1 ring-amber-600',
          cardBg: 'bg-gradient-to-b from-orange-50/60 to-white border-amber-200 shadow-sm',
          prizeColor: 'text-orange-950'
        };
      case 3:
        return {
          icon: '🎖️',
          labelBg: 'bg-slate-200 text-slate-800 font-bold',
          cardBg: 'bg-white border-slate-200 shadow-xs',
          prizeColor: 'text-slate-800'
        };
      default:
        return {
          icon: '🎖️',
          labelBg: 'bg-slate-100 text-slate-700 font-bold',
          cardBg: 'bg-white border-slate-200 shadow-xs',
          prizeColor: 'text-slate-800'
        };
    }
  };

  const basePrice = categories.length > 0 ? Math.min(...categories.map(c => c.price)) : (race.priceFrom || race.price || 60);

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 overflow-y-auto animate-in fade-in duration-150 flex flex-col font-sans">
      
      {/* 1. Barra Superior Fixa de Navegação (Desktop & Mobile) */}
      <header className="sticky top-0 z-50 bg-white/95 border-b border-slate-200 px-4 sm:px-8 py-3 backdrop-blur-md flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs sm:text-sm font-black transition cursor-pointer shadow-md shadow-orange-950/20 active:scale-95"
            title="Retornar para o calendário de corridas"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Calendário</span>
          </button>

          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200">
            <span className="text-xs font-black text-slate-800 truncate max-w-xs lg:max-w-md">
              {race.title}
            </span>
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${chipBadge.badgeClass}`}>
              {chipBadge.shortName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onToggleFeatured && (
            <button
              onClick={() => onToggleFeatured(race.id)}
              className={`p-2 rounded-xl border transition cursor-pointer text-xs font-bold flex items-center gap-1.5 ${
                race.featured
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title={race.featured ? "Remover dos destaques" : "Destacar no topo"}
            >
              <Sparkles className={`w-3.5 h-3.5 ${race.featured ? 'fill-slate-950 text-slate-950' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">{race.featured ? 'Destaque' : 'Destacar'}</span>
            </button>
          )}

          <button
            onClick={() => onShareWhatsApp(race)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Compartilhar evento no WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          {race.registrationUrl && (race.status === 'open' || race.status === 'closing_soon') && (
            <a
              href={race.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-xs sm:text-sm font-black transition shadow-sm cursor-pointer active:scale-95"
            >
              <span>Inscrever-se ↗</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </header>

      {/* 2. Banner Panorâmico 100% Edge-to-Edge */}
      <div className="relative w-full h-64 sm:h-80 md:h-[380px] bg-slate-900 border-b border-slate-200 overflow-hidden flex-shrink-0">
        {race.bannerUrl || race.imageUrl ? (
          <>
            <img
              src={race.bannerUrl || race.imageUrl}
              alt={race.title}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
          </>
        ) : (
          <DynamicRaceBanner
            race={race}
            heightClass="h-full"
            className="w-full h-full"
          />
        )}

        {/* Selo da Cronometragem Oficial no Canto Superior Esquerdo */}
        <div className={`absolute top-4 left-4 z-10 font-bold px-3 py-1.5 rounded-xl text-xs backdrop-blur-md border shadow-lg flex items-center gap-1.5 ${chipBadge.badgeClass}`}>
          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
          <span>{chipBadge.name}</span>
        </div>

        {/* Contagem Regressiva no Canto Superior Direito */}
        {daysLeft > 0 && (
          <div className="absolute top-4 right-4 z-10 font-black text-xs bg-slate-950/80 text-orange-300 px-3 py-1.5 rounded-xl border border-slate-700/80 backdrop-blur-md shadow-lg">
            ⚡ Faltam {daysLeft} dias para o evento
          </div>
        )}

        {/* Informações Principais sobre o Banner */}
        <div className="absolute bottom-5 sm:bottom-6 left-4 sm:left-8 right-4 sm:right-8 z-10 text-white space-y-2 max-w-5xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30 backdrop-blur-md">
              📍 {race.city}, Pará
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900/60 text-slate-200 border border-slate-700 backdrop-blur-md">
              🏢 {race.organizer || 'Organização Oficial'}
            </span>
            {batchCountdown && (
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-slate-950 shadow-md">
                🔥 {batchCountdown}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
            {race.title}
          </h1>
        </div>
      </div>

      {/* 3. Conteúdo Completo da Prova */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-900 pb-28 sm:pb-12">
        
        {/* Bloco 1: AÇÕES DIRETAS (Inscrição, Regulamento PDF, Agenda, WhatsApp) */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200/90 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Botão Oficial de Inscrição */}
            {race.status === 'open' || race.status === 'closing_soon' ? (
              race.registrationUrl ? (
                <a
                  href={race.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-2xl text-sm sm:text-base font-black transition shadow-lg shadow-orange-950/20 flex items-center justify-center gap-2 text-center active:scale-95 cursor-pointer leading-snug"
                >
                  <span>Inscrever-se no site oficial da {chipBadge.name}</span>
                  <ExternalLink className="w-5 h-5 flex-shrink-0" />
                </a>
              ) : (
                <button
                  onClick={() => alert('O link oficial de inscrição será liberado nos próximos dias pelo organizador no portal de cronometragem.')}
                  className="flex-1 py-4 px-6 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-sm sm:text-base font-black transition text-center shadow-md cursor-pointer"
                >
                  Aguardando liberação do link oficial 🔔
                </button>
              )
            ) : race.status === 'finished' ? (
              race.resultsUrl ? (
                <a
                  href={race.resultsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-4 px-6 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-sm sm:text-base font-black transition shadow-lg shadow-purple-950/20 flex items-center justify-center gap-2 text-center active:scale-95 cursor-pointer"
                >
                  <span>Ver Resultados na {chipBadge.name} ↗</span>
                  <ExternalLink className="w-5 h-5 flex-shrink-0" />
                </a>
              ) : (
                <button
                  disabled
                  className="flex-1 py-4 px-6 bg-slate-100 text-slate-400 rounded-2xl text-sm sm:text-base font-bold cursor-not-allowed"
                >
                  Prova Realizada • Resultados em Apuração
                </button>
              )
            ) : (
              <button
                onClick={() => {
                  alert(`Você será avisado no WhatsApp assim que as inscrições oficiais de ${race.title} forem abertas!`);
                }}
                className="flex-1 py-4 px-6 bg-slate-900 hover:bg-slate-800 text-orange-400 rounded-2xl text-sm sm:text-base font-black transition text-center shadow-md cursor-pointer"
              >
                Avise-me quando abrir a inscrição 🔔
              </button>
            )}

            {/* Regulamento Oficial em PDF */}
            {(race.regulationUrl || race.rulesUrl) && (
              <a
                href={race.regulationUrl || race.rulesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-4 px-5 bg-orange-50 hover:bg-orange-100 text-orange-950 border border-orange-200 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 text-center shadow-2xs"
                title="Abrir o regulamento oficial original em PDF"
              >
                <FileText className="w-4 h-4 text-orange-600" />
                <span>Regulamento Oficial (PDF)</span>
              </a>
            )}

            {/* Google Agenda */}
            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="py-4 px-5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 text-center"
            >
              <CalendarPlus className="w-4 h-4 text-orange-600" />
              <span>Adicionar na Agenda</span>
            </a>

            {/* WhatsApp */}
            <button
              onClick={() => onShareWhatsApp(race)}
              className="py-4 px-5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 text-center cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Bloco 2: PREMIAÇÃO OFICIAL CONFORME O REGULAMENTO DA CORRIDA (COM TODOS OS VALORES EM R$) */}
        <div className="bg-gradient-to-br from-amber-50/90 via-white to-orange-50/60 rounded-3xl p-5 sm:p-8 shadow-sm border border-amber-200 space-y-6">
          
          {/* Header da Premiação */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/80 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-amber-950 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <span>Premiação & Pódio Oficial (Conforme Regulamento)</span>
              </h2>
              <p className="text-xs text-amber-900/80 mt-1 font-medium">
                Valores e troféus oficiais extraídos diretamente do regulamento da prova
              </p>
            </div>

            {race.prizeTotal && race.prizeTotal > 0 ? (
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-4 py-2 rounded-2xl shadow-sm border border-amber-300">
                <span className="text-lg">💰</span>
                <div className="text-left">
                  <span className="text-[10px] font-black uppercase tracking-wider block text-amber-950/80">Premiação em Dinheiro</span>
                  <span className="text-sm sm:text-base font-black">
                    Até R$ {race.prizeTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 bg-amber-100/80 text-amber-900 px-3 py-1.5 rounded-xl text-xs font-bold border border-amber-200">
                <Trophy className="w-4 h-4 text-amber-600" />
                <span>Troféus & Medalhas Finisher</span>
              </div>
            )}
          </div>

          {/* Grupos de Premiação Estruturados (Geral, Local, Faixas, Equipes) */}
          {race.awardGroups && race.awardGroups.length > 0 ? (
            <div className="space-y-6">
              {race.awardGroups.map((group, gIdx) => {
                const isGeneral = group.name.toLowerCase().includes('geral');
                return (
                  <div key={gIdx} className="space-y-3">
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>{group.name}</span>
                    </h3>

                    {/* Se for Geral: Cards de Pódio Estilizados */}
                    {isGeneral ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                        {group.items.map((item, idx) => {
                          const badge = getPodiumBadgeProps(idx);
                          return (
                            <div 
                              key={idx} 
                              className={`rounded-2xl p-4 border transition-all duration-200 flex flex-col items-center text-center space-y-2 ${badge.cardBg}`}
                            >
                              <span className="text-3xl drop-shadow-xs">{badge.icon}</span>
                              <span className={`text-[11px] px-2.5 py-0.5 rounded-full ${badge.labelBg}`}>
                                {item.place}
                              </span>
                              <div className="pt-1">
                                <span className={`text-base sm:text-lg font-black block leading-tight ${badge.prizeColor}`}>
                                  {item.prize}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Outras Categorias (Comunidade Local, Faixas Etárias, Equipes): Grid Limpo */
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {group.items.map((item, idx) => (
                          <div 
                            key={idx}
                            className="bg-white rounded-2xl p-3.5 border border-amber-200/70 shadow-2xs flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">🎖️</span>
                              <span className="text-xs font-black text-slate-900">
                                {item.place}
                              </span>
                            </div>
                            <span className="text-xs sm:text-sm font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                              {item.prize}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Fallback com extração do texto */
            <div className="p-4 bg-white rounded-2xl border border-amber-200 text-slate-800 text-xs sm:text-sm space-y-2">
              <p className="font-bold text-amber-950">
                {race.awardsInfo || 'Premiação oficial com troféus para os primeiros colocados gerais e medalhas de participação para todos os atletas concluintes.'}
              </p>
            </div>
          )}

          {/* Texto Oficial das Regras e Regulamento Completo */}
          {race.awardsInfo && (
            <div className="p-4 sm:p-5 bg-amber-100/60 rounded-2xl border border-amber-200 text-amber-950 text-xs leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 font-black text-amber-900 uppercase tracking-wider text-[11px]">
                <FileText className="w-3.5 h-3.5 text-amber-700" />
                <span>Trecho Oficial do Regulamento:</span>
              </div>
              <p className="whitespace-pre-line text-xs font-medium text-amber-950/90 pt-1">
                {race.awardsInfo}
              </p>
            </div>
          )}
        </div>

        {/* Bloco 3: QUILOMETRAGENS & VALORES REAIS POR LOTE */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200/90 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                <span>Quilometragens & Valores Oficiais de Inscrição</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Valores reais por percurso cadastrados no portal de cronometragem
              </p>
            </div>

            {batchCountdown && (
              <span className="px-3 py-1 rounded-xl text-xs font-black bg-amber-500 text-slate-950 uppercase tracking-wider shadow-xs">
                {batchCountdown}
              </span>
            )}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-900 text-white font-black text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4">Percurso / Distância</th>
                  <th className="p-4">Lote Vigente</th>
                  <th className="p-4 text-right sm:text-left">Valor da Inscrição</th>
                  {race.priceWithShirt && <th className="p-4 hidden sm:table-cell">Kit c/ Camisa</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {categories.map((cat, idx) => (
                  <tr key={idx} className="hover:bg-orange-50/40 transition">
                    <td className="p-4 font-black text-slate-900">
                      <span className="px-3 py-1.5 rounded-xl bg-orange-100 text-orange-950 text-xs sm:text-sm font-black inline-block">
                        {cat.distance}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 font-semibold">
                      {cat.lot_name || race.currentBatch || '1º Lote Oficial'}
                    </td>
                    <td className="p-4 font-black text-emerald-950 text-base sm:text-lg text-right sm:text-left">
                      R$ {cat.price.toFixed(2).replace('.', ',')}
                    </td>
                    {race.priceWithShirt && (
                      <td className="p-4 font-black text-emerald-950 bg-emerald-50/40 hidden sm:table-cell">
                        R$ {race.priceWithShirt.toFixed(2).replace('.', ',')}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bloco 4: KIT DO ATLETA OFICIAL VERIFICADO */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200/90 space-y-4">
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Gift className="w-4 h-4 text-orange-500" />
            <span>Kit do Atleta (Conforme Regulamento Oficial)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {kitItemsToDisplay.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bloco 5: DATA, HORÁRIO E LOCAL DE LARGADA */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200/90 space-y-4">
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span>Data, Horário e Local de Concentração</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-orange-50/70 border border-orange-200/70 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-800 block">
                Data do Evento
              </span>
              <div className="text-lg sm:text-xl font-black text-slate-900">
                {formattedFullDate}
              </div>
              <div className="text-xs text-orange-950 font-bold flex items-center gap-1.5 pt-1">
                <Clock className="w-4 h-4 text-orange-600" />
                <span>Largada pontual às {race.time}h</span>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Local de Concentração
              </span>
              <div className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                {race.location}
              </div>
              <div className="text-xs text-slate-600 font-semibold">
                {race.city}, Pará
              </div>
              <a
                href={getMapsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline pt-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Abrir rota no Google Maps ↗</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bloco 6: Selo de Verificação Breu Run */}
        <div className="p-5 rounded-2xl bg-slate-900 text-white text-xs space-y-2 border border-slate-800 shadow-md">
          <div className="flex items-center gap-2 text-orange-400 font-bold">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm">Dados Oficiais e Regulamento Verificados</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            As informações deste evento foram extraídas e sincronizadas diretamente dos sistemas oficiais da empresa de cronometragem <strong>{chipBadge.name}</strong>.
          </p>
        </div>
      </main>

      {/* 4. Barra Fixa Inferior no Celular (Mobile Sticky Action Bar) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 z-40 flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Inscrição a partir de</span>
          <span className="text-base font-black text-emerald-700">
            R$ {basePrice.toFixed(2).replace('.', ',')}
          </span>
        </div>

        {race.status === 'open' || race.status === 'closing_soon' ? (
          race.registrationUrl ? (
            <a
              href={race.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>Inscrever-se Agora</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <button
              onClick={() => alert('O link oficial de inscrição será liberado nos próximos dias pelo organizador.')}
              className="py-2.5 px-4 bg-amber-500 text-white rounded-xl text-xs font-black shadow-md"
            >
              Em Breve 🔔
            </button>
          )
        ) : race.status === 'finished' ? (
          race.resultsUrl ? (
            <a
              href={race.resultsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 bg-purple-600 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1"
            >
              <span>Resultados ↗</span>
            </a>
          ) : (
            <span className="text-xs font-bold text-slate-400">Encerrado</span>
          )
        ) : (
          <button
            onClick={() => onShareWhatsApp(race)}
            className="py-2.5 px-4 bg-slate-900 text-orange-400 rounded-xl text-xs font-bold"
          >
            Avise-me 🔔
          </button>
        )}
      </div>

    </div>
  );
};
