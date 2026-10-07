/**
 * Rota de API para disparo do Cron Job de Sincronização
 * Compatível com Next.js (App Router: app/api/cron/sync-races/route.ts),
 * Vercel Serverless Functions ou Express / Fastify.
 */

import { runSyncRacesJob } from '../src/modules/sync/orchestrator/syncOrchestrator';
import { InMemoryRaceRepository } from '../src/modules/sync/repositories/RaceRepository';

// Chave secreta esperada para autorizar o disparo do Cron
const CRON_SECRET = process.env.CRON_SECRET || 'para-run-cron-secret-key-2026';

/**
 * Handler padrão para Next.js App Router (POST /api/cron/sync-races)
 */
export async function POST(request: Request) {
  try {
    // 1. Validação de Segurança via Bearer Token
    const authHeader = request.headers.get('authorization');
    const customHeader = request.headers.get('x-cron-secret');
    const token = authHeader?.replace('Bearer ', '') || customHeader;

    if (!token || token !== CRON_SECRET) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Não autorizado: Token CRON_SECRET inválido ou ausente.'
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 2. Execução do Job de Sincronização
    // Nota: Em produção com Prisma, passe: new PrismaRaceRepository(prisma)
    const repository = new InMemoryRaceRepository();
    const summary = await runSyncRacesJob({ repository });

    // 3. Resposta com métricas estruturadas
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sincronização dos 4 portais de cronometragem executada com sucesso!',
        summary
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[CronAPI] Falha crítica na sincronização:', message);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erro interno ao processar sincronização',
        details: message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Permite também disparo via GET para facilidade de testes em navegadores/healthcheck
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');

  if (key !== CRON_SECRET) {
    return new Response(
      JSON.stringify({ error: 'Chave secreta de query param inválida.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return POST(request);
}
