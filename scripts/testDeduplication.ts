import { runSyncRacesJob } from '../src/modules/sync/orchestrator/syncOrchestrator.ts';
import { InMemoryRaceRepository } from '../src/modules/sync/repositories/RaceRepository.ts';

async function testDeduplication() {
  const repository = new InMemoryRaceRepository([]);

  console.log('--- FIRST RUN ---');
  const run1 = await runSyncRacesJob({ repository });
  console.log(`Run 1: ${run1.insertedCount} inserted, ${run1.updatedCount} updated.`);

  console.log('\n--- SECOND RUN (IDEMPOTENCY TEST) ---');
  const run2 = await runSyncRacesJob({ repository });
  console.log(`Run 2: ${run2.insertedCount} inserted, ${run2.updatedCount} updated, ${run2.totalScraped} scraped.`);

  const stored = await repository.findAll();
  console.log(`Total records in repository after 2 runs: ${stored.length} (should remain exactly 73 without duplicates)`);
}

testDeduplication().catch(console.error);
