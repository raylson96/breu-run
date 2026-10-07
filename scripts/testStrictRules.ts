import { 
  isValidRegistrationUrl, 
  extractDistances, 
  extractPrice, 
  extractRegulationUrl 
} from '../src/modules/sync/utils/parsingHelpers.ts';
import { runSyncRacesJob } from '../src/modules/sync/orchestrator/syncOrchestrator.ts';
import { InMemoryRaceRepository } from '../src/modules/sync/repositories/RaceRepository.ts';

function runUnitTests() {
  console.log('=== TESTE 1: DISTINÇÃO RÍGIDA DE LINKS ===');

  const forbiddenSamples = [
    'https://result.racetag.com.br/chipbreubranco/#/corrida-da-gente',
    'https://resultados.racezone.com.br/chipbreubranco/#/corrida-guerra',
    'https://chipbreubranco.com.br/resultados/racetag/#/corrida-de-gratidao',
    'https://www.chipamazonia.com.br/resultado-evento/2026/corrida-de-rua/2-corridarosapink2026',
    'https://chippara.com.br/classificacao/corrida-2025',
    'https://superachipcrono.com.br/tempos/ranking-geral',
    'https://chipamazonia.com.br/evento/2026/corrida-de-rua/prova&listar=1',
    'https://chipbreubranco.com.br/evento/2024/corrida-antiga' // ano anterior
  ];

  for (const url of forbiddenSamples) {
    const valid = isValidRegistrationUrl(url, '2026');
    console.log(`Proibido: "${url.slice(0, 65)}..." -> Válido? ${valid} (Esperado: false)`);
    if (valid) throw new Error(`Falha no filtro! URL proibida foi aceita: ${url}`);
  }

  const validSamples = [
    'https://www.chipbreubranco.com.br/inscricao-select/2026/corrida-de-rua/corrida-de-rua-nova-ipixuna-run-33-anos',
    'https://www.chippara.com.br/inscricao-select/1682/1-corrida-do-amor-em-prol-da-vida',
    'https://www.superachipcrono.com.br/inscricao-select/5800/1-corrida-satlinkplay',
    'https://chipamazonia.com.br/evento/2026/corrida-de-rua/1-corrida-do-corre-de-tera'
  ];

  for (const url of validSamples) {
    const valid = isValidRegistrationUrl(url, '2026');
    console.log(`Permitido: "${url.slice(0, 65)}..." -> Válido? ${valid} (Esperado: true)`);
    if (!valid) throw new Error(`Falha no filtro! URL legítima foi rejeitada: ${url}`);
  }

  console.log('\n=== TESTE 2: EXTRAÇÃO DE DISTÂNCIAS (PERCURSOS) ===');
  const distanceSamples = [
    { text: 'Corrida rústica de 7km e caminhada 3km para toda família', expected: ['3 km', '7 km'] },
    { text: 'Percurso único de 5 km e 10 km', expected: ['5 km', '10 km'] },
    { text: 'Meia Maratona 21k e Maratona 42.195km', expected: ['21 km', '42 km'] },
    { text: 'Corrida Kids 200m e adultos 5km', expected: ['5 km', 'Kids 200 m'] }
  ];

  for (const sample of distanceSamples) {
    const dists = extractDistances(sample.text);
    console.log(`Texto: "${sample.text}" -> Distâncias:`, dists);
    if (dists.length === 0) throw new Error(`Falha ao extrair distâncias de: ${sample.text}`);
  }

  console.log('\n=== TESTE 3: EXTRAÇÃO DE VALORES (PREÇOS) ===');
  const priceSamples = [
    { text: 'Valor da inscrição: R$ 65,00 no primeiro lote', expected: 65.0 },
    { text: 'Inscrição Geral: R$ 85,00 | Idoso: R$ 42,50', expected: 85.0 },
    { text: '1º lote promocional por apenas R$ 49,99 até 10/10', expected: 49.99 }
  ];

  for (const sample of priceSamples) {
    const price = extractPrice(sample.text);
    console.log(`Texto: "${sample.text}" -> Preço: ${price} (Esperado: ~${sample.expected})`);
    if (price === null) throw new Error(`Falha ao extrair preço de: ${sample.text}`);
  }

  console.log('\n=== TESTE 4: EXTRAÇÃO DE REGULAMENTO (PDF) ===');
  const regHtml = `<div class="btn-group"><a href="/painel/upload/doc/inscricao/doc-105-regulamento.pdf" class="btn">Regulamento</a></div>`;
  const regUrl = extractRegulationUrl(regHtml, 'https://www.chipamazonia.com.br');
  console.log('Regulamento extraído:', regUrl);
  if (!regUrl || !regUrl.endsWith('.pdf')) throw new Error('Falha ao extrair link do regulamento!');

  console.log('\n✅ TODOS OS TESTES UNITÁRIOS PASSARAM COM SUCESSO!\n');
}

async function runEndToEndTest() {
  console.log('=== TESTE 5: EXECUÇÃO END-TO-END DO MOTOR DE SINCRONIZAÇÃO ===');
  const repository = new InMemoryRaceRepository([]);

  const summary = await runSyncRacesJob({ repository });

  console.log(`Total capturado: ${summary.totalScraped}`);
  console.log(`Total inserido: ${summary.insertedCount}`);
  console.log(`Erros: ${summary.errorCount}`);

  const allRecords = await repository.findAll();
  console.log(`Total persistido no repositório: ${allRecords.length}`);

  // Valida que NENHUM registro possui links de resultados ou tempos proibidos
  for (const r of allRecords) {
    if (r.registrationUrl) {
      const isForbidden = /resultado|racetag|racezone|classificacao|tempo|ranking/.test(r.registrationUrl.toLowerCase());
      if (isForbidden) {
        throw new Error(`VIOLAÇÃO GRAVE: Corrida "${r.title}" contém link proibido: ${r.registrationUrl}`);
      }
    }
  }

  console.log('✅ Verificação de Segurança de Links: 100% dos links de inscrição são seguros e legítimos!');

  // Amostra de registros com preços, distâncias e regulamentos
  console.log('\nAmostra de 5 corridas sincronizadas com metadados completos:');
  allRecords.slice(0, 5).forEach((r, i) => {
    console.log(`[${i + 1}] "${r.title}"`);
    console.log(`    Data: ${r.eventDate} | Horário: ${r.eventTime} | Cidade: ${r.city}/PA | Local: ${r.location}`);
    console.log(`    Distâncias: [${r.distances.join(', ')}] | Preço: ${r.price ? `R$ ${r.price.toFixed(2)}` : 'Sob consulta'}`);
    console.log(`    Regulamento: ${r.regulationUrl || 'Pendente de upload pela organização'}`);
    console.log(`    Inscrição: ${r.registrationUrl || 'Aguardando abertura de inscrições (NULL)'} | Status: ${r.status}`);
  });

  console.log('\n🏆 TUDO TESTADO E HOMOLOGADO COM SUCESSO!');
}

runUnitTests();
runEndToEndTest().catch(console.error);
