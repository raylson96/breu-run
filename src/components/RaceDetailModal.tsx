import React from 'react';
import type { Race } from '../types/race';
import { 
  X, 
  Calendar, 
  MapPin, 
  Clock, 
  Trophy, 
  CheckCircle, 
  ExternalLink, 
  Share2, 
  TrendingUp, 
  FileText,
  CalendarPlus,
  Bell,
  Award,
  Tag,
  Sparkles
} from 'lucide-react';

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
  onOpenRegistration,
  onToggleFeatured
}) => {
  if (!race) return null;

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${day} de ${months[parseInt(month, 10) - 1]} de ${year}`;
  };

  // Google Calendar URL generator
  const getGoogleCalendarUrl = () => {
    const startTimeFormatted = race.date.replace(/-/g, '') + 'T' + race.time.replace(':', '') + '00';
    const endHour = (parseInt(race.time.split(':')[0]) + 3).toString().padStart(2, '0');
    const endTimeFormatted = race.date.replace(/-/g, '') + 'T' + endHour + race.time.split(':')[1] + '00';
    
    const details = encodeURIComponent(
      `Corrida: ${race.title}\nDistâncias: ${race.distances.join(', ')}\nLocal: ${race.location}, ${race.city}/PA\nCronometragem: ${race.chipCompany}\nInscrição: ${race.registrationUrl || 'Aguardando abertura'}`
    );
    const location = encodeURIComponent(`${race.location}, ${race.city}, Pará, Brasil`);
    const title = encodeURIComponent(`🏃‍♂️ ${race.title}`);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTimeFormatted}/${endTimeFormatted}&details=${details}&location=${location}`;
  };

  const getMapsUrl = () => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${race.location}, ${race.city}, Pará`)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div className="bg-slate-900 text-white p-5 flex items-start justify-between relative">
          <div className="pr-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 mb-2">
              <span>{race.city}, PA</span>
              <span>•</span>
              <span>{race.chipCompany}</span>
              {race.region && (
                <>
                  <span>•</span>
                  <span>{race.region}</span>
                </>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black leading-tight text-white tracking-tight">
              {race.title}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Organizado por: <span className="text-slate-300 font-medium">{race.organizer}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {onToggleFeatured && (
              <button
                onClick={() => onToggleFeatured(race.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  race.featured 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title={race.featured ? "Remover do destaque do topo" : "Fixar esta prova em destaque no topo"}
              >
                <Sparkles className={`w-3.5 h-3.5 ${race.featured ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                <span>{race.featured ? 'Em Destaque no Topo' : 'Destacar no Topo'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-sm">
          {/* Quick Date, Time & Location summary card */}
          <div className="bg-orange-50/70 rounded-2xl p-4 border border-orange-200/80 space-y-3">
            <div className="flex items-center gap-2.5 text-slate-900 font-black text-sm sm:text-base">
              <Calendar className="w-4 h-4 text-orange-600 flex-shrink-0" />
              <span>{formatDate(race.date)}</span>
              <span className="text-orange-600">•</span>
              <Clock className="w-4 h-4 text-orange-600 flex-shrink-0" />
              <span>Largada às {race.time}h</span>
            </div>

            <div className="flex items-start justify-between gap-2 pt-2 border-t border-orange-200/60">
              <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span>{race.location} — <strong>{race.city}/PA</strong></span>
              </div>
              <a
                href={getMapsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-orange-700 hover:underline whitespace-nowrap"
              >
                Ver no Maps
              </a>
            </div>
          </div>

          {/* Card de Valor da Inscrição & Lote Atual */}
          <div className="bg-emerald-50/90 rounded-2xl p-4 border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm flex-shrink-0 shadow-sm">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">
                  Valor da Inscrição
                </span>
                {(typeof race.price === 'number' || typeof race.priceFrom === 'number') ? (
                  <span className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight">
                    R$ {(race.price ?? race.priceFrom)!.toFixed(2).replace('.', ',')}
                  </span>
                ) : (
                  <span className="text-sm font-bold text-slate-600">
                    {race.status === 'confirmed' ? 'Lote em breve' : 'Valor sob consulta'}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {race.currentBatch && (
                <span className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-900 text-xs font-black rounded-xl shadow-2xs">
                  {race.currentBatch}
                </span>
              )}
            </div>
          </div>

          {/* Status Explanation Banner for Athletes */}
          {race.status === 'confirmed' && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-amber-950 text-xs sm:text-sm">
                  Data confirmada no calendário oficial
                </h4>
                <p className="text-xs text-amber-900/80 mt-0.5 leading-relaxed">
                  O organizador e a empresa de cronometragem já confirmaram a realização da prova nesta data. As vendas de inscrição ainda não foram abertas no sistema de chip. Salve no seu calendário para não esquecer!
                </p>
              </div>
            </div>
          )}

          {race.status === 'finished' && (
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-purple-950 text-xs sm:text-sm">
                  Prova já realizada
                </h4>
                <p className="text-xs text-purple-900/80 mt-0.5 leading-relaxed">
                  Esta corrida já aconteceu. Fique atento às próximas etapas do circuito regional de corridas!
                </p>
              </div>
            </div>
          )}

          {/* Distâncias */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
              Percursos Disponíveis
            </h3>
            <div className="flex flex-wrap gap-2">
              {race.distances.map((dist, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-slate-900 text-orange-400 shadow-sm"
                >
                  {dist}
                </span>
              ))}
            </div>
          </div>

          {/* Descrição */}
          {race.description && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                Sobre o Evento
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {race.description}
              </p>
            </div>
          )}

          {/* Kit do Atleta */}
          {race.kitItems && race.kitItems.length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                Kit do Atleta Inclui
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {race.kitItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Premiação */}
          {race.awardsInfo && (
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs mb-1">
                <Trophy className="w-4 h-4 text-amber-600" />
                <span>Premiação & Troféus</span>
              </div>
              <p className="text-xs text-amber-950 leading-relaxed">
                {race.awardsInfo}
              </p>
            </div>
          )}

          {/* Altimetria */}
          {race.elevation && (
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <TrendingUp className="w-4 h-4 text-slate-500" />
              <span><strong>Perfil do Percurso:</strong> {race.elevation}</span>
            </div>
          )}

          {/* Ações secundárias: Salvar na Agenda + Compartilhar WhatsApp */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition text-center"
            >
              <CalendarPlus className="w-4 h-4 text-orange-600" />
              <span>Salvar no Google Agenda</span>
            </a>

            <button
              onClick={() => onShareWhatsApp(race)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition text-center cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-emerald-600" />
              <span>Mandar no WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
          {(race.regulationUrl || race.rulesUrl) && (
            <a
              href={race.regulationUrl || race.rulesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 text-slate-700 hover:text-orange-600 hover:bg-orange-50 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
              title="Baixar ou ler Regulamento Oficial em PDF"
            >
              <FileText className="w-4 h-4 text-orange-600 flex-shrink-0" />
              <span>Regulamento Oficial (PDF)</span>
            </a>
          )}

          {race.status === 'open' || race.status === 'closing_soon' ? (
            onOpenRegistration ? (
              <button
                onClick={() => onOpenRegistration(race)}
                className="flex-1 py-3 px-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 transition text-center cursor-pointer active:scale-95"
              >
                <span>Ir para Inscrição Oficial</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            ) : (
              <a
                href={race.registrationUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 transition text-center"
              >
                <span>Ir para Inscrição Oficial</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )
          ) : race.status === 'confirmed' ? (
            <button
              onClick={() => {
                alert(`Você será avisado no WhatsApp assim que o link oficial de ${race.title} for aberto!`);
                onClose();
              }}
              className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-black text-center transition"
            >
              Avise-me quando abrir o link de inscrição 🔔
            </button>
          ) : race.status === 'finished' ? (
            race.resultsUrl ? (
              <a
                href={race.resultsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-black text-center transition flex items-center justify-center gap-2 shadow-lg shadow-purple-950/20 active:scale-95 cursor-pointer"
              >
                <span>Ver Resultados Oficiais ({race.chipCompany}) ↗</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <button
                disabled
                className="flex-1 py-3 px-4 bg-slate-200 text-slate-500 rounded-xl text-sm font-black text-center cursor-not-allowed"
              >
                Prova Realizada
              </button>
            )
          ) : (
            <button
              disabled
              className="flex-1 py-3 px-4 bg-slate-200 text-slate-500 rounded-xl text-sm font-black text-center cursor-not-allowed"
            >
              Inscrições Encerradas para esta Prova
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
