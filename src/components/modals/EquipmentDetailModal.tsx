import React from 'react';
import { 
  X, 
  Wrench, 
  Clock, 
  Activity, 
  History, 
  Package, 
  CheckCircle2, 
  AlertTriangle, 
  PlusCircle, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';
import { Equipment } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface EquipmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment | null;
  onCreateWo: (name: string, cat: string) => void;
  onOpenParts: (name: string) => void;
}

export const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({
  isOpen,
  onClose,
  equipment,
  onCreateWo,
  onOpenParts,
}) => {
  const { isDarkMode } = useTheme();

  if (!isOpen || !equipment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className={`w-full max-w-3xl rounded-xl border shadow-2xl overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-150 ${
          isDarkMode ? 'bg-[#0a1526] border-[#1d3962] text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#071d36] text-white flex items-center justify-between border-b border-[#142e4e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#ea580c] flex items-center justify-center font-bold">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold font-space text-lg">{equipment.name}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#142c4d] text-orange-300">
                  {equipment.code}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Catégorie : {equipment.category} · Emplacement : {equipment.location}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Status and KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0e213d] border border-slate-200 dark:border-[#1e4274]">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Statut Opérationnel</div>
              <div className="text-sm font-extrabold mt-1 text-emerald-600 dark:text-emerald-400">
                {equipment.status}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0e213d] border border-slate-200 dark:border-[#1e4274]">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Disponibilité</div>
              <div className="text-sm font-extrabold mt-1 text-emerald-600 dark:text-emerald-400">
                {equipment.availability}%
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0e213d] border border-slate-200 dark:border-[#1e4274]">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">MTBF</div>
              <div className="text-sm font-extrabold mt-1 text-slate-900 dark:text-white">
                {equipment.mtbf}h
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0e213d] border border-slate-200 dark:border-[#1e4274]">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">MTTR</div>
              <div className="text-sm font-extrabold mt-1 text-amber-600 dark:text-amber-400">
                {equipment.mttr}h
              </div>
            </div>
          </div>

          {/* Telemetry Details */}
          <div>
            <h4 className="font-bold font-space text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-orange-500" />
              <span>Télémétrie en Direct & Paramètres Capteurs</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-lg bg-slate-50 dark:bg-[#0e213d] border border-slate-200 dark:border-[#1e4274]">
              {Object.entries(equipment.telemetry).map(([key, val]) => (
                <div key={key} className="flex justify-between py-1 border-b border-slate-200/60 dark:border-[#18355c]">
                  <span className="text-slate-500 dark:text-slate-400 capitalize">{key} :</span>
                  <span className="font-mono-num font-bold text-slate-900 dark:text-white">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Maintenance History */}
          <div>
            <h4 className="font-bold font-space text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
              <History className="w-4 h-4 text-blue-500" />
              <span>Historique Récent des Interventions & Traçabilité</span>
            </h4>
            <div className="space-y-2">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-[#1e4274] flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Dernière Maintenance Préventive</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">{equipment.lastMaintenance}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  CONFORME
                </span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-[#1e4274] flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Prochaine Échéance Programmée</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">{equipment.nextMaintenance}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300">
                  PLANIFIÉ
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#071526] border-t border-slate-200 dark:border-[#1d3962] flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={() => onOpenParts(equipment.name)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-200 dark:bg-[#142c4d] text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-[#1b3a66]"
          >
            <Package className="w-4 h-4 text-amber-500" />
            <span>Catalogue Pièces Détachées</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-[#122847] text-xs font-semibold"
            >
              Fermer
            </button>
            <button
              onClick={() => {
                onCreateWo(equipment.name, equipment.category);
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-[#ea580c] hover:bg-[#d44f0b] text-white text-xs font-bold shadow flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Créer Work Order Dédié</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
