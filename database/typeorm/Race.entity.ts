import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';

export enum TimingCompanyEnum {
  CHIP_AMAZONIA = 'CHIP_AMAZONIA',
  CHIP_PARA = 'CHIP_PARA',
  CHIP_BRANCO = 'CHIP_BRANCO',
  SUPERA_CHRONOS = 'SUPERA_CHRONOS',
  OUTRO = 'OUTRO'
}

export enum RaceStatusEnum {
  UPCOMING = 'UPCOMING',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED'
}

@Entity({ name: 'races' })
@Index('idx_races_date_city', ['eventDate', 'city'])
@Index('idx_races_company_status', ['timingCompany', 'status'])
export class RaceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug!: string;

  @Column({ type: 'date', name: 'event_date' })
  eventDate!: Date;

  @Column({ type: 'varchar', length: 10, default: '06:00', name: 'event_time' })
  eventTime!: string;

  @Column({ type: 'varchar', length: 100 })
  city!: string;

  @Column({ type: 'varchar', length: 2, default: 'PA' })
  state!: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: 'Centro' })
  location!: string;

  @Column({
    type: 'enum',
    enum: TimingCompanyEnum,
    default: TimingCompanyEnum.CHIP_AMAZONIA,
    name: 'timing_company'
  })
  timingCompany!: TimingCompanyEnum;

  @Column({ type: 'text', nullable: true, name: 'registration_url' })
  registrationUrl?: string | null;

  @Column({ type: 'text', nullable: true, name: 'banner_url' })
  bannerUrl?: string;

  @Column({ type: 'text', nullable: true, name: 'rules_url' })
  rulesUrl?: string;

  @Column({ type: 'text', nullable: true, name: 'regulation_url' })
  regulationUrl?: string;

  @Column('simple-array', { default: '5 km' })
  distances!: string[];

  @Column({
    type: 'enum',
    enum: RaceStatusEnum,
    default: RaceStatusEnum.UPCOMING
  })
  status!: RaceStatusEnum;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'current_batch' })
  currentBatch?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'price' })
  price?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'price_from' })
  priceFrom?: number;

  @Column({ type: 'boolean', default: false })
  featured!: boolean;

  @Column({ type: 'varchar', length: 255, default: 'Organização Oficial' })
  organizer!: string;

  @Column({ type: 'jsonb', nullable: true, default: {}, name: 'raw_data' })
  rawData?: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
