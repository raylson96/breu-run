import * as cheerio from 'cheerio';
import type { ExtractedRace } from '../types';
import type { RaceScraperInterface } from './RaceScraperInterface';
import { fetchHtmlWithRetry, fetchJsonWithRetry } from '../utils/httpClient';
import { parseChipPayload } from './chipDataExtractor';
import { enrichRaceDetails } from './raceDetailsEnricher';
import { VERIFIED_CHIP_SNAPSHOT } from '../data/verifiedRacesSnapshot';

/**
 * Scraper dedicado e resiliente para o portal da Supera Chip Chronos
 * (https://www.superachipcrono.com.br/eventos)
 * 
 * Executa raspagem em 2 estágios:
 * 1. Extração de listagem
 * 2. Navegação profunda na página interna de cada evento para captura de:
 *    - Percursos/Distâncias confirmadas
 *    - Preço/Lote atual
 *    - Regulamento oficial em PDF
 *    - Link oficial de checkout (bloqueando resultados/tempos)
 */
export class SuperaChronosScraper implements RaceScraperInterface {
  readonly company = 'SUPERA_CHRONOS' as const;
  readonly name = 'Supera Chip Chronos';
  readonly sourceUrl: string;
  private readonly baseUrl: string;

  constructor(
    baseUrl = 'https://www.superachipcrono.com.br',
    eventsPath = '/eventos'
  ) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.sourceUrl = `${this.baseUrl}${eventsPath.startsWith('/') ? eventsPath : `/${eventsPath}`}`;
  }

  async scrape(): Promise<ExtractedRace[]> {
    console.info(`[${this.name}] Iniciando extração dedicada em ${this.sourceUrl}...`);
    let extracted: ExtractedRace[] = [];

    try {
      const html = await fetchHtmlWithRetry(this.sourceUrl);

      // 1. Extração direta de scripts inline
      const inlineRaces = parseChipPayload(html, this.baseUrl, this.company, this.name);
      extracted.push(...inlineRaces);

      // 2. Extração de arquivo JSON dinâmico (url_arquivo_events)
      const jsonMatch = html.match(/url_arquivo_events\s*=\s*['"]([^'"]+)['"]/);
      if (jsonMatch && jsonMatch[1]) {
        const jsonUrl = jsonMatch[1];
        try {
          console.info(`[${this.name}] Detectado endpoint de eventos JSON: ${jsonUrl}`);
          const jsonData = await fetchJsonWithRetry(jsonUrl);
          const jsonRaces = parseChipPayload(jsonData, this.baseUrl, this.company, this.name);
          extracted.push(...jsonRaces);
        } catch (jsonErr) {
          console.warn(`[${this.name}] Falha ao buscar arquivo JSON (${jsonUrl}):`, jsonErr);
        }
      }

      // 3. Fallback de parsing DOM
      if (extracted.length === 0) {
        const domRaces = this.scrapeDomFallback(html);
        extracted.push(...domRaces);
      }
    } catch (networkErr) {
      console.warn(`[${this.name}] Erro na conexão direta ou CORS. Utilizando snapshot verificado como contingência:`, networkErr);
      const fallbackRaces = VERIFIED_CHIP_SNAPSHOT.filter((r) => r.timingCompany === this.company);
      if (fallbackRaces.length > 0) {
        console.info(`[${this.name}] Carregadas ${fallbackRaces.length} provas do snapshot verificado.`);
        return fallbackRaces;
      }
    }

    if (extracted.length === 0) {
      console.warn(`[${this.name}] Nenhuma prova encontrada via scrape online. Aplicando snapshot verificado.`);
      const fallbackRaces = VERIFIED_CHIP_SNAPSHOT.filter((r) => r.timingCompany === this.company);
      return fallbackRaces;
    }

    const unique = this.deduplicateExtracted(extracted);

    // 4. Navegação profunda na página interna de cada evento
    console.info(`[${this.name}] Navegando nas páginas internas de ${unique.length} eventos para extrair percursos, preços e regulamentos...`);
    const enrichedRaces: ExtractedRace[] = [];

    for (const race of unique) {
      try {
        const enriched = await enrichRaceDetails(race, this.baseUrl);
        enrichedRaces.push(enriched);
      } catch (err) {
        console.warn(`[${this.name}] Falha ao enriquecer "${race.title}":`, err);
        enrichedRaces.push(race);
      }
    }

    console.info(`[${this.name}] Concluído com sucesso. ${enrichedRaces.length} provas extraídas e enriquecidas.`);
    return enrichedRaces;
  }

  private deduplicateExtracted(list: ExtractedRace[]): ExtractedRace[] {
    const seen = new Set<string>();
    const result: ExtractedRace[] = [];

    for (const item of list) {
      const key = `${item.title.toLowerCase().trim()}_${item.eventDate}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(item);
      }
    }

    return result;
  }

  private scrapeDomFallback(html: string): ExtractedRace[] {
    const $ = cheerio.load(html);
    const races: ExtractedRace[] = [];
    const seenUrls = new Set<string>();

    const cardSelectors = [
      '.evento-item',
      '.event-box',
      '.evento-card',
      '.provas-card',
      '.card-evento',
      '.card'
    ];

    let items = $(cardSelectors.join(', '));
    if (items.length === 0) {
      items = $('a[href*="/evento"], a[href*="/inscricao"]').parent();
    }

    items.each((_, element) => {
      const $card = $(element);
      const text = $card.text().trim();
      if (!text || text.length < 10) return;

      let href = $card.find('a[href*="/evento"], a[href*="/inscricao"]').first().attr('href') || '';
      if (!href) return;

      let absoluteUrl = href;
      try {
        absoluteUrl = new URL(href, this.baseUrl).toString();
      } catch {
        return;
      }

      if (seenUrls.has(absoluteUrl)) return;
      seenUrls.add(absoluteUrl);

      const title = $card.find('h1, h2, h3, h4, h5, .title, strong').first().text().trim() || 'Corrida Supera Chronos';

      races.push({
        title,
        eventDate: new Date().toISOString().split('T')[0],
        eventTime: '06:00',
        city: 'Cametá',
        state: 'PA',
        timingCompany: this.company,
        registrationUrl: null, // Inicialmente null até verificação da página interna
        distances: ['5 km'],
        status: 'UPCOMING',
        currentBatch: 'Inscrições em Breve',
        price: null,
        isRegistrationOpen: false,
        organizer: 'Supera Chip Chronos',
        rawData: {
          scrapedAt: new Date().toISOString(),
          extractedFrom: this.sourceUrl,
          rawSnippet: text.slice(0, 100),
          relativeUrl: href
        }
      });
    });

    return races;
  }
}
