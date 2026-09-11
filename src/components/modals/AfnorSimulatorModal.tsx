import React, { useState } from 'react';
import { X, Sliders, Calculator, CheckCircle2, RefreshCw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface AfnorSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AfnorSimulatorModal: React.FC<AfnorSimulatorModalProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();

  // Simulation parameters
  const [tbfTotal, setTbfTotal] = useState<number>(1140); // Total Operating Hours
  const [failuresCount, setFailuresCount] = useState<number>(8); // Number of failures
  const [ttrTotal, setTtrTotal] = useState<number>(14.4); // Total Repair Time in hours
  const [performanceRate, setPerformanceRate] = useState<number>(92.4); // %
  const [qualityRate, setQualityRate] = useState<number>(97.1); // %

  if (!isOpen) return null;

  // Real-time calculations
  const mtbf = failuresCount > 0 ? (tbfTotal / failuresCount).toFixed(1) : '0';
  const mttr = failuresCount > 0 ? (ttrTotal / failuresCount).toFixed(2) : '0';
  const mtbfNum = parseFloat(mtbf);
  const mttrNum = parseFloat(mttr);
  const availability = (mtbfNum + mttrNum) > 0 
    ? ((mtbfNum / (mtbfNum + mttrNum)) * 100).toFixed(2) 
    : '0';
  const trs = (
    (parseFloat(availability) / 100) *
    (performanceRate / 100) *
    (qualityRate / 100) *
    100
  ).toFixed(1);
  const lambda = mtbfNum > 0 ? (1 / mtbfNum).toFixed(5) : '0';

  const handleReset = () => {
    setTbfTotal(1140);
    setFailuresCount(8);
    setTtrTotal(14.4);
    setPerformanceRate(92.4);
    setQualityRate(97.1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className={`w-full max-w-2xl rounded-xl border shadow-2xl overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-150 ${
          isDarkMode ? 'bg-[#0a1526] border-[#1d3962] text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#071d36] text-white flex items-center justify-between border-b border-[#142e4e]">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold font-space text-base">Simulateur d'Atelier & Calculs AFNOR</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs max-h-[80vh] overflow-y-auto">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Modifiez les paramètres opérationnels de l'atelier pour observer instantanément l'impact sur les KPIs de fiabilité selon les normes <strong>NF EN 13306</strong> et <strong>NF X 60-015</strong>.
          </p>

          {/* Sliders Grid */}
          <div className="space-y-4 p-4 rounded-lg bg-slate-50 dark:bg-[#0e213d] border border-slate-200 dark:border-[#1e4274]">
            {/* 1. TBF Total */}
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-slate-700 dark:text-slate-200">Heures de marche cumulées (Σ TBF) :</span>
                <span className="text-blue-600 dark:text-blue-400 font-mono-num">{tbfTotal} heures</span>
              </div>
              <input
                type="range"
                min={200}
                max={3000}
                step={20}
                value={tbfTotal}
                onChange={(e) => setTbfTotal(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* 2. Failures Count */}
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-slate-700 dark:text-slate-200">Nombre total d'arrêts pannes (N) :</span>
                <span className="text-red-600 dark:text-red-400 font-mono-num">{failuresCount} pannes</span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={failuresCount}
                onChange={(e) => setFailuresCount(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
            </div>

            {/* 3. TTR Total */}
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-slate-700 dark:text-slate-200">Temps cumulé de remise en état (Σ TTR) :</span>
                <span className="text-amber-600 dark:text-amber-400 font-mono-num">{ttrTotal} heures</span>
              </div>
              <input
                type="range"
                min={1}
                max={60}
                step={0.5}
                value={ttrTotal}
                onChange={(e) => setTtrTotal(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            {/* 4. Cadence & Qualité */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-[#18365e]">
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span className="text-slate-700 dark:text-slate-200">Cadence / Perf. :</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono-num">{performanceRate}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  step={0.5}
                  value={performanceRate}
                  onChange={(e) => setPerformanceRate(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span className="text-slate-700 dark:text-slate-200">Qualité minerai :</span>
                  <span className="text-purple-600 dark:text-purple-400 font-mono-num">{qualityRate}%</span>
                </div>
                <input
                  type="range"
                  min={80}
                  max={100}
                  step={0.5}
                  value={qualityRate}
                  onChange={(e) => setQualityRate(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Real-time Calculated Outputs */}
          <div>
            <h4 className="font-bold font-space text-sm mb-3 text-slate-900 dark:text-white">
              Résultats de Calcul Intégré :
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-[#081526] border border-slate-200 dark:border-[#163359]">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">MTBF Calculé</div>
                <div className="text-xl font-extrabold font-space text-slate-900 dark:text-white mt-1">
                  {mtbf} h
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Fiabilité moyenne</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-100 dark:bg-[#081526] border border-slate-200 dark:border-[#163359]">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">MTTR Calculé</div>
                <div className="text-xl font-extrabold font-space text-amber-600 dark:text-amber-400 mt-1">
                  {mttr} h
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Maintenabilité</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-100 dark:bg-[#081526] border border-slate-200 dark:border-[#163359]">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Disponibilité (D)</div>
                <div className="text-xl font-extrabold font-space text-emerald-600 dark:text-emerald-400 mt-1">
                  {availability}%
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                  {parseFloat(availability) >= 90 ? 'Cible atteinte (>90%)' : 'Alerte sous la cible'}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-100 dark:bg-[#081526] border border-slate-200 dark:border-[#163359]">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">TRS / OEE</div>
                <div className="text-xl font-extrabold font-space text-sky-600 dark:text-sky-400 mt-1">
                  {trs}%
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">D × P × Q</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-100 dark:bg-[#081526] border border-slate-200 dark:border-[#163359] col-span-2 sm:col-span-2">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Taux de Défaillance (λ)</div>
                <div className="text-lg font-extrabold font-space text-purple-600 dark:text-purple-400 mt-1 font-mono-num">
                  λ = {lambda} pannes/h
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Fréquence instantanée de défaillance</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#071526] border-t border-slate-200 dark:border-[#1d3962] flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réinitialiser valeurs par défaut</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#071d36] hover:bg-[#0c2a4d] dark:bg-[#16355e] dark:hover:bg-[#1c4377] text-white font-bold"
          >
            Fermer le Simulateur
          </button>
        </div>
      </div>
    </div>
  );
};
