export interface AthleteProfile {
  fullName: string;
  cpf: string;
  birthDate: string; // YYYY-MM-DD
  gender: 'M' | 'F' | 'Outro';
  shirtSize: 'PP' | 'P' | 'M' | 'G' | 'GG' | 'XGG' | 'Babylook M' | 'Babylook G';
  phone: string;
  email: string;
  team: string; // Assessoria esportiva ou equipe
  city: string;
  state: string;
  bloodType?: string; // Ex: A+, O+, etc.
  emergencyContact?: string;
  emergencyPhone?: string;
}

export const EMPTY_ATHLETE_PROFILE: AthleteProfile = {
  fullName: '',
  cpf: '',
  birthDate: '',
  gender: 'M',
  shirtSize: 'M',
  phone: '',
  email: '',
  team: '',
  city: '',
  state: 'PA',
  bloodType: '',
  emergencyContact: '',
  emergencyPhone: ''
};
