import React from 'react';
import { 
  AlertTriangle, 
  PlusCircle, 
  FileText, 
  Sigma, 
  Wrench, 
  CheckCircle2, 
  Sparkles,
  Layers
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HeaderBannerProps {
  onDeclarePanne: () => void;
  onNewWorkOrder: () => void;
  onAddEquipment: () => void;
  onBilanDirection: () => void;
  onOpenAfnor: () => void;
}

export const HeaderBanner: React.FC<HeaderBannerProps> = ({
  onDeclarePanne,
  onNewWorkOrder,
  onAddEquipment,
  onBilanDirection,
  onOpenAfnor,
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div className="mb-6">
      {/* Top Tagline & Certifications */}
      <div className="flex flex-wrap items-center gap-2.5 mb-2 text-xs">
        <span className="font-bold tracking-wider uppercase text-slate-600 dark:text-slate-300">
          Groupe Eramet - Terminal Owendo
        </span>
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-200 text-slate-700 dark:bg-[#152744] dark:text-slate-200">
          NF EN 13306 & ISO 55001
        </span>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Terminal Opérationnel - Dispo Usine 94.2%</span>
        </div>
      </div>

      {/* Main Title & Action Bar Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-space tracking-tight text-slate-900 dark:text-white">
            OWENDO MINERAL PORT (OMP)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
            Supervision Intégrée & Performance de la Maintenance Portuaire · Direction Générale & Technique
          </p>
        </div>

        {/* Action Buttons Grid */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Déclarer une Panne */}
          <button
            id="btn-declarer-panne"
            onClick={onDeclarePanne}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#992800] hover:bg-[#b03000] text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.02]"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>+ Déclarer une Panne</span>
          </button>

          {/* Nouveau Work Order */}
          <button
            id="btn-nouveau-work-order"
            onClick={onNewWorkOrder}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#071d36] hover:bg-[#0c2a4d] text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.02] border border-[#163860]"
          >
            <PlusCircle className="w-4 h-4 text-orange-400" />
            <span>+ Nouveau Work Order</span>
          </button>

          {/* Ajouter Équipement */}
          <button
            id="btn-ajouter-equipement"
            onClick={onAddEquipment}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold border transition-all ${
              isDarkMode
                ? 'bg-[#0f1d35] border-[#1f3b64] text-sky-200 hover:bg-[#162947]'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-blue-500" />
            <span>+ Ajouter Équipement</span>
          </button>

          {/* Bilan Direction */}
          <button
            id="btn-bilan-direction"
            onClick={onBilanDirection}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold border transition-all ${
              isDarkMode
                ? 'bg-[#0f1d35] border-[#1f3b64] text-slate-200 hover:bg-[#162947]'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />
            <span>Bilan Direction</span>
          </button>

          {/* Σ AFNOR */}
          <button
            id="btn-afnor-calculator"
            onClick={onOpenAfnor}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold border transition-all ${
              isDarkMode
                ? 'bg-[#0f1d35] border-[#1f3b64] text-orange-300 hover:bg-[#162947]'
                : 'bg-white border-slate-300 text-orange-700 hover:bg-slate-50'
            }`}
          >
            <Sigma className="w-3.5 h-3.5 text-orange-600" />
            <span>Σ AFNOR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
