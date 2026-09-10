import React, { useState, useEffect } from 'react';
import { X, ClipboardList, PlusCircle, CheckCircle2 } from 'lucide-react';
import { WorkOrder, Equipment, PriorityLevel } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface NewWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipments: Equipment[];
  initialEquipmentName?: string;
  initialCategory?: string;
  onWorkOrderCreated: (wo: WorkOrder) => void;
}

export const NewWorkOrderModal: React.FC<NewWorkOrderModalProps> = ({
  isOpen,
  onClose,
  equipments,
  initialEquipmentName,
  initialCategory,
  onWorkOrderCreated,
}) => {
  const { isDarkMode } = useTheme();

  const [equipment, setEquipment] = useState(initialEquipmentName || 'Pelle mécanique CAT 349D');
  const [category, setCategory] = useState<string>(
    initialCategory || 'Pelle mécanique'
  );
  const [technician, setTechnician] = useState('Marc V.');
  const [type, setType] = useState('Préventif Planifié');
  const [priority, setPriority] = useState<PriorityLevel>('P2');
  const [deadline, setDeadline] = useState("Aujourd'hui 18:00");
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialEquipmentName) setEquipment(initialEquipmentName);
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [initialEquipmentName, initialCategory]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newWo: WorkOrder = {
      id: `#WO-${Math.floor(4200 + Math.random() * 500)}`,
      category,
      equipment,
      equipmentSn: 'Terminal Owendo OMP',
      technician,
      type,
      priority,
      priorityLabel: priority === 'P1' ? 'P1 Critique' : priority === 'P2' ? 'P2 Haute' : 'P3 Normale',
      deadline,
      progress: 0,
      status: 'En cours',
      description: description || "Ordre d'intervention programmé par la Direction Technique.",
      estimatedHours: 4,
      spentHours: 0,
    };
    onWorkOrderCreated(newWo);
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
        <div className="px-6 py-4 bg-[#071d36] text-white flex items-center justify-between border-b border-[#142e4e]">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold font-space text-base">Nouveau Work Order (OMP)</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Catégorie Portuaire
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full p-2.5 rounded-lg border font-medium ${
                  isDarkMode ? 'bg-[#0f2342] border-[#20406d] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                <option value="Pelle mécanique">Pelle mécanique</option>
                <option value="Chargeuse">Chargeuse</option>
                <option value="Dumper">Dumper</option>
                <option value="Bulldozer / Bull">Bulldozer / Bull</option>
                <option value="Tracteur">Tracteur</option>
                <option value="Camion">Camion</option>
                <option value="Tractopelle">Tractopelle</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Équipement Cible
              </label>
              <input
                type="text"
                required
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                placeholder="Ex: Pelle mécanique PM-01, Dumper DP-02..."
                className={`w-full p-2.5 rounded-lg border font-medium ${
                  isDarkMode ? 'bg-[#0f2342] border-[#20406d] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Technicien / Brigade Affectée
              </label>
              <select
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
                className={`w-full p-2.5 rounded-lg border font-medium ${
                  isDarkMode ? 'bg-[#0f2342] border-[#20406d] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                <option value="Marc V.">Marc V. (Équipe Mécanique)</option>
                <option value="Alain M. (Astreinte)">Alain M. (Astreinte 24/7)</option>
                <option value="Didier K.">Didier K. (Chaudronnerie & Bandes)</option>
                <option value="Stéphane B.">Stéphane B. (Électromécanicien)</option>
                <option value="Patrick N.">Patrick N. (CND & Télémétrie)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Type d'Intervention
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className={`w-full p-2.5 rounded-lg border font-medium ${
                  isDarkMode ? 'bg-[#0f2342] border-[#20406d] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                <option value="Préventif Planifié">Préventif Planifié</option>
                <option value="Préventif 5000h">Préventif 5000h</option>
                <option value="Curatif Urgent">Curatif Urgent</option>
                <option value="Préventif Conditionnel">Préventif Conditionnel</option>
                <option value="Contrôle Métrologique">Contrôle Métrologique</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Priorité
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
                          ? 'bg-red-600 text-white border-red-700'
                          : p === 'P2'
                          ? 'bg-orange-500 text-white border-orange-600'
                          : 'bg-blue-600 text-white border-blue-700'
                        : isDarkMode
                        ? 'bg-[#0f2342] border-[#1d3962] text-slate-300'
                        : 'bg-slate-100 border-slate-300 text-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Échéance de Fin
              </label>
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="Ex: Demain 12:00, Sous 48h..."
                className={`w-full p-2.5 rounded-lg border font-medium ${
                  isDarkMode ? 'bg-[#0f2342] border-[#20406d] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
              Instructions & Consignes d'Intervention
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Spécifier les outillages spéciaux, consignation électrique/mécanique, EPI requis..."
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
              className="px-5 py-2 rounded-lg bg-[#071d36] hover:bg-[#0c2a4d] dark:bg-[#16355e] dark:hover:bg-[#1c4377] text-white font-bold shadow-md flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-orange-400" />
              <span>Créer l'Ordre de Travail</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
