import React, { useState } from 'react';
import { AlertTriangle, Plus, Search, AlertCircle, CheckCircle2, Clock, Trash2, BarChart2 } from 'lucide-react';
import WeeklyStatsDiagram from '../components/WeeklyStatsDiagram.jsx';
import { CategorySupervision } from '../components/CategorySupervision.tsx';
import EquipmentKpiModal from '../components/modals/EquipmentKpiModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function PannesPage({ pannes = [], equipments = [], workOrders = [], onOpenAddModal, onResolvePanne, onDeletePanne }) {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPanne, setSelectedPanne] = useState(null);
  const [selectedMachineForKpi, setSelectedMachineForKpi] = useState(null);

  const findEquipmentForPanne = (panne) => {
    if (!panne) return null;
    return equipments.find((e) => String(e.id) === String(panne._equipmentId))
      || equipments.find((e) => e.code === panne.equipmentCode)
      || equipments.find((e) => e.name === panne.equipment)
      || null;
  };

  const total = pannes.length;
  const inProgress = pannes.filter(p => p.status === 'En cours').length;
  const critical = pannes.filter(p => p.severity === 'Critique' || p.severity === 'Élevée').length;
  const resolved = pannes.filter(p => p.status === 'Résolue').length;

  const filteredPannes = pannes.filter(p => {
    const matchesSearch = p.equipment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.reportedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || p.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <div className="content" id="pannes-page-content">
      {/* En-tête Dossier 1 */}
      <div className="section-heading" style={{ marginBottom: '28px' }}>
        <div>
          <div className="section-label">MAINTENANCE</div>
          <div className="section-title" style={{ fontSize: '28px', marginTop: '4px' }}>
            Gestion des pannes
          </div>
          <p style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '4px' }}>
            Centralisez, analysez et suivez les défaillances pour réduire les temps d'arrêt non planifiés.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={onOpenAddModal}
          id="btn-add-panne"
        >
          <Plus size={16} /> + Déclarer une panne
        </button>
      </div>

      {/* 4 Stats Cards */}
      <div className="kpi-grid" style={{ marginBottom: '30px' }}>
        <div className="kpi-card border-accent">
          <div className="kpi-top">
            <span className="kpi-title">Total Pannes</span>
            <div className="kpi-icon"><AlertTriangle size={18} /></div>
          </div>
          <div className="kpi-number">{total}</div>
          <span className="kpi-caption">Historique global d'incidents</span>
        </div>

        <div className="kpi-card border-accent">
          <div className="kpi-top">
            <span className="kpi-title">Pannes En Cours</span>
            <div className="kpi-icon"><Clock size={18} color="var(--orange)" /></div>
          </div>
          <div className="kpi-number" style={{ color: 'var(--orange)' }}>{inProgress}</div>
          <span className="kpi-caption">Interventions actives sur quai</span>
        </div>

        <div className="kpi-card border-accent">
          <div className="kpi-top">
            <span className="kpi-title">Pannes Critiques</span>
            <div className="kpi-icon"><AlertCircle size={18} color="var(--red)" /></div>
          </div>
          <div className="kpi-number" style={{ color: 'var(--red)' }}>{critical}</div>
          <span className="kpi-caption">Priorité P1 / Impact manutention</span>
        </div>

        <div className="kpi-card border-accent">
          <div className="kpi-top">
            <span className="kpi-title">Pannes Résolues</span>
            <div className="kpi-icon"><CheckCircle2 size={18} color="var(--green)" /></div>
          </div>
          <div className="kpi-number" style={{ color: 'var(--green)' }}>{resolved}</div>
          <span className="kpi-caption">Clôturées avec succès</span>
        </div>
      </div>

      {/* SCHÉMAS STATISTIQUES DES PANNES PAR SEMAINE / MOIS / JOUR / HEURE */}
      <WeeklyStatsDiagram
        pageTitle="Statistiques Multi-Périodes des Défaillances & Pannes"
        subtitle="Distribution réelle des pannes par mois, semaine et jour"
        context="pannes"
        pannes={pannes}
      />

      {/* SUPERVISION PAR CATÉGORIE : RATIOS DE PANNES, TRC, PRÉVENTIF/CORRECTIF PAR MACHINE */}
      <CategorySupervision
        equipments={equipments}
        pannes={pannes}
        workOrders={workOrders}
        onSelectEquipment={(eq) => setSelectedMachineForKpi(eq)}
      />

      {/* Registre des Pannes */}
      <section className="section">
        <div className="section-heading">
          <div>
            <div className="section-label">INCIDENTS DÉCLARÉS</div>
            <div className="section-title">Registre des Pannes & Défaillances</div>
          </div>
        </div>

        <div className="filters-bar" style={{ background: 'var(--card-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div className="search-box">
            <Search className="search-icon" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher par équipement, type ou déclarant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-selects">
            <select 
              className="filter-select"
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
            >
              <option value="all">Toutes les gravités</option>
              <option value="Critique">Critique (P1)</option>
              <option value="Élevée">Élevée (P2)</option>
              <option value="Moyenne">Moyenne (P3)</option>
              <option value="Faible">Faible (P4)</option>
            </select>

            <select 
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="En cours">En cours</option>
              <option value="Résolue">Résolue</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper" style={{ marginTop: '16px' }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Équipement</th>
                <th>Type de Panne</th>
                <th>Déclarée le</th>
                <th>Résolue le</th>
                <th>Gravité</th>
                <th>Déclarée Par</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPannes.map((panne) => (
                <tr key={panne.id}>
                  <td style={{ fontWeight: 700 }}>{panne.id}</td>
                  <td style={{ fontWeight: 600 }}>{panne.equipment}</td>
                  <td>{panne.type}</td>
                  <td>{panne.date} {panne.time && `· ${panne.time}`}</td>
                  <td>
                    {panne.resolvedDate
                      ? <span style={{ color: 'var(--green)', fontWeight: 600 }}>{panne.resolvedDate} · {panne.resolvedTime}</span>
                      : <span style={{ color: 'var(--muted)' }}>—</span>}
                  </td>
                  <td>
                    <span className={`status-badge ${panne.severity === 'Critique' ? 'status-late' : panne.severity === 'Élevée' ? 'status-progress' : 'status-info'}`}>
                      {panne.severity}
                    </span>
                  </td>
                  <td>{panne.reportedBy}</td>
                  <td>
                    <span className={`status-badge ${panne.status === 'Résolue' ? 'status-done' : 'status-progress'}`}>
                      {panne.status}
                    </span>
                    {panne.needsReview && (
                      <span className="status-badge status-late" style={{ marginLeft: '6px' }} title="Incohérence détectée à l'import — exclue des calculs de KPI jusqu'à confirmation">
                        À valider
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="action-btn-sm"
                        onClick={() => setSelectedPanne(panne)}
                      >
                        Détails
                      </button>
                      {findEquipmentForPanne(panne) && (
                        <button
                          type="button"
                          className="action-btn-kpi"
                          onClick={() => setSelectedMachineForKpi(findEquipmentForPanne(panne))}
                          title="Voir les KPI de cette machine"
                        >
                          <BarChart2 size={13} /> KPI
                        </button>
                      )}
                      {onDeletePanne && isAdmin && (
                        <button
                          type="button"
                          className="action-btn-sm"
                          style={{ color: 'var(--red)', borderColor: 'rgba(239,71,111,0.4)' }}
                          onClick={() => onDeletePanne(panne.id)}
                          title="Supprimer cette panne"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Détails Panne */}
      {selectedPanne && (
        <div className="modal-overlay" onClick={() => setSelectedPanne(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Détail Incident · {selectedPanne.id}</div>
              <button type="button" className="modal-close" onClick={() => setSelectedPanne(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', fontSize: '13px' }}>
                <div><strong>Équipement :</strong> {selectedPanne.equipment}</div>
                <div><strong>Type :</strong> {selectedPanne.type}</div>
                <div><strong>Déclarée le :</strong> {selectedPanne.date} à {selectedPanne.time}</div>
                <div>
                  <strong>Résolue le :</strong>{' '}
                  {selectedPanne.resolvedDate
                    ? <span style={{ color: 'var(--green)', fontWeight: 600 }}>{selectedPanne.resolvedDate} à {selectedPanne.resolvedTime}</span>
                    : <span style={{ color: 'var(--muted)' }}>Non résolue</span>}
                </div>
                <div><strong>Gravité :</strong> {selectedPanne.severity}</div>
                <div><strong>Déclarée par :</strong> {selectedPanne.reportedBy}</div>
                <div><strong>Statut :</strong> {selectedPanne.status}</div>
                <div><strong>Durée d'arrêt (diagnostic) :</strong> {selectedPanne.durationHours ?? 0} h</div>
              </div>

              <div style={{ marginTop: '12px' }}>
                <strong>Symptômes constatés :</strong>
                <p style={{ color: 'var(--muted)', marginTop: '4px', fontSize: '13px' }}>
                  {selectedPanne.symptoms || 'Non renseigné.'}
                </p>
              </div>

              <div style={{ marginTop: '10px' }}>
                <strong>Cause racine identifiée :</strong>
                <p style={{ color: 'var(--muted)', marginTop: '4px', fontSize: '13px' }}>
                  {selectedPanne.cause || 'Analyse en cours par les équipes techniques.'}
                </p>
              </div>

              <div style={{ marginTop: '10px' }}>
                <strong>Action corrective requise :</strong>
                <p style={{ color: 'var(--muted)', marginTop: '4px', fontSize: '13px' }}>
                  {selectedPanne.actionRequired || 'Consignation et intervention standard.'}
                </p>
              </div>
            </div>
            <div className="modal-footer">
              {findEquipmentForPanne(selectedPanne) && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ borderColor: 'var(--orange)', color: 'var(--orange)' }}
                  onClick={() => {
                    const eq = findEquipmentForPanne(selectedPanne);
                    setSelectedPanne(null);
                    setSelectedMachineForKpi(eq);
                  }}
                >
                  <BarChart2 size={16} /> Voir les KPI &amp; TRC de la machine
                </button>
              )}
              {selectedPanne.status !== 'Résolue' && onResolvePanne && (
                <button 
                  type="button" 
                  className="btn-primary" 
                  style={{ background: 'var(--green)' }}
                  onClick={() => {
                    onResolvePanne(selectedPanne.id);
                    setSelectedPanne(null);
                  }}
                >
                  <CheckCircle2 size={16} /> Marquer comme Résolue
                </button>
              )}
              {onDeletePanne && isAdmin && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ color: 'var(--red)', borderColor: 'rgba(239,71,111,0.4)' }}
                  onClick={() => {
                    onDeletePanne(selectedPanne.id);
                    setSelectedPanne(null);
                  }}
                >
                  <Trash2 size={15} /> Supprimer
                </button>
              )}
              <button type="button" className="btn-secondary" onClick={() => setSelectedPanne(null)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal KPI & TRC de la machine liée à la panne sélectionnée */}
      {selectedMachineForKpi && (
        <EquipmentKpiModal
          equipment={selectedMachineForKpi}
          pannes={pannes}
          workOrders={workOrders}
          onClose={() => setSelectedMachineForKpi(null)}
        />
      )}
    </div>
  );
}
