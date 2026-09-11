import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Wrench, 
  ClipboardList, 
  Package, 
  Users, 
  CalendarCheck, 
  History, 
  Settings, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Flame, 
  ChevronRight,
  Search,
  Filter,
  Eye,
  Sliders,
  Moon,
  Sun
} from 'lucide-react';
import { PanneIncident, WorkOrder, Equipment, Technician, SparePart, ActiveTab } from '../../types';
import { useTheme } from '../../context/ThemeContext';

// =========================================================================
// 1. PANNES & INCIDENTS VIEW
// =========================================================================
export const PannesView: React.FC<{
  pannes: PanneIncident[];
  onDeclarePanne: () => void;
  onResolvePanne: (id: string) => void;
}> = ({ pannes, onDeclarePanne, onResolvePanne }) => {
  const { isDarkMode } = useTheme();
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = pannes.filter(p => {
    const matchesSev = filterPriority === 'all' || p.priority === filterPriority;
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
                          p.equipmentName.toLowerCase().includes(search.toLowerCase()) ||
                          p.reporter.toLowerCase().includes(search.toLowerCase());
    return matchesSev && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#1e3c66]">
        <div>
          <h2 className="text-xl font-bold font-space text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>Pannes & Incidents Portuaires en Temps Réel</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Signalements d'astreinte 24/7 et gestion des blocages d'évacuation
          </p>
        </div>
        <button
          onClick={onDeclarePanne}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#992800] hover:bg-[#b03000] text-white font-bold text-xs shadow"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>+ Déclarer une Panne</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          {['all', 'P1', 'P2', 'P3'].map(p => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterPriority === p
                  ? p === 'P1'
                    ? 'bg-red-600 text-white'
                    : p === 'P2'
                    ? 'bg-orange-500 text-white'
                    : p === 'P3'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-white dark:bg-sky-600'
                  : 'bg-slate-100 text-slate-700 dark:bg-[#0f2342] dark:text-slate-300'
              }`}
            >
              {p === 'all' ? 'Toutes' : `${p} ${p === 'P1' ? 'Critiques' : p === 'P2' ? 'Hautes' : 'Normales'}`}
            </button>
          ))}
        </div>
        <div className="ml-auto w-full sm:w-64">
          <input
            type="text"
            placeholder="Rechercher incident..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full text-xs px-3 py-1.5 rounded-lg border ${
              isDarkMode ? 'bg-[#0f2342] border-[#1d3c66] text-white' : 'bg-white border-slate-300 text-slate-800'
            }`}
          />
        </div>
      </div>

      {/* Incident List */}
      <div className="space-y-3">
        {filtered.map(panne => (
          <div
            key={panne.id}
            className={`p-4 rounded-xl border transition-all ${
              isDarkMode ? 'bg-[#0b1b33] border-[#1a3a66]' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    panne.priority === 'P1'
                      ? 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300'
                      : panne.priority === 'P2'
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/80 dark:text-orange-300'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300'
                  }`}>
                    {panne.priority} {panne.priority === 'P1' ? 'CRITIQUE' : 'HAUTE'}
                  </span>
                  <span className="font-mono-num font-bold text-xs text-slate-500">{panne.id}</span>
                  <span className="text-xs text-slate-400">· {panne.reportedAt}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-[#132b4b] text-slate-700 dark:text-slate-300 font-semibold">
                    {panne.status}
                  </span>
                </div>
                <h3 className="font-bold text-sm font-space text-slate-900 dark:text-white mt-1">
                  {panne.title}
                </h3>
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Équipement : <strong>{panne.equipmentName}</strong> · Déclarant : {panne.reporter} · Technicien affecté : {panne.assignedTech || 'Non assigné'}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-[#0e213d] p-2.5 rounded-lg border border-slate-100 dark:border-[#17355e]">
                  {panne.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onResolvePanne(panne.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Clôturer / Résolu</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// =========================================================================
// 2. TECHNICIENS VIEW
// =========================================================================
export const TechniciensView: React.FC<{ techniciens: Technician[] }> = ({ techniciens }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className="space-y-4">
      <div className="pb-3 border-b border-slate-200 dark:border-[#1e3c66]">
        <h2 className="text-xl font-bold font-space text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-500" />
          <span>Brigades & Techniciens de Maintenance (3×8)</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Suivi des 24 agents postés, astreintes et affectations sur le port d'Owendo
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {techniciens.map(tech => (
          <div
            key={tech.id}
            className={`p-4 rounded-xl border transition-all ${
              isDarkMode ? 'bg-[#0b1b33] border-[#1a3a66]' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                tech.status === 'En intervention'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                  : tech.status === 'Disponible'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-700 dark:bg-[#152e52] dark:text-slate-300'
              }`}>
                {tech.status}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {tech.shift}
              </span>
            </div>

            <h3 className="font-bold font-space text-sm text-slate-900 dark:text-white">
              {tech.name}
            </h3>
            <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
              {tech.role}
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-[#17355e] text-xs space-y-1 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Spécialité :</span>
                <strong className="text-slate-900 dark:text-white truncate ml-2">{tech.specialty}</strong>
              </div>
              <div className="flex justify-between">
                <span>Intervention active :</span>
                <strong className="font-mono-num text-emerald-600 dark:text-emerald-400">{tech.activeWO || 'Aucune'}</strong>
              </div>
              <div className="flex justify-between">
                <span>Contact direct :</span>
                <span className="text-slate-500">{tech.contact}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// =========================================================================
// 3. PARAMÈTRES VIEW
// =========================================================================
export const ParametresView: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="pb-3 border-b border-slate-200 dark:border-[#1e3c66]">
        <h2 className="text-xl font-bold font-space text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-400" />
          <span>Paramètres du Système & Télémétrie OMP</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configuration des flux, passerelle FastAPI, bases de données et interface utilisateur
        </p>
      </div>

      {/* Theme Setting */}
      <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#0b1b33] border-[#1a3a66]' : 'bg-white border-slate-200'}`}>
        <h3 className="font-bold font-space text-sm text-slate-900 dark:text-white mb-2">
          Apparence & Thème Visuel
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Basculez entre le mode clair et le mode sombre <strong>Bleu Nuit</strong> (Midnight Blue) optimisé pour les écrans de contrôle de la Direction Technique.
        </p>
        <button
          onClick={toggleDarkMode}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
            isDarkMode 
              ? 'bg-[#10233f] text-sky-200 border-[#224471] ring-1 ring-sky-400/40' 
              : 'bg-slate-100 text-slate-800 border-slate-300'
          }`}
        >
          {isDarkMode ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Désactiver le Mode Bleu Nuit (Passer en Mode Clair)</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-[#071d36]" />
              <span>Activer le Mode Sombre Bleu Nuit</span>
            </>
          )}
        </button>
      </div>

      {/* API Integrations */}
      <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#0b1b33] border-[#1a3a66]' : 'bg-white border-slate-200'}`}>
        <h3 className="font-bold font-space text-sm text-slate-900 dark:text-white mb-2">
          Connecteurs & Intégrations Système
        </h3>
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-[#0e213d]">
            <div>
              <div className="font-bold text-slate-900 dark:text-white">API FastAPI Portuaire (Port 8000)</div>
              <div className="text-slate-500 dark:text-slate-400">Statut : Connecté et cadencé à 500ms</div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
              ACTIF
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-[#0e213d]">
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Base de Données Supabase / PostgreSQL</div>
              <div className="text-slate-500 dark:text-slate-400">Réplication multi-zones Owendo · Chiffrement AES-256</div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
              SYNCHRONISÉ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
