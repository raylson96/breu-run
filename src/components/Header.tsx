import React from 'react';
import { Flame, MessageCircle, Settings, Trophy, Sparkles } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import type { AppNotification } from '../types/notification';

interface HeaderProps {
  onOpenAdminModal: () => void;
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
  onOpenAdminModal,
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
    <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-40 shadow-xl">
      {/* Top Banner / Notificação de Alerta */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 text-white text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-center gap-2">
          <Flame className="w-3.5 h-3.5 animate-pulse flex-shrink-0" />
          <span>
            <strong>Circuito Breu Run:</strong> {openRegistrationsCount} de {totalRaces} provas com inscrições abertas ou confirmadas
          </span>
          <button
            onClick={onOpenAlertModal}
            className="underline hover:text-amber-100 font-bold ml-1 cursor-pointer hidden sm:inline"
          >
            Receber avisos no WhatsApp
          </button>
        </div>
      </div>

      {/* Main Full-Width Header Bar */}
      <div className="w-full px-4 sm:px-6 lg:px-10 py-3.5 flex items-center justify-between">
        {/* Logo & Slogan */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-950/40">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-orange-400 bg-clip-text text-transparent">
                BREU RUN
              </span>
              <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                CALENDÁRIO OFICIAL
              </span>
            </div>
            <p className="text-slate-400 text-xs hidden md:block">
              Centralizando Chip Amazônia, Chip Breu Branco, Chip Pará, Chip Cronos e organizadores regionais
            </p>
          </div>
        </div>

        {/* Action Buttons (Full Desktop Space) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Real-Time Notification Bell */}
          <NotificationCenter
            notifications={notifications}
            onNotificationsChange={onNotificationsChange}
            onSelectRaceById={onSelectRaceById}
            onTriggerSync={onTriggerSync}
            isSyncing={isSyncing}
          />

          {/* Athlete Profile Button */}
          <button
            onClick={onOpenProfileModal}
            className={`flex items-center gap-1.5 text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition shadow-sm active:scale-95 cursor-pointer border ${
              hasAthleteProfile
                ? 'bg-slate-900 hover:bg-slate-800 text-emerald-400 border-emerald-500/40'
                : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white border-transparent'
            }`}
            title="Meu perfil e dados de corredor"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="hidden md:inline">
              {hasAthleteProfile ? 'Meu Perfil' : 'Cadastrar Perfil'}
            </span>
            <span className="md:hidden">
              {hasAthleteProfile ? 'Perfil' : 'Cadastro'}
            </span>
            {hasAthleteProfile && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            )}
          </button>

          {/* VIP WhatsApp Button */}
          <button
            onClick={onOpenAlertModal}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition shadow-md shadow-emerald-950/30 active:scale-95 cursor-pointer"
            title="Receber avisos no WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Grupo VIP WhatsApp</span>
            <span className="sm:hidden">WhatsApp</span>
          </button>

          {/* Admin Panel Button (AI Calendar Import + Link Management) */}
          <button
            onClick={onOpenAdminModal}
            className="flex items-center gap-2 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-750 text-orange-400 border border-slate-700 text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition shadow-sm active:scale-95 cursor-pointer"
            title="Central do Administrador (Upar imagem do calendário, Prompt IA e Gerenciar Links)"
          >
            <Settings className="w-4 h-4 text-orange-400" />
            <span className="hidden md:inline">Painel Admin</span>
            <span className="md:hidden">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};
