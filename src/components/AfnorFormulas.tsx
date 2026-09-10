import React from 'react';
import { 
  Sigma, 
  Sliders, 
  FileText, 
  Calculator, 
  Info, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AfnorFormulasProps {
  onOpenSimulator: () => void;
  onOpenReport: () => void;
}

export const AfnorFormulas: React.FC<AfnorFormulasProps> = ({
  onOpenSimulator,
  onOpenReport
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div 
      id="afnor-formulas-block"
      className={`rounded-xl border overflow-hidden transition-all shadow-sm mb-8 ${
        isDarkMode ? 'bg-[#0b1b33] border-[#1a3a66]' : 'bg-white border-slate-200'
      }`}
    >
      {/* Header with Title & Action Buttons */}
      <div className="p-4 border-b border-slate-100 dark:border-[#163359] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40 dark:bg-[#0c203c]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-950/70 dark:text-orange-300 flex items-center justify-center font-bold text-base">
            Σ
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold font-space text-slate-900 dark:text-white flex items-center gap-2">
              <span>Démonstrateur des Formules & Calculs AFNOR</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Validation mathématique rigoureuse selon les normes AFNOR NF EN 13306 et NF X 60-015
            </p>
          </div>
        </div>

        {/* Buttons: Simulateur d'Atelier & Rapport d'Audit KPI (PDF) */}
        <div className="flex items-center gap-2">
          <button
            id="btn-simulateur-atelier"
            onClick={onOpenSimulator}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isDarkMode 
                ? 'bg-[#0f2342] border-[#1f4171] text-sky-200 hover:bg-[#16325c]' 
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-blue-500" />
            <span>Simulateur d'Atelier</span>
          </button>

          <button
            id="btn-rapport-audit-kpi"
            onClick={onOpenReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#071d36] hover:bg-[#0c2a4d] dark:bg-[#16355e] dark:hover:bg-[#1c4377] text-white text-xs font-semibold shadow-sm transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-orange-400" />
            <span>Rapport d'Audit KPI (PDF)</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Formula Cards Grid */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Card 1: MTBF */}
        <div className={`p-3.5 rounded-lg border text-center transition-all ${
          isDarkMode ? 'bg-[#0e213d] border-[#1e4274]' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            1. Fiabilité Intrinsèque
          </div>
          <div className="text-sm font-extrabold font-space text-slate-900 dark:text-white mt-1">
            MTBF (Heures)
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-2">
            Mean Time Between Failures
          </div>

          <div className="p-2 rounded bg-white dark:bg-[#081526] border border-slate-200 dark:border-[#142c4d] my-2">
            <div className="text-[11px] font-mono-num font-semibold text-slate-600 dark:text-slate-300">
              MTBF = Σ TBF / N
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              = 1 140 h / 8 pannes
            </div>
            <div className="text-xl font-extrabold font-space text-slate-900 dark:text-white mt-1">
              142.5 h
            </div>
          </div>

          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            Temps moyen entre deux arrêts fortuits
          </div>
        </div>

        {/* Card 2: MTTR */}
        <div className={`p-3.5 rounded-lg border text-center transition-all ${
          isDarkMode ? 'bg-[#0e213d] border-[#1e4274]' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            2. Maintenabilité
          </div>
          <div className="text-sm font-extrabold font-space text-slate-900 dark:text-white mt-1">
            MTTR (Heures)
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-2">
            Mean Time To Repair
          </div>

          <div className="p-2 rounded bg-white dark:bg-[#081526] border border-slate-200 dark:border-[#142c4d] my-2">
            <div className="text-[11px] font-mono-num font-semibold text-slate-600 dark:text-slate-300">
              MTTR = Σ TTR / N
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              = 14.4 h / 8 pannes
            </div>
            <div className="text-xl font-extrabold font-space text-amber-600 dark:text-amber-400 mt-1">
              1.80 h
            </div>
          </div>

          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            Diag: 25m + Rép: 60m + Essais: 23m
          </div>
        </div>

        {/* Card 3: Disponibilité D */}
        <div className={`p-3.5 rounded-lg border text-center transition-all ${
          isDarkMode ? 'bg-[#0e213d] border-[#1e4274]' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            3. Disponibilité Op.
          </div>
          <div className="text-sm font-extrabold font-space text-slate-900 dark:text-white mt-1">
            D (Disponibilité)
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-2">
            NF EN 13306 §8.2
          </div>

          <div className="p-2 rounded bg-white dark:bg-[#081526] border border-slate-200 dark:border-[#142c4d] my-2">
            <div className="text-[10px] font-mono-num font-semibold text-slate-600 dark:text-slate-300">
              D = MTBF / (MTBF + MTTR)
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              = 142.5 / 144.3
            </div>
            <div className="text-xl font-extrabold font-space text-emerald-600 dark:text-emerald-400 mt-1">
              98.75%
            </div>
          </div>

          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            Supérieure à l'engagement &gt;90%
          </div>
        </div>

        {/* Card 4: TRS / OEE */}
        <div className={`p-3.5 rounded-lg border text-center transition-all ${
          isDarkMode ? 'bg-[#0e213d] border-[#1e4274]' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            4. Efficacité Globale
          </div>
          <div className="text-sm font-extrabold font-space text-slate-900 dark:text-white mt-1">
            TRS / OEE
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-2">
            Taux Rendement Synthétique
          </div>

          <div className="p-2 rounded bg-white dark:bg-[#081526] border border-slate-200 dark:border-[#142c4d] my-2">
            <div className="text-[10px] font-mono-num font-semibold text-slate-600 dark:text-slate-300">
              TRS = D × P × Q
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              = 93.8% × 92.4% × 97.1%
            </div>
            <div className="text-xl font-extrabold font-space text-sky-600 dark:text-sky-400 mt-1">
              84.2%
            </div>
          </div>

          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            Dispo × Perf × Qualité minéralière
          </div>
        </div>

        {/* Card 5: Taux Défaillance (Lambda) */}
        <div className={`p-3.5 rounded-lg border text-center transition-all ${
          isDarkMode ? 'bg-[#0e213d] border-[#1e4274]' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            5. Taux Défaillance
          </div>
          <div className="text-sm font-extrabold font-space text-slate-900 dark:text-white mt-1">
            λ (Lambda)
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-2">
            Défaillance Instantanée
          </div>

          <div className="p-2 rounded bg-white dark:bg-[#081526] border border-slate-200 dark:border-[#142c4d] my-2">
            <div className="text-[11px] font-mono-num font-semibold text-slate-600 dark:text-slate-300">
              λ = 1 / MTBF
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              = 1 / 142.5 h
            </div>
            <div className="text-xl font-extrabold font-space text-slate-900 dark:text-white mt-1">
              0.0070
            </div>
          </div>

          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            Défaillances par heure de marche
          </div>
        </div>
      </div>
    </div>
  );
};
