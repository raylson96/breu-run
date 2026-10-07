import type { TimingCompany, ExtractedRace } from '../types';

export interface RaceScraperInterface {
  readonly company: TimingCompany;
  readonly name: string;
  readonly sourceUrl: string;

  /**
   * Executa a extração dos eventos cadastrados no portal
   */
  scrape(): Promise<ExtractedRace[]>;
}
