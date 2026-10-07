import { runSyncRacesJob } from '../modules/sync/orchestrator/syncOrchestrator';
import { LocalStorageRaceRepository } from '../modules/sync/repositories/RaceRepository';
import { addNotification } from './notificationService';
import type { Race } from '../types/race';

const LAST_SYNC_KEY = 'para_run_last_sync_timestamp';

export interface AutoSyncStatus {
  lastSync: string | null; // ISO string
  isSyncing: boolean;
  statusText: string;
}

export function getLastSyncTime(): string | null {
  return localStorage.getItem(LAST_SYNC_KEY);
}

export function formatLastSyncTime(isoString: string | null): string {
  if (!isoString) return 'Nunca executada';
  try {
    const date = new Date(isoString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month} às ${hours}:${minutes}`;
  } catch {
    return 'Data desconhecida';
  }
}

/**
 * Executa a sincronização inteligente automática comparando as provas antes e depois
 * e gerando alertas em tempo real para os atletas e administradores.
 */
export async function executeAutoSync(
  currentRaces: Race[],
  onUpdateRaces: (updated: Race[]) => void,
  onStatusChange?: (status: string) => void
): Promise<{ newCount: number; updatedCount: number }> {
  if (onStatusChange) onStatusChange('Verificando os 4 sites de cronometragem...');

  const repository = new LocalStorageRaceRepository();
  const previousMap = new Map<string, Race>();
  currentRaces.forEach((r) => {
    previousMap.set(r.title.toLowerCase().trim(), r);
  });

  try {
    const summary = await runSyncRacesJob({
      repository,
      onProgress: (stage) => {
        if (onStatusChange) onStatusChange(stage);
      }
    });

    const nowIso = new Date().toISOString();
    localStorage.setItem(LAST_SYNC_KEY, nowIso);

    // Carrega a nova lista persistida
    const rawStored = localStorage.getItem('para_run_races_v4');
    if (rawStored) {
      const freshRaces: Race[] = JSON.parse(rawStored);
      onUpdateRaces(freshRaces);

      // Detecta novos eventos ou abertura de links
      let detectedNew = 0;
      let detectedOpened = 0;

      freshRaces.forEach((fresh) => {
        const prev = previousMap.get(fresh.title.toLowerCase().trim());
        if (!prev) {
          detectedNew++;
          addNotification({
            type: 'NEW_RACE',
            title: `Nova Prova: ${fresh.title}`,
            message: `Cadastrada em ${fresh.city}/PA com cronometragem ${fresh.chipCompany}.`,
            raceId: fresh.id,
            chipCompany: fresh.chipCompany
          });
        } else if (prev.status !== 'open' && (fresh.status === 'open' || fresh.status === 'closing_soon')) {
          detectedOpened++;
          addNotification({
            type: 'REGISTRATION_OPENED',
            title: `Inscrições Abertas: ${fresh.title}`,
            message: `O link oficial de inscrição foi liberado! Lote: ${fresh.currentBatch || '1º Lote'}.`,
            raceId: fresh.id,
            chipCompany: fresh.chipCompany
          });
        }
      });

      if (summary.insertedCount > 0 || summary.updatedCount > 0 || detectedNew > 0 || detectedOpened > 0) {
        addNotification({
          type: 'SYNC_SUCCESS',
          title: 'Sincronização Concluída com Sucesso',
          message: `${freshRaces.length} provas verificadas nos 4 sites oficiais. ${detectedNew} novas corridas e ${detectedOpened} novas inscrições abertas.`
        });
      }
    }

    return {
      newCount: summary.insertedCount,
      updatedCount: summary.updatedCount
    };
  } catch (error) {
    console.error('Falha no auto-sync:', error);
    throw error;
  }
}
