import React from 'react';
import { MessageCircle, Trophy, Sparkles } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import type { AppNotification } from '../types/notification';

interface HeaderProps {
  onOpenAdminModal?: () => void;
  onOpenAlertModal: () => void;
  onOpenProfileModal: () => void;
  hasAthleteProfile: boolean;
  totalRaces: number;
  openRegistrationsCount: number;
  notifications: AppNotification[];
  onNotificationsChange: (updated: AppNotification[]) => void;
  onSelectRaceById?: (raceId: string) => void;
  onTriggerSync?: () => void;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAlertModal,
  onOpenProfileModal,
  hasAthleteProfile,
  totalRaces,
  openRegistrationsCount,
  notifications,
  onNotificationsChange,
  onSelectRaceById,
  onTriggerSync,
  isSyncing
}) => {
  return (
    <header className="bg-slate-950/95 backdrop-blur-md text-white border-b border-slate-800/90 sticky top-0 z-[70] shadow-xl w-full">
      {/* Container Responsivo sem Overflow */}
      <div className="w-full max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        {/* Logo & Marca Breu Run */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-950/40 flex-shrink-0">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-black text-lg sm:text-2xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-orange-400 bg-clip-text text-transparent">
                BREU RUN
              </span>
            </div>
            <p className="text-slate-400 text-[11px] hidden md:block">
              Central oficial de chips de corrida • {totalRaces} provas ({openRegistrationsCount} abertas)
            </p>
          </div>
        </div>

        {/* Botões de Ação com Layout Seguro no Mobile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          {/* Central de Notificações com Sininho */}
          <NotificationCenter
            notifications={notifications}
            onNotificationsChange={onNotificationsChange}
            onSelectRaceById={onSelectRaceById}
            onTriggerSync={onTriggerSync}
            isSyncing={isSyncing}
          />

          {/* Botão Perfil do Atleta */}
          <button
            onClick={onOpenProfileModal}
            className={`flex items-center gap-1 text-xs sm:text-sm font-bold px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl transition shadow-sm active:scale-95 cursor-pointer border ${
              hasAthleteProfile
                ? 'bg-slate-900 hover:bg-slate-800 text-emerald-400 border-emerald-500/40'
                : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white border-transparent'
            }`}
            title="Meu perfil e dados de corredor"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 flex-shrink-0" />
            <span className="hidden sm:inline">
              {hasAthleteProfile ? 'Meu Perfil' : 'Cadastrar'}
            </span>
            {hasAthleteProfile && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5 hidden sm:inline" />
            )}
          </button>

          {/* VIP WhatsApp Button - Compacto no Mobile para não estourar a tela */}
          <button
            onClick={onOpenAlertModal}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition shadow-md shadow-emerald-950/30 active:scale-95 cursor-pointer flex-shrink-0"
            title="Receber avisos no WhatsApp VIP"
          >
            <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="hidden sm:inline">WhatsApp VIP</span>
            <span className="sm:hidden text-xs">VIP</span>
          </button>
        </div>
      </div>
    </header>
  );
};
