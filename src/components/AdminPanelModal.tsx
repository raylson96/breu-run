import React, { useState, useEffect } from 'react';
import type { Race, ChipCompany, RaceStatus } from '../types/race';
import { REGIONS_CITIES, CHIP_COMPANIES } from '../data/mockRaces';
import { 
  runLocalOcrExtraction, 
  runGeminiVisionExtraction 
} from '../services/calendarAiService';
import { 
  X, 
  Upload, 
  Sparkles, 
  Copy, 
  Check, 
  FileText, 
  AlertCircle, 
  Link as LinkIcon, 
  Trash2, 
  PlusCircle, 
  CheckCircle2, 
  ExternalLink,
  Bot,
  Zap,
  Key,
  Loader2,
  Globe,
  RefreshCw,
  Layers
} from 'lucide-react';
import { 
  CHIP_SITES, 
  mergeAndDeduplicateRaces, 
  parseLinksBatch,
  type MergeResult
} from '../services/chipScraperService';
import { runSyncRacesJob } from '../modules/sync/orchestrator/syncOrchestrator';
import { LocalStorageRaceRepository, getInitialEnrichedRaces } from '../modules/sync/repositories/RaceRepository';
import type { SyncSummary } from '../modules/sync/types';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  races: Race[];
  onAddRace: (newRace: Race) => void;
  onAddMultipleRaces: (newRaces: Race[]) => void;
  onUpdateRace: (updatedRace: Race) => void;
  onDeleteRace: (raceId: string) => void;
  onClearAllRaces: () => void;
  onBatchUpdateRaces?: (allRaces: Race[]) => void;
  initialTab?: 'ai_import' | 'link_crawler' | 'manage_links' | 'manual_add';
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  races,
  onAddRace,
  onAddMultipleRaces,
  onUpdateRace,
  onDeleteRace,
  onClearAllRaces,
  onBatchUpdateRaces,
  initialTab
}) => {
  const [activeTab, setActiveTab] = useState<'ai_import' | 'link_crawler' | 'manage_links' | 'manual_add'>(initialTab || 'ai_import');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // AI Import State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [aiTextResponse, setAiTextResponse] = useState<string>('');
  const [parsedRaces, setParsedRaces] = useState<Partial<Race>[]>([]);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Automatic Processing State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  
  // Gemini API Key State
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem('gemini_vision_api_key') || '';
  });
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);

  useEffect(() => {
    if (geminiApiKey) {
      localStorage.setItem('gemini_vision_api_key', geminiApiKey);
    }
  }, [geminiApiKey]);

  // Manual Add Form State
  const [title, setTitle] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('06:00');
  const [city, setCity] = useState('Tailândia');
  const [location, setLocation] = useState('');
  const [distancesStr, setDistancesStr] = useState('5 km, 10 km');
  const [chipCompany, setChipCompany] = useState<ChipCompany>('Chip Amazônia');
  const [status, setStatus] = useState<RaceStatus>('confirmed');
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [priceFrom, setPriceFrom] = useState('');
  const [currentBatch, setCurrentBatch] = useState('Data Confirmada no Calendário');
  const [featured, setFeatured] = useState(false);

  // Link Crawler & Deduplication State
  const [pastedLinksText, setPastedLinksText] = useState('');
  const [mergePreview, setMergePreview] = useState<MergeResult | null>(null);
  const [isCrawling, setIsCrawling] = useState(false);

  const handleAnalyzeLinks = () => {
    if (!pastedLinksText.trim()) {
      alert('Por favor, cole um ou mais links dos sites de chip para cruzar com o calendário.');
      return;
    }
    setIsCrawling(true);
    try {
      const entries = parseLinksBatch(pastedLinksText);
      if (entries.length === 0) {
        alert('Nenhum link com protocolo (http:// ou https://) foi identificado no texto colado.');
        setIsCrawling(false);
        return;
      }
      const result = mergeAndDeduplicateRaces(races, entries);
      setMergePreview(result);
    } catch (e) {
      alert('Erro ao analisar links: ' + e);
    } finally {
      setIsCrawling(false);
    }
  };

  const handleApplyLinkMerge = () => {
    if (!mergePreview) return;
    if (onBatchUpdateRaces) {
      onBatchUpdateRaces(mergePreview.updatedRaces);
    } else {
      mergePreview.updatedRaces.forEach((r) => onUpdateRace(r));
    }
    alert(`Sucesso! ${mergePreview.matchedCount} provas existentes receberam link oficial (inscrições abertas) e ${mergePreview.addedCount} novas provas foram integradas sem duplicatas.`);
    setMergePreview(null);
    setPastedLinksText('');
  };

  // Automated Scraping Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatusText, setSyncStatusText] = useState('');
  const [syncSummary, setSyncSummary] = useState<SyncSummary | null>(null);
  const [siteStates, setSiteStates] = useState<Record<string, 'pending' | 'running' | 'success' | 'error'>>({
    'Chip Amazônia': 'pending',
    'Chip Pará': 'pending',
    'Chip Breu Branco': 'pending',
    'Supera Chip Chronos': 'pending'
  });

  const handleTriggerActiveSync = async () => {
    setIsSyncing(true);
    setSyncProgress(10);
    setSyncStatusText('Iniciando robô de scraping nos 4 portais...');
    setSyncSummary(null);

    setSiteStates({
      'Chip Amazônia': 'running',
      'Chip Pará': 'running',
      'Chip Breu Branco': 'running',
      'Supera Chip Chronos': 'running'
    });

    // Garante sincronia do estado em memória com o LocalStorage antes da varredura
    if (races && races.length > 0) {
      localStorage.setItem('para_run_races_v4', JSON.stringify(races));
    }

    const repository = new LocalStorageRaceRepository();

    try {
      setSyncProgress(30);
      setSyncStatusText('Varrendo Chip Amazônia, Chip Pará, Chip Breu Branco e Supera Chronos...');

      const summary = await runSyncRacesJob({
        repository,
        onProgress: (stage, current, total) => {
          const pct = Math.min(95, Math.round(30 + (current / total) * 65));
          setSyncProgress(pct);
          setSyncStatusText(`${stage} (${current}/${total})...`);
        }
      });

      const newStates: Record<string, 'pending' | 'running' | 'success' | 'error'> = {};
      summary.sites.forEach((site) => {
        newStates[site.name] = site.success ? 'success' : 'error';
      });
      setSiteStates(newStates);

      setSyncProgress(100);
      setSyncStatusText(`Sincronização concluída! ${summary.totalScraped} provas identificadas (${summary.insertedCount} novas, ${summary.updatedCount} atualizadas).`);
      setSyncSummary(summary);

      // Recarrega do storage para a UI principal
      const rawStored = localStorage.getItem('para_run_races_v4');
      if (rawStored && onBatchUpdateRaces) {
        onBatchUpdateRaces(JSON.parse(rawStored));
      }
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      console.error('Falha na sincronização:', err);
      setSyncStatusText(`Erro na sincronização: ${err}`);
      setSiteStates({
        'Chip Amazônia': 'error',
        'Chip Pará': 'error',
        'Chip Breu Branco': 'error',
        'Supera Chip Chronos': 'error'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLoadSampleLinks = () => {
    const samples = [
      'https://chipbreubranco.com.br/evento/4-corrida-noturna-de-tailandia',
      'https://chipamazonia.com.br/evento/meia-maratona-carajas-maraba',
      'https://chippara.com.br/evento/corrida-belem-metropolitana-10k',
      'https://chipcronos.com.br/evento/circuito-sul-do-para-tucurui'
    ].join('\n');
    setPastedLinksText(samples);
  };

  const handleResetToOnlyOfficialRaces = () => {
    if (confirm('Deseja restaurar as 30 provas oficiais confirmadas dos portais de chip e remover quaisquer provas manuais ou antigas?')) {
      const official = getInitialEnrichedRaces();
      localStorage.setItem('para_run_races_v4', JSON.stringify(official));
      if (onBatchUpdateRaces) {
        onBatchUpdateRaces(official);
      }
      alert('Pronto! Base redefinida com sucesso para as 30 corridas oficiais confirmadas nos 4 sites de cronometragem.');
    }
  };

  if (!isOpen) return null;

  // The optimized prompt to give to ChatGPT / Gemini / Claude with the image
  const extractionPrompt = `Você é um especialista em atletismo regional e extração de dados.
Analise a imagem deste calendário/cartaz de corridas de rua do Pará e extraia TODOS os eventos identificados.

Retorne EXATAMENTE no formato JSON (array de objetos), sem explicações extras, seguindo rigorosamente esta estrutura:
[
  {
    "title": "Nome da corrida (ex: 4ª Corrida Noturna de Tailândia)",
    "date": "Data no formato AAAA-MM-DD (ex: 2026-11-07)",
    "time": "Horário de largada se houver, ou '06:00'",
    "city": "Cidade do Pará (ex: Tailândia, Marabá, Breu Branco, Parauapebas, Belém)",
    "location": "Local ou bairro se mencionado, ou 'Centro'",
    "distances": ["5 km", "10 km"],
    "chipCompany": "Chip Amazônia, Chip Breu Branco, Chip Pará, ou 'A Definir'",
    "status": "confirmed",
    "registrationUrl": "",
    "currentBatch": "Confirmada no Calendário Oficial"
  }
]`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(extractionPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 1. EXECUÇÃO DIRETA DO OCR (Sem precisar de chave nem abrir outra aba!)
  const handleRunDirectOcr = async () => {
    if (!imagePreview) {
      alert('Por favor, faça primeiro o upload da imagem do cartaz/calendário.');
      return;
    }

    setIsProcessing(true);
    setParseError(null);
    setProcessingProgress(10);
    setProcessingStatus('Iniciando motor de leitura OCR...');

    try {
      const result = await runLocalOcrExtraction(imagePreview, (progress, status) => {
        setProcessingProgress(progress);
        setProcessingStatus(status);
      });

      if (result.races.length > 0) {
        setParsedRaces(result.races);
        setAiTextResponse(`// Texto bruto detectado pelo scanner:\n${result.rawText}\n\n// Total de provas identificadas: ${result.races.length}`);
      } else {
        setParseError('O OCR identificou texto, mas não encontrou datas ou nomes claros de corrida. Você pode tentar o modo IA Gemini Vision ou colar o texto manualmente.');
        setAiTextResponse(result.rawText);
      }
    } catch (err) {
      console.error(err);
      setParseError('Ocorreu um erro ao processar o OCR da imagem. Tente uma imagem mais nítida ou use o Gemini Vision.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. EXECUÇÃO DIRETA DA IA GEMINI VISION
  const handleRunGeminiVision = async () => {
    if (!imagePreview) {
      alert('Por favor, faça primeiro o upload da imagem do cartaz/calendário.');
      return;
    }

    if (!geminiApiKey.trim()) {
      setShowKeyInput(true);
      return;
    }

    setIsProcessing(true);
    setParseError(null);
    setProcessingProgress(40);
    setProcessingStatus('Enviando imagem para a IA Multimodal (Gemini Vision)...');

    try {
      const racesFound = await runGeminiVisionExtraction(geminiApiKey.trim(), imagePreview, (status) => {
        setProcessingStatus(status);
      });

      setProcessingProgress(100);
      setParsedRaces(racesFound);
      setAiTextResponse(JSON.stringify(racesFound, null, 2));
    } catch (err: any) {
      console.error(err);
      setParseError(err.message || 'Erro ao comunicar com a API do Gemini. Verifique sua chave de API.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Parse text or JSON pasted by the user
  const handleParseAiResponse = () => {
    setParseError(null);
    if (!aiTextResponse.trim()) {
      setParseError('Por favor, cole a resposta da IA na caixa de texto abaixo.');
      return;
    }

    try {
      let cleaned = aiTextResponse.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/, '').trim();
      }

      const data = JSON.parse(cleaned);
      if (Array.isArray(data)) {
        const normalized = data.map((item, index) => ({
          id: `race-ai-${Date.now()}-${index}`,
          title: item.title || `Corrida ${item.city || 'Regional'}`,
          date: item.date || new Date().toISOString().split('T')[0],
          time: item.time || '06:00',
          city: item.city || 'Tailândia',
          state: 'PA',
          location: item.location || `Centro, ${item.city || 'PA'}`,
          distances: Array.isArray(item.distances) && item.distances.length > 0 ? item.distances : ['5 km'],
          chipCompany: (item.chipCompany as ChipCompany) || 'A Definir',
          status: (item.status as RaceStatus) || (item.registrationUrl ? 'open' : 'confirmed'),
          registrationUrl: item.registrationUrl || '',
          currentBatch: item.currentBatch || (item.registrationUrl ? '1º Lote' : 'Confirmada no Calendário'),
          price: typeof item.price === 'number' ? item.price : item.priceFrom ? parseFloat(item.priceFrom) : undefined,
          priceFrom: typeof item.price === 'number' ? item.price : item.priceFrom ? parseFloat(item.priceFrom) : undefined,
          organizer: item.organizer || 'Organização Local',
          featured: false
        }));
        setParsedRaces(normalized);
      } else {
        throw new Error('O formato retornado não é uma lista de corridas.');
      }
    } catch (err) {
      // Fallback: line-by-line parsing
      const lines = aiTextResponse.split('\n').filter((l) => l.trim().length > 3);
      const fallbackRaces: Partial<Race>[] = [];

      lines.forEach((line, idx) => {
        const dateMatch = line.match(/(\d{2})[\/\-](\d{2})(?:[\/\-](\d{4}))?/) || line.match(/(\d{4})[\-](\d{2})[\-](\d{2})/);
        let raceDate = '2026-11-15';
        if (dateMatch) {
          if (dateMatch[3]) {
            raceDate = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
          } else {
            raceDate = `2026-${dateMatch[2]}-${dateMatch[1]}`;
          }
        }

        const foundCity = REGIONS_CITIES.find((c) => c !== 'Todas' && line.toLowerCase().includes(c.toLowerCase())) || 'Tailândia';

        fallbackRaces.push({
          id: `race-ai-${Date.now()}-${idx}`,
          title: line.replace(/^[0-9\.\-\*\s]+/, '').substring(0, 50).trim() || `Corrida ${foundCity}`,
          date: raceDate,
          time: '06:00',
          city: foundCity,
          state: 'PA',
          location: `Centro, ${foundCity}`,
          distances: ['5 km', '10 km'],
          chipCompany: 'A Definir',
          status: 'confirmed',
          registrationUrl: '',
          currentBatch: 'Confirmada no Calendário',
          organizer: 'Organizador Local'
        });
      });

      if (fallbackRaces.length > 0) {
        setParsedRaces(fallbackRaces);
      } else {
        setParseError('Não foi possível reconhecer as corridas. Certifique-se de que colou o JSON ou uma lista com datas e nomes.');
      }
    }
  };

  // Preencher exemplo de teste
  const handleLoadSampleAiData = () => {
    const sample = JSON.stringify([
      {
        "title": "Circuito Noturno do Lago de Breu Branco",
        "date": "2026-11-21",
        "time": "19:00",
        "city": "Breu Branco",
        "location": "Orla da Cidade",
        "distances": ["5 km", "10 km"],
        "chipCompany": "Chip Breu Branco",
        "status": "confirmed",
        "registrationUrl": "",
        "currentBatch": "Confirmada no Calendário Anual"
      },
      {
        "title": "Desafio Corrida dos Minérios de Canaã",
        "date": "2026-12-05",
        "time": "06:15",
        "city": "Canaã dos Carajás",
        "location": "Bosque Gonzaguinha",
        "distances": ["5 km", "10 km"],
        "chipCompany": "Chip Amazônia",
        "status": "confirmed",
        "registrationUrl": "",
        "currentBatch": "Confirmada no Calendário Anual"
      },
      {
        "title": "Meia Maratona Vale do Tocantins - Marabá",
        "date": "2027-01-24",
        "time": "05:30",
        "city": "Marabá",
        "location": "Pioneira",
        "distances": ["5 km", "10 km", "21 km"],
        "chipCompany": "Chip Amazônia",
        "status": "confirmed",
        "registrationUrl": "",
        "currentBatch": "Confirmada no Calendário Anual"
      }
    ], null, 2);

    setAiTextResponse(sample);
  };

  const handleSaveImportedRaces = () => {
    if (parsedRaces.length === 0) return;

    const mergeRes = mergeAndDeduplicateRaces(races, parsedRaces);
    if (onBatchUpdateRaces) {
      onBatchUpdateRaces(mergeRes.updatedRaces);
    } else {
      const completedRaces: Race[] = parsedRaces.map((p, idx) => ({
        id: p.id || `race-imported-${Date.now()}-${idx}`,
        title: p.title || 'Corrida Regional',
        organizer: p.organizer || 'Organização Oficial',
        date: p.date || '2026-11-01',
        time: p.time || '06:00',
        city: p.city || 'Tailândia',
        state: 'PA',
        location: p.location || `Centro, ${p.city}`,
        distances: p.distances || ['5 km'],
        chipCompany: p.chipCompany || 'A Definir',
        status: p.status || 'confirmed',
        registrationUrl: p.registrationUrl || '',
        currentBatch: p.currentBatch || 'Confirmada no Calendário',
        kitItems: ['Camiseta oficial', 'Medalha finisher', 'Número de peito com chip']
      }));
      onAddMultipleRaces(completedRaces);
    }

    alert(`Sucesso! ${mergeRes.addedCount} novas provas adicionadas e ${mergeRes.matchedCount} provas existentes sincronizadas sem nenhuma duplicação!`);
    setParsedRaces([]);
    setAiTextResponse('');
    setImagePreview(null);
    onClose();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) {
      alert('Por favor, preencha o Nome e a Data da Prova.');
      return;
    }

    const distances = distancesStr
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);

    const newRace: Race = {
      id: `race-${Date.now()}`,
      title,
      organizer: organizer || 'Organização Regional',
      date,
      time,
      city,
      state: 'PA',
      location: location || `Centro, ${city}`,
      distances: distances.length > 0 ? distances : ['5 km'],
      chipCompany,
      status,
      registrationUrl: registrationUrl || '',
      featured,
      price: priceFrom ? parseFloat(priceFrom) : undefined,
      priceFrom: priceFrom ? parseFloat(priceFrom) : undefined,
      currentBatch: currentBatch || (registrationUrl ? '1º Lote' : 'Data Confirmada no Calendário'),
      kitItems: ['Camiseta oficial', 'Medalha finisher', 'Número de peito com chip']
    };

    onAddRace(newRace);
    alert(`Corrida "${newRace.title}" cadastrada com sucesso!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-6xl rounded-3xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Central do Administrador • Leitor IA de Calendários
                </h2>
                <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  Admin Master
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Upe a imagem do cartaz e deixe a IA ler todas as corridas e datas automaticamente!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 flex items-center gap-2 overflow-x-auto text-xs sm:text-sm font-bold">
          <button
            onClick={() => setActiveTab('ai_import')}
            className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'ai_import'
                ? 'border-orange-600 text-orange-700 bg-white rounded-t-xl font-black shadow-sm'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bot className="w-4 h-4 text-orange-600" />
            <span>1. Leitor IA do Cartaz</span>
          </button>

          <button
            onClick={() => setActiveTab('link_crawler')}
            className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'link_crawler'
                ? 'border-orange-600 text-orange-700 bg-white rounded-t-xl font-black shadow-sm'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>2. 🔗 Cruzador de Links & Deduplicação (4 Chips)</span>
          </button>

          <button
            onClick={() => setActiveTab('manage_links')}
            className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'manage_links'
                ? 'border-orange-600 text-orange-700 bg-white rounded-t-xl font-black shadow-sm'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-4 h-4 text-blue-600" />
            <span>3. Tabela de Links & Status ({races.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('manual_add')}
            className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'manual_add'
                ? 'border-orange-600 text-orange-700 bg-white rounded-t-xl font-black shadow-sm'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-slate-600" />
            <span>4. Cadastrar Manual</span>
          </button>
        </div>

        {/* TAB 1: AI IMAGE IMPORT */}
        {activeTab === 'ai_import' && (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
            {/* Explanatory banner */}
            <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-sm text-orange-950 flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  Leitura Direta da Imagem no Próprio Site
                </h3>
                <p className="text-xs text-orange-900/90 leading-relaxed">
                  Suba o cartaz ou print do calendário de provas abaixo. Você pode clicar no botão <strong>"Ler com OCR Automático"</strong> para processar direto no navegador sem custo, ou usar o <strong>"Gemini Vision AI"</strong> para leitura profunda!
                </p>
              </div>

              {/* Botão para configurar chave Gemini se desejar */}
              <button
                onClick={() => setShowKeyInput(!showKeyInput)}
                className="px-3 py-1.5 bg-white border border-orange-300 text-orange-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition flex-shrink-0 hover:bg-orange-100"
              >
                <Key className="w-3.5 h-3.5 text-orange-600" />
                <span>{geminiApiKey ? 'Chave Gemini Configurada' : 'Configurar Chave Gemini'}</span>
              </button>
            </div>

            {/* API Key Modal/Input Accordion */}
            {showKeyInput && (
              <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" />
                    Chave de API do Google Gemini (Opcional para Modo Ultra Inteligente)
                  </span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-orange-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    Obter chave gratuita no Google AI Studio <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    className="flex-1 p-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  <button
                    onClick={() => {
                      localStorage.setItem('gemini_vision_api_key', geminiApiKey);
                      setShowKeyInput(false);
                      alert('Chave salva com sucesso no navegador!');
                    }}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Salvar
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Nota: Se não tiver a chave, você pode usar o <strong>OCR Automático</strong> normalmente, que roda 100% no seu navegador de forma gratuita!
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Image Upload + Direct Actions */}
              <div className="space-y-4">
                {/* Upload Image Box */}
                <div className="border-2 border-dashed border-slate-300 hover:border-orange-500 rounded-3xl p-5 text-center transition bg-slate-50/50">
                  <input
                    type="file"
                    accept="image/*"
                    id="calendar-image-upload"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label htmlFor="calendar-image-upload" className="cursor-pointer block">
                    {imagePreview ? (
                      <div className="space-y-3">
                        <img 
                          src={imagePreview} 
                          alt="Calendário enviado" 
                          className="max-h-60 mx-auto rounded-2xl object-contain shadow-lg border border-slate-200"
                        />
                        <div className="text-xs font-bold text-slate-700">
                          Imagem: <span className="text-orange-600">{imageName}</span> (Clique para trocar)
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 py-6">
                        <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                          <Upload className="w-7 h-7" />
                        </div>
                        <h4 className="font-bold text-sm text-slate-800">
                          Clique ou arraste a imagem do cartaz do calendário de corridas
                        </h4>
                        <p className="text-xs text-slate-500">
                          PNG, JPG ou JPEG (Cartaz anual, print de WhatsApp, flyer oficial)
                        </p>
                      </div>
                    )}
                  </label>
                </div>

                {/* Direct Action Buttons when Image is present */}
                {imagePreview && (
                  <div className="space-y-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                      Escolha como processar a imagem:
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Botão OCR Automático */}
                      <button
                        onClick={handleRunDirectOcr}
                        disabled={isProcessing}
                        className="py-3 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>Ler com OCR Direto (Grátis)</span>
                      </button>

                      {/* Botão Gemini Vision */}
                      <button
                        onClick={handleRunGeminiVision}
                        disabled={isProcessing}
                        className="py-3 px-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-2xl text-xs font-black shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        <Bot className="w-4 h-4" />
                        <span>Ler com Gemini AI Vision</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Progress bar when processing */}
                {isProcessing && (
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs font-bold text-orange-950">
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                        {processingStatus}
                      </span>
                      <span>{processingProgress}%</span>
                    </div>
                    <div className="w-full bg-orange-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${processingProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Fallback Prompt Box (ChatGPT / Claude) */}
                <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      Ou Copiar Prompt para ChatGPT / Claude
                    </span>
                    <button
                      onClick={handleCopyPrompt}
                      className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPrompt ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Se preferir, copie este prompt e cole no ChatGPT junto com a foto do cartaz:
                  </p>
                  <pre className="bg-slate-950 p-2.5 rounded-xl text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-24 no-scrollbar border border-slate-800 whitespace-pre-wrap">
                    {extractionPrompt}
                  </pre>
                </div>
              </div>

              {/* Right Column: Paste Response & Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                    Dados Extraídos da Imagem
                  </label>
                  <button
                    onClick={handleLoadSampleAiData}
                    className="text-xs text-orange-600 hover:text-orange-700 font-bold underline cursor-pointer"
                  >
                    + Exemplo de Teste
                  </button>
                </div>

                <textarea
                  rows={9}
                  placeholder={`Aqui aparecerá o resultado da leitura da imagem automaticamente, ou você pode colar o JSON / lista manualmente...`}
                  value={aiTextResponse}
                  onChange={(e) => setAiTextResponse(e.target.value)}
                  className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none"
                />

                {parseError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{parseError}</span>
                  </div>
                )}

                <button
                  onClick={handleParseAiResponse}
                  disabled={isProcessing}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span>Analisar Texto & Atualizar Tabela de Conferência</span>
                </button>
              </div>
            </div>

            {/* PREVIEW TABLE OF PARSED RACES */}
            {parsedRaces.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-200 space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-black text-base sm:text-lg text-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      Conferência: {parsedRaces.length} provas identificadas da imagem
                    </h3>
                    <p className="text-xs text-slate-500">
                      Revise os dados antes de publicar. Todas entrarão na listagem do calendário oficial!
                    </p>
                  </div>

                  <button
                    onClick={handleSaveImportedRaces}
                    className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-900/20 transition cursor-pointer flex items-center justify-center gap-2 active:scale-95 flex-shrink-0"
                  >
                    <Check className="w-4 h-4" />
                    <span>Importar Todas para o Calendário</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto max-h-80">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase border-b border-slate-200 sticky top-0">
                        <tr>
                          <th className="p-3">Data</th>
                          <th className="p-3">Nome da Prova</th>
                          <th className="p-3">Cidade</th>
                          <th className="p-3">Distâncias</th>
                          <th className="p-3">Cronometragem</th>
                          <th className="p-3">Status Inicial</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {parsedRaces.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-orange-600 whitespace-nowrap">
                              {r.date}
                            </td>
                            <td className="p-3 font-semibold text-slate-900">
                              {r.title}
                            </td>
                            <td className="p-3 text-slate-700 whitespace-nowrap">
                              {r.city}, PA
                            </td>
                            <td className="p-3 text-slate-600 whitespace-nowrap">
                              {r.distances?.join(', ')}
                            </td>
                            <td className="p-3 text-slate-600 whitespace-nowrap">
                              {r.chipCompany || 'A Definir'}
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                Confirmada no Calendário
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LINK CRAWLER & DEDUPLICATION */}
        {activeTab === 'link_crawler' && (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
            {/* Header info banner */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-3xl p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm sm:text-base text-emerald-950">
                      Rastreador de Links & Cruzamento com Calendário (Anti-Duplicidade)
                    </h3>
                    <p className="text-xs text-emerald-800">
                      O sistema monitora os 4 principais sites de chip do Pará, associa os links aos eventos do cartaz e previne provas repetidas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Grid dos 4 Chips Oficiais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2">
                {CHIP_SITES.map((site) => (
                  <div 
                    key={site.name} 
                    className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-emerald-200/60 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-black text-xs text-slate-900">{site.name}</span>
                        <a
                          href={site.defaultUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 font-bold"
                          title={`Abrir ${site.domain}`}
                        >
                          <span>Visitar</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-2">
                        {site.description}
                      </p>
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-slate-400 truncate">
                      {site.domain}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD DE SINCRONIZAÇÃO AUTOMÁTICA EM TEMPO REAL (ROBÔ DE WEB SCRAPING) */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                      ROBÔ DE SINCRONIZAÇÃO ATIVA
                    </span>
                    <span className="text-xs text-slate-400">• Diário via Vercel Cron</span>
                  </div>
                  <h4 className="font-black text-base sm:text-lg tracking-tight text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    Sincronização Automática dos 4 Portais de Chip
                  </h4>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    O robô varre <strong>Chip Amazônia</strong>, <strong>Chip Pará</strong>, <strong>Chip Breu Branco</strong> e <strong>Supera Chip Chronos</strong>, extrai corridas abertas, identifica distâncias, datas e links oficiais, cruzando tudo sem gerar duplicatas.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleTriggerActiveSync}
                  disabled={isSyncing}
                  className="py-3 px-6 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-2xl font-black text-xs sm:text-sm shadow-lg shadow-orange-950/40 transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 disabled:opacity-50 flex-shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Sincronizando os 4 Sites...' : 'Sincronizar Sites dos Chips Agora'}</span>
                </button>
              </div>

              {/* Barra de Progresso durante a Sincronização */}
              {isSyncing && (
                <div className="space-y-2 pt-2 border-t border-slate-800 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-orange-400 font-bold flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      {syncStatusText}
                    </span>
                    <span className="text-slate-400 font-mono font-bold">{syncProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-emerald-400 transition-all duration-300 rounded-full"
                      style={{ width: `${syncProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Status Individual de Cada Portal */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {Object.entries(siteStates).map(([siteName, st]) => (
                  <div 
                    key={siteName} 
                    className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-slate-200 truncate">{siteName}</span>
                    {st === 'running' ? (
                      <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Varrendo
                      </span>
                    ) : st === 'success' ? (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> OK
                      </span>
                    ) : st === 'error' ? (
                      <span className="text-[10px] text-rose-400 font-bold">Falhou</span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Pronto</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Sumário Pós-Execução */}
              {syncSummary && (
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl space-y-3 animate-in fade-in text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-emerald-300 text-sm flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Sincronização Concluída ({syncSummary.durationMs}ms)
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {new Date(syncSummary.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                    <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase">Total Varridas</span>
                      <strong className="text-white text-base">{syncSummary.totalScraped}</strong>
                    </div>
                    <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-emerald-400 block uppercase">Novas Inseridas</span>
                      <strong className="text-emerald-400 text-base">+{syncSummary.insertedCount}</strong>
                    </div>
                    <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-amber-400 block uppercase">Atualizadas c/ Link</span>
                      <strong className="text-amber-400 text-base">{syncSummary.updatedCount}</strong>
                    </div>
                    <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-blue-400 block uppercase">Duplicatas</span>
                      <strong className="text-blue-400 text-base">0 (Deduplicadas)</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CARD EXPLICATIVO: COMO FUNCIONA A ATUALIZAÇÃO AUTOMÁTICA EM PRODUÇÃO */}
            <div className="bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50 border border-blue-200/80 rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4 text-blue-100" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-blue-950">
                    Como Funciona a Atualização Automática Contínua (24 Horas / 7 Dias)
                  </h4>
                  <p className="text-xs text-blue-800">
                    Sua plataforma nunca fica desatualizada, mesmo se uma nova corrida for lançada amanhã cedo.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
                <div className="p-3 bg-white rounded-2xl border border-blue-100 space-y-1">
                  <span className="font-extrabold text-blue-900 block">1. Robô no Servidor (Cron Job)</span>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Em produção, um processo agendado roda a cada poucas horas nos servidores da Chip Amazônia, Chip Pará, Chip Breu Branco e Supera Cronos.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-blue-100 space-y-1">
                  <span className="font-extrabold text-emerald-900 block">2. Inserção & Virada de Lote</span>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Se um organizador cadastra uma nova corrida ou abre o link de inscrição, o sistema atualiza datas, percursos, PDF de regulamento e o preço do lote ativo sozinho.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-blue-100 space-y-1">
                  <span className="font-extrabold text-orange-900 block">3. Alertas para os Corredores</span>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    O sino de notificações no cabeçalho avisa os atletas em tempo real sobre novas corridas e aberturas de inscrições, sem necessidade de digitação manual pelo admin.
                  </p>
                </div>
              </div>
            </div>

            {/* Input para Colar Links em Lote */}
            <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-orange-600" />
                    Cole os Links de Inscrição ou Mensagens de WhatsApp
                  </h4>
                  <p className="text-xs text-slate-500">
                    Pode colar múltiplos links juntos. O algoritmo extrai cada URL, identifica o chip pelo domínio e cruza com a prova correspondente no calendário.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLoadSampleLinks}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                  <span>Carregar Exemplos Reais</span>
                </button>
              </div>

              <textarea
                rows={5}
                value={pastedLinksText}
                onChange={(e) => setPastedLinksText(e.target.value)}
                placeholder="Cole aqui os links das corridas ou copie e cole a mensagem do grupo de WhatsApp...&#10;Ex:&#10;https://chipbreubranco.com.br/evento/4-corrida-noturna-de-tailandia&#10;https://chipamazonia.com.br/evento/meia-maratona-carajas-maraba&#10;https://chippara.com.br/evento/corrida-belem-metropolitana-10k&#10;https://chipcronos.com.br/evento/circuito-sul-do-para-tucurui"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />

              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-[11px] text-slate-400">
                  Total de provas atualmente cadastradas no calendário: <strong>{races.length}</strong>
                </span>

                <button
                  type="button"
                  onClick={handleAnalyzeLinks}
                  disabled={isCrawling || !pastedLinksText.trim()}
                  className="py-3 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition shadow-md flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isCrawling ? 'animate-spin' : ''}`} />
                  <span>Cruzar Links com Calendário Oficial</span>
                </button>
              </div>
            </div>

            {/* PREVIEW DO CRUZAMENTO */}
            {mergePreview && (
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
                {/* Métricas de Resultado */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg">
                      {mergePreview.matchedCount}
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-emerald-700 block">Atualizadas</span>
                      <p className="text-xs font-bold text-slate-800">
                        Provas do cartaz que ganharam link e abriram inscrições!
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-blue-200 shadow-xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg">
                      {mergePreview.addedCount}
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-blue-700 block">Novas Provas</span>
                      <p className="text-xs font-bold text-slate-800">
                        Provas novas identificadas pelos links
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black text-lg">
                      0
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-600 block">Duplicatas</span>
                      <p className="text-xs font-bold text-slate-800">
                        Zero duplicatas geradas pelo filtro fonético
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tabela de Conferência do Cruzamento */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
                  <div className="overflow-x-auto max-h-72">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase border-b border-slate-200 sticky top-0">
                        <tr>
                          <th className="p-3">Data</th>
                          <th className="p-3">Nome da Prova</th>
                          <th className="p-3">Cidade</th>
                          <th className="p-3">Chip Detectado</th>
                          <th className="p-3">Status Resultante</th>
                          <th className="p-3">Link de Inscrição</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {mergePreview.updatedRaces.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-orange-600 whitespace-nowrap">
                              {r.date}
                            </td>
                            <td className="p-3 font-semibold text-slate-900">
                              {r.title}
                            </td>
                            <td className="p-3 text-slate-700 whitespace-nowrap">
                              {r.city}, PA
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-100 text-slate-800 border border-slate-200">
                                {r.chipCompany}
                              </span>
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              {r.status === 'open' ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  🟢 Inscrições Abertas
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                  🟡 Confirmada no Cartaz
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-slate-500 max-w-xs truncate font-mono text-[11px]">
                              {r.registrationUrl ? (
                                <a
                                  href={r.registrationUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-700 hover:underline flex items-center gap-1"
                                >
                                  <span className="truncate">{r.registrationUrl}</span>
                                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                </a>
                              ) : (
                                <span className="text-slate-400 italic">Sem link ainda</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Ações Finais do Cruzamento */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setMergePreview(null)}
                    className="px-4 py-2.5 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Descartar Prévia
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyLinkMerge}
                    className="py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-900/20 transition cursor-pointer flex items-center gap-2 active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>Salvar Cruzamento no Calendário Oficial ({mergePreview.updatedRaces.length} Provas)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MANAGE LINKS & STATUS */}
        {activeTab === 'manage_links' && (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-black text-sm text-blue-950 flex items-center gap-1.5">
                  <LinkIcon className="w-4 h-4 text-blue-600" />
                  Como gerenciar links de inscrição e status de encerramento:
                </h4>
                <p className="text-xs text-blue-900/80 leading-relaxed mt-0.5">
                  Quando uma prova do calendário abrir inscrições no Chip Amazônia, Chip Breu Branco ou Chip Pará, basta colar o link oficial abaixo e mudar o status para <strong>"Inscrições Abertas"</strong>. Quando esgotar ou a data passar, mude para <strong>"Encerrada"</strong> ou <strong>"Realizada"</strong>.
                </p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="p-3">Data</th>
                      <th className="p-3">Nome da Corrida</th>
                      <th className="p-3">Cidade</th>
                      <th className="p-3">Distâncias</th>
                      <th className="p-3">Valor</th>
                      <th className="p-3">Regulamento</th>
                      <th className="p-3">Status Atual</th>
                      <th className="p-3 min-w-[260px]">Link Oficial de Inscrição</th>
                      <th className="p-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {races.map((race) => (
                      <tr key={race.id} className="hover:bg-slate-50">
                        {/* Data */}
                        <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                          {race.date.split('-').reverse().join('/')}
                        </td>

                        {/* Nome */}
                        <td className="p-3 font-bold text-slate-900 max-w-xs truncate">
                          {race.title}
                        </td>

                        {/* Cidade */}
                        <td className="p-3 text-slate-700 whitespace-nowrap">
                          {race.city}
                        </td>

                        {/* Distâncias */}
                        <td className="p-3 whitespace-nowrap">
                          <span className="text-[11px] font-bold text-slate-700">
                            {race.distances?.join(', ') || '5 km'}
                          </span>
                        </td>

                        {/* Valor */}
                        <td className="p-3 whitespace-nowrap">
                          <span className="text-xs font-black text-slate-900">
                            {(typeof race.price === 'number' || typeof race.priceFrom === 'number') ? `R$ ${(race.price ?? race.priceFrom)!.toFixed(2).replace('.', ',')}` : 'Sob consulta'}
                          </span>
                        </td>

                        {/* Regulamento */}
                        <td className="p-3 whitespace-nowrap">
                          {(race.regulationUrl || race.rulesUrl) ? (
                            <a
                              href={race.regulationUrl || race.rulesUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-700 hover:underline"
                              title="Abrir Regulamento PDF"
                            >
                              <FileText className="w-3.5 h-3.5 text-orange-600" />
                              <span>PDF</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                        </td>

                        {/* Status Dropdown */}
                        <td className="p-3 whitespace-nowrap">
                          <select
                            value={race.status}
                            onChange={(e) => onUpdateRace({
                              ...race,
                              status: e.target.value as RaceStatus
                            })}
                            className={`p-1.5 rounded-lg text-xs font-bold border outline-none cursor-pointer ${
                              race.status === 'open'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : race.status === 'closing_soon'
                                ? 'bg-orange-50 text-orange-800 border-orange-300'
                                : race.status === 'confirmed'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : race.status === 'finished'
                                ? 'bg-purple-50 text-purple-800 border-purple-300'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}
                          >
                            <option value="open">🟢 Inscrições Abertas</option>
                            <option value="closing_soon">🟠 Virando Lote / Últimos Dias</option>
                            <option value="confirmed">🟡 Confirmada (Sem Link)</option>
                            <option value="soon">🔵 Em Breve</option>
                            <option value="closed">⚪ Inscrições Encerradas</option>
                            <option value="finished">🟣 Prova Realizada</option>
                          </select>
                        </td>

                        {/* Link Input */}
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="url"
                              placeholder="https://chip... (Cole o link aqui)"
                              value={race.registrationUrl || ''}
                              onChange={(e) => onUpdateRace({
                                ...race,
                                registrationUrl: e.target.value,
                                status: e.target.value && race.status === 'confirmed' ? 'open' : race.status
                              })}
                              className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:bg-white focus:ring-1 focus:ring-orange-500 outline-none"
                            />
                            {race.registrationUrl && (
                              <a
                                href={race.registrationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-slate-400 hover:text-orange-600 rounded"
                                title="Testar link"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Ações */}
                        <td className="p-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => {
                              if (confirm(`Deseja remover "${race.title}" do calendário?`)) {
                                onDeleteRace(race.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Excluir prova"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MANUAL ADD */}
        {activeTab === 'manual_add' && (
          <form onSubmit={handleManualSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Nome da Corrida <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: 1ª Corrida Cidade de Tailândia"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Data <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Horário</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Cidade</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                >
                  {REGIONS_CITIES.filter((c) => c !== 'Todas').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Distâncias</label>
                <input
                  type="text"
                  placeholder="5 km, 10 km"
                  value={distancesStr}
                  onChange={(e) => setDistancesStr(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Empresa de Chip</label>
                <select
                  value={chipCompany}
                  onChange={(e) => setChipCompany(e.target.value as ChipCompany)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                >
                  {CHIP_COMPANIES.filter((c) => c !== 'Todas').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Realizador / Organizador
                </label>
                <input
                  type="text"
                  placeholder="Ex: SEMEL Tailândia / Assessoria Carajás"
                  value={organizer}
                  onChange={(e) => setOrganizer(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Local / Ponto de Largada
                </label>
                <input
                  type="text"
                  placeholder="Ex: Praça do Povo ou Orla da Cidade"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as RaceStatus)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                >
                  <option value="confirmed">🟡 Confirmada no Calendário (Sem Link)</option>
                  <option value="open">🟢 Inscrições Abertas</option>
                  <option value="closing_soon">🟠 Virada de Lote</option>
                  <option value="soon">🔵 Em Breve</option>
                  <option value="closed">⚪ Encerradas</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Link de Inscrição (se já houver)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={registrationUrl}
                  onChange={(e) => setRegistrationUrl(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Preço Inicial (R$)</label>
                <input
                  type="number"
                  placeholder="Ex: 65"
                  value={priceFrom}
                  onChange={(e) => setPriceFrom(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Lote Atual</label>
                <input
                  type="text"
                  placeholder="Ex: 1º Lote"
                  value={currentBatch}
                  onChange={(e) => setCurrentBatch(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="featured-checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 accent-orange-600 rounded cursor-pointer"
                />
                <label htmlFor="featured-checkbox" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Destacar no Topo ⭐
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="py-2.5 px-5 bg-orange-600 hover:bg-orange-500 text-white font-extrabold rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Salvar Prova</span>
              </button>
            </div>
          </form>
        )}

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-2">
            <span>Total de provas no sistema: <strong>{races.length}</strong></span>
            <button
              onClick={handleResetToOnlyOfficialRaces}
              className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              title="Restaurar as 30 provas confirmadas dos 4 sites de chip e limpar manuais"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Restaurar Provas Oficiais dos Chips</span>
            </button>
            {races.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Tem certeza que deseja apagar todas as corridas cadastradas para começar do zero?')) {
                    onClearAllRaces();
                    alert('Todas as corridas foram removidas. A base está zerada para novos cadastros!');
                  }
                }}
                className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                title="Apagar todas as corridas cadastradas"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Zerar Todas</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition cursor-pointer"
          >
            Fechar Painel
          </button>
        </div>
      </div>
    </div>
  );
};
