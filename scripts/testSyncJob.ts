import { runSyncRacesJob } from '../src/modules/sync/orchestrator/syncOrchestrator.ts';
import { InMemoryRaceRepository } from '../src/modules/sync/repositories/RaceRepository.ts';

async function testSyncJob() {
  console.log('Testing full runSyncRacesJob...');
  const repository = new InMemoryRaceRepository([]);

  const summary = await runSyncRacesJob({
    repository,
    onProgress: (stage, current, total) => {
      console.log(`Progress: ${stage} (${current}/${total})`);
    }
  });

  console.log('\n=== SYNC SUMMARY ===');
  console.log('Total scraped:', summary.totalScraped);
  console.log('Inserted:', summary.insertedCount);
  console.log('Updated:', summary.updatedCount);
  console.log('Errors:', summary.errorCount);
  console.log('Duration:', summary.durationMs, 'ms');
  console.log('Sites:', summary.sites.map(s => `${s.name}: ${s.success ? `${s.foundCount} events` : `ERROR: ${s.error}`}`));

  const stored = await repository.findAll();
  console.log('\nTotal in repository:', stored.length);
  console.log('First 5 stored races:');
  stored.slice(0, 5).forEach((r, i) => {
    console.log(`[${i + 1}] "${r.title}" | ${r.eventDate} | ${r.city}/PA | ${r.timingCompany} | Status: ${r.status} | Link: ${r.registrationUrl}`);
  });
}

testSyncJob().catch(console.error);
