import React, { useMemo, useState } from 'react';
import { Maximize2, Filter, BarChart3, X, Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import TemporalAnalyticsSection from './TemporalAnalyticsSection.jsx';
import { calculateEquipmentSpecificKpis, calculateTRC } from '../utils/kpiCalculations.js';

interface CategorySupervisionProps {
  equipments: any[];
  pannes?: any[];
  workOrders?: any[];
  onSelectEquipment: (eq: any) => void;
}

/**
 * Supervision par catégorie d'équipement, entièrement dérivée des données réelles
 * (equipements, pannes, work orders). Un seul tableau dont le contenu se met à jour
 * selon la catégorie sélectionnée dans le filtre, plutôt qu'un bloc répété par
 * catégorie (évite de surcharger la page). L'analyse temporelle détaillée (ratios,
 * TRC dans le temps) reste accessible via un bouton, dans une modale.
 */
export const CategorySupervision: React.FC<CategorySupervisionProps> = ({
  equipments,
  pannes = [],
  workOrders = [],
  onSelectEquipment
}) => {
  const { isDarkMode } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = useMemo(() => Array.from(new Set(equipments.map((e) => e.category).filter(Boolean))), [equipments]);

  const visibleEquipments = useMemo(() => {
    const byCategory = selectedCategory === 'all' ? equipments : equipments.filter((e) => e.category === selectedCategory);
    const term = searchTerm.trim().toLowerCase();
    if (!term) return byCategory;
    return byCategory.filter((e) => e.name.toLowerCase().includes(term) || e.code.toLowerCase().includes(term));
  }, [equipments, selectedCategory, searchTerm]);

  const scopePannes = useMemo(
    () => (selectedCategory === 'all' ? pannes : pannes.filter((p) => p._category === selectedCategory)),
    [pannes, selectedCategory]
  );

  const scopeTrc = calculateTRC(scopePannes);
  const scopeLabel = selectedCategory === 'all' ? 'Tout le parc' : selectedCategory;

  return (
    <div className="space-y-4 mb-8" id="category-supervision-container">
      <div className="rounded-xl border p-5 transition-all shadow-sm bg-white dark:bg-[#0b1b33] border-slate-200 dark:border-[#1a3a66]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="px-2 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wide bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300">
              Supervision par Catégorie · Données Réelles
            </span>
            <h2 className="text-xl font-bold font-space text-slate-900 dark:text-white mt-2">
              Ratios de Pannes, TRC & Préventif/Correctif par Catégorie de Machines
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {equipments.length} équipement(s) répartis en {categories.length} catégorie(s)
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filtrer :
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                selectedCategory === 'all' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-600 dark:bg-[#122847] dark:text-slate-300'
              }`}
            >
              Toutes les catégories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === cat ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-[#122847] dark:text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {equipments.length === 0 ? (
        <div className="rounded-xl border p-8 text-center text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-[#0b1b33] border-slate-200 dark:border-[#1a3a66]">
          Aucun équipement enregistré pour le moment.
        </div>
      ) : (
        <div className={`rounded-xl border overflow-hidden transition-all shadow-sm ${isDarkMode ? 'bg-[#0b1b33] border-[#1a3a66]' : 'bg-white border-slate-200'}`}>
          {/* Résumé de la sélection courante (catégorie choisie dans le filtre ci-dessus) */}
          <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-[#163359] bg-slate-50/70 dark:bg-[#0e2240]">
            <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
              <span className="font-bold text-sm font-space text-slate-900 dark:text-white">{scopeLabel}</span>
              <span>{visibleEquipments.length} machine(s) · {scopePannes.length} panne(s) enregistrée(s)</span>
              <span>
                TRC : <strong className="text-slate-900 dark:text-white">{scopeTrc.trc}%</strong>
                <span className="text-slate-400 dark:text-slate-500"> ({scopeTrc.resolved}/{scopeTrc.total})</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowAnalysisModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-orange-100 hover:text-orange-700 dark:bg-[#122847] dark:text-slate-200 dark:hover:bg-orange-950/60 dark:hover:text-orange-300 transition-all"
            >
              <BarChart3 className="w-3.5 h-3.5" /> Voir l'analyse temporelle & TRC — {scopeLabel}
            </button>
          </div>

          {/* Tableau unique : le contenu change directement selon la catégorie sélectionnée ci-dessus */}
          <div style={{ padding: '12px 20px 0' }}>
            <div className="search-box" style={{ maxWidth: '320px' }}>
              <Search className="search-icon" size={16} />
              <input
                type="text"
                placeholder="Rechercher une machine..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Équipement</th>
                  <th>Catégorie</th>
                  <th>Statut</th>
                  <th>MTBF</th>
                  <th>MTTR</th>
                  <th>Dispo</th>
                  <th>Heures</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleEquipments.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px' }}>
                      Aucune machine dans cette catégorie.
                    </td>
                  </tr>
                ) : (
                  visibleEquipments.map((item) => {
                    const kpis = calculateEquipmentSpecificKpis(item, pannes, workOrders);
                    return (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 700, color: 'var(--orange)' }}>{item.code}</td>
                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                        <td>{item.category}</td>
                        <td>
                          <span className={`status-badge ${item.status === 'Opérationnel' ? 'status-done' : item.status === 'En maintenance' ? 'status-progress' : 'status-late'}`}>
                            {item.status}
                          </span>
                        </td>
                        <td>{kpis?.mtbf ?? '—'} h</td>
                        <td style={{ color: 'var(--orange)', fontWeight: 700 }}>{kpis?.mttr ?? '—'} h</td>
                        <td style={{ color: 'var(--green)', fontWeight: 700 }}>{kpis?.doRate ?? '—'}%</td>
                        <td>{(item.operatingHours || 0).toLocaleString()} h</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="action-btn-sm"
                            onClick={() => onSelectEquipment(item)}
                          >
                            <Maximize2 size={13} /> Voir les KPI détaillés
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAnalysisModal && (
        <div className="modal-overlay" onClick={() => setShowAnalysisModal(false)}>
          <div className="modal-box large" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '980px' }}>
            <div className="modal-header">
              <div className="modal-title">Analyse Temporelle & Ratios — {scopeLabel}</div>
              <button type="button" className="modal-close" onClick={() => setShowAnalysisModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <TemporalAnalyticsSection
                equipments={equipments}
                pannes={pannes}
                workOrders={workOrders}
                fixedCategory={selectedCategory === 'all' ? null : selectedCategory}
                showFilters={selectedCategory === 'all'}
                title={`Ratios réels — ${scopeLabel}`}
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowAnalysisModal(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
