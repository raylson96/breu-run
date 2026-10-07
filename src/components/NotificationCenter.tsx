import React, { useState, useRef, useEffect } from 'react';
import type { AppNotification } from '../types/notification';
import { 
  Bell, 
  Sparkles, 
  Zap, 
  Tag, 
  Clock, 
  CheckCheck, 
  RefreshCw, 
  ShieldCheck 
} from 'lucide-react';
import { 
  markAsRead, 
  markAllAsRead, 
  getUnreadCount, 
  formatTimeAgo 
} from '../services/notificationService';

interface NotificationCenterProps {
  notifications: AppNotification[];
  onNotificationsChange: (updated: AppNotification[]) => void;
  onSelectRaceById?: (raceId: string) => void;
  onTriggerSync?: () => void;
  isSyncing?: boolean;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onNotificationsChange,
  onSelectRaceById,
  onTriggerSync,
  isSyncing = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'races' | 'admin'>('races');
  const containerRef = useRef<HTMLDivElement>(null);

  const athleteNotifications = notifications.filter((n) => n.type !== 'SYNC_SUCCESS');
  const adminNotifications = notifications.filter((n) => n.type === 'SYNC_SUCCESS');

  const unreadAthleteCount = athleteNotifications.filter((n) => !n.read).length;
  const unreadAdminCount = adminNotifications.filter((n) => !n.read).length;
  const unreadCount = getUnreadCount(notifications);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAllRead = () => {
    const updated = markAllAsRead();
    onNotificationsChange(updated);
  };

  const handleItemClick = (notification: AppNotification) => {
    if (!notification.read) {
      const updated = markAsRead(notification.id);
      onNotificationsChange(updated);
    }
    const target = notification.raceId || notification.title;
    if (target && onSelectRaceById) {
      onSelectRaceById(target);
      setIsOpen(false);
    }
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'NEW_RACE':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'REGISTRATION_OPENED':
        return <Zap className="w-4 h-4 text-emerald-500" />;
      case 'BATCH_UPDATE':
        return <Tag className="w-4 h-4 text-orange-500" />;
      case 'SYNC_SUCCESS':
        return <ShieldCheck className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="relative z-[80]" ref={containerRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition cursor-pointer flex items-center justify-center active:scale-95 shadow-xs"
        title="Central de Avisos e Atualizações Automáticas"
      >
        <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-600 to-orange-600 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-950 shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel com z-index alto e responsividade perfeita */}
      {isOpen && (
        <div className="fixed sm:absolute right-2 sm:right-0 top-14 sm:top-full mt-1.5 w-[calc(100vw-1rem)] sm:w-96 max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-600/30 text-orange-400 flex items-center justify-center">
                <Bell className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <h4 className="font-black text-sm text-white tracking-tight">
                  Atualizações em Tempo Real
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Robô de Sincronização Ativo</span>
                </div>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 font-semibold transition cursor-pointer hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Ler todas</span>
              </button>
            )}
          </div>

          {/* Tabs: Corridas vs Admin */}
          <div className="flex border-b border-slate-200 bg-slate-100/70 p-1">
            <button
              onClick={() => setActiveTab('races')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'races'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>Avisos de Corridas</span>
              {unreadAthleteCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-orange-600" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>Admin & Sistema</span>
              {unreadAdminCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-blue-600" />
              )}
            </button>
          </div>

          {/* Quick Explanatory Banner */}
          <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 p-2.5 border-b border-orange-100 flex items-start gap-2 text-xs text-slate-700">
            {activeTab === 'races' ? (
              <>
                <Zap className="w-3.5 h-3.5 text-orange-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 leading-snug">
                  <strong>Para Atletas:</strong> Alertas de novas provas lançadas, abertura de inscrições e viradas de lote.
                </p>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 leading-snug">
                  <strong>Painel do Administrador:</strong> Relatórios da sincronização dos 4 chips (Chip Amazônia, Breu Branco, Pará e Cronos).
                </p>
              </>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {((activeTab === 'races' ? athleteNotifications : adminNotifications).length === 0) ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                {activeTab === 'races' 
                  ? 'Nenhum aviso de corrida recente.' 
                  : 'Nenhum registro técnico de sincronização ainda.'}
              </div>
            ) : (
              (activeTab === 'races' ? athleteNotifications : adminNotifications).map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`p-3.5 hover:bg-slate-50 transition cursor-pointer flex items-start gap-3 ${
                    !n.read ? (activeTab === 'races' ? 'bg-orange-50/40' : 'bg-blue-50/40') : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 flex-shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h5 className={`text-xs truncate ${!n.read ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                        {n.title}
                      </h5>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap flex items-center gap-1 font-medium">
                        <Clock className="w-2.5 h-2.5" />
                        {formatTimeAgo(n.timestamp)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5">
                      {n.chipCompany && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {n.chipCompany}
                        </span>
                      )}
                      {n.raceId && (
                        <span className="text-[10px] font-bold text-orange-600 flex items-center gap-0.5 hover:underline">
                          Ver evento ↗
                        </span>
                      )}
                    </div>
                  </div>

                  {!n.read && (
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                      activeTab === 'races' ? 'bg-orange-600' : 'bg-blue-600'
                    }`} />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer with Manual Sync Trigger */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-medium">
              Monitora: Amazônia • Pará • Breu Branco • Cronos
            </span>

            {onTriggerSync && (
              <button
                onClick={onTriggerSync}
                disabled={isSyncing}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Varrendo...' : 'Verificar Agora'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
