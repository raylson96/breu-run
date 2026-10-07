import axios from 'axios';

export interface HttpClientOptions {
  timeoutMs?: number;
  retries?: number;
  delayMs?: number;
  headers?: Record<string, string>;
}

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache'
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Converte URLs externas para rota de proxy local quando executado no navegador (evitando CORS)
 */
export function resolveBrowserSafeUrl(targetUrl: string): string {
  if (typeof window === 'undefined') {
    return targetUrl;
  }

  try {
    const parsed = new URL(targetUrl, window.location.origin);
    const host = parsed.hostname.toLowerCase();

    if (host.includes('chipamazonia.com.br')) {
      return `/proxy-chipamazonia${parsed.pathname}${parsed.search}`;
    }
    if (host.includes('chipbreubranco.com.br')) {
      return `/proxy-chipbreubranco${parsed.pathname}${parsed.search}`;
    }
    if (host.includes('chippara.com.br')) {
      return `/proxy-chippara${parsed.pathname}${parsed.search}`;
    }
    if (host.includes('superachipcrono.com.br')) {
      return `/proxy-supera${parsed.pathname}${parsed.search}`;
    }
  } catch {
    // ignora falhas de parse de URL
  }

  return targetUrl;
}

/**
 * Realiza requisição HTTP GET para obter texto/HTML com retry e suporte a fallback de CORS
 */
export async function fetchHtmlWithRetry(
  url: string,
  options: HttpClientOptions = {}
): Promise<string> {
  const {
    timeoutMs = 12000,
    retries = 2,
    delayMs = 1000,
    headers = {}
  } = options;

  const resolvedUrl = resolveBrowserSafeUrl(url);
  const urlsToTry = [resolvedUrl];

  // Se estiver no navegador e a URL original for externa, adiciona fallback de proxy CORS público
  if (typeof window !== 'undefined' && url.startsWith('http')) {
    urlsToTry.push(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
  }

  let lastError: Error | null = null;

  for (const candidateUrl of urlsToTry) {
    let attempt = 0;
    let currentDelay = delayMs;

    while (attempt < retries) {
      try {
        attempt++;
        const response = await axios.get<string>(candidateUrl, {
          timeout: timeoutMs,
          headers: {
            ...DEFAULT_HEADERS,
            ...headers
          },
          responseType: 'text',
          validateStatus: (status) => status >= 200 && status < 400
        });

        if (response.data && typeof response.data === 'string') {
          return response.data;
        }
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < retries) {
          await sleep(currentDelay);
          currentDelay *= 1.5;
        }
      }
    }
  }

  throw new Error(
    `[HttpClient] Falha ao obter dados da URL "${url}": ${lastError?.message || 'Erro de conexão'}`
  );
}

/**
 * Realiza requisição HTTP GET para obter objeto JSON com retry resiliente
 */
export async function fetchJsonWithRetry<T = any>(
  url: string,
  options: HttpClientOptions = {}
): Promise<T> {
  const {
    timeoutMs = 12000,
    retries = 2,
    delayMs = 1000,
    headers = {}
  } = options;

  const resolvedUrl = resolveBrowserSafeUrl(url);
  const urlsToTry = [resolvedUrl];

  if (typeof window !== 'undefined' && url.startsWith('http')) {
    urlsToTry.push(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
  }

  let lastError: Error | null = null;

  for (const candidateUrl of urlsToTry) {
    let attempt = 0;
    let currentDelay = delayMs;

    while (attempt < retries) {
      try {
        attempt++;
        const response = await axios.get<T>(candidateUrl, {
          timeout: timeoutMs,
          headers: {
            ...DEFAULT_HEADERS,
            'Accept': 'application/json, text/plain, */*',
            ...headers
          },
          validateStatus: (status) => status >= 200 && status < 400
        });

        if (response.data) {
          // Se AllOrigins retornar uma string em vez de objeto parseado
          if (typeof response.data === 'string' && (response.data.trim().startsWith('{') || response.data.trim().startsWith('['))) {
            try {
              return JSON.parse(response.data) as T;
            } catch {
              // segue fluxo
            }
          }
          return response.data;
        }
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < retries) {
          await sleep(currentDelay);
          currentDelay *= 1.5;
        }
      }
    }
  }

  throw new Error(
    `[HttpClient] Falha ao obter JSON da URL "${url}": ${lastError?.message || 'Erro de conexão'}`
  );
}
