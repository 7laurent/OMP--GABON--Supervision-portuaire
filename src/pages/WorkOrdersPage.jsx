import React, { useState } from 'react';
import { ClipboardList, Plus, Search, CheckCircle2, Clock, AlertTriangle, ArrowRight, Trash2 } from 'lucide-react';
import WeeklyStatsDiagram from '../components/WeeklyStatsDiagram.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function WorkOrdersPage({
  workOrders = [],
  onOpenAddModal,
  onNavigate,
  onCompleteWorkOrder,
  onDeleteWorkOrder
}) {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedWO, setSelectedWO] = useState(null);

  const total = workOrders.length;
  const inProgress = workOrders.filter(w => w.status === 'En cours').length;
  const completed = workOrders.filter(w => w.status === 'Terminé').length;
  const late = workOrders.filter(w => w.status === 'En retard').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const filteredWO = workOrders.filter(w => {
    const matchesSearch = w.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          w.equipment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          w.technician.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || w.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="content" id="workorder-page-content">
      {/* Hero Dossier 1 */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-small-title">MAINTENANCE OPERATIONS</div>
          <h1>Work Orders au cœur des opérations</h1>
          <p>
            Planifiez, affectez et tracez l'ensemble des ordres de travail préventifs et curatifs sur l'ensemble
            des installations portuaires d'Owendo.
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={onOpenAddModal}
              id="btn-add-wo-hero"
            >
              <Plus size={16} /> + Nouveau Work Order
            </button>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => onNavigate('historique')}
            >
              Historique →
            </button>
          </div>
        </div>
        <div className="hero-number">WO</div>
      </section>

      {/* 4 KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: '30px' }}>
        <div className="kpi-card border-accent">
          <div className="kpi-top">
            <span className="kpi-title">Total Work Orders</span>
            <div className="kpi-icon"><ClipboardList size={18} /></div>
          </div>
          <div className="kpi-number">{total}</div>
          <span className="kpi-caption">Interventions émises</span>
        </div>

        <div className="kpi-card border-accent">
          <div className="kpi-top">
            <span className="kpi-title">En Cours</span>
            <div className="kpi-icon"><Clock size={18} color="var(--orange)" /></div>
          </div>
          <div className="kpi-number" style={{ color: 'var(--orange)' }}>{inProgress}</div>
          <span className="kpi-caption">En phase d'exécution</span>
        </div>

        <div className="kpi-card border-accent">
          <div className="kpi-top">
            <span className="kpi-title">Terminés</span>
            <div className="kpi-icon"><CheckCircle2 size={18} color="var(--green)" /></div>
          </div>
          <div className="kpi-number" style={{ color: 'var(--green)' }}>{completed}</div>
          <span className="kpi-caption">{completionRate}% de réalisation</span>
        </div>

        <div className="kpi-card border-accent">
          <div className="kpi-top">
            <span className="kpi-title">En Retard</span>
            <div className="kpi-icon"><AlertTriangle size={18} color="var(--red)" /></div>
          </div>
          <div className="kpi-number" style={{ color: 'var(--red)' }}>{late}</div>
          <span className="kpi-caption">Échéance dépassée</span>
        </div>
      </div>

      {/* SCHÉMAS STATISTIQUES DES WORK ORDERS PAR SEMAINE / MOIS / JOUR / HEURE */}
      <WeeklyStatsDiagram
        pageTitle="Statistiques d'Exécution des Work Orders"
        subtitle="Suivi réel des ordres de travail par mois, semaine et jour"
        context="workorders"
        workOrders={workOrders}
      />

      {/* Table Work Orders */}
      <section className="section">
        <div className="section-heading">
          <div>
            <div className="section-label">REGISTRE OPÉRATIONNEL</div>
            <div className="section-title">Table des Interventions</div>
          </div>
        </div>

        <div className="filters-bar" style={{ background: 'var(--card-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div className="search-box">
            <Search className="search-icon" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher par ID, équipement ou technicien..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-selects">
            <select 
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="En cours">En cours</option>
              <option value="Terminé">Terminé</option>
              <option value="En retard">En retard</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper" style={{ marginTop: '16px' }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Équipement</th>
                <th>Type</th>
                <th>Technicien</th>
                <th>Priorité</th>
                <th>Date / Échéance</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredWO.map((wo) => (
                <tr key={wo.id}>
                  <td style={{ fontWeight: 700 }}>{wo.id}</td>
                  <td style={{ fontWeight: 600 }}>{wo.equipment}</td>
                  <td><span className="tag-badge">{wo.type}</span></td>
                  <td>{wo.technician}</td>
                  <td>
                    <span className={`status-badge ${wo.priority === 'Critique' ? 'status-late' : wo.priority === 'Élevée' ? 'status-progress' : 'status-info'}`}>
                      {wo.priority}
                    </span>
                  </td>
                  <td>{wo.dueDate || wo.date}</td>
                  <td>
                    <span className={`status-badge ${wo.status === 'Terminé' ? 'status-done' : wo.status === 'En retard' ? 'status-late' : 'status-progress'}`}>
                      {wo.status}
                    </span>
                    {wo.needsReview && (
                      <span className="status-badge status-late" style={{ marginLeft: '6px' }} title="Incohérence détectée à l'import — exclu des calculs de KPI jusqu'à confirmation">
                        À valider
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="action-btn-sm"
                        onClick={() => setSelectedWO(wo)}
                      >
                        Détails
                      </button>
                      {onDeleteWorkOrder && isAdmin && (
                        <button
                          type="button"
                          className="action-btn-sm"
                          style={{ color: 'var(--red)', borderColor: 'rgba(239,71,111,0.4)' }}
                          onClick={() => onDeleteWorkOrder(wo.id)}
                          title="Supprimer ce Work Order"
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

      {/* Modal Détails WO */}
      {selectedWO && (
        <div className="modal-overlay" onClick={() => setSelectedWO(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Détail Work Order · {selectedWO.id}</div>
              <button type="button" className="modal-close" onClick={() => setSelectedWO(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', fontSize: '13px' }}>
                <div><strong>Équipement :</strong> {selectedWO.equipment}</div>
                <div><strong>Type :</strong> {selectedWO.type}</div>
                <div><strong>Technicien affecté :</strong> {selectedWO.technician}</div>
                <div><strong>Priorité :</strong> {selectedWO.priority}</div>
                <div><strong>Date de création :</strong> {selectedWO.date}</div>
                <div><strong>Date d'échéance :</strong> {selectedWO.dueDate || 'N/A'}</div>
                <div><strong>Statut actuel :</strong> {selectedWO.status}</div>
                <div><strong>Heures estimées :</strong> {selectedWO.estimatedHours || 4} h</div>
              </div>

              <div style={{ marginTop: '12px' }}>
                <strong>Description des travaux :</strong>
                <p style={{ color: 'var(--muted)', marginTop: '4px', fontSize: '13px' }}>
                  {selectedWO.description || 'Aucune description spécifique renseignée.'}
                </p>
              </div>

              {selectedWO.actionList && selectedWO.actionList.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <strong>Liste des opérations requises :</strong>
                  <ul style={{ paddingLeft: '20px', marginTop: '4px', fontSize: '12px', color: 'var(--muted)' }}>
                    {selectedWO.actionList.map((action, i) => (
                      <li key={i}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {selectedWO.status !== 'Terminé' && onCompleteWorkOrder && (
                <button 
                  type="button" 
                  className="btn-primary" 
                  style={{ background: 'var(--green)' }}
                  onClick={() => {
                    onCompleteWorkOrder(selectedWO.id);
                    setSelectedWO(null);
                  }}
                >
                  <CheckCircle2 size={16} /> Clôturer le Work Order
                </button>
              )}
              {onDeleteWorkOrder && isAdmin && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ color: 'var(--red)', borderColor: 'rgba(239,71,111,0.4)' }}
                  onClick={() => {
                    onDeleteWorkOrder(selectedWO.id);
                    setSelectedWO(null);
                  }}
                >
                  <Trash2 size={15} /> Supprimer
                </button>
              )}
              <button type="button" className="btn-secondary" onClick={() => setSelectedWO(null)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
