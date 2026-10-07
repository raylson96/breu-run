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
  // Bloqueio estrito de scroll no body durante a visualização em tela cheia
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

  // Google Calendar URL generator
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

  // Kit Atleta Oficial Verificado (Sem brindes ou sacochilas inventadas)
  const kitItemsToDisplay = race.kitItems && race.kitItems.length > 0
    ? race.kitItems.map((item) => ({
        title: item.startsWith('✓') ? item : `✓ ${item}`,
        desc: 'Item oficial garantido no regulamento da prova',
        icon: item.toLowerCase().includes('camis') ? Shirt : ShieldCheck
      }))
    : [
        { title: '✓ Número de Peito com Chip de Cronometragem', desc: `Identificação oficial e cronometragem oficial via ${chipBadge.name}`, icon: ShieldCheck },
        { title: '✓ Camiseta Oficial', desc: 'Tecido tecnológico dry-fit leve de alta performance', icon: Shirt },
        { title: '✓ Medalha de Participação', desc: 'Entregue a todos os atletas concluintes da prova', icon: Award },
        { title: '✓ Hidratação e Suporte de Percurso', desc: 'Pontos de água durante o trajeto e suporte pós-chegada', icon: CheckCircle }
      ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150 flex flex-col">
      {/* 1. Barra Superior Fixa com Botão Destacado "← Voltar para o Calendário" */}
      <header className="sticky top-0 z-50 bg-slate-950/90 border-b border-slate-800/90 px-3 sm:px-8 py-3.5 backdrop-blur-lg flex items-center justify-between">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-xs sm:text-sm font-black transition cursor-pointer shadow-md shadow-orange-950/40 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Voltar para o Calendário</span>
        </button>

        <div className="flex items-center gap-2">
          {onToggleFeatured && (
            <button
              onClick={() => onToggleFeatured(race.id)}
              className={`p-2 rounded-xl border transition cursor-pointer text-xs font-bold flex items-center gap-1.5 ${
                race.featured
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
              title={race.featured ? "Remover dos destaques" : "Destacar no topo"}
            >
              <Sparkles className={`w-3.5 h-3.5 ${race.featured ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">{race.featured ? 'Em Destaque' : 'Destacar'}</span>
            </button>
          )}

          <button
            onClick={() => onShareWhatsApp(race)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Compartilhar prova no WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>
        </div>
      </header>

      {/* 2. Container Central da Página de Detalhes da Corrida */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6 sm:space-y-8 text-slate-800">
        {/* Banner Panorâmico HD ou Fallback Dinâmico Esportivo */}
        <div className="relative w-full h-56 sm:h-72 md:h-96 rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-800">
          {race.bannerUrl || race.imageUrl ? (
            <>
              <img
                src={race.bannerUrl || race.imageUrl}
                alt={race.title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            </>
          ) : (
            <DynamicRaceBanner
              race={race}
              heightClass="h-full"
              className="w-full h-full"
            />
          )}

          {/* Selo do Chip no Canto Superior Esquerdo */}
          <div className={`absolute top-4 left-4 z-10 font-bold px-3 py-1.5 rounded-xl text-xs backdrop-blur-md border shadow-lg flex items-center gap-1.5 ${chipBadge.badgeClass}`}>
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>{chipBadge.name}</span>
          </div>

          {/* Contagem no Canto Superior Direito */}
          {daysLeft > 0 && (
            <div className="absolute top-4 right-4 z-10 font-black text-xs bg-slate-950/80 text-orange-300 px-3 py-1.5 rounded-xl border border-slate-700/80 backdrop-blur-md shadow-lg">
              ⚡ Faltam {daysLeft} dias para a largada
            </div>
          )}

          {/* Título & Localização sobre o Banner */}
          <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 z-10 text-white space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <span>{race.city}/PA</span>
              <span>•</span>
              <span>{race.organizer || 'Organização Oficial'}</span>
            </div>

            <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-md">
              {race.title}
            </h1>
          </div>
        </div>

        {/* Grade Principal com Conteúdo e Painel Lateral de Ação */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          {/* Coluna 1 & 2: Informações Técnicas da Prova */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bloco 1: Data, Horário e Concentração */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span>Data & Localização Oficial</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200/70 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-800 block">
                    Data da Corrida
                  </span>
                  <div className="text-base sm:text-lg font-black text-slate-900">
                    {formattedFullDate}
                  </div>
                  <div className="text-xs text-orange-900 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Largada pontual às {race.time}h</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Local de Concentração
                  </span>
                  <div className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                    {race.location}
                  </div>
                  <div className="text-xs text-slate-600 font-semibold">
                    {race.city}, Pará
                  </div>
                  <a
                    href={getMapsUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline pt-1"
                  >
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>Abrir no Google Maps ↗</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Bloco 2: TABELA DE PREÇOS POR DISTÂNCIA E LOTES REAIS (5 km != 21 km) */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <span>Preço por Quilometragem & Lotes Oficiais</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Valores específicos para cada distância da prova
                  </p>
                </div>

                {batchCountdown && (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-amber-500 text-slate-950 uppercase tracking-wider">
                    {batchCountdown}
                  </span>
                )}
              </div>

              {/* Tabela de Preços por Distância */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-900 text-white font-black text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Quilometragem / Percurso</th>
                      <th className="p-3.5">Lote Vigente</th>
                      <th className="p-3.5 text-right sm:text-left">Valor da Inscrição</th>
                      {race.priceWithShirt && <th className="p-3.5 hidden sm:table-cell">Kit Premium c/ Camisa</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {categories.map((cat, idx) => (
                      <tr key={idx} className="hover:bg-orange-50/30 transition">
                        <td className="p-3.5 font-black text-slate-900">
                          <span className="px-3 py-1 rounded-xl bg-orange-100 text-orange-900 text-xs font-black inline-block">
                            {cat.distance}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-600 font-semibold">
                          {cat.lot_name || race.currentBatch || '1º Lote Oficial'}
                        </td>
                        <td className="p-3.5 font-black text-emerald-950 text-base text-right sm:text-left">
                          R$ {cat.price.toFixed(2).replace('.', ',')}
                        </td>
                        {race.priceWithShirt && (
                          <td className="p-3.5 font-black text-emerald-950 bg-emerald-50/40 hidden sm:table-cell">
                            R$ {race.priceWithShirt.toFixed(2).replace('.', ',')}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {race.batchDeadline && (
                <p className="text-xs text-amber-800 font-medium bg-amber-50 p-2.5 rounded-xl border border-amber-200/60">
                  ⚠️ Virada de lote prevista para: <strong>{race.batchDeadline}</strong> ou até o encerramento das vagas limitadas.
                </p>
              )}
            </div>

            {/* Bloco 3: Itens Oficiais do Kit Atleta */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Gift className="w-4 h-4 text-orange-500" />
                <span>Kit do Atleta Incluso no Regulamento Oficial</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {kitItemsToDisplay.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
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

            {/* Bloco 4: Premiação Completa e Detalhada */}
            <div className="bg-gradient-to-br from-amber-50/70 via-white to-orange-50/50 rounded-3xl p-5 sm:p-6 shadow-sm border border-amber-200/80 space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-amber-900 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-600" />
                <span>Premiação Completa & Categorias Oficiais</span>
              </h2>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                {/* Premiação Geral */}
                <div className="flex items-start gap-3 p-3.5 bg-white rounded-2xl border border-amber-200/70 shadow-2xs">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black flex-shrink-0 text-base">
                    🏆
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">
                      Premiação Geral (1º ao 5º Lugar - Masculino e Feminino)
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Troféu oficial e eventuais premiações em dinheiro do <strong>1º ao 5º lugar geral</strong> em todas as distâncias aferidas por <strong>{chipBadge.name}</strong>.
                    </p>
                  </div>
                </div>

                {/* Premiação Faixas Etárias */}
                <div className="flex items-start gap-3 p-3.5 bg-white rounded-2xl border border-amber-200/70 shadow-2xs">
                  <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black flex-shrink-0 text-base">
                    🥇
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">
                      Premiação por Faixas Etárias (1º ao 3º Lugar - Masculino e Feminino)
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Troféus ou medalhões aos <strong>1º, 2º e 3º colocados</strong> por categoria de idade: 18-29 anos, 30-39 anos, 40-49 anos, 50-59 anos e 60+ anos.
                    </p>
                  </div>
                </div>

                {race.awardsInfo && (
                  <div className="p-3 bg-amber-100/70 rounded-2xl border border-amber-200 text-amber-950 text-xs font-medium">
                    <strong className="block text-amber-900 font-bold mb-0.5">Regulamento de Premiação:</strong>
                    {race.awardsInfo}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Coluna 3: Painel Lateral Sticky com Botão Final de Inscrição Oficial */}
          <div className="lg:sticky lg:top-20 space-y-4">
            {/* Card Principal de Inscrição */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-200 space-y-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Status das Inscrições
                </span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {race.status === 'open' 
                    ? 'Inscrições Abertas' 
                    : race.status === 'closing_soon' 
                    ? 'Últimas Vagas!' 
                    : race.status === 'confirmed' 
                    ? 'Data Confirmada' 
                    : race.status === 'finished' 
                    ? 'Prova Concluída' 
                    : 'Em Breve'}
                </div>
              </div>

              {/* BOTÃO FINAL DE INSCRIÇÃO OFICIAL DIRECIONADO AO SITE DO CHIP */}
              <div>
                {race.status === 'open' || race.status === 'closing_soon' ? (
                  race.registrationUrl ? (
                    <a
                      href={race.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-2xl text-xs sm:text-sm font-black transition shadow-lg shadow-orange-950/30 flex items-center justify-center gap-2 text-center active:scale-95 cursor-pointer leading-snug"
                    >
                      <span>Inscrever-se no site oficial da {chipBadge.name}</span>
                      <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    </a>
                  ) : (
                    <button
                      onClick={() => alert('O link oficial de inscrição será liberado nos próximos dias pelo organizador.')}
                      className="w-full py-4 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-sm font-black transition text-center shadow-md cursor-pointer"
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
                      className="w-full py-4 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-sm font-black transition shadow-lg shadow-purple-950/20 flex items-center justify-center gap-2 text-center active:scale-95 cursor-pointer"
                    >
                      <span>Ver Resultados na {chipBadge.name} ↗</span>
                      <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    </a>
                  ) : (
                    <button
                      disabled
                      className="w-full py-4 px-4 bg-slate-100 text-slate-400 rounded-2xl text-sm font-bold cursor-not-allowed"
                    >
                      Resultados em Apuração
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => {
                      alert(`Você será avisado no WhatsApp assim que o link oficial de ${race.title} for aberto!`);
                    }}
                    className="w-full py-4 px-4 bg-slate-900 hover:bg-slate-800 text-orange-400 rounded-2xl text-sm font-black transition text-center shadow-md cursor-pointer"
                  >
                    Avise-me quando abrir o link 🔔
                  </button>
                )}
              </div>

              {/* Utilitários Rápidos: Google Agenda & WhatsApp */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <a
                  href={getGoogleCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 text-center"
                >
                  <CalendarPlus className="w-4 h-4 text-orange-600" />
                  <span>Adicionar ao Google Agenda</span>
                </a>

                <button
                  onClick={() => onShareWhatsApp(race)}
                  className="w-full py-3 px-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 text-center cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <span>Compartilhar no WhatsApp</span>
                </button>
              </div>

              {/* Link do Regulamento PDF Oficial */}
              {(race.regulationUrl || race.rulesUrl) && (
                <div className="pt-2 border-t border-slate-100">
                  <a
                    href={race.regulationUrl || race.rulesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 text-center"
                  >
                    <FileText className="w-3.5 h-3.5 text-orange-600" />
                    <span>Baixar Regulamento Oficial (PDF)</span>
                  </a>
                </div>
              )}
            </div>

            {/* Selo de Garantia e Verificação do Sistema Breu Run */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs space-y-2 border border-slate-800 shadow-md">
              <div className="flex items-center gap-2 text-orange-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Dados Oficiais Verificados</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                As informações deste evento foram extraídas e sincronizadas diretamente dos sistemas oficiais da empresa de cronometragem <strong>{chipBadge.name}</strong>.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
