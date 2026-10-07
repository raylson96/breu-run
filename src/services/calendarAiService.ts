import { createWorker } from 'tesseract.js';
import type { Race, ChipCompany, RaceStatus } from '../types/race';
import { REGIONS_CITIES } from '../data/mockRaces';

// 1. Parser heurístico avançado de texto bruto (OCR) para corridas do Pará
export function parseRacesFromRawText(text: string): Partial<Race>[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 2);

  const races: Partial<Race>[] = [];

  // Mapeamento de meses em português
  const monthMap: Record<string, string> = {
    jan: '01', janeiro: '01',
    fev: '02', fevereiro: '02',
    mar: '03', março: '03', marco: '03',
    abr: '04', abril: '04',
    mai: '05', maio: '05',
    jun: '06', junho: '06',
    jul: '07', julho: '07',
    ago: '08', agosto: '08',
    set: '09', setembro: '09',
    out: '10', outubro: '10',
    nov: '11', novembro: '11',
    dez: '12', dezembro: '12',
  };

  const currentYear = new Date().getFullYear().toString();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Busca padrões de data:
    // Ex: "25/10", "25/10/2026", "25 DE OUTUBRO", "25 OUT", "2026-11-07"
    let extractedDate: string | null = null;

    // Padrão 1: DD/MM ou DD/MM/AAAA
    const slashMatch = line.match(/(\b\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/);
    if (slashMatch) {
      const day = slashMatch[1].padStart(2, '0');
      const month = slashMatch[2].padStart(2, '0');
      const year = slashMatch[3] ? (slashMatch[3].length === 2 ? `20${slashMatch[3]}` : slashMatch[3]) : currentYear;
      extractedDate = `${year}-${month}-${day}`;
    }

    // Padrão 2: "25 de Outubro" ou "25 OUT"
    if (!extractedDate) {
      const textDateMatch = line.match(/(\b\d{1,2})\s*(?:de\s*)?([a-zçã]{3,9})(?:\s*(?:de\s*)?(\d{4}))?/i);
      if (textDateMatch) {
        const day = textDateMatch[1].padStart(2, '0');
        const monthWord = textDateMatch[2].toLowerCase().substring(0, 3);
        const year = textDateMatch[3] || currentYear;
        if (monthMap[monthWord]) {
          extractedDate = `${year}-${monthMap[monthWord]}-${day}`;
        }
      }
    }

    // Se encontrou uma data ou a linha tem palavras-chave fortes de corrida
    const isRaceLine = 
      /corrida|meia maratona|maratona|desafio|circuito|etapa|trof[eé]u|trail|running/i.test(line);

    if (extractedDate || isRaceLine) {
      // Extrair cidade procurando na lista de cidades do Pará
      let foundCity = 'Tailândia';
      const surroundingText = `${line} ${lines[i + 1] || ''} ${lines[i - 1] || ''}`.toLowerCase();
      
      for (const city of REGIONS_CITIES) {
        if (city !== 'Todas' && surroundingText.includes(city.toLowerCase())) {
          foundCity = city;
          break;
        }
      }

      // Extrair distâncias (ex: 5km, 10km, 21k, 42k)
      const distMatches = surroundingText.match(/(\d+\s*k(?:m)?|\bmeia\b|\bmaratona\b)/gi) || [];
      const distances: string[] = [];
      distMatches.forEach((d) => {
        const clean = d.toLowerCase().replace(/\s+/g, '');
        if (clean.includes('5k')) distances.push('5 km');
        else if (clean.includes('10k')) distances.push('10 km');
        else if (clean.includes('15k')) distances.push('15 km');
        else if (clean.includes('21k') || clean.includes('meia')) distances.push('21 km');
        else if (clean.includes('42k') || clean.includes('maratona')) distances.push('42 km');
      });

      // Extrair empresa de chip
      let chipCompany: ChipCompany = 'A Definir';
      if (/amaz[oô]nia/i.test(surroundingText)) chipCompany = 'Chip Amazônia';
      else if (/breu\s*branco/i.test(surroundingText)) chipCompany = 'Chip Breu Branco';
      else if (/chip\s*par[aá]/i.test(surroundingText)) chipCompany = 'Chip Pará';
      else if (/cronos/i.test(surroundingText)) chipCompany = 'Chip Cronos';

      // Limpar título da corrida
      let cleanTitle = line
        .replace(/(\b\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)/g, '')
        .replace(/^[0-9\.\-\*\s•]+/, '')
        .trim();

      if (cleanTitle.length < 5) {
        cleanTitle = `Corrida de ${foundCity}`;
      }

      races.push({
        id: `race-ocr-${Date.now()}-${races.length}`,
        title: cleanTitle,
        date: extractedDate || `${currentYear}-11-15`,
        time: '06:00',
        city: foundCity,
        state: 'PA',
        location: `Centro, ${foundCity}`,
        distances: distances.length > 0 ? Array.from(new Set(distances)) : ['5 km'],
        chipCompany,
        status: 'confirmed',
        registrationUrl: '',
        currentBatch: 'Confirmada no Calendário',
        organizer: 'Organizador Local'
      });
    }
  }

  // Desduplicar por título/data aproximada
  return races.filter((race, index, self) =>
    index === self.findIndex((r) => r.title === race.title && r.date === race.date)
  );
}

// 2. OCR Nativo no Navegador com Tesseract.js (Sem custos, sem chave de API)
export async function runLocalOcrExtraction(
  imageSource: string | File,
  onProgress?: (progress: number, status: string) => void
): Promise<{ rawText: string; races: Partial<Race>[] }> {
  const worker = await createWorker('por'); // Português

  if (onProgress) {
    onProgress(20, 'Carregando motor de visão neural...');
  }

  let imageUrl: string;
  if (typeof imageSource === 'string') {
    imageUrl = imageSource;
  } else {
    imageUrl = URL.createObjectURL(imageSource);
  }

  if (onProgress) {
    onProgress(50, 'Escaneando texto do cartaz do calendário...');
  }

  const ret = await worker.recognize(imageUrl);
  const rawText = ret.data.text;

  if (onProgress) {
    onProgress(85, 'Interpretando datas, percursos e cidades...');
  }

  await worker.terminate();

  const races = parseRacesFromRawText(rawText);

  if (onProgress) {
    onProgress(100, 'Leitura concluída com sucesso!');
  }

  return { rawText, races };
}

// 3. Leitura Direta por IA Multimodal (Google Gemini Vision API)
export async function runGeminiVisionExtraction(
  apiKey: string,
  imageBase64: string,
  onProgress?: (status: string) => void
): Promise<Partial<Race>[]> {
  if (onProgress) onProgress('Enviando imagem para a IA Multimodal (Gemini)...');

  // Remove data URI prefix if present: "data:image/jpeg;base64,..."
  const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

  const prompt = `Analise esta imagem de calendário/cartaz de corridas de rua do Pará e extraia TODOS os eventos.
Retorne rigorosamente um array JSON de objetos com esta estrutura exata:
[
  {
    "title": "Nome da prova (ex: 4ª Corrida Noturna de Tailândia)",
    "date": "AAAA-MM-DD",
    "time": "06:00",
    "city": "Tailândia, Marabá, Breu Branco, Parauapebas, Belém, etc.",
    "location": "Local de largada se visível, ou 'Centro'",
    "distances": ["5 km", "10 km"],
    "chipCompany": "Chip Amazônia, Chip Breu Branco, Chip Pará, ou 'A Definir'",
    "status": "confirmed",
    "registrationUrl": "",
    "currentBatch": "Confirmada no Calendário"
  }
]
Não inclua nenhuma outra palavra ou markdown além do array JSON.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: cleanBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        response_mime_type: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Erro na API Gemini (${response.status})`);
  }

  const json = await response.json();
  const rawContent = json.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawContent) {
    throw new Error('A IA não retornou nenhum texto reconhecido.');
  }

  // Parse JSON
  const parsed = JSON.parse(rawContent.trim());
  if (!Array.isArray(parsed)) {
    throw new Error('A IA retornou um formato inesperado (não é uma lista).');
  }

  return parsed.map((item, index) => ({
    id: `race-gemini-${Date.now()}-${index}`,
    title: item.title || 'Corrida Regional',
    date: item.date || '2026-11-15',
    time: item.time || '06:00',
    city: item.city || 'Tailândia',
    state: 'PA',
    location: item.location || `Centro, ${item.city || 'PA'}`,
    distances: Array.isArray(item.distances) && item.distances.length > 0 ? item.distances : ['5 km'],
    chipCompany: (item.chipCompany as ChipCompany) || 'A Definir',
    status: (item.status as RaceStatus) || 'confirmed',
    registrationUrl: item.registrationUrl || '',
    currentBatch: item.currentBatch || 'Confirmada no Calendário',
    organizer: item.organizer || 'Organizador Local'
  }));
}
