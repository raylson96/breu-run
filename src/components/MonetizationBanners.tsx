import React from 'react';
import { Sparkles, ShoppingBag, ShieldCheck, ExternalLink, PhoneCall } from 'lucide-react';

interface MonetizationBannersProps {
  onOpenAddModal: () => void;
}

export const MonetizationBanners: React.FC<MonetizationBannersProps> = ({ onOpenAddModal }) => {
  return (
    <div className="space-y-6 my-8">
      {/* 1. Anúncio para Organizadores & Marcas Locais */}
      <div className="bg-gradient-to-r from-orange-950 via-slate-900 to-zinc-900 rounded-2xl p-5 border border-orange-500/30 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black bg-orange-500/20 text-orange-400 border border-orange-500/30 uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              Espaço do Organizador & Patrocinador
            </div>
            <h3 className="text-base sm:text-lg font-black text-white">
              Quer sua corrida ou loja de esportes em destaque no Pará?
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Coloque seu evento no topo do calendário regional, envie disparos de virada de lote e alcance milhares de atletas de Tailândia, Marabá, Breu Branco, Belém e região.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black rounded-xl transition shadow-md shadow-orange-900/40 cursor-pointer active:scale-95 whitespace-nowrap"
            >
              Anunciar Corrida
            </button>
            <a
              href="https://wa.me/5594999999999?text=Ol%C3%A1!%20Gostaria%20de%20anunciar%20uma%20corrida%20ou%20marca%20no%20Par%C3%A1%20Run."
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Comercial</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Vitrine de Afiliados (Géis, Cintos, Tênis de Corrida) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-slate-900">
                Equipamentos Recomendados para Treinos e Provas
              </h4>
              <p className="text-[11px] text-slate-600">
                Seleção dos itens mais usados pelos corredores do circuito paraense
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
            Links Parceiros
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Card Produto 1 */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col justify-between hover:border-orange-300 transition group">
            <div>
              <span className="text-[10px] font-bold text-orange-700 uppercase block mb-1">Nutrição</span>
              <h5 className="font-bold text-xs text-slate-900 group-hover:text-orange-600 line-clamp-2">
                Gel de Carboidrato CarbUp / Z2 (Caixa c/ 10)
              </h5>
              <p className="text-[11px] text-slate-600 mt-1">Essencial para provas de 10k e 21k</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-xs font-black text-slate-900">R$ 69,90</span>
              <a
                href="https://amazon.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-extrabold text-orange-600 flex items-center gap-0.5 hover:underline"
              >
                Ver <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          {/* Card Produto 2 */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col justify-between hover:border-orange-300 transition group">
            <div>
              <span className="text-[10px] font-bold text-blue-700 uppercase block mb-1">Acessório</span>
              <h5 className="font-bold text-xs text-slate-900 group-hover:text-orange-600 line-clamp-2">
                Cinto de Hidratação Slim com Garrafas
              </h5>
              <p className="text-[11px] text-slate-600 mt-1">Não pula no corpo, cabe celular grande</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-xs font-black text-slate-900">R$ 54,90</span>
              <a
                href="https://amazon.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-extrabold text-orange-600 flex items-center gap-0.5 hover:underline"
              >
                Ver <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          {/* Card Produto 3 */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col justify-between hover:border-orange-300 transition group">
            <div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase block mb-1">Performance</span>
              <h5 className="font-bold text-xs text-slate-900 group-hover:text-orange-600 line-clamp-2">
                Meias de Compressão Anti-Bolha
              </h5>
              <p className="text-[11px] text-slate-600 mt-1">Ideal para o calor úmido do Pará</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-xs font-black text-slate-900">R$ 39,90</span>
              <a
                href="https://amazon.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-extrabold text-orange-600 flex items-center gap-0.5 hover:underline"
              >
                Ver <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          {/* Card Produto 4 */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col justify-between hover:border-orange-300 transition group">
            <div>
              <span className="text-[10px] font-bold text-purple-700 uppercase block mb-1">Tecnologia</span>
              <h5 className="font-bold text-xs text-slate-900 group-hover:text-orange-600 line-clamp-2">
                Relógio GPS c/ Monitor Cardíaco
              </h5>
              <p className="text-[11px] text-slate-600 mt-1">Marcação de ritmo (pace) em tempo real</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-xs font-black text-slate-900">R$ 289,00</span>
              <a
                href="https://amazon.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-extrabold text-orange-600 flex items-center gap-0.5 hover:underline"
              >
                Ver <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Parceria com os Chips */}
      <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-orange-400 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
              Você representa Chip Amazônia, Chip Breu Branco, Chip Pará ou Chip Cronos?
            </h4>
            <p className="text-xs text-slate-600">
              A plataforma é neutra e independente! Integramos seu link de inscrição direto sem cobrança de comissão. Leve mais inscritos para as suas provas!
            </p>
          </div>
        </div>

        <a
          href="https://wa.me/5594999999999?text=Ol%C3%A1!%20Sou%20de%20uma%20empresa%20de%20cronometragem%20e%20quero%20conectar%20nosso%20calend%C3%A1rio."
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex-shrink-0"
        >
          Falar com a Plataforma
        </a>
      </div>
    </div>
  );
};
