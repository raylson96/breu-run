/**
 * Gera um slug amigável para URLs a partir do título e data do evento
 * Ex: "4ª Corrida Noturna de Tailândia" e "2026-11-07" -> "4-corrida-noturna-de-tailandia-2026"
 */
export function slugify(text: string, dateStr?: string): string {
  const year = dateStr ? dateStr.split('-')[0] : '';
  
  let slug = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentuação
    .toLowerCase()
    .replace(/\b(\d+)[ªº°a]\b/g, '$1') // 4ª -> 4
    .replace(/[^a-z0-9\s-]/g, '')     // remove caracteres especiais
    .trim()
    .replace(/\s+/g, '-');            // substitui espaços por traços

  if (year && !slug.includes(year)) {
    slug = `${slug}-${year}`;
  }

  return slug;
}
