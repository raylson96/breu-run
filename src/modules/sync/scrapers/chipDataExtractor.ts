import type { TimingCompany, ExtractedRace, RaceStatus } from '../types';
import { 
  parsePortugueseDate, 
  extractDistances, 
  extractCity,
  isValidRegistrationUrl
} from '../utils/parsingHelpers';

/**
 * Normaliza caminho de URL para URL absoluta com o domínio base correto
 */
function toAbsoluteUrl(baseUrl: string, urlOrPath: string): string {
  if (!urlOrPath) return baseUrl;
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    return urlOrPath;
  }
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanPath = urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`;
  return `${cleanBase}${cleanPath}`;
}

/**
 * Converte data DD/MM/AAAA para YYYY-MM-DD
 */
function parseSlashDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  const parts = dateStr.trim().split('/');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return parsePortugueseDate(dateStr) || new Date().toISOString().split('T')[0];
}

/**
 * Extrai eventos estruturados a partir do HTML ou JSON dos sites dos 4 chips.
 * NOTA: listResults é intencionalmente ignorado para NÃO puxar resultados de provas passadas.
 */
export function parseChipPayload(
  content: string | Record<string, unknown>,
  baseUrl: string,
  company: TimingCompany,
  organizerName: string
): ExtractedRace[] {
  const extracted: ExtractedRace[] = [];
  const seenTitles = new Set<string>();

  // ---------------------------------------------------------------------------
  // CASO 1: Se o conteúdo já for um objeto JSON ou string JSON
  // ---------------------------------------------------------------------------
  let jsonObj: any = null;
  if (typeof content === 'object') {
    jsonObj = content;
  } else if (typeof content === 'string' && (content.trim().startsWith('{') || content.trim().startsWith('['))) {
    try {
      jsonObj = JSON.parse(content);
    } catch {
      // continua para tentar via regex
    }
  }

  // ---------------------------------------------------------------------------
  // CASO 2: Extrair JSONs embutidos em scripts (listEventos.push)
  // ---------------------------------------------------------------------------
  if (typeof content === 'string') {
    const pushMatches = content.match(/listEventos\.push\s*\(\s*({[\s\S]*?})\s*\);?/g);
    if (pushMatches && pushMatches.length > 0) {
      for (const statement of pushMatches) {
        try {
          const jsonStr = statement.replace(/^listEventos\.push\s*\(\s*/, '').replace(/\s*\);?$/, '');
          const item = JSON.parse(jsonStr);
          processEventObject(item, baseUrl, company, organizerName, extracted, seenTitles);
        } catch {
          // ignora item com sintaxe inválida
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Processamento de objetos de lista (apenas eventos ativos/calendário)
  // ---------------------------------------------------------------------------
  if (jsonObj) {
    const list = Array.isArray(jsonObj) 
      ? jsonObj 
      : (jsonObj.listEventos || jsonObj.eventos || jsonObj.events || []);

    if (Array.isArray(list)) {
      list.forEach((item) => {
        processEventObject(item, baseUrl, company, organizerName, extracted, seenTitles);
      });
    }
    // OBS: jsonObj.listResults NÃO É PROCESSADO para evitar links de tempos passados
  }

  return extracted;
}

function processEventObject(
  item: any,
  baseUrl: string,
  company: TimingCompany,
  organizerName: string,
  outList: ExtractedRace[],
  seenTitles: Set<string>
): void {
  if (!item || typeof item !== 'object') return;

  // Extrai Título
  const title = (item.eve_nome || item.nome || item.title || item.nome_especial || '').trim();
  if (!title || title.length < 3) return;

  // Extrai Data
  const rawDate = item.eve_data_evento || item.data || item.data_evento || item.event_date || '';
  const eventDate = parseSlashDate(rawDate);
  const eventYear = eventDate ? eventDate.split('-')[0] : '2026';

  const titleKey = `${title.toLowerCase().trim()}_${eventDate}`;
  if (seenTitles.has(titleKey)) return;
  seenTitles.add(titleKey);

  // Extrai Cidade
  const rawCity = item.eve_cidade || item.cidade || item.city || '';
  const city = extractCity(rawCity, 'Tailândia');

  // Extrai Link Bruto
  let relativeLink = item.url_evento || item.link || item.url || '';
  if (typeof relativeLink === 'object' && relativeLink !== null) {
    const firstKey = Object.keys(relativeLink)[0];
    if (firstKey && relativeLink[firstKey]?.url) {
      relativeLink = relativeLink[firstKey].url;
    } else {
      relativeLink = `/evento/${item.eve_id || ''}`;
    }
  }

  const rawAbsoluteUrl = relativeLink ? toAbsoluteUrl(baseUrl, String(relativeLink)) : null;

  // Status estrito da prova baseado nos códigos do chip
  // 1 = liberado/aberto, 2 = encerrado, 0 = aguardando/em breve
  let status: RaceStatus = 'UPCOMING';
  if (item.eve_liberado === 1) {
    status = 'OPEN';
  } else if (item.eve_liberado === 2 || String(title).toLowerCase().includes('encerrad')) {
    status = 'CLOSED';
  } else {
    status = 'UPCOMING';
  }

  // Validação Rígida de Link de Inscrição:
  // Se for status OPEN e a URL passar na validação estrita (sem termos proibidos de resultados)
  let registrationUrl: string | null = null;
  if (status === 'OPEN' && rawAbsoluteUrl && isValidRegistrationUrl(rawAbsoluteUrl, eventYear)) {
    registrationUrl = rawAbsoluteUrl;
  }

  // Banner
  const bannerRaw = item.imagem_capa || item.imagem || item.banner || '';
  const bannerUrl = bannerRaw ? toAbsoluteUrl(baseUrl, String(bannerRaw)) : undefined;

  // Regulamento inicial se presente no objeto
  let regulationUrl: string | null = null;
  if (item.url_evento_regulamento && typeof item.url_evento_regulamento === 'string' && item.url_evento_regulamento.trim()) {
    regulationUrl = toAbsoluteUrl(baseUrl, item.url_evento_regulamento.trim());
  }

  // Distâncias
  const distances = extractDistances(title + ' ' + (item.tipo_eve_nome || ''));

  outList.push({
    title,
    eventDate,
    eventTime: item.eve_hora || '06:00',
    city,
    state: 'PA',
    timingCompany: company,
    registrationUrl,
    bannerUrl,
    regulationUrl,
    rulesUrl: regulationUrl,
    distances,
    status,
    currentBatch: status === 'OPEN' ? 'Inscrições Abertas' : status === 'CLOSED' ? 'Encerrada' : 'Aguardando Inscrição',
    price: null,
    priceFrom: undefined,
    isRegistrationOpen: status === 'OPEN' && Boolean(registrationUrl),
    organizer: organizerName,
    rawData: {
      originalId: item.eve_id || item.id,
      liberado: item.eve_liberado,
      tipo: item.tipo_eve_nome,
      relativeUrl: relativeLink
    }
  });
}
