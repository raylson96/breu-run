import type { RaceRecord, TimingCompany, RaceStatus } from '../types';
import type { Race as FrontendRace } from '../../../types/race';
import { getRaceCategories } from '../../../utils/raceFormatters';

export interface RaceRepositoryInterface {
  findAll(): Promise<RaceRecord[]>;
  findById(id: string): Promise<RaceRecord | null>;
  findBySlug(slug: string): Promise<RaceRecord | null>;
  create(data: Omit<RaceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<RaceRecord>;
  update(id: string, data: Partial<RaceRecord>): Promise<RaceRecord>;
}

// ------------------------------------------------------------------------------
// 1. In-Memory Repository (Ideal para testes de unidade e simulações rápidas)
// ------------------------------------------------------------------------------
export class InMemoryRaceRepository implements RaceRepositoryInterface {
  private records: Map<string, RaceRecord> = new Map();

  constructor(initialData: RaceRecord[] = []) {
    initialData.forEach((item) => this.records.set(item.id, { ...item }));
  }

  async findAll(): Promise<RaceRecord[]> {
    return Array.from(this.records.values());
  }

  async findById(id: string): Promise<RaceRecord | null> {
    const item = this.records.get(id);
    return item ? { ...item } : null;
  }

  async findBySlug(slug: string): Promise<RaceRecord | null> {
    for (const item of this.records.values()) {
      if (item.slug === slug) return { ...item };
    }
    return null;
  }

  async create(data: Omit<RaceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<RaceRecord> {
    const id = `race-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();
    const newRecord: RaceRecord = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.records.set(id, newRecord);
    return { ...newRecord };
  }

  async update(id: string, data: Partial<RaceRecord>): Promise<RaceRecord> {
    const existing = this.records.get(id);
    if (!existing) {
      throw new Error(`Corrida com id ${id} não encontrada.`);
    }
    const updated: RaceRecord = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString()
    };
    this.records.set(id, updated);
    return { ...updated };
  }
}

// ------------------------------------------------------------------------------
// 2. LocalStorage Adapter (Conecta a sincronização com o armazenamento do app React)
// ------------------------------------------------------------------------------
export class LocalStorageRaceRepository implements RaceRepositoryInterface {
  private storageKey: string;

  constructor(storageKey = 'para_run_races_v4') {
    this.storageKey = storageKey;
  }

  private mapFrontendToRecord(r: FrontendRace): RaceRecord {
    const timingMap: Record<string, TimingCompany> = {
      'Chip Amazônia': 'CHIP_AMAZONIA',
      'Chip Pará': 'CHIP_PARA',
      'Chip Breu Branco': 'CHIP_BRANCO',
      'Chip Cronos': 'SUPERA_CHRONOS'
    };

    const statusMap: Record<string, RaceStatus> = {
      open: 'OPEN',
      closing_soon: 'OPEN',
      confirmed: 'UPCOMING',
      soon: 'UPCOMING',
      closed: 'CLOSED',
      finished: 'CLOSED'
    };

    return {
      id: r.id,
      title: r.title,
      slug: r.id,
      eventDate: r.date,
      eventTime: r.time,
      city: r.city,
      state: r.state || 'PA',
      location: r.location,
      timingCompany: timingMap[r.chipCompany] || 'OUTRO',
      registrationUrl: r.registrationUrl || null,
      bannerUrl: r.bannerUrl || r.imageUrl,
      rulesUrl: r.rulesUrl || r.regulationUrl,
      regulationUrl: r.regulationUrl || r.rulesUrl,
      distances: r.distances || ['5 km'],
      status: statusMap[r.status] || 'UPCOMING',
      currentBatch: r.currentBatch,
      price: r.price ?? r.priceFrom ?? null,
      priceFrom: r.price ?? r.priceFrom ?? undefined,
      priceWithoutShirt: r.priceWithoutShirt ?? null,
      priceWithShirt: r.priceWithShirt ?? null,
      featured: r.featured || false,
      organizer: r.organizer || 'Organização Oficial',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  private getRegionForCity(city: string): string {
    const sudeste = ['Marabá', 'Parauapebas', 'Canaã dos Carajás', 'Curionópolis', 'Eldorado do Carajás', 'São Geraldo do Araguaia', 'Itupiranga', 'Nova Ipixuna'];
    const pa150 = ['Tailândia', 'Breu Branco', 'Tucuruí', 'Goianésia do Pará', 'Jacundá', 'Novo Repartimento', 'Pacajá'];
    const metro = ['Belém', 'Ananindeua', 'Marituba', 'Castanhal', 'Benevides'];
    const baixoTocantins = ['Abaetetuba', 'Cametá', 'Barcarena', 'Moju', 'Igarapé-Miri', 'Tomé-Açu', 'Capanema', 'Bragança', 'Salinópolis', 'Oeiras do Pará'];
    const oeste = ['Santarém', 'Altamira', 'Itaituba', 'Redenção'];

    if (sudeste.includes(city)) return 'Sudeste do Pará';
    if (pa150.includes(city)) return 'Eixo PA-150 & Lago';
    if (metro.includes(city)) return 'Região Metropolitana';
    if (baixoTocantins.includes(city)) return 'Baixo Tocantins & Salgado';
    if (oeste.includes(city)) return 'Oeste do Pará';
    return 'Eixo PA-150 & Lago';
  }

  private mapRecordToFrontend(rec: RaceRecord): FrontendRace {
    const companyReverse: Record<TimingCompany, any> = {
      CHIP_AMAZONIA: 'Chip Amazônia',
      CHIP_PARA: 'Chip Pará',
      CHIP_BRANCO: 'Chip Breu Branco',
      SUPERA_CHRONOS: 'Chip Cronos',
      OUTRO: 'A Definir'
    };

    const statusReverse: Record<RaceStatus, any> = {
      OPEN: 'open',
      UPCOMING: 'confirmed',
      CLOSED: 'closed',
      CANCELLED: 'closed'
    };

    return {
      id: rec.id,
      title: rec.title,
      organizer: rec.organizer,
      date: rec.eventDate,
      time: rec.eventTime || '06:00',
      city: rec.city,
      state: rec.state,
      location: rec.location || 'Centro',
      region: this.getRegionForCity(rec.city),
      distances: rec.distances,
      chipCompany: companyReverse[rec.timingCompany] || 'Chip Amazônia',
      status: rec.status === 'CLOSED' ? 'finished' : (statusReverse[rec.status] || 'confirmed'),
      registrationUrl: rec.registrationUrl || undefined,
      regulationUrl: rec.regulationUrl || rec.rulesUrl || undefined,
      bannerUrl: rec.bannerUrl,
      imageUrl: rec.bannerUrl,
      rulesUrl: rec.regulationUrl || rec.rulesUrl || undefined,
      resultsUrl: (rec as any).resultsUrl || (
        rec.timingCompany === 'CHIP_AMAZONIA' ? 'https://chipamazonia.com.br/resultados' :
        rec.timingCompany === 'CHIP_PARA' ? 'https://www.chippara.com.br/resultados' :
        rec.timingCompany === 'CHIP_BRANCO' ? 'https://www.chipbreubranco.com.br/resultados' :
        rec.timingCompany === 'SUPERA_CHRONOS' ? 'https://www.superachipcrono.com.br/resultados' :
        undefined
      ),
      currentBatch: rec.currentBatch || (rec.status === 'OPEN' ? 'Inscrições Abertas' : 'Confirmada no Calendário'),
      price: rec.price ?? rec.priceFrom ?? undefined,
      priceFrom: rec.price ?? rec.priceFrom ?? undefined,
      priceWithoutShirt: rec.priceWithoutShirt ?? undefined,
      priceWithShirt: rec.priceWithShirt ?? undefined,
      featured: rec.featured,
      categories: getRaceCategories({
        distances: rec.distances,
        priceWithoutShirt: rec.priceWithoutShirt ?? undefined,
        priceFrom: rec.price ?? rec.priceFrom ?? undefined,
        price: rec.price ?? rec.priceFrom ?? undefined,
        currentBatch: rec.currentBatch
      } as any),
      kitItems: ['Camiseta oficial', 'Medalha finisher', 'Número de peito com chip']
    };
  }

  private readAll(): FrontendRace[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private writeAll(items: FrontendRace[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (e) {
      console.error('Falha ao salvar no localStorage', e);
    }
  }

  async findAll(): Promise<RaceRecord[]> {
    const raw = this.readAll();
    return raw.map((r) => this.mapFrontendToRecord(r));
  }

  async findById(id: string): Promise<RaceRecord | null> {
    const all = await this.findAll();
    return all.find((r) => r.id === id) || null;
  }

  async findBySlug(slug: string): Promise<RaceRecord | null> {
    const all = await this.findAll();
    return all.find((r) => r.slug === slug || r.id === slug) || null;
  }

  async create(data: Omit<RaceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<RaceRecord> {
    const id = `race-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const now = new Date().toISOString();
    const newRecord: RaceRecord = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    };

    const frontendRace = this.mapRecordToFrontend(newRecord);
    const existing = this.readAll();
    this.writeAll([frontendRace, ...existing]);

    return newRecord;
  }

  async update(id: string, data: Partial<RaceRecord>): Promise<RaceRecord> {
    const existingList = this.readAll();
    const index = existingList.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error(`Corrida com id ${id} não encontrada no storage.`);
    }

    const currentRecord = this.mapFrontendToRecord(existingList[index]);
    const updatedRecord: RaceRecord = {
      ...currentRecord,
      ...data,
      updatedAt: new Date().toISOString()
    };

    existingList[index] = this.mapRecordToFrontend(updatedRecord);
    this.writeAll(existingList);

    return updatedRecord;
  }
}

import { FINAL_VERIFIED_RACES_V6 } from '../data/finalVerifiedRacesV6';

/**
 * Retorna as 30 corridas verificadas com dados oficiais, kits e premiações reais
 */
export function getInitialEnrichedRaces(): FrontendRace[] {
  return FINAL_VERIFIED_RACES_V6;
}
