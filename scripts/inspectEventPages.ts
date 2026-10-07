import axios from 'axios';
import * as cheerio from 'cheerio';

async function inspectEventPages() {
  const sampleUrls = [
    'https://www.chipamazonia.com.br/evento/2026/corrida-de-rua/2-corridarosapink2026',
    'https://www.chipbreubranco.com.br/evento/2026/corrida-de-rua/corrida-de-rua-nova-ipixuna-run-33-anos',
    'https://www.chippara.com.br/evento/1682/1-corrida-do-amor-em-prol-da-vida',
    'https://www.superachipcrono.com.br/evento/5800/1-corrida-satlinkplay'
  ];

  for (const url of sampleUrls) {
    console.log(`\n=================== Fetching: ${url} ===================`);
    try {
      const res = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        timeout: 15000
      });
      const html = res.data;
      const $ = cheerio.load(html);

      console.log('Page Title:', $('title').text().trim());

      // Search for price
      const text = $('body').text();
      const priceMatches = text.match(/(?:R\$\s*|valor:\s*R?\$\s*)(\d{1,3}(?:[.,]\d{2}))/gi);
      console.log('Price matches:', priceMatches?.slice(0, 5));

      // Search for distances
      const distMatches = text.match(/\b(\d+(?:[.,]\d+)?)\s*(?:km|k|quil[oô]metros?|metros?|m)\b/gi);
      console.log('Distance matches:', [...new Set(distMatches || [])].slice(0, 8));

      // Search for regulation PDF
      const regLinks: string[] = [];
      $('a[href*="regulamento"], a[href*="pdf"], a[href*="Regulamento"]').each((_, a) => {
        regLinks.push($(a).attr('href') || '');
      });
      console.log('Regulation links:', regLinks);

      // Search for location/address
      const locationText = text.match(/(?:local|largada|concentra[çc][ãa]o)[:\s]+([^\n\r.]+)/i);
      if (locationText) {
        console.log('Location snippet:', locationText[0].trim());
      }

      // Search for time
      const timeMatch = text.match(/(?:hor[áa]rio|largada)[:\s]+(\d{1,2}[:h]\d{2})/i);
      if (timeMatch) {
        console.log('Time snippet:', timeMatch[0].trim());
      }
    } catch (e) {
      console.error('Error fetching', url, e.message);
    }
  }
}

inspectEventPages();
