import React from 'react';
import { 
  Wrench, 
  AlertTriangle, 
  ClipboardList, 
  Users, 
  CheckCircle2, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Percent
} from 'lucide-react';
import { KpiSummary } from '../types';
import { useTheme } from '../context/ThemeContext';

interface KpiMetricsRowProps {
  kpis: KpiSummary;
  onCardClick?: (kpiType: string) => void;
}

export const KpiMetricsRow: React.FC<KpiMetricsRowProps> = ({ kpis, onCardClick }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
      {/* 1. Équipements Total */}
      <div 
        id="kpi-card-equipements"
        onClick={() => onCardClick?.('equipements')}
        className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
          isDarkMode 
            ? 'bg-[#0e1d35] border-[#1d3962] text-white hover:border-sky-500/60' 
            : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className="text-[11px] font-bold tracking-wider uppercase">Équipements Total</span>
          <Wrench className="w-4 h-4 text-slate-400 dark:text-slate-400" />
        </div>
        <div className="flex items-baseline gap-1 my-1">
          <span className="text-3xl font-extrabold font-space">{kpis.equipementsTotal}</span>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          Actifs au Port
        </div>
        <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <TrendingUp className="w-3 h-3" />
          <span>{kpis.equipementsEvolution}</span>
        </div>
      </div>

      {/* 2. Pannes Actives */}
      <div 
        id="kpi-card-pannes"
        onClick={() => onCardClick?.('pannes')}
        className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
          isDarkMode 
            ? 'bg-[#0e1d35] border-[#1d3962] text-white hover:border-red-500/60' 
            : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className="text-[11px] font-bold tracking-wider uppercase text-red-600 dark:text-red-400">Pannes Actives</span>
          <AlertTriangle className="w-4 h-4 text-red-500" />
        </div>
        <div className="flex items-baseline gap-2 my-1">
          <span className="text-3xl font-extrabold font-space text-red-600 dark:text-red-400">{kpis.pannesActives}</span>
          <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/60 px-1.5 py-0.5 rounded">
            ({kpis.pannesP1} P1)
          </span>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          En cours d'astreinte
        </div>
        <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <TrendingDown className="w-3 h-3" />
          <span>{kpis.pannesEvolution}</span>
        </div>
      </div>

      {/* 3. Work Orders */}
      <div 
        id="kpi-card-workorders"
        onClick={() => onCardClick?.('work-orders')}
        className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
          isDarkMode 
            ? 'bg-[#0e1d35] border-[#1d3962] text-white hover:border-blue-500/60' 
            : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className="text-[11px] font-bold tracking-wider uppercase">Work Orders</span>
          <ClipboardList className="w-4 h-4 text-blue-500" />
        </div>
        <div className="flex items-baseline gap-1 my-1">
          <span className="text-3xl font-extrabold font-space">{kpis.workOrdersTotal}</span>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          {kpis.workOrdersPreventif} Prév / {kpis.workOrdersCuratif} Curatifs
        </div>
        <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <TrendingUp className="w-3 h-3" />
          <span>{kpis.workOrdersEvolution}</span>
        </div>
      </div>

      {/* 4. Techniciens Terrain */}
      <div 
        id="kpi-card-techniciens"
        onClick={() => onCardClick?.('techniciens')}
        className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
          isDarkMode 
            ? 'bg-[#0e1d35] border-[#1d3962] text-white hover:border-amber-500/60' 
            : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className="text-[11px] font-bold tracking-wider uppercase">Techniciens Terrain</span>
          <Users className="w-4 h-4 text-amber-500" />
        </div>
        <div className="flex items-baseline gap-1 my-1">
          <span className="text-3xl font-extrabold font-space">{kpis.techniciensTerrain}</span>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          {kpis.techniciensShift}
        </div>
        <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-3 h-3" />
          <span>{kpis.techniciensBrigade}</span>
        </div>
      </div>

      {/* 5. Disponibilité Usine */}
      <div 
        id="kpi-card-disponibilite"
        onClick={() => onCardClick?.('afnor')}
        className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
          isDarkMode 
            ? 'bg-[#0e1d35] border-[#1d3962] text-white hover:border-emerald-500/60' 
            : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-700 dark:text-emerald-400">Disponibilité Usine</span>
          <Percent className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="flex items-baseline gap-1 my-1">
          <span className="text-3xl font-extrabold font-space text-emerald-700 dark:text-emerald-400">{kpis.disponibiliteUsine}%</span>
        </div>
        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
          {kpis.disponibiliteNorme}
        </div>
        <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
          <span>{kpis.disponibiliteCible}</span>
        </div>
      </div>

      {/* 6. MTBF / MTTR Global */}
      <div 
        id="kpi-card-mtbf-mttr"
        onClick={() => onCardClick?.('afnor')}
        className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
          isDarkMode 
            ? 'bg-[#0e1d35] border-[#1d3962] text-white hover:border-orange-500/60' 
            : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span className="text-[11px] font-bold tracking-wider uppercase">MTBF / MTTR Global</span>
          <Activity className="w-4 h-4 text-orange-500" />
        </div>
        <div className="flex items-baseline gap-2 my-1">
          <span className="text-2xl font-extrabold font-space text-slate-900 dark:text-white">{kpis.mtbfGlobal}h</span>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-2xl font-extrabold font-space text-orange-600 dark:text-orange-400">{kpis.mttrGlobal}h</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
          <span>MTBF</span>
          <span>MTTR</span>
        </div>
        <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-3 h-3" />
          <span>Ratio {kpis.ratioGlobal}%</span>
        </div>
      </div>
    </div>
  );
};
