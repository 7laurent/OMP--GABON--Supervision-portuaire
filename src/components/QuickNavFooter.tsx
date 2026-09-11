import React from 'react';
import { 
  Wrench, 
  AlertTriangle, 
  ClipboardList, 
  Package, 
  Users, 
  CalendarCheck, 
  History, 
  Settings 
} from 'lucide-react';
import { ActiveTab } from '../types';
import { useTheme } from '../context/ThemeContext';

interface QuickNavFooterProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  pannesCount: number;
  workOrdersCount: number;
  equipementsCount: number;
}

export const QuickNavFooter: React.FC<QuickNavFooterProps> = ({
  activeTab,
  setActiveTab,
  pannesCount,
  workOrdersCount,
  equipementsCount
}) => {
  const { isDarkMode } = useTheme();

  const items = [
    { id: 'equipements', label: 'Équipements', sub: `${equipementsCount} Actifs`, icon: Wrench, color: 'text-sky-500' },
    { id: 'pannes', label: 'Pannes', sub: `${pannesCount} Actives`, icon: AlertTriangle, color: 'text-red-500' },
    { id: 'work-orders', label: 'Work Orders', sub: `${workOrdersCount} en cours`, icon: ClipboardList, color: 'text-blue-500' },
    { id: 'pieces', label: 'Pièces & Mag.', sub: '3 420 réf', icon: Package, color: 'text-amber-500' },
    { id: 'techniciens', label: 'Techniciens', sub: '24 postés', icon: Users, color: 'text-emerald-500' },
    { id: 'preventif', label: 'Préventif', sub: 'Plans 2024', icon: CalendarCheck, color: 'text-indigo-500' },
    { id: 'historique', label: 'Historique', sub: 'Audit Logs', icon: History, color: 'text-slate-400' },
    { id: 'parametres', label: 'Paramètres', sub: 'API & Rôles', icon: Settings, color: 'text-slate-400' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-8">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            id={`quick-nav-${item.id}`}
            onClick={() => setActiveTab(item.id as ActiveTab)}
            className={`p-3 rounded-lg border text-center transition-all ${
              isActive
                ? 'bg-[#ea580c] text-white border-[#ea580c] shadow-md scale-[1.02]'
                : isDarkMode
                ? 'bg-[#0b1b33] border-[#1a3a66] text-slate-300 hover:bg-[#112749] hover:border-sky-500/40'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Icon className={`w-5 h-5 mx-auto mb-1.5 ${isActive ? 'text-white' : item.color}`} />
            <div className="font-bold text-xs font-space truncate">{item.label}</div>
            <div className={`text-[10px] truncate ${isActive ? 'text-white/90' : 'text-slate-400'}`}>
              {item.sub}
            </div>
          </button>
        );
      })}
    </div>
  );
};
