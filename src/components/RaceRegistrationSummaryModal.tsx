import React from 'react';
import type { Race } from '../types/race';
import { 
  X, 
  ExternalLink, 
  Calendar, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Tag, 
  CheckCircle2, 
  FileText, 
  Trophy, 
  Share2, 
  Gift, 
  Shirt, 
  Award, 
  Droplet, 
  HeartHandshake
} from 'lucide-react';

interface RaceRegistrationSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  race: Race | null;
  onShareWhatsApp: (race: Race) => void;
}

export const RaceRegistrationSummaryModal: React.FC<RaceRegistrationSummaryModalProps> = ({
  isOpen,
  onClose,
  race,
  onShareWhatsApp
}) => {
  if (!isOpen || !race) return null;

  const [year, monthStr, dayStr] = race.date.split('-');
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const formattedDate = `${dayStr} de ${months[parseInt(monthStr, 10) - 1]} de ${year}`;

  const handleGoToRegistration = () => {
    if (race.registrationUrl) {
      window.open(race.registrationUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const getChipBadgeColor = () => {
    if (race.chipCompany.includes('Amazônia')) return 'bg-emerald-50 text-emerald-800 border-emerald-300';
    if (race.chipCompany.includes('Breu Branco')) return 'bg-blue-50 text-blue-800 border-blue-300';
    if (race.chipCompany.includes('Pará')) return 'bg-purple-50 text-purple-800 border-purple-300';
    if (race.chipCompany.includes('Cronos')) return 'bg-cyan-50 text-cyan-800 border-cyan-300';
    return 'bg-slate-50 text-slate-800 border-slate-300';
  };

  const hasPrice = typeof race.price === 'number' || typeof race.priceFrom === 'number';
  const displayPrice = (race.price ?? race.priceFrom)?.toFixed(2).replace('.', ',');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-950/40">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  Resumo da Prova & Inscrição
                </span>
                <span className="text-[10px] text-slate-400">Sem burocracia</span>
              </div>
              <h3 className="font-black text-base sm:text-lg text-white leading-tight mt-0.5 truncate max-w-xs sm:max-w-md">
                {race.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-700 text-sm">
          {/* 1. Card de Data, Hora e Local */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Calendar className="w-4 h-4 text-orange-600" />
                <span>{formattedDate}</span>
                <span className="text-slate-300">•</span>
                <Clock className="w-4 h-4 text-orange-600" />
                <span>Largada às {race.time}h</span>
              </div>

              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${getChipBadgeColor()}`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Cronometragem: <strong>{race.chipCompany}</strong></span>
              </div>
            </div>

            <div className="flex items-start justify-between gap-2 pt-2 border-t border-slate-200/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                <span>{race.location} — <strong className="text-slate-800">{race.city}/PA</strong></span>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${race.location}, ${race.city}, Pará`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-orange-600 hover:underline whitespace-nowrap"
              >
                Abrir no Google Maps ↗
              </a>
            </div>
          </div>

          {/* 2. Valor Atual & Lote Vigente */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-2xl p-4 sm:p-5 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-sm">
                <Tag className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                  Valor Atual da Inscrição
                </span>
                {hasPrice ? (
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
                      R$ {displayPrice}
                    </span>
                    <span className="text-xs text-emerald-700 font-semibold">/ atleta</span>
                  </div>
                ) : (
                  <span className="text-base font-bold text-slate-700">
                    {race.status === 'confirmed' ? 'Lote em definição pela organização' : 'Sob consulta'}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-1">
              {race.currentBatch && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-emerald-300 text-emerald-900 text-xs font-black rounded-xl shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {race.currentBatch}
                </span>
              )}
              {race.batchDeadline && (
                <span className="text-[11px] text-amber-800 font-bold">
                  Vigente até: {race.batchDeadline}
                </span>
              )}
            </div>
          </div>

          {/* 3. Percursos e Distâncias Disponíveis */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
              Percursos Disponíveis
            </h4>
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

          {/* 4. O que vem no Kit do Atleta & Brindes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-orange-600" />
                Kit do Atleta & Brindes Inclusos
              </h4>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Incluso na inscrição
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/90 flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-orange-100 text-orange-700 flex-shrink-0">
                  <Shirt className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-extrabold text-xs text-slate-900">Camiseta Oficial</h5>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Tecido tecnológico poliamida dry-fit com proteção UV para a corrida.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/90 flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800 flex-shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-extrabold text-xs text-slate-900">Medalha Finisher Exclusiva</h5>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Medalha em metal maciço personalizada para todos que completarem a prova.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/90 flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700 flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-extrabold text-xs text-slate-900">Número de Peito + Chip</h5>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Número de peito personalizado com chip eletrônico de cronometragem oficial.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/90 flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-teal-100 text-teal-800 flex-shrink-0">
                  <Droplet className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-extrabold text-xs text-slate-900">Hidratação & Frutas Pós-Prova</h5>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Pontos de água gelada no percurso e mesa de frutas na chegada.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/90 flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700 flex-shrink-0">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-extrabold text-xs text-slate-900">Sacochila & Brindes</h5>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Sacochila temática do evento com brindes dos patrocinadores regionais.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/90 flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 flex-shrink-0">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-extrabold text-xs text-slate-900">Seguro do Atleta & Suporte</h5>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Ambulância, socorristas de prontidão e seguro durante todo o percurso.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Premiação e Troféus */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs mb-1">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>Premiação Prevista no Regulamento</span>
            </div>
            <p className="text-xs text-amber-950 leading-relaxed">
              {race.awardsInfo || 'Troféus para os 5 primeiros colocados no Geral Masculino e Feminino, além de premiação por faixas etárias de acordo com as normas da Federação Paraense de Atletismo e o regulamento oficial.'}
            </p>
          </div>

          {/* 6. Regulamento Oficial em PDF se disponível */}
          {(race.regulationUrl || race.rulesUrl) && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <div>
                  <h5 className="text-xs font-bold text-slate-900">Regulamento Oficial da Prova</h5>
                  <p className="text-[11px] text-slate-500">Documento oficial com todas as regras, retirada de kit e faixas etárias.</p>
                </div>
              </div>
              <a
                href={race.regulationUrl || race.rulesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-white hover:bg-orange-50 text-orange-700 border border-slate-300 rounded-xl text-xs font-bold whitespace-nowrap transition"
              >
                Abrir PDF ↗
              </a>
            </div>
          )}
        </div>

        {/* Footer com CTA Direto para o Site Oficial do Chip */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => onShareWhatsApp(race)}
            className="w-full sm:w-auto px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            title="Compartilhar resumo com amigos de corrida"
          >
            <Share2 className="w-4 h-4 text-emerald-600" />
            <span>Compartilhar no WhatsApp</span>
          </button>

          {race.status === 'open' || race.status === 'closing_soon' ? (
            race.registrationUrl ? (
              <button
                onClick={handleGoToRegistration}
                className="w-full sm:flex-1 py-3.5 px-6 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-orange-950/20 transition cursor-pointer active:scale-95"
              >
                <span>Prosseguir para Inscrição no Site Oficial ({race.chipCompany})</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            ) : (
              <button
                disabled
                className="w-full sm:flex-1 py-3.5 px-6 bg-slate-200 text-slate-400 rounded-2xl text-sm font-bold text-center cursor-not-allowed"
              >
                Aguardando Liberação do Link de Checkout
              </button>
            )
          ) : race.status === 'confirmed' ? (
            <button
              onClick={() => {
                alert(`Data confirmada! Assim que o link oficial for disponibilizado pela ${race.chipCompany}, você será notificado!`);
                onClose();
              }}
              className="w-full sm:flex-1 py-3.5 px-6 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-sm font-black text-center transition cursor-pointer"
            >
              Inscrições em Breve no Site do Chip 🔔
            </button>
          ) : (
            <button
              disabled
              className="w-full sm:flex-1 py-3.5 px-6 bg-slate-200 text-slate-500 rounded-2xl text-sm font-black text-center cursor-not-allowed"
            >
              Inscrições Encerradas para esta Prova
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
