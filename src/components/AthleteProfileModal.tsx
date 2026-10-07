import React, { useState, useEffect } from 'react';
import type { AthleteProfile } from '../types/athlete';
import { 
  getAthleteProfile, 
  saveAthleteProfile, 
  clearAthleteProfile,
  formatCPF, 
  formatPhone 
} from '../services/athleteService';
import { 
  X, 
  ShieldCheck, 
  User, 
  CreditCard, 
  Calendar, 
  Phone, 
  Mail, 
  Shirt, 
  Users, 
  MapPin, 
  Check, 
  Trash2, 
  Lock, 
  HeartHandshake
} from 'lucide-react';

interface AthleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (profile: AthleteProfile) => void;
}

export const AthleteProfileModal: React.FC<AthleteProfileModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated
}) => {
  const [profile, setProfile] = useState<AthleteProfile>(getAthleteProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProfile(getAthleteProfile());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof AthleteProfile, value: string) => {
    let formattedVal = value;
    if (field === 'cpf') formattedVal = formatCPF(value);
    if (field === 'phone' || field === 'emergencyPhone') formattedVal = formatPhone(value);

    setProfile((prev) => ({
      ...prev,
      [field]: formattedVal
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveAthleteProfile(profile);
    setSavedSuccess(true);
    if (onProfileUpdated) {
      onProfileUpdated(profile);
    }
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    if (window.confirm('Tem certeza de que deseja apagar os dados salvos no seu dispositivo?')) {
      clearAthleteProfile();
      const cleared = getAthleteProfile();
      setProfile(cleared);
      if (onProfileUpdated) {
        onProfileUpdated(cleared);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-orange-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-600/30 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg tracking-tight">Meu Perfil de Atleta</h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full">
                  100% SEGURO
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Preenchimento rápido e automático para inscrições de corrida
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-850 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security / LGPD Notice Banner */}
        <div className="bg-emerald-50 border-b border-emerald-200/80 px-4 py-3 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
          <div className="text-[11px] text-emerald-900 leading-relaxed">
            <strong>Privacidade Garantida (LGPD):</strong> Seus dados pessoais (como CPF e data de nascimento) ficam gravados <strong>somente no seu próprio navegador</strong>. Não enviamos seus dados para servidores externos. Você usa esses dados para agilizar sua inscrição com 1 clique antes que os lotes esgotem!
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {savedSuccess && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-700" />
              <span>Perfil salvo com sucesso no seu dispositivo! Fechando...</span>
            </div>
          )}

          {/* Nome e CPF */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-orange-600" />
                Nome Completo
              </label>
              <input
                type="text"
                required
                value={profile.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="Ex: João da Silva Santos"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-orange-600" />
                CPF (Principal para o Chip)
              </label>
              <input
                type="text"
                required
                maxLength={14}
                value={profile.cpf}
                onChange={(e) => handleChange('cpf', e.target.value)}
                placeholder="000.000.000-00"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Data de Nascimento, Gênero e Tamanho de Camiseta */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-orange-600" />
                Data de Nascimento
              </label>
              <input
                type="date"
                required
                value={profile.birthDate}
                onChange={(e) => handleChange('birthDate', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Gênero
              </label>
              <select
                value={profile.gender}
                onChange={(e) => handleChange('gender', e.target.value as 'M' | 'F' | 'Outro')}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Shirt className="w-3.5 h-3.5 text-orange-600" />
                Tamanho da Camiseta
              </label>
              <select
                value={profile.shirtSize}
                onChange={(e) => handleChange('shirtSize', e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="PP">PP</option>
                <option value="P">P</option>
                <option value="M">M (Padrão)</option>
                <option value="G">G</option>
                <option value="GG">GG</option>
                <option value="XGG">XGG</option>
                <option value="Babylook M">Babylook M</option>
                <option value="Babylook G">Babylook G</option>
              </select>
            </div>
          </div>

          {/* WhatsApp e E-mail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-orange-600" />
                WhatsApp / Celular
              </label>
              <input
                type="text"
                maxLength={15}
                value={profile.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(94) 99123-4567"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-orange-600" />
                E-mail
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Assessoria / Equipe e Cidade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-orange-600" />
                Assessoria Esportiva / Equipe
              </label>
              <input
                type="text"
                value={profile.team}
                onChange={(e) => handleChange('team', e.target.value)}
                placeholder="Ex: Tailândia Runners / Pelotão Marabá / Avulso"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-600" />
                Cidade de Residência
              </label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Ex: Tailândia, Marabá, Breu Branco, Belém"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Dados Médicos e Emergência (Opcional) */}
          <div className="pt-2 border-t border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Informações Adicionais para o Regulamento (Opcional)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo Sanguíneo
                </label>
                <select
                  value={profile.bloodType || ''}
                  onChange={(e) => handleChange('bloodType', e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                >
                  <option value="">Não informado</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <HeartHandshake className="w-3 h-3 text-rose-500" />
                  Contato Emergência
                </label>
                <input
                  type="text"
                  value={profile.emergencyContact || ''}
                  onChange={(e) => handleChange('emergencyContact', e.target.value)}
                  placeholder="Nome do parente"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                >
                </input>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telefone Emergência
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={profile.emergencyPhone || ''}
                  onChange={(e) => handleChange('emergencyPhone', e.target.value)}
                  placeholder="(94) 99..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleClear}
              className="px-3.5 py-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Limpar Dados</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs sm:text-sm font-black transition shadow-lg shadow-orange-600/30 flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Salvar Meus Dados Rápidos</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
