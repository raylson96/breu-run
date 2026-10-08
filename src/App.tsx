import { useState, useEffect, useMemo } from 'react';
import type { Race, FilterState } from './types/race';
import type { AthleteProfile } from './types/athlete';
import { getAthleteProfile, hasSavedProfile } from './services/athleteService';
import { getInitialEnrichedRaces } from './modules/sync/repositories/RaceRepository';
import { Header } from './components/Header';
import { FeaturedRacesSection } from './components/FeaturedRacesSection';
import { FilterBar } from './components/FilterBar';
import { ResultsView } from './components/ResultsView';
import { RaceCard } from './components/RaceCard';
import { RaceTableView } from './components/RaceTableView';
import { RaceDetailModal } from './components/RaceDetailModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { WhatsAppAlertModal } from './components/WhatsAppAlertModal';
import { MonetizationBanners } from './components/MonetizationBanners';
import { AthleteProfileModal } from './components/AthleteProfileModal';
import type { AppNotification } from './types/notification';
import { getStoredNotifications } from './services/notificationService';
import { executeAutoSync } from './services/autoSyncService';
import { extractPrizeValue } from './utils/raceFormatters';
import { 
  MessageCircle, 
  Sparkles, 
  FilterX, 
  Heart, 
  PlusCircle, 
  Upload, 
  ShieldCheck, 
  User, 
  Zap 
} from 'lucide-react';

export function App() {
  // Persistence for races list in localStorage (v7 - strictly real verified chip races & exact regulation awards)
  const [races, setRaces] = useState<Race[]>(() => {
    const verifiedSnapshot = getInitialEnrichedRaces();

    // Limpa versões anteriores para atualizar dados oficiais, chips e premiações
    localStorage.removeItem('para_run_races_v1');
    localStorage.removeItem('para_run_races_v2');
    localStorage.removeItem('para_run_races_v3');
    localStorage.removeItem('para_run_races_v4');
    localStorage.removeItem('para_run_races_v5');
    localStorage.removeItem('para_run_races_v6');
    localStorage.removeItem('para_run_races_v7');

    const saved = localStorage.getItem('para_run_races_v8');
    if (saved) {
      try {
        const parsed: Race[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Mantém exclusivamente provas oficiais confirmadas dos portais de chip
          const onlyRealChipRaces = parsed.filter((r) => 
            !r.id.startsWith('race-mock') && 
            !r.id.startsWith('race-ai-') && 
            !r.id.startsWith('race-ocr-') &&
            !r.id.startsWith('manual-')
          );

          if (onlyRealChipRaces.length > 0) {
            return onlyRealChipRaces.map((r) => {
              // Limpa qualquer termo proibido de resultado que possa ter vindo de cache
              const hasForbiddenTerm = r.registrationUrl && (
                r.registrationUrl.toLowerCase().includes('resultado') ||
                r.registrationUrl.toLowerCase().includes('racetag') ||
                r.registrationUrl.toLowerCase().includes('racezone') ||
                r.registrationUrl.toLowerCase().includes('classificacao') ||
                r.registrationUrl.toLowerCase().includes('tempo')
              );

              const match = verifiedSnapshot.find((snap) => 
                snap.title.toLowerCase().trim() === r.title.toLowerCase().trim() ||
                (snap.city === r.city && snap.date === r.date)
              );

              return {
                ...r,
                distances: match?.distances || r.distances,
                categories: match?.categories || r.categories,
                kitItems: match?.kitItems || r.kitItems,
                registrationUrl: hasForbiddenTerm ? undefined : (r.registrationUrl || match?.registrationUrl),
                price: typeof r.price === 'number' ? r.price : match?.price,
                priceFrom: typeof r.priceFrom === 'number' ? r.priceFrom : (match?.priceFrom || match?.price),
                priceWithoutShirt: r.priceWithoutShirt ?? match?.priceWithoutShirt,
                priceWithShirt: r.priceWithShirt ?? match?.priceWithShirt,
                regulationUrl: r.regulationUrl || match?.regulationUrl,
                currentBatch: match?.currentBatch || r.currentBatch,
                awardsInfo: match?.awardsInfo || r.awardsInfo,
                prizeTotal: match?.prizeTotal ?? r.prizeTotal,
                awardGroups: match?.awardGroups || r.awardGroups
              };
            });
          }
        }
      } catch (e) {
        console.error('Failed to parse saved races', e);
      }
    }
    return verifiedSnapshot;
  });

  // Real-Time Notification Center State
  const [notifications, setNotifications] = useState<AppNotification[]>(getStoredNotifications);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Athlete Profile State
  const [athleteProfile, setAthleteProfile] = useState<AthleteProfile>(getAthleteProfile);
  const [isAthleteModalOpen, setIsAthleteModalOpen] = useState(false);

  // Persistence for favorites in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('para_run_favorites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse favorites', e);
      }
    }
    return [];
  });

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    viewMode: 'grid',
    tab: 'upcoming',
    region: 'Todas as Regiões',
    city: 'Todas',
    month: 'all',
    distance: 'Todas',
    chipCompany: 'Todas',
    status: 'all',
    search: '',
    onlyFavorites: false,
    sortBy: 'date_asc'
  });

  // Modals state
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminInitialTab, setAdminInitialTab] = useState<'ai_import' | 'link_crawler' | 'manage_links' | 'manual_add'>('ai_import');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const handleOpenAdminWithTab = (tab: 'ai_import' | 'link_crawler' | 'manage_links' | 'manual_add') => {
    setAdminInitialTab(tab);
    setIsAdminModalOpen(true);
  };

  // Sync to localStorage (v8)
  useEffect(() => {
    localStorage.setItem('para_run_races_v8', JSON.stringify(races));
  }, [races]);


  useEffect(() => {
    localStorage.setItem('para_run_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Background Auto-Sync on initial app start (after 1.5s delay to keep UI instant)
  useEffect(() => {
    const timer = setTimeout(() => {
      handleManualAutoSync(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleManualAutoSync = async (silent = false) => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await executeAutoSync(races, (updated) => {
        setRaces(updated);
      });
      setNotifications(getStoredNotifications());
    } catch (e) {
      if (!silent) {
        console.warn('Falha na sincronização automática:', e);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Toggle favorite
  const handleToggleFavorite = (raceId: string) => {
    setFavorites((prev) => 
      prev.includes(raceId) ? prev.filter((id) => id !== raceId) : [...prev, raceId]
    );
  };

  // Toggle featured badge / top placement
  const handleToggleFeatured = (raceId: string) => {
    setRaces((prev) => 
      prev.map((r) => r.id === raceId ? { ...r, featured: !r.featured } : r)
    );
  };

  // Add single race
  const handleAddRace = (newRace: Race) => {
    setRaces((prev) => [newRace, ...prev]);
  };

  // Add multiple races (from AI calendar image extraction)
  const handleAddMultipleRaces = (newRaces: Race[]) => {
    setRaces((prev) => [...newRaces, ...prev]);
  };

  // Update race (e.g. registration link or status)
  const handleUpdateRace = (updatedRace: Race) => {
    setRaces((prev) => prev.map((r) => (r.id === updatedRace.id ? updatedRace : r)));
  };

  // Delete race
  const handleDeleteRace = (raceId: string) => {
    setRaces((prev) => prev.filter((r) => r.id !== raceId));
  };

  // Clear all races to start from clean slate
  const handleClearAllRaces = () => {
    setRaces([]);
    localStorage.removeItem('para_run_races_v4');
  };

  // Open rich event summary & registration (full-screen view)
  const handleOpenRegistration = (race: Race) => {
    setSelectedRace(race);
  };

  // WhatsApp share handler
  const handleShareWhatsApp = (race: Race) => {
    const [year, month, day] = race.date.split('-');
    const formattedDate = `${day}/${month}/${year}`;
    
    const message = `🏃‍♂️ *${race.title}*\n` +
      `📅 *Data:* ${formattedDate} às ${race.time}h\n` +
      `📍 *Local:* ${race.location}, ${race.city}/PA\n` +
      `🎯 *Distâncias:* ${race.distances.join(' • ')}\n` +
      `⏱️ *Cronometragem:* ${race.chipCompany}\n` +
      `💰 *Status:* ${race.status === 'open' ? 'Inscrições Abertas' : race.status === 'confirmed' ? 'Data Confirmada no Calendário' : 'Em Breve'} ${race.priceFrom ? `(A partir de R$ ${race.priceFrom})` : ''}\n` +
      (race.registrationUrl ? `🔗 *Inscrição Oficial:* ${race.registrationUrl}\n\n` : `ℹ️ *Inscrição:* Em breve no site oficial\n\n`) +
      `📲 Calendário Oficial *Breu Run* — Todas as corridas do Pará em um só lugar`;

    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // City race counts
  const cityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    races.forEach((r) => {
      counts[r.city] = (counts[r.city] || 0) + 1;
    });
    return counts;
  }, [races]);

  // Open registrations count
  const openCount = useMemo(() => {
    return races.filter((r) => r.status === 'open' || r.status === 'closing_soon').length;
  }, [races]);

  // Filtered & sorted races
  const filteredRaces = useMemo(() => {
    return races.filter((race) => {
      // Tab filter: 'upcoming' vs 'results'
      const isPastRace = race.status === 'finished';
      if (filters.tab === 'results') {
        if (!isPastRace) return false;
      } else {
        // upcoming tab (default): exclude finished races to keep calendar clean
        if (isPastRace) return false;
      }

      // Region filter
      if (filters.region !== 'Todas as Regiões' && race.region && race.region !== filters.region) {
        return false;
      }

      // City filter
      if (filters.city !== 'Todas' && race.city !== filters.city) {
        return false;
      }

      // Month filter
      if (filters.month !== 'all') {
        const raceMonth = race.date.substring(0, 7);
        if (raceMonth !== filters.month) return false;
      }

      // Distance filter
      if (filters.distance !== 'Todas') {
        const hasDist = race.distances.some((d) => 
          d.toLowerCase().includes(filters.distance.toLowerCase().replace(' todas', ''))
        );
        if (!hasDist) return false;
      }

      // Chip company filter
      if (filters.chipCompany !== 'Todas' && race.chipCompany !== filters.chipCompany) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all') {
        if (filters.status === 'open' && !(race.status === 'open' || race.status === 'closing_soon')) {
          return false;
        } else if (filters.status !== 'open' && race.status !== filters.status) {
          return false;
        }
      }

      // Only favorites
      if (filters.onlyFavorites && !favorites.includes(race.id)) {
        return false;
      }

      // Text search
      if (filters.search.trim() !== '') {
        const query = filters.search.toLowerCase();
        const matches = 
          race.title.toLowerCase().includes(query) ||
          race.city.toLowerCase().includes(query) ||
          race.organizer.toLowerCase().includes(query) ||
          race.location.toLowerCase().includes(query) ||
          race.chipCompany.toLowerCase().includes(query);

        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.tab === 'results') {
        // Provas concluídas: mais recentes primeiro
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (filters.sortBy === 'prize_desc') {
        const prizeA = extractPrizeValue(a);
        const prizeB = extractPrizeValue(b);
        if (prizeB !== prizeA) return prizeB - prizeA;
      } else if (filters.sortBy === 'date_desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [races, filters, favorites]);

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 flex flex-col font-sans overflow-x-hidden w-full max-w-full">
      {/* 1. Header (Full Width on Desktop) */}
      <Header
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onOpenAlertModal={() => setIsAlertModalOpen(true)}
        onOpenProfileModal={() => setIsAthleteModalOpen(true)}
        hasAthleteProfile={hasSavedProfile(athleteProfile)}
        totalRaces={races.length}
        openRegistrationsCount={openCount}
        notifications={notifications}
        onNotificationsChange={setNotifications}
        onSelectRaceById={(idOrTitle) => {
          const target = idOrTitle.toLowerCase().trim();
          const r = races.find((x) => 
            x.id === idOrTitle || 
            x.id.includes(idOrTitle) || 
            idOrTitle.includes(x.id) ||
            x.title.toLowerCase().trim() === target ||
            x.title.toLowerCase().includes(target) ||
            target.includes(x.title.toLowerCase())
          );
          if (r) {
            setSelectedRace(r);
          }
        }}
        onTriggerSync={() => handleManualAutoSync(false)}
        isSyncing={isSyncing}
      />

      {/* 2. Main Container (Wide Full-Screen Layout on PC, responsive on Mobile) */}
      <main className="w-full max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-10 py-4 sm:py-6 flex-1 overflow-x-hidden">
        {/* Seção de Múltiplas Provas em Evidência (Suporta 1 a 3+ cards em destaque) */}
        {filters.tab !== 'results' && filters.city === 'Todas' && filters.region === 'Todas as Regiões' && !filters.search && !filters.onlyFavorites && (
          <FeaturedRacesSection
            races={races}
            onSelectRace={(race) => setSelectedRace(race)}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
            onOpenRegistration={handleOpenRegistration}
            onToggleFeatured={handleToggleFeatured}
          />
        )}

        {/* 3. Alternância entre Tela Secundária de Resultados e Calendário Principal */}
        {filters.tab === 'results' ? (
          <ResultsView
            races={races}
            onBackToCalendar={() => setFilters((prev) => ({ ...prev, tab: 'upcoming', status: 'all' }))}
            onSelectRace={(r) => setSelectedRace(r)}
          />
        ) : (
          <>
            {/* Filtros e Busca Rápida com Seletor de Modo PC / Cards */}
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              cityCounts={cityCounts}
              totalFiltered={filteredRaces.length}
            />

            {/* Header da Listagem com Contadores e Acesso Rápido */}
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-3">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {filters.city !== 'Todas' 
                    ? `Corridas em ${filters.city}` 
                    : filters.region !== 'Todas as Regiões' 
                    ? `Corridas no Polo ${filters.region}` 
                    : 'Calendário Breu Run'}
                </h2>
                <span className="bg-orange-100 text-orange-900 border border-orange-200 text-xs font-black px-2.5 py-0.5 rounded-full">
                  {filteredRaces.length} {filteredRaces.length === 1 ? 'evento' : 'eventos'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {filters.onlyFavorites && (
                  <span className="text-xs font-bold text-rose-600 flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200">
                    <Heart className="w-3.5 h-3.5 fill-rose-600" /> Minhas Salvas
                  </span>
                )}
                
                <button
                  onClick={() => setIsAdminModalOpen(true)}
                  className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-orange-400 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  <span>Importar Calendário por Imagem / IA</span>
                </button>
              </div>
            </div>

            {/* 4. Lista de Corridas (Alternância Grade Ampla PC vs Tabela Executiva vs Base Limpa Inicial) */}
            {races.length === 0 ? (
              /* BASE LIMPA ZERADA (Pronta para upload real do usuário) */
              <div className="bg-gradient-to-br from-white via-slate-50 to-orange-50/30 rounded-3xl p-8 sm:p-12 text-center border-2 border-dashed border-orange-200 shadow-sm my-6 space-y-6">
                <div className="max-w-2xl mx-auto space-y-3">
                  <div className="w-16 h-16 bg-gradient-to-tr from-orange-600 to-amber-500 text-white rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-orange-950/20">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h3 className="font-black text-2xl text-slate-900 tracking-tight">
                    Seu Calendário está Limpo e Pronto para as Provas Reais!
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Todas as corridas de teste anteriores foram removidas. Agora você pode subir a foto oficial do cartaz de corridas da região para a IA ler, ou cadastrar uma prova manualmente.
                  </p>
                </div>

                {/* Ações Diretas */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => handleOpenAdminWithTab('link_crawler')}
                    className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-sm font-black rounded-2xl shadow-lg shadow-orange-950/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Zap className="w-4 h-4 text-amber-200 fill-amber-200" />
                    <span>Sincronizar Sites dos 4 Chips Agora</span>
                  </button>

                  <button
                    onClick={() => handleOpenAdminWithTab('ai_import')}
                    className="w-full sm:w-auto px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow"
                  >
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    <span>Upar Imagem com IA</span>
                  </button>

                  <button
                    onClick={() => handleOpenAdminWithTab('manual_add')}
                    className="w-full sm:w-auto px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-sm font-bold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <PlusCircle className="w-4 h-4 text-slate-600" />
                    <span>Cadastrar Manual</span>
                  </button>
                </div>

                {/* Chips Integrados Info */}
                <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Chip Amazônia
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-blue-600" /> Chip Breu Branco
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-purple-600" /> Chip Pará
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-cyan-600" /> Chip Cronos
                  </span>
                </div>
              </div>
            ) : filteredRaces.length > 0 ? (
              filters.viewMode === 'table' ? (
                /* TABELA EXECUTIVA (Ampla no PC) */
                <RaceTableView
                  races={filteredRaces}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  onSelectRace={(r) => setSelectedRace(r)}
                  onShareWhatsApp={handleShareWhatsApp}
                  onOpenRegistration={handleOpenRegistration}
                  onToggleFeatured={handleToggleFeatured}
                />
              ) : (
                /* GRADE DE CARDS (4 colunas no PC / 2 no tablet / 1 no mobile centralizado) */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8 justify-items-center sm:justify-items-stretch">
                  {filteredRaces.map((race) => (
                    <RaceCard
                      key={race.id}
                      race={race}
                      isFavorite={favorites.includes(race.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onSelectRace={(r) => setSelectedRace(r)}
                      onShareWhatsApp={handleShareWhatsApp}
                      onOpenRegistration={handleOpenRegistration}
                      onToggleFeatured={handleToggleFeatured}
                    />
                  ))}
                </div>
              )
            ) : (
              /* Empty Search Filter State */
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm my-6 space-y-3">
                <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto">
                  <FilterX className="w-7 h-7" />
                </div>
                <h3 className="font-black text-lg text-slate-800">
                  Nenhuma corrida encontrada para os filtros atuais
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Tente selecionar outro chip, cidade ou limpar a busca.
                </p>
                <button
                  onClick={() => setFilters({
                    viewMode: filters.viewMode,
                    tab: 'upcoming',
                    region: 'Todas as Regiões',
                    city: 'Todas',
                    month: 'all',
                    distance: 'Todas',
                    chipCompany: 'Todas',
                    status: 'all',
                    search: '',
                    onlyFavorites: false,
                    sortBy: 'date_asc'
                  })}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shadow-md"
                >
                  Ver Todas as Provas
                </button>
              </div>
            )}
          </>
        )}

        {/* 5. Seção de Monetização & Parcerias */}
        <MonetizationBanners onOpenAddModal={() => setIsAdminModalOpen(true)} />
      </main>

      {/* 6. Mobile Bottom Quick Bar */}
      <div className="sm:hidden sticky bottom-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-4 py-2.5 flex items-center justify-between gap-3 shadow-2xl">
        <button
          onClick={() => setIsAthleteModalOpen(true)}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 border ${
            hasSavedProfile(athleteProfile)
              ? 'bg-slate-800 text-emerald-400 border-emerald-500/40'
              : 'bg-orange-600 text-white border-transparent'
          }`}
          title="Meu Perfil de Atleta (CPF / Auto-preenchimento)"
        >
          <User className="w-3.5 h-3.5" />
          <span>{hasSavedProfile(athleteProfile) ? 'Meu CPF' : 'Cadastrar'}</span>
        </button>

        <button
          onClick={() => setIsAlertModalOpen(true)}
          className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Grupo VIP WhatsApp</span>
        </button>
      </div>

      {/* 7. Footer (Full Width on Desktop) */}
      <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 mt-16 py-10 px-4 sm:px-8 lg:px-12">
        <div className="max-w-[1700px] mx-auto space-y-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-black text-xl text-white tracking-tight">BREU RUN</span>
                <span className="text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full font-bold">
                  SISTEMA UNIFICADO REGIONAL
                </span>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm max-w-xl">
                A vitrine digital que aproxima corredores de rua, assessorias esportivas e as empresas de cronometragem do estado do Pará.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300">
                Polo Tailândia (PA-150)
              </span>
              <span className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300">
                Polo Marabá & Carajás
              </span>
              <span className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300">
                Polo Breu Branco & Tucuruí
              </span>
              <span className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300">
                Polo Belém Metropolitana
              </span>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} Breu Run. Todos os direitos reservados aos organizadores e atletas.</p>
            <div className="flex flex-wrap items-center gap-3">
              <p>Cronometragens integradas: Chip Chronos • Chip Breu Branco • Chip Pará • Chip Amazônia</p>
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="text-[11px] text-slate-600 hover:text-slate-400 underline cursor-pointer"
                title="Acesso Administrativo Breu Run"
              >
                Acesso Administrativo
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <RaceDetailModal
        race={selectedRace}
        onClose={() => setSelectedRace(null)}
        onShareWhatsApp={handleShareWhatsApp}
        onOpenRegistration={handleOpenRegistration}
        onToggleFeatured={handleToggleFeatured}
      />

      <AdminPanelModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        races={races}
        onAddRace={handleAddRace}
        onAddMultipleRaces={handleAddMultipleRaces}
        onUpdateRace={handleUpdateRace}
        onDeleteRace={handleDeleteRace}
        onClearAllRaces={handleClearAllRaces}
        onBatchUpdateRaces={(updatedAll) => setRaces(updatedAll)}
        initialTab={adminInitialTab}
      />

      <WhatsAppAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
      />

      <AthleteProfileModal
        isOpen={isAthleteModalOpen}
        onClose={() => setIsAthleteModalOpen(false)}
        onProfileUpdated={(updated) => setAthleteProfile(updated)}
      />
    </div>
  );
}

export default App;
