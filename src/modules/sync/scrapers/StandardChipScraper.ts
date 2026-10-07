import * as cheerio from 'cheerio';
import type { TimingCompany, ExtractedRace } from '../types';
import type { RaceScraperInterface } from './RaceScraperInterface';
import { fetchHtmlWithRetry, fetchJsonWithRetry } from '../utils/httpClient';
import { parseChipPayload } from './chipDataExtractor';
import { enrichRaceDetails } from './raceDetailsEnricher';
import { VERIFIED_CHIP_SNAPSHOT } from '../data/verifiedRacesSnapshot';

/**
 * Scraper padronizado e resiliente para os portais:
 * - Chip Amazônia (https://chipamazonia.com.br/eventos)
 * - Chip Pará (https://www.chippara.com.br/eventos)
 * - Chip Breu Branco (https://www.chipbreubranco.com.br/eventos)
 * 
 * Executa raspagem em 2 estágios:
 * 1. Extração de listagem e endpoints de eventos
 * 2. Navegação profunda na página interna de cada evento para captura de:
 *    - Percursos/Distâncias confirmadas
 *    - Preço/Lote atual
 *    - Regulamento oficial em PDF
 *    - Link oficial e ativo de checkout (banindo links de resultados passados)
 */
export class StandardChipScraper implements RaceScraperInterface {
  readonly company: TimingCompany;
  readonly name: string;
  readonly sourceUrl: string;
  private readonly baseUrl: string;

  constructor(
    company: TimingCompany,
    name: string,
    baseUrl: string,
    eventsPath = '/eventos'
  ) {
    this.company = company;
    this.name = name;
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.sourceUrl = `${this.baseUrl}${eventsPath.startsWith('/') ? eventsPath : `/${eventsPath}`}`;
  }

  async scrape(): Promise<ExtractedRace[]> {
    console.info(`[${this.name}] Iniciando extração inteligente em ${this.sourceUrl}...`);
    let extracted: ExtractedRace[] = [];

    try {
      const html = await fetchHtmlWithRetry(this.sourceUrl);

      // 1. Extração primária: procura listEventos.push embutidos no HTML
      const inlineRaces = parseChipPayload(html, this.baseUrl, this.company, this.name);
      extracted.push(...inlineRaces);

      // 2. Extração secundária: procura endpoint dinâmico url_arquivo_events
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

      // 3. Fallback DOM (Cheerio): se os métodos acima não retornarem nada
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

    // Deduplicação primária no lote
    const unique = this.deduplicateExtracted(extracted);

    // 4. Navegação na página interna de cada evento para enriquecimento profundo
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
      '.card-evento',
      '.evento-card',
      '.evento',
      '.event-card',
      '.card',
      'div:has(> a[href*="/evento"])'
    ];

    let foundElements = $(cardSelectors.join(', '));
    if (foundElements.length === 0) {
      foundElements = $('a[href*="/evento"], a[href*="/inscricao"]').parent();
    }

    foundElements.each((_, el) => {
      const $card = $(el);
      const text = $card.text().trim();
      if (!text || text.length < 10) return;

      let linkHref = $card.find('a[href*="/evento"], a[href*="/inscricao"]').first().attr('href')
        || $card.find('a').first().attr('href')
        || '';

      if (!linkHref) return;

      let absoluteUrl = linkHref;
      try {
        absoluteUrl = new URL(linkHref, this.baseUrl).toString();
      } catch {
        return;
      }

      if (seenUrls.has(absoluteUrl)) return;
      seenUrls.add(absoluteUrl);

      const title = $card.find('h1, h2, h3, h4, h5, .card-title, strong').first().text().trim() || 'Corrida de Rua';

      races.push({
        title,
        eventDate: new Date().toISOString().split('T')[0],
        eventTime: '06:00',
        city: 'Tailândia',
        state: 'PA',
        timingCompany: this.company,
        registrationUrl: null, // Validação inicial nula até confirmação na página interna
        distances: ['5 km'],
        status: 'UPCOMING',
        currentBatch: 'Inscrições em Breve',
        price: null,
        isRegistrationOpen: false,
        organizer: `${this.name} / Circuito Regional`,
        rawData: {
          scrapedAt: new Date().toISOString(),
          extractedFrom: this.sourceUrl,
          rawSnippet: text.slice(0, 100),
          relativeUrl: linkHref
        }
      });
    });

    return races;
  }
}
