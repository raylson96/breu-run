import React from 'react';
import type { Race } from '../types/race';
import { 
  ExternalLink, 
  Share2, 
  Heart, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  CalendarCheck,
  FileText,
  Sparkles
} from 'lucide-react';

interface RaceTableViewProps {
  races: Race[];
  favorites: string[];
  onToggleFavorite: (raceId: string) => void;
  onSelectRace: (race: Race) => void;
  onShareWhatsApp: (race: Race) => void;
  onOpenRegistration?: (race: Race) => void;
  onToggleFeatured?: (raceId: string) => void;
}

export const RaceTableView: React.FC<RaceTableViewProps> = ({
  races,
  favorites,
  onToggleFavorite,
  onSelectRace,
  onShareWhatsApp,
  onOpenRegistration,
  onToggleFeatured
}) => {
  const getStatusBadge = (status: Race['status']) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Inscrições Abertas
          </span>
        );
      case 'closing_soon':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-orange-100 text-orange-800 border border-orange-300">
            <AlertCircle className="w-3 h-3 text-orange-600" />
            Últimas Vagas
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
            <CalendarCheck className="w-3 h-3 text-amber-700" />
            Data Confirmada
          </span>
        );
      case 'soon':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300">
            <Clock className="w-3 h-3 text-blue-600" />
            Em Breve
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-600 border border-slate-300">
            Encerradas
          </span>
        );
      case 'finished':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-purple-100 text-purple-800 border border-purple-300">
            Prova Realizada
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return {
      day,
      month: months[parseInt(month, 10) - 1],
      year
    };
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-900 text-white font-black text-xs uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4 w-28 text-center">Data</th>
              <th className="p-4">Evento / Realizador</th>
              <th className="p-4">Cidade / Local</th>
              <th className="p-4">Percursos</th>
              <th className="p-4">Cronometragem</th>
              <th className="p-4">Status & Lote</th>
              <th className="p-4 text-center">Inscrição / Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {races.map((race) => {
              const dateInfo = formatDate(race.date);
              const isFav = favorites.includes(race.id);

              return (
                <tr 
                  key={race.id} 
                  className={`hover:bg-orange-50/40 transition-colors ${
                    race.featured ? 'bg-amber-50/20' : ''
                  }`}
                >
                  {/* Data */}
                  <td className="p-4 text-center whitespace-nowrap">
                    <div className="bg-slate-900 text-white rounded-xl py-1.5 px-2 inline-flex flex-col items-center min-w-[60px] shadow-sm">
                      <span className="text-[10px] font-bold text-orange-400 block uppercase">
                        {dateInfo.month}
                      </span>
                      <span className="text-xl font-black leading-none block">
                        {dateInfo.day}
                      </span>
                      <span className="text-[9px] text-slate-400 block font-medium">
                        {dateInfo.year}
                      </span>
                    </div>
                  </td>

                  {/* Nome da Corrida & Organizador */}
                  <td className="p-4">
                    <div className="space-y-1 max-w-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectRace(race)}
                          className="font-bold text-slate-900 hover:text-orange-600 transition text-left leading-snug cursor-pointer"
                        >
                          {race.title}
                        </button>
                        {race.featured && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-orange-600 text-white uppercase">
                            Destaque
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        Por: <span className="text-slate-700 font-medium">{race.organizer}</span>
                      </div>
                    </div>
                  </td>

                  {/* Cidade & Local */}
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-slate-900 font-bold">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{race.city}, PA</span>
                    </div>
                    <div className="text-xs text-slate-400 truncate max-w-[180px]">
                      {race.location}
                    </div>
                  </td>

                  {/* Percursos */}
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1 max-w-[140px]">
                      {race.distances.map((d: string, i: number) => (
                        <span 
                          key={i} 
                          className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Cronometragem */}
                  <td className="p-4 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                      <span>{race.chipCompany}</span>
                    </div>
                  </td>

                  {/* Status, Lote, Preço & Regulamento */}
                  <td className="p-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div>{getStatusBadge(race.status)}</div>
                      {race.currentBatch && (
                        <div className="text-[11px] text-slate-500 font-medium">
                          {race.currentBatch}
                        </div>
                      )}
                      {race.priceWithShirt && race.priceWithoutShirt ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] text-slate-500 font-medium">
                            Sem camisa: <strong className="text-slate-800">R$ {race.priceWithoutShirt.toFixed(2).replace('.', ',')}</strong>
                          </span>
                          <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 w-fit">
                            Com camisa: R$ {race.priceWithShirt.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      ) : (typeof race.price === 'number' || typeof race.priceFrom === 'number') ? (
                        <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-900 border border-emerald-200/90 px-2 py-0.5 rounded-lg text-xs font-black">
                          <span>R$ {(race.price ?? race.priceFrom)!.toFixed(2).replace('.', ',')}</span>
                        </div>
                      ) : null}
                      {(race.regulationUrl || race.rulesUrl) && (
                        <a 
                          href={race.regulationUrl || race.rulesUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-700 hover:text-orange-900 hover:underline pt-0.5"
                          title="Abrir Regulamento Oficial em PDF"
                        >
                          <FileText className="w-3 h-3 text-orange-600 flex-shrink-0" />
                          <span>Regulamento (PDF)</span>
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Ação / Inscrição */}
                  <td className="p-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Botão de Inscrição */}
                      {race.status === 'open' || race.status === 'closing_soon' ? (
                        onOpenRegistration ? (
                          <button
                            onClick={() => onOpenRegistration(race)}
                            className="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                          >
                            <span>Inscrever-se</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : (
                          <a
                            href={race.registrationUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                          >
                            <span>Inscrever-se</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )
                      ) : race.status === 'confirmed' || race.status === 'soon' ? (
                        <button
                          onClick={() => onSelectRace(race)}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold transition cursor-pointer"
                          title="Aguardando liberação do link oficial de inscrição"
                        >
                          Inscrições em Breve 🔔
                        </button>
                      ) : race.status === 'finished' ? (
                        race.resultsUrl ? (
                          <a
                            href={race.resultsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black shadow-sm flex items-center gap-1 transition active:scale-95 cursor-pointer"
                            title="Abrir resultados oficiais no site de cronometragem"
                          >
                            <span>Resultados ↗</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="px-3 py-1.5 bg-slate-100 text-slate-400 border border-slate-200 rounded-xl text-xs font-bold">
                            Concluída
                          </span>
                        )
                      ) : (
                        <span className="px-3 py-1.5 bg-slate-100 text-slate-400 border border-slate-200 rounded-xl text-xs font-bold">
                          Encerrado
                        </span>
                      )}

                      {/* Destacar no Topo */}
                      {onToggleFeatured && (
                        <button
                          onClick={() => onToggleFeatured(race.id)}
                          className={`p-2 rounded-xl transition cursor-pointer ${
                            race.featured 
                              ? 'text-amber-500 bg-amber-50 hover:bg-amber-100 ring-1 ring-amber-300' 
                              : 'text-slate-300 hover:text-amber-500 hover:bg-amber-50'
                          }`}
                          title={race.featured ? "Remover do topo" : "Fixar esta prova em destaque no topo"}
                        >
                          <Sparkles className={`w-4 h-4 ${race.featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                        </button>
                      )}

                      {/* Compartilhar WhatsApp */}
                      <button
                        onClick={() => onShareWhatsApp(race)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition cursor-pointer"
                        title="Enviar no grupo de WhatsApp"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      {/* Favoritar */}
                      <button
                        onClick={() => onToggleFavorite(race.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                        title={isFav ? 'Remover dos favoritos' : 'Salvar no meu calendário'}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
