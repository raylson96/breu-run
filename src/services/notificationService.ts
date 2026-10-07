import type { AppNotification } from '../types/notification';

const NOTIFICATIONS_STORAGE_KEY = 'para_run_notifications_v1';

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-sync-1',
    type: 'SYNC_SUCCESS',
    title: 'Sincronização com 4 Chips Ativa',
    message: 'Varredura automática verificou Chip Amazônia, Chip Pará, Chip Breu Branco e Supera Cronos.',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    read: false,
    chipCompany: 'Todos os Chips'
  },
  {
    id: 'notif-batch-2',
    type: 'BATCH_UPDATE',
    title: 'Lote Atualizado: Box Eleven',
    message: '2ª Corrida Box Eleven atualizada para o 2º Lote vigente (R$ 79,90).',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    read: false,
    raceId: 'race-chip-10-2-corrida-de-rua-e-vi-open-da-box-eleven-2026-12-06',
    chipCompany: 'Chip Amazônia'
  },
  {
    id: 'notif-open-3',
    type: 'REGISTRATION_OPENED',
    title: 'Inscrições Abertas: Corre de Terça',
    message: '1ª Corrida do Corre de Terça liberou inscrições oficiais no site da cronometragem.',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    read: true,
    chipCompany: 'Chip Amazônia'
  }
];

export function getStoredNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) {
      saveNotifications(INITIAL_NOTIFICATIONS);
      return INITIAL_NOTIFICATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_NOTIFICATIONS;
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveNotifications(notifications: AppNotification[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch (e) {
    console.error('Falha ao salvar notificações', e);
  }
}

export function addNotification(notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): AppNotification {
  const current = getStoredNotifications();
  const newItem: AppNotification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    read: false
  };

  const updated = [newItem, ...current].slice(0, 50); // Mantém as 50 mais recentes
  saveNotifications(updated);
  return newItem;
}

export function markAsRead(id: string): AppNotification[] {
  const current = getStoredNotifications();
  const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveNotifications(updated);
  return updated;
}

export function markAllAsRead(): AppNotification[] {
  const current = getStoredNotifications();
  const updated = current.map((n) => ({ ...n, read: true }));
  saveNotifications(updated);
  return updated;
}

export function getUnreadCount(notifications: AppNotification[]): number {
  return notifications.filter((n) => !n.read).length;
}

export function formatTimeAgo(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Agora mesmo';
    if (diffMinutes < 60) return `Há ${diffMinutes} min`;
    if (diffHours < 24) return `Há ${diffHours}h`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays} dias`;

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  } catch {
    return 'Recente';
  }
}
