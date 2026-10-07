import React, { useState } from 'react';
import type { Race, ChipCompany, RaceStatus } from '../types/race';
import { REGIONS_CITIES, CHIP_COMPANIES } from '../data/mockRaces';
import { X, PlusCircle, Sparkles, Check } from 'lucide-react';

interface AdminAddRaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRace: (newRace: Race) => void;
}

export const AdminAddRaceModal: React.FC<AdminAddRaceModalProps> = ({
  isOpen,
  onClose,
  onAddRace
}) => {
  const [title, setTitle] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('06:00');
  const [city, setCity] = useState('Tailândia');
  const [location, setLocation] = useState('');
  const [distancesStr, setDistancesStr] = useState('5 km, 10 km');
  const [chipCompany, setChipCompany] = useState<ChipCompany>('Chip Amazônia');
  const [status, setStatus] = useState<RaceStatus>('open');
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [priceFrom, setPriceFrom] = useState('');
  const [currentBatch, setCurrentBatch] = useState('1º Lote');
  const [featured, setFeatured] = useState(false);
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !registrationUrl) {
      alert('Por favor, preencha o Nome da Corrida, a Data e o Link de Inscrição.');
      return;
    }

    const distances = distancesStr
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);

    const newRace: Race = {
      id: `race-${Date.now()}`,
      title,
      organizer: organizer || 'Organização Local',
      date,
      time,
      city,
      state: 'PA',
      location: location || `Centro, ${city}`,
      distances: distances.length > 0 ? distances : ['5 km'],
      chipCompany,
      status,
      registrationUrl,
      featured,
      priceFrom: priceFrom ? parseFloat(priceFrom) : undefined,
      currentBatch,
      description: description || `Corrida oficial em ${city}/PA com cronometragem ${chipCompany}.`,
      kitItems: ['Camiseta dry fit', 'Medalha finisher', 'Número de peito com chip']
    };

    onAddRace(newRace);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-xl rounded-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
              <PlusCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black leading-tight text-white">
                Cadastrar Nova Corrida
              </h2>
              <p className="text-xs text-slate-400">
                Painel rápido de alimentação do calendário regional
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Nome da Prova */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Nome do Evento <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: 1ª Corrida Rota do Sol"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          {/* Organizador */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Realizador / Organizador
            </label>
            <input
              type="text"
              placeholder="Ex: SEMEL Tailândia / Assessoria Carajás"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          {/* Data, Horário e Cidade */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Data do Evento <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Horário da Largada
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Cidade (Pará)
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
              >
                {REGIONS_CITIES.filter((c) => c !== 'Todas').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Local de largada */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Local de Largada / Ponto de Encontro
            </label>
            <input
              type="text"
              placeholder="Ex: Praça do Povo (Centro) ou Orla da Cidade"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          {/* Distâncias e Empresa de Chip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Distâncias (separadas por vírgula)
              </label>
              <input
                type="text"
                placeholder="Ex: 5 km, 10 km, 21 km"
                value={distancesStr}
                onChange={(e) => setDistancesStr(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Empresa de Cronometragem
              </label>
              <select
                value={chipCompany}
                onChange={(e) => setChipCompany(e.target.value as ChipCompany)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
              >
                {CHIP_COMPANIES.filter((c) => c !== 'Todas').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status e Preço */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Status das Inscrições
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as RaceStatus)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
              >
                <option value="open">Abertas</option>
                <option value="soon">Em Breve</option>
                <option value="closed">Encerradas</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Preço Inicial (R$)
              </label>
              <input
                type="number"
                placeholder="Ex: 65"
                value={priceFrom}
                onChange={(e) => setPriceFrom(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Lote Atual
              </label>
              <input
                type="text"
                placeholder="Ex: 1º Lote"
                value={currentBatch}
                onChange={(e) => setCurrentBatch(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>

          {/* Descrição Adicional */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Observações / Detalhes do Percurso
            </label>
            <input
              type="text"
              placeholder="Ex: Percurso plano no asfalto, hidratação a cada 2km"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          {/* Link Oficial de Inscrição */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Link Oficial de Inscrição <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              required
              placeholder="https://chipamazonia.com.br ou https://chipbreubranco.com.br"
              value={registrationUrl}
              onChange={(e) => setRegistrationUrl(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          {/* Destaque Booleano (Monetização) */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <div>
                <span className="font-bold text-amber-900 block text-xs">
                  Colocar em Destaque no Topo
                </span>
                <span className="text-[11px] text-amber-700">
                  Destaque visual para corridas patrocinadas ou com taxa paga
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-5 h-5 accent-orange-600 rounded cursor-pointer"
            />
          </div>

          {/* Botões do Formulário */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 bg-orange-600 hover:bg-orange-500 text-white font-extrabold rounded-xl transition shadow-md shadow-orange-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Publicar Corrida</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
