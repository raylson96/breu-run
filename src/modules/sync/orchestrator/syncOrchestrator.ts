import type { 
  SyncSummary, 
  ScraperSiteSummary, 
  ExtractedRace, 
  RaceRecord 
} from '../types';
import type { RaceScraperInterface } from '../scrapers/RaceScraperInterface';
import { StandardChipScraper } from '../scrapers/StandardChipScraper';
import { SuperaChronosScraper } from '../scrapers/SuperaChronosScraper';
import { matchExistingRace, mergeRaceData } from '../deduplication/matcher';
import { slugify } from '../utils/slugify';
import type { RaceRepositoryInterface } from '../repositories/RaceRepository';

export interface SyncJobOptions {
  repository: RaceRepositoryInterface;
  scrapers?: RaceScraperInterface[];
  onProgress?: (stage: string, current: number, total: number) => void;
}

/**
 * Cria a lista padrão dos 4 scrapers configurados para o Pará
 */
export function getDefaultScrapers(): RaceScraperInterface[] {
  return [
    new StandardChipScraper(
      'CHIP_AMAZONIA',
      'Chip Amazônia',
      'https://chipamazonia.com.br'
    ),
    new StandardChipScraper(
      'CHIP_PARA',
      'Chip Pará',
      'https://www.chippara.com.br'
    ),
    new StandardChipScraper(
      'CHIP_BRANCO',
      'Chip Breu Branco',
      'https://www.chipbreubranco.com.br'
    ),
    new SuperaChronosScraper(
      'https://www.superachipcrono.com.br'
    )
  ];
}

/**
 * Orquestrador principal de Sincronização e Web Scraping
 * Executa as 4 varreduras em paralelo, cruza e deduplica contra o banco de dados.
 */
export async function runSyncRacesJob(
  options: SyncJobOptions
): Promise<SyncSummary> {
  const startTime = Date.now();
  const scrapers = options.scrapers || getDefaultScrapers();
  const repository = options.repository;

  console.info(`[SyncJob] Iniciando job de sincronização para ${scrapers.length} portais de cronometragem...`);

  const siteSummaries: ScraperSiteSummary[] = [];
  const allExtractedRaces: ExtractedRace[] = [];

  // 1. Execução paralela com controle de concorrência e isolamento de falhas
  const scrapePromises = scrapers.map(async (scraper) => {
    const siteStart = Date.now();
    try {
      const extracted = await scraper.scrape();
      const siteSummary: ScraperSiteSummary = {
        company: scraper.company,
        name: scraper.name,
        sourceUrl: scraper.sourceUrl,
        success: true,
        foundCount: extracted.length,
        durationMs: Date.now() - siteStart
      };
      return { success: true, extracted, siteSummary };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`[SyncJob] Erro na raspagem de ${scraper.name} (${scraper.sourceUrl}): ${errorMsg}`);
      const siteSummary: ScraperSiteSummary = {
        company: scraper.company,
        name: scraper.name,
        sourceUrl: scraper.sourceUrl,
        success: false,
        foundCount: 0,
        error: errorMsg,
        durationMs: Date.now() - siteStart
      };
      return { success: false, extracted: [] as ExtractedRace[], siteSummary };
    }
  });

  const results = await Promise.all(scrapePromises);

  results.forEach((res) => {
    siteSummaries.push(res.siteSummary);
    if (res.success && res.extracted.length > 0) {
      allExtractedRaces.push(...res.extracted);
    }
  });

  console.info(`[SyncJob] Raspagem finalizada. Total de ${allExtractedRaces.length} provas capturadas. Iniciando deduplicação...`);

  // 2. Busca do estado atual do banco de dados
  const existingRaces = await repository.findAll();
  const workingRacesList: RaceRecord[] = [...existingRaces];

  let insertedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  // 3. Pipeline de Deduplicação e Persistência
  for (let i = 0; i < allExtractedRaces.length; i++) {
    const incoming = allExtractedRaces[i];
    if (options.onProgress) {
      options.onProgress('Deduplicando e persistindo', i + 1, allExtractedRaces.length);
    }

    const match = matchExistingRace(incoming, workingRacesList);

    if (match.isMatch && match.matchedRace) {
      // CORRIDA EXISTENTE: Enriquecer com link oficial e dados atualizados
      const existing = match.matchedRace;
      const updatePayload = mergeRaceData(existing, incoming);

      const updatedRecord = await repository.update(existing.id, updatePayload);

      // Atualiza a lista em memória de trabalho para refletir as mudanças no lote
      const idx = workingRacesList.findIndex((r) => r.id === existing.id);
      if (idx !== -1) {
        workingRacesList[idx] = updatedRecord;
      }

      console.info(`[SyncJob] 🔄 Atualizada: "${existing.title}" -> Link: ${incoming.registrationUrl} (${match.matchReasons.join(', ')})`);
      updatedCount++;
    } else {
      // NOVA CORRIDA: Inserir com slug único e dados limpos
      let candidateSlug = slugify(incoming.title, incoming.eventDate);
      let slugCount = 1;

      // Garantir slug único
      while (workingRacesList.some((r) => r.slug === candidateSlug)) {
        candidateSlug = `${candidateSlug}-${slugCount++}`;
      }

      const newRecord = await repository.create({
        title: incoming.title,
        slug: candidateSlug,
        eventDate: incoming.eventDate,
        eventTime: incoming.eventTime || '06:00',
        city: incoming.city,
        state: incoming.state || 'PA',
        location: incoming.location || 'Centro',
        timingCompany: incoming.timingCompany,
        registrationUrl: incoming.registrationUrl,
        bannerUrl: incoming.bannerUrl,
        rulesUrl: incoming.regulationUrl || incoming.rulesUrl || null,
        regulationUrl: incoming.regulationUrl || incoming.rulesUrl || null,
        distances: incoming.distances,
        status: incoming.status,
        currentBatch: incoming.currentBatch || (incoming.status === 'OPEN' ? '1º Lote Aberto' : 'Inscrições em Breve'),
        price: incoming.price ?? incoming.priceFrom ?? null,
        priceFrom: incoming.price ?? incoming.priceFrom ?? undefined,
        isRegistrationOpen: incoming.isRegistrationOpen ?? (incoming.status === 'OPEN' && Boolean(incoming.registrationUrl)),
        featured: false,
        organizer: incoming.organizer || 'Organização Oficial',
        rawData: incoming.rawData
      });

      workingRacesList.push(newRecord);
      console.info(`[SyncJob] ➕ Nova cadastrada: "${incoming.title}" (${incoming.city}/PA - ${incoming.eventDate})`);
      insertedCount++;
    }
  }

  const durationMs = Date.now() - startTime;
  const errorCount = siteSummaries.filter((s) => !s.success).length;

  const summary: SyncSummary = {
    totalScraped: allExtractedRaces.length,
    insertedCount,
    updatedCount,
    skippedCount,
    errorCount,
    durationMs,
    sites: siteSummaries,
    timestamp: new Date().toISOString()
  };

  console.info(`[SyncJob] ✅ Finalizado em ${durationMs}ms: ${insertedCount} novas inseridas, ${updatedCount} atualizadas, ${errorCount} erros.`);
  return summary;
}
