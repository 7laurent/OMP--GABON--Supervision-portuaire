import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  SlidersHorizontal, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  Info
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const AnalyticsCharts: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  // Semestrial data for Preventif vs Curatif
  const monthlyData = [
    { month: 'OCT', prev: 71, curat: 29 },
    { month: 'NOV', prev: 68, curat: 32 },
    { month: 'DEC', prev: 74, curat: 26 },
    { month: 'JAN', prev: 76, curat: 24 },
    { month: 'FEV', prev: 73, curat: 27 },
    { month: 'MAR', prev: 78, curat: 22 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
      {/* ========================================================================= */}
      {/* 1. Heures Préventif vs Curatif */}
      {/* ========================================================================= */}
      <div 
        id="chart-preventif-curatif"
        className={`p-4 rounded-xl border transition-all shadow-sm ${
          isDarkMode ? 'bg-[#0b1b33] border-[#1a3a66]' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-bold text-sm font-space text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Heures Préventif vs Curatif</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Évolution semestrielle (Cible &gt; 70% Préventif)
            </p>
          </div>
          <button className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Bar Chart Graphic (SVG + Interactive Bars) */}
        <div className="h-44 flex items-end justify-between pt-6 px-2 gap-3">
          {monthlyData.map((item) => {
            const isHovered = hoveredMonth === item.month;
            return (
              <div 
                key={item.month} 
                className="flex-1 flex flex-col items-center gap-1 h-full justify-end group cursor-pointer"
                onMouseEnter={() => setHoveredMonth(item.month)}
                onMouseLeave={() => setHoveredMonth(null)}
              >
                {/* Tooltip on hover */}
                {isHovered && (
                  <div className="text-[10px] bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-1.5 py-0.5 rounded shadow absolute -translate-y-24 z-10 font-mono-num font-bold">
                    Prév {item.prev}% / Cur {item.curat}%
                  </div>
                )}
                <div className="w-full flex items-end justify-center gap-1 h-28">
                  {/* Préventif bar */}
                  <div 
                    className="w-3 rounded-t transition-all duration-300 bg-[#0f4066] dark:bg-[#205b91] group-hover:brightness-125"
                    style={{ height: `${item.prev * 1.1}%` }}
                    title={`Préventif: ${item.prev}%`}
                  ></div>
                  {/* Curatif bar */}
                  <div 
                    className="w-3 rounded-t transition-all duration-300 bg-[#ea580c] group-hover:brightness-125"
                    style={{ height: `${item.curat * 1.1}%` }}
                    title={`Curatif: ${item.curat}%`}
                  ></div>
                </div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs pt-3 border-t border-slate-100 dark:border-[#163359] flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#0f4066] dark:bg-[#205b91]"></span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">Préventif <strong>(74.8%)</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#ea580c]"></span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">Curatif <strong>(25.2%)</strong></span>
          </div>
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
            <CheckCircle2 className="w-3 h-3" />
            <span>Ratio Conforme</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. Statuts du Parc Total */}
      {/* ========================================================================= */}
      <div 
        id="chart-statuts-parc"
        className={`p-4 rounded-xl border transition-all shadow-sm ${
          isDarkMode ? 'bg-[#0b1b33] border-[#1a3a66]' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-bold text-sm font-space text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Statuts du Parc Total</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Inventaire actif de 128 engins portuaires
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live</span>
          </div>
        </div>

        {/* Donut Chart Visual */}
        <div className="relative flex items-center justify-center my-3">
          <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke={isDarkMode ? '#142c4d' : '#e2e8f0'}
              strokeWidth="12"
            />
            {/* Opérationnels (67.2% -> 240 / 360 deg) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#10b981"
              strokeWidth="12"
              strokeDasharray="160 240"
              strokeDashoffset="0"
              className="transition-all duration-700 hover:opacity-90"
            />
            {/* En Maintenance (19.5%) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#f59e0b"
              strokeWidth="12"
              strokeDasharray="47 240"
              strokeDashoffset="-162"
              className="transition-all duration-700 hover:opacity-90"
            />
            {/* Arrêt / Pannes (13.3%) */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#ef4444"
              strokeWidth="12"
              strokeDasharray="32 240"
              strokeDashoffset="-211"
              className="transition-all duration-700 hover:opacity-90"
            />
          </svg>

          {/* Centered Total Label */}
          <div className="absolute text-center">
            <div className="text-2xl font-extrabold font-space text-slate-900 dark:text-white leading-none">
              128
            </div>
            <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">
              Équipements
            </div>
          </div>
        </div>

        {/* Segment Breakdown Legend */}
        <div className="space-y-1 text-xs pt-2 border-t border-slate-100 dark:border-[#163359]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-700 dark:text-slate-300">Opérationnels (86)</span>
            </div>
            <span className="font-mono-num font-bold text-slate-900 dark:text-white">67.2%</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-slate-700 dark:text-slate-300">En Maintenance (25)</span>
            </div>
            <span className="font-mono-num font-bold text-slate-900 dark:text-white">19.5%</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span className="text-slate-700 dark:text-slate-300">Arrêt / Pannes (17)</span>
            </div>
            <span className="font-mono-num font-bold text-red-600 dark:text-red-400">13.3%</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. Criticité par Catégorie */}
      {/* ========================================================================= */}
      <div 
        id="chart-criticite-categorie"
        className={`p-4 rounded-xl border transition-all shadow-sm ${
          isDarkMode ? 'bg-[#0b1b33] border-[#1a3a66]' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-bold text-sm font-space text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Criticité par Catégorie</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Impact financier & goulet logistique d'embarquement
            </p>
          </div>
          <button className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Impact Bar List */}
        <div className="space-y-3 my-3">
          {/* Levage Lourd */}
          <div>
            <div className="flex justify-between text-xs mb-1 font-medium">
              <span className="text-slate-800 dark:text-slate-200">Levage Lourd & Portiques</span>
              <span className="font-mono-num font-bold text-red-600 dark:text-red-400">42% impact</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-[#152e52] rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: '42%' }}></div>
            </div>
          </div>

          {/* Convoyage Minéralier */}
          <div>
            <div className="flex justify-between text-xs mb-1 font-medium">
              <span className="text-slate-800 dark:text-slate-200">Convoyage Minéralier</span>
              <span className="font-mono-num font-bold text-orange-600 dark:text-orange-400">28% impact</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-[#152e52] rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full" style={{ width: '28%' }}></div>
            </div>
          </div>

          {/* Ferroviaire & Traction */}
          <div>
            <div className="flex justify-between text-xs mb-1 font-medium">
              <span className="text-slate-800 dark:text-slate-200">Ferroviaire & Traction</span>
              <span className="font-mono-num font-bold text-sky-600 dark:text-sky-400">18% impact</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-[#152e52] rounded-full overflow-hidden">
              <div className="h-full bg-sky-600 rounded-full" style={{ width: '18%' }}></div>
            </div>
          </div>

          {/* Énergie & Utilités */}
          <div>
            <div className="flex justify-between text-xs mb-1 font-medium">
              <span className="text-slate-800 dark:text-slate-200">Énergie & Utilités</span>
              <span className="font-mono-num font-bold text-emerald-600 dark:text-emerald-400">12% impact</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-[#152e52] rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '12%' }}></div>
            </div>
          </div>
        </div>

        {/* Alert notification callout */}
        <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2 mt-4">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-[11px] leading-snug">
            <strong>Priorité astreinte renforcée</strong> sur Quai 3 (MV Ogooué Cape)
          </span>
        </div>
      </div>
    </div>
  );
};
