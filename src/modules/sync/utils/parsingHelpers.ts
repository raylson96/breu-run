/**
 * Utilitários de extração, parsing e validação rigorosa para scrapers de corrida em português
 */

const MONTHS_MAP: Record<string, string> = {
  janeiro: '01',
  jan: '01',
  fevereiro: '02',
  fev: '02',
  marco: '03',
  março: '03',
  mar: '03',
  abril: '04',
  abr: '04',
  maio: '05',
  mai: '05',
  junho: '06',
  jun: '06',
  julho: '07',
  jul: '07',
  agosto: '08',
  ago: '08',
  setembro: '09',
  set: '09',
  outubro: '10',
  out: '10',
  novembro: '11',
  nov: '11',
  dezembro: '12',
  dez: '12'
};

const COMMON_PARA_CITIES = [
  'Tailândia',
  'Breu Branco',
  'Marabá',
  'Parauapebas',
  'Belém',
  'Tucuruí',
  'Canaã dos Carajás',
  'Barcarena',
  'Abaetetuba',
  'Castanhal',
  'Bragança',
  'Cametá',
  'Moju',
  'Tomé-Açu',
  'Salinópolis',
  'Santarém',
  'Altamira',
  'Redenção',
  'Itaituba',
  'Capanema',
  'Igarapé-Miri',
  'Goianésia do Pará',
  'Jacundá',
  'Novo Repartimento',
  'Rondon do Pará',
  'Nova Ipixuna',
  'Abel Figueiredo',
  'Pacajá',
  'Oeiras do Pará',
  'Itupiranga',
  'Ulianópolis',
  'Dom Eliseu',
  'Paragominas',
  'São Geraldo do Araguaia',
  'Eldorado do Carajás',
  'Curionópolis'
];

/**
 * Termos expressamente proibidos em URLs de inscrição.
 * Se a URL contiver qualquer um destes termos no caminho ou parâmetros, NUNCA é um link de inscrição ativo.
 */
export const FORBIDDEN_URL_TERMS = [
  'resultado',
  'resultados',
  'result',
  'resultado-evento',
  'racetag',
  'racezone',
  'classificacao',
  'classificação',
  'tempo',
  'tempos',
  'ranking',
  'certificado',
  'certificados',
  'fotos',
  'foto',
  'edicao-anterior',
  'edicao_anterior',
  'listar=1',
  'lista_inscritos',
  'inscritos',
  'comprovante',
  '.pdf',
  'upload/doc',
  'documento',
  'regulamento'
];

/**
 * Caminhos esperados e válidos para checkout, inscrição ou página oficial ativa
 */
export const VALID_REGISTRATION_PATHS = [
  'inscricao-select',
  'inscricao',
  'inscrição',
  'evento',
  'eventos',
  'inscreva-se',
  'inscrevase',
  'ticket',
  'comprar',
  'detalhes-evento'
];

/**
 * Validação rigorosa de URLs de Inscrição.
 * Garante que nunca seja associado um link de resultados, tempos ou edições anteriores.
 */
export function isValidRegistrationUrl(
  url: string | null | undefined,
  expectedYear?: string | number
): boolean {
  if (!url || typeof url !== 'string') return false;

  const trimmed = url.trim();
  if (trimmed.length < 10) return false;

  // 1. Deve ser URL com protocolo http/https válido
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return false;
  }

  const lower = trimmed.toLowerCase();

  // 2. Proibição absoluta de termos de resultados / tempos / classificações / fotos
  for (const forbidden of FORBIDDEN_URL_TERMS) {
    if (lower.includes(forbidden)) {
      return false;
    }
  }

  // 3. Validação de rotas de inscrição / evento oficiais
  const hasValidPath = VALID_REGISTRATION_PATHS.some((path) => lower.includes(path));
  if (!hasValidPath) {
    return false;
  }

  // 4. Validação de Ano / Edição:
  // Se o ano esperado for fornecido (ex: 2026), não pode apontar para páginas antigas (2022, 2023, 2024, 2025)
  if (expectedYear) {
    const yearNum = typeof expectedYear === 'string' ? parseInt(expectedYear, 10) : expectedYear;
    if (!isNaN(yearNum)) {
      // Procura anos passados de 4 dígitos na URL
      const yearMatches = lower.match(/\b(201\d|202[0-5])\b/g);
      if (yearMatches && yearMatches.length > 0) {
        // Se encontrou ano anterior ao ano esperado da corrida
        const hasPastYear = yearMatches.some((y) => parseInt(y, 10) < yearNum);
        if (hasPastYear) {
          return false;
        }
      }
    }
  }

  return true;
}

/**
 * Normaliza e converte formatos de datas brasileiras para ISO YYYY-MM-DD
 */
export function parsePortugueseDate(text: string): string | null {
  if (!text) return null;

  // 1. Formato DD/MM/AAAA ou DD-MM-AAAA
  const slashMatch = text.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/);
  if (slashMatch) {
    const day = slashMatch[1].padStart(2, '0');
    const month = slashMatch[2].padStart(2, '0');
    const year = slashMatch[3];
    return `${year}-${month}-${day}`;
  }

  // 2. Formato "15 de Novembro de 2026" ou "15 Nov 2026"
  const clean = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const textDateMatch = clean.match(/\b(\d{1,2})\s+(?:de\s+)?([a-z]{3,9})\s+(?:de\s+)?(\d{4})\b/);
  if (textDateMatch) {
    const day = textDateMatch[1].padStart(2, '0');
    const monthName = textDateMatch[2];
    const year = textDateMatch[3];
    const month = MONTHS_MAP[monthName];
    if (month) {
      return `${year}-${month}-${day}`;
    }
  }

  return null;
}

/**
 * Regex obrigatório e extrator abrangente para percursos e distâncias.
 * Captura: \b(\d+(?:[.,]\d+)?)\s*(?:km|k|quil[oô]metros?|metros?|m)\b/gi
 * E categoriza modalidades (7 km, Meia Maratona, Caminhada, Kids).
 */
export function extractDistances(text: string): string[] {
  if (!text) return ['5 km'];

  const found = new Set<string>();
  const lower = text.toLowerCase();

  // Regex obrigatório para distâncias numéricas
  const regex = /\b(\d+(?:[.,]\d+)?)\s*(?:km|k|quil[oô]metros?|metros?|m)\b/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(lower)) !== null) {
    const fullMatch = match[0].toLowerCase();
    const rawNum = match[1].replace(',', '.');
    const val = parseFloat(rawNum);

    if (isNaN(val) || val <= 0) continue;

    // Se a unidade for metros e menor que 1000m (ex: "100m", "400 metros", "Kids 200m")
    if ((fullMatch.includes('m') || fullMatch.includes('metro')) && !fullMatch.includes('k') && !fullMatch.includes('quil') && val < 1000) {
      found.add(`Kids ${Math.round(val)} m`);
      continue;
    }

    // Se a unidade for em km ou metros >= 1000
    const kmValue = val >= 1000 ? val / 1000 : val;
    if (kmValue >= 1 && kmValue <= 100) {
      const formattedKm = Number.isInteger(kmValue) ? `${kmValue} km` : `${kmValue} km`;
      found.add(formattedKm);
    }
  }

  // Detecção contextual de modalidades especiais
  if (lower.includes('meia maratona') || lower.includes('21 km') || lower.includes('21k')) {
    found.add('21 km');
  }
  if (lower.includes('maratona') && !lower.includes('meia')) {
    found.add('42 km');
  }
  if (lower.includes('caminhada')) {
    // Procura se tem quilometragem associada à caminhada
    const caminhadaMatch = lower.match(/caminhada\s*(?:de\s*)?(\d+)\s*(?:km|k)?/i);
    if (caminhadaMatch && caminhadaMatch[1]) {
      found.add(`Caminhada ${caminhadaMatch[1]} km`);
    } else {
      found.add('Caminhada 3 km');
    }
  }

  if (found.size === 0) {
    return ['5 km'];
  }

  // Ordena por distância para exibição limpa
  return Array.from(found).sort((a, b) => {
    const valA = parseFloat(a.replace(/[^0-9.]/g, '')) || 0;
    const valB = parseFloat(b.replace(/[^0-9.]/g, '')) || 0;
    return valA - valB;
  });
}

/**
 * Extrai valor monetário numérico em reais e lote associado.
 * Suporta formatos: R$ 85,00, R$ 85, R$ 89.99, 85.00, 85, "Geral R$ 70", etc.
 */
export function extractPrice(textOrNumber: string | number | null | undefined): number | null {
  if (textOrNumber === null || textOrNumber === undefined) return null;
  if (typeof textOrNumber === 'number') {
    return isNaN(textOrNumber) || textOrNumber <= 0 ? null : textOrNumber;
  }

  const raw = String(textOrNumber).trim();
  if (!raw) return null;

  // 1. Número puro (ex: "85", "85.00", "85,50")
  if (/^\d+(?:[.,]\d{1,2})?$/.test(raw)) {
    const parsed = parseFloat(raw.replace(',', '.'));
    return isNaN(parsed) || parsed <= 0 ? null : parsed;
  }

  // 2. Regex focado em R$ com ou sem centavos (ex: R$ 85,00, R$ 85, R$ 150)
  const currencyMatch = raw.match(/R\$\s*(\d{1,3}(?:[.,]\d{1,2})?)/i);
  if (currencyMatch && currencyMatch[1]) {
    const cleanNum = currencyMatch[1].replace(',', '.');
    const val = parseFloat(cleanNum);
    if (!isNaN(val) && val > 0 && val < 5000) {
      return val;
    }
  }

  // 3. Fallback para termos de inscrição, taxa, lote, geral
  const altMatch = raw.match(/(?:inscrição|lote|taxa|geral|individual|valor)[:\s]+(?:R\$\s*)?(\d{1,3}(?:[.,]\d{1,2})?)/i);
  if (altMatch && altMatch[1]) {
    const cleanNum = altMatch[1].replace(',', '.');
    const val = parseFloat(cleanNum);
    if (!isNaN(val) && val > 0 && val < 5000) {
      return val;
    }
  }

  return null;
}

/**
 * Extrai link direto do regulamento em PDF a partir do HTML ou texto
 */
export function extractRegulationUrl(htmlOrText: string, baseUrl: string): string | null {
  if (!htmlOrText) return null;

  // 1. Procura tags <a> com links apontando para PDF ou regulamento
  const pdfMatch = htmlOrText.match(/href\s*=\s*['"]([^'"]*(?:regulamento|upload\/doc)[^'"]*\.pdf[^'"]*)['"]/i)
    || htmlOrText.match(/href\s*=\s*['"]([^'"]*\.pdf)['"]/i)
    || htmlOrText.match(/href\s*=\s*['"]([^'"]*regulamento[^'"]*)['"]/i);

  if (pdfMatch && pdfMatch[1]) {
    const raw = pdfMatch[1].trim();
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return raw;
    }
    const cleanBase = baseUrl.replace(/\/+$/, '');
    const cleanPath = raw.startsWith('/') ? raw : `/${raw}`;
    return `${cleanBase}${cleanPath}`;
  }

  return null;
}

/**
 * Identifica a cidade do Pará mencionada no texto ou retorna default
 */
export function extractCity(text: string, defaultCity = 'Tailândia'): string {
  if (!text) return defaultCity;

  // Remove sufixos como " - PA", " / PA", ", PA", etc.
  const cleaned = text.replace(/[\s\-_/,]+(pa|para)$/i, '').trim();
  if (!cleaned) return defaultCity;

  const norm = cleaned.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  for (const city of COMMON_PARA_CITIES) {
    const cityNorm = city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (norm === cityNorm || norm.includes(cityNorm)) {
      return city;
    }
  }

  // Se for um nome direto de município não presente na lista padrão
  if (cleaned.length >= 3 && cleaned.length <= 40 && !cleaned.includes('http')) {
    return cleaned
      .toLowerCase()
      .split(' ')
      .map((w) => ['de', 'do', 'da', 'dos', 'das', 'e'].includes(w) ? w : w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  return defaultCity;
}
