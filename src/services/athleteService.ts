import type { AthleteProfile } from '../types/athlete';
import { EMPTY_ATHLETE_PROFILE } from '../types/athlete';

const STORAGE_KEY = 'athlete_secure_vault_v1';

export function getAthleteProfile(): AthleteProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...EMPTY_ATHLETE_PROFILE, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Erro ao ler perfil do atleta', e);
  }
  return EMPTY_ATHLETE_PROFILE;
}

export function saveAthleteProfile(profile: AthleteProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Erro ao salvar perfil do atleta', e);
  }
}

export function clearAthleteProfile(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Erro ao limpar perfil do atleta', e);
  }
}

export function hasSavedProfile(profile: AthleteProfile): boolean {
  return Boolean(profile.fullName.trim() && profile.cpf.trim());
}

// Formatação amigável de CPF: 000.000.000-00
export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

// Formatação de telefone: (99) 99999-9999
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

// Formatação de data BR: DD/MM/AAAA a partir de YYYY-MM-DD
export function formatDateBR(dateIso: string): string {
  if (!dateIso) return '';
  const parts = dateIso.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateIso;
}

/**
 * Gera um Bookmarklet (código JavaScript executável no navegador)
 * que o atleta pode salvar nos favoritos ou colar no console para preencher
 * automaticamente os campos no site da empresa de chip (Chip Amazônia, Chip Breu Branco, Chip Pará, Chip Cronos).
 */
export function generateAutoFillBookmarklet(profile: AthleteProfile): string {
  const cleanCPF = profile.cpf.replace(/\D/g, '');
  const birthBR = formatDateBR(profile.birthDate);
  const cleanPhone = profile.phone.replace(/\D/g, '');

  const script = `javascript:(function(){
    const data = {
      name: "${profile.fullName.replace(/"/g, '\\"')}",
      cpf: "${cleanCPF}",
      cpfFormatted: "${profile.cpf}",
      birth: "${birthBR}",
      birthIso: "${profile.birthDate}",
      email: "${profile.email}",
      phone: "${cleanPhone}",
      phoneFormatted: "${profile.phone}",
      gender: "${profile.gender}",
      team: "${profile.team.replace(/"/g, '\\"')}",
      city: "${profile.city.replace(/"/g, '\\"')}",
      state: "${profile.state}",
      shirt: "${profile.shirtSize}"
    };
    function fill(selectors, value) {
      if(!value) return;
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) {
          el.value = value;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          el.dispatchEvent(new Event('blur', { bubbles: true }));
          return true;
        }
      }
      return false;
    }
    fill(['input[name*="cpf" i]', 'input[id*="cpf" i]', 'input[placeholder*="cpf" i]'], data.cpfFormatted || data.cpf);
    fill(['input[name*="nome" i]', 'input[id*="nome" i]', 'input[placeholder*="nome" i]'], data.name);
    fill(['input[name*="nasc" i]', 'input[id*="nasc" i]', 'input[name*="birth" i]', 'input[placeholder*="nascimento" i]'], data.birth);
    fill(['input[name*="email" i]', 'input[id*="email" i]'], data.email);
    fill(['input[name*="tel" i]', 'input[name*="cel" i]', 'input[id*="telefone" i]', 'input[id*="whatsapp" i]'], data.phoneFormatted);
    fill(['input[name*="equipe" i]', 'input[name*="assessoria" i]', 'input[id*="equipe" i]'], data.team);
    fill(['input[name*="cidade" i]', 'input[id*="cidade" i]'], data.city);
    alert('✅ Dados do Atleta (Pará Run) preenchidos com sucesso!');
  })();`;

  return script.replace(/\n\s*/g, ' ').trim();
}
