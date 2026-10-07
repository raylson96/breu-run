import React, { useState } from 'react';
import { X, MessageCircle, Bell, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { REGIONS_CITIES } from '../data/mockRaces';

interface WhatsAppAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppAlertModal: React.FC<WhatsAppAlertModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedCity, setSelectedCity] = useState('Todas');
  const [phone, setPhone] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
  };

  const resetAndClose = () => {
    setIsSuccess(false);
    setPhone('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-emerald-700 text-white p-5 flex items-start justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black leading-tight">
                Alertas de Corridas no WhatsApp
              </h2>
              <p className="text-xs text-emerald-100">
                Nunca mais perca o 1º lote ou a abertura de inscrições!
              </p>
            </div>
          </div>

          <button
            onClick={resetAndClose}
            className="w-8 h-8 rounded-full bg-emerald-800 text-emerald-200 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {isSuccess ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-black text-lg text-slate-900">
                Você está na lista prioritária!
              </h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Assim que uma nova prova for cadastrada em <strong>{selectedCity}</strong> ou quando um lote estiver virando, você receberá a notificação direta.
              </p>
              <button
                onClick={resetAndClose}
                className="mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
              >
                Voltar para o Calendário
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Option 1: Fast direct join button */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-center">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                  Opção Rápida: Entre no Grupo VIP
                </span>
                <p className="text-xs text-emerald-950 mb-3">
                  Grupo exclusivo e silencioso (apenas admins postam links oficiais de provas).
                </p>
                <a
                  href="https://chat.whatsapp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Entrar no Grupo Oficial Breu Run</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-slate-400 text-[11px] font-semibold">OU RECEBA INDIVIDUALMENTE</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Option 2: Individual registration */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">
                    Qual região você corre mais?
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {REGIONS_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c === 'Todas' ? 'Todas as cidades do Pará' : c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">
                    Seu Número de WhatsApp
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(94) 9XXXX-XXXX ou (91) 9XXXX-XXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Bell className="w-3.5 h-3.5 text-orange-400" />
                  <span>Cadastrar para Receber Alertas</span>
                </button>
              </form>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-600 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero spam. Apenas avisos de novas corridas e lotes.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
