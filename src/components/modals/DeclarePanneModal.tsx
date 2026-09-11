import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Equipment, PanneIncident, PriorityLevel } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface DeclarePanneModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipments: Equipment[];
  onPanneDeclared: (panne: PanneIncident) => void;
}

export const DeclarePanneModal: React.FC<DeclarePanneModalProps> = ({
  isOpen,
  onClose,
  equipments,
  onPanneDeclared,
}) => {
  const { isDarkMode } = useTheme();

  const [selectedEqId, setSelectedEqId] = useState(equipments[0]?.id || 'EQ-01');
  const [priority, setPriority] = useState<PriorityLevel>('P1');
  const [title, setTitle] = useState('');
  const [reporter, setReporter] = useState('Chef de Quart');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eq = equipments.find(item => item.id === selectedEqId);
    const newPanne: PanneIncident = {
      id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
      equipmentId: selectedEqId,
      equipmentName: eq ? `${eq.name} (${eq.code})` : 'Équipement Portuaire',
      category: eq?.categoryLabel || 'Général',
      title: title || 'Anomalie détectée en exploitation',
      priority,
      status: 'Aiguë',
      reportedAt: "À l'instant",
      reporter,
      assignedTech: 'Équipe Astreinte 24/7',
      impactMinutes: 10,
      financialImpact: priority === 'P1' ? 'Arrêt flux chargement' : 'Ralentissement cadence',
      description: description || 'Intervention immédiate requise pour reprise de cadence.',
    };
    onPanneDeclared(newPanne);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className={`w-full max-w-lg rounded-xl border shadow-2xl overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-150 ${
          isDarkMode ? 'bg-[#0a1526] border-[#1d3962] text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#992800] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold font-space text-base">Déclarer une Panne / Incident Critique</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
              Équipement concerné
            </label>
            <select
              value={selectedEqId}
              onChange={(e) => setSelectedEqId(e.target.value)}
              className={`w-full p-2.5 rounded-lg border font-medium ${
                isDarkMode ? 'bg-[#0f2342] border-[#20406d] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              {equipments.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.code} - {eq.name} ({eq.categoryLabel})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Niveau d'Urgence / Priorité
              </label>
              <div className="flex gap-1.5">
                {(['P1', 'P2', 'P3'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all border ${
                      priority === p
                        ? p === 'P1'
                          ? 'bg-red-600 text-white border-red-700 shadow'
                          : p === 'P2'
                          ? 'bg-orange-500 text-white border-orange-600 shadow'
                          : 'bg-blue-600 text-white border-blue-700 shadow'
                        : isDarkMode
                        ? 'bg-[#0f2342] border-[#1d3962] text-slate-300'
                        : 'bg-slate-100 border-slate-300 text-slate-700'
                    }`}
                  >
                    {p} {p === 'P1' ? 'Critique' : p === 'P2' ? 'Haute' : 'Normale'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Déclarant / Opérateur
              </label>
              <input
                type="text"
                value={reporter}
                onChange={(e) => setReporter(e.target.value)}
                placeholder="Ex: Chef de Quart, Opérateur..."
                className={`w-full p-2.5 rounded-lg border font-medium ${
                  isDarkMode ? 'bg-[#0f2342] border-[#20406d] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
              Symptôme / Titre succinct
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Surchauffe palier treuil principal ou alarme patinage..."
              className={`w-full p-2.5 rounded-lg border font-medium ${
                isDarkMode ? 'bg-[#0f2342] border-[#20406d] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
              Détails techniques & impacts
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Précisez les alarmes visuelles/sonores, fuites éventuelles, odeur, perte de cadence..."
              className={`w-full p-2.5 rounded-lg border font-medium ${
                isDarkMode ? 'bg-[#0f2342] border-[#20406d] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#1d3962]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#122847] font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#992800] hover:bg-[#b03000] text-white font-bold shadow-md flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Transmettre à l'Astreinte</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
