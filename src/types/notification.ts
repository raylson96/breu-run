export type NotificationType = 
  | 'NEW_RACE'              // Nova corrida cadastrada nos sites de chip
  | 'REGISTRATION_OPENED'   // Inscrições acabaram de abrir
  | 'BATCH_UPDATE'          // Virada de lote ou novo preço
  | 'SYNC_SUCCESS'          // Varredura dos 4 sites concluída
  | 'CALENDAR_ALERT';       // Alerta de proximidade de prova

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string; // ISO string
  read: boolean;
  raceId?: string;
  chipCompany?: string;
  url?: string;
}
