import React, { useState } from 'react';
import type { Race } from '../types/race';
import type { AthleteProfile } from '../types/athlete';
import { 
  hasSavedProfile, 
  formatDateBR, 
  generateAutoFillBookmarklet 
} from '../services/athleteService';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  User, 
  Zap, 
  AlertCircle,
  Edit3
} from 'lucide-react';

interface QuickFillDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  race: Race | null;
  athleteProfile: AthleteProfile;
  onOpenEditProfile: () => void;
}

export const QuickFillDrawer: React.FC<QuickFillDrawerProps> = ({
  isOpen,
  onClose,
  race,
  athleteProfile,
  onOpenEditProfile
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showBookmarkletGuide, setShowBookmarkletGuide] = useState(false);

  if (!isOpen || !race) return null;

  const isProfileComplete = hasSavedProfile(athleteProfile);
  const cleanCPF = athleteProfile.cpf.replace(/\D/g, '');
  const birthBR = formatDateBR(athleteProfile.birthDate);

  const copyToClipboard = (text: string, fieldId: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const copyAllSummary = () => {
    const summary = `Nome: ${athleteProfile.fullName}
CPF: ${athleteProfile.cpf}
Nascimento: ${birthBR}
Sexo: ${athleteProfile.gender}
Camiseta: ${athleteProfile.shirtSize}
WhatsApp: ${athleteProfile.phone}
E-mail: ${athleteProfile.email}
Equipe: ${athleteProfile.team || 'Avulso'}
Cidade: ${athleteProfile.city || 'Tailândia'}/PA`;
    copyToClipboard(summary, 'all');
  };

  const bookmarkletCode = generateAutoFillBookmarklet(athleteProfile);

  const handleOpenRegistration = () => {
    if (race.registrationUrl) {
      window.open(race.registrationUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              <Zap className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg tracking-tight">
                  Assistente de Inscrição Rápida
                </h3>
              </div>
              <p className="text-xs text-orange-100">
                Seus dados prontos para colar na página de inscrição
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prova em Questão */}
        <div className="bg-slate-900 text-white p-3.5 px-4 flex items-center justify-between border-b border-slate-800">
          <div className="min-w-0 pr-3">
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">
              Inscrição para o evento:
            </span>
            <h4 className="font-black text-sm text-white truncate">{race.title}</h4>
            <div className="text-[11px] text-slate-400">
              {race.city}, PA • Cronometragem: <strong className="text-white">{race.chipCompany}</strong>
            </div>
          </div>

          <button
            onClick={handleOpenRegistration}
            className="py-2 px-3.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition cursor-pointer flex-shrink-0 active:scale-95"
          >
            <span>Ir para o Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {!isProfileComplete ? (
            /* Warning if profile is empty */
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3 text-amber-950">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-xs sm:text-sm">
                    Você ainda não cadastrou seu perfil rápido!
                  </h4>
                  <p className="text-xs text-amber-800 leading-relaxed mt-1">
                    Cadastre seu CPF, data de nascimento e tamanho de camiseta uma única vez para preencher qualquer corrida em menos de 10 segundos!
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenEditProfile();
                  }}
                  className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Cadastrar Meus Dados Agora</span>
                </button>
              </div>
            </div>
          ) : (
            /* User profile quick copy fields */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-orange-600" />
                  Copie com 1 clique para colar no formulário:
                </span>

                <button
                  onClick={() => {
                    onClose();
                    onOpenEditProfile();
                  }}
                  className="text-[11px] text-orange-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  Editar meus dados
                </button>
              </div>

              {/* Grid de Botões de Cópia Rápida */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. CPF (Com e Sem Máscara) */}
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">CPF</span>
                    <span className="text-xs font-black text-slate-900 truncate block">
                      {athleteProfile.cpf}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => copyToClipboard(athleteProfile.cpf, 'cpf_fmt')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        copiedField === 'cpf_fmt' 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                      title="Copiar com pontos e traço"
                    >
                      {copiedField === 'cpf_fmt' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'cpf_fmt' ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                    <button
                      onClick={() => copyToClipboard(cleanCPF, 'cpf_clean')}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        copiedField === 'cpf_clean' 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                      title="Copiar apenas os números do CPF"
                    >
                      {copiedField === 'cpf_clean' ? 'OK!' : 'S/ Pontos'}
                    </button>
                  </div>
                </div>

                {/* 2. Data de Nascimento */}
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Nascimento</span>
                    <span className="text-xs font-black text-slate-900 truncate block">
                      {birthBR || 'Não informada'}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(birthBR, 'birth')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      copiedField === 'birth' 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {copiedField === 'birth' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'birth' ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>

                {/* 3. Nome Completo */}
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Nome Completo</span>
                    <span className="text-xs font-bold text-slate-900 truncate block">
                      {athleteProfile.fullName}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(athleteProfile.fullName, 'name')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      copiedField === 'name' 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {copiedField === 'name' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'name' ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>

                {/* 4. Telefone / WhatsApp */}
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">WhatsApp</span>
                    <span className="text-xs font-bold text-slate-900 truncate block">
                      {athleteProfile.phone || 'Não informado'}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(athleteProfile.phone, 'phone')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      copiedField === 'phone' 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {copiedField === 'phone' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'phone' ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>

                {/* 5. Camiseta & Equipe */}
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Camiseta / Sexo</span>
                    <span className="text-xs font-bold text-slate-900 truncate block">
                      Tam: {athleteProfile.shirtSize} ({athleteProfile.gender})
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(athleteProfile.shirtSize, 'shirt')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      copiedField === 'shirt' 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {copiedField === 'shirt' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'shirt' ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>

                {/* 6. Copiar Resumo Completo */}
                <div className="p-2.5 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] font-bold text-orange-600 block uppercase">Todos os Dados</span>
                    <span className="text-xs font-bold text-orange-950 truncate block">
                      Bloco de texto com tudo
                    </span>
                  </div>
                  <button
                    onClick={copyAllSummary}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      copiedField === 'all' 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-orange-600 text-white hover:bg-orange-500'
                    }`}
                  >
                    {copiedField === 'all' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'all' ? 'Copiado!' : 'Copiar Tudo'}</span>
                  </button>
                </div>
              </div>

              {/* Botão de Preenchimento Automático em 1 Clique (Bookmarklet) */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowBookmarkletGuide(!showBookmarkletGuide)}
                  className="w-full text-left p-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl flex items-center justify-between text-xs font-bold hover:from-slate-850 hover:to-slate-750 transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Como preencher em 1 clique automático com o Bookmarklet</span>
                  </span>
                  <span className="text-slate-400 text-[11px] underline">
                    {showBookmarkletGuide ? 'Ocultar' : 'Ver Instrução'}
                  </span>
                </button>

                {showBookmarkletGuide && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2 mt-2 animate-in fade-in">
                    <p className="text-slate-700 text-[11px] leading-relaxed">
                      Você pode copiar o código de autopreenchimento abaixo. Quando abrir a página de inscrição da empresa de chip ({race.chipCompany}), abra o console do navegador ou crie um favorito com ele para preencher CPF, Nome e Data instantaneamente!
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={bookmarkletCode}
                        className="flex-1 p-2 bg-white border border-slate-300 rounded-xl text-[10px] font-mono text-slate-600 truncate"
                      />
                      <button
                        onClick={() => copyToClipboard(bookmarkletCode, 'bookmarklet')}
                        className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer flex items-center gap-1 flex-shrink-0"
                      >
                        {copiedField === 'bookmarklet' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === 'bookmarklet' ? 'Copiado!' : 'Copiar Script'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dica do Chip */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              Ao clicar no botão abaixo, a página oficial de inscrição do <strong>{race.chipCompany}</strong> será aberta em uma nova aba.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="py-2.5 px-4 text-slate-600 hover:bg-slate-200/70 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Fechar
          </button>

          <button
            onClick={handleOpenRegistration}
            className="py-3 px-6 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition shadow-lg shadow-orange-600/30 cursor-pointer active:scale-95 flex-1 sm:flex-initial"
          >
            <span>Abrir Inscrição Agora</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
