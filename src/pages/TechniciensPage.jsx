import React, { useState } from 'react';
import { Users, Plus, Search, CheckCircle2, Clock, Award, Trash2 } from 'lucide-react';
import WeeklyStatsDiagram from '../components/WeeklyStatsDiagram.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function TechniciensPage({ technicians = [], onOpenAddModal, onDeleteTechnician }) {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeam, setFilterTeam] = useState('all');
  const [selectedTech, setSelectedTech] = useState(null);

  const total = technicians.length;
  const active = technicians.filter(t => t.status === 'Actif').length;

  const filteredTechs = technicians.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.matricule.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = filterTeam === 'all' || t.team === filterTeam;
    return matchesSearch && matchesTeam;
  });

  return (
    <div className="content" id="techniciens-page-content">
      {/* En-tête Dossier 1 */}
      <div className="section-heading" style={{ marginBottom: '28px' }}>
        <div>
          <div className="section-label">ÉQUIPES & RESSOURCES</div>
          <div className="section-title" style={{ fontSize: '28px', marginTop: '4px' }}>
            Gestion des techniciens
          </div>
          <p style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '4px' }}>
            Gérez les affectations, les compétences techniques, la disponibilité et la charge d'intervention.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={onOpenAddModal}
          id="btn-add-technicien"
        >
          <Plus size={16} /> + Ajouter un technicien
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: '30px' }}>
        <div className="kpi-card border-accent">
          <div className="kpi-top">
            <span className="kpi-title">Total Techniciens</span>
            <div className="kpi-icon"><Users size={18} /></div>
          </div>
          <div className="kpi-number">{total}</div>
          <span className="kpi-caption">Effectif opérationnel OMP</span>
        </div>

        <div className="kpi-card border-accent">
          <div className="kpi-top">
            <span className="kpi-title">Actifs en Poste</span>
            <div className="kpi-icon"><CheckCircle2 size={18} color="var(--green)" /></div>
          </div>
          <div className="kpi-number" style={{ color: 'var(--green)' }}>{active}</div>
          <span className="kpi-caption">Prêts à intervenir sur quai</span>
        </div>

        <div className="kpi-card border-accent">
          <div className="kpi-top">
            <span className="kpi-title">Taux Résolution 1er Coup</span>
            <div className="kpi-icon"><Award size={18} color="var(--orange)" /></div>
          </div>
          <div className="kpi-number" style={{ color: 'var(--orange)' }}>91.5%</div>
          <span className="kpi-caption">First Time Fix Rate (FTFR)</span>
        </div>

        <div className="kpi-card border-accent">
          <div className="kpi-top">
            <span className="kpi-title">Habilitations Sécurité</span>
            <div className="kpi-icon"><CheckCircle2 size={18} color="var(--green)" /></div>
          </div>
          <div className="kpi-number" style={{ color: 'var(--green)' }}>100%</div>
          <span className="kpi-caption">À jour CACES, élec & quai</span>
        </div>
      </div>

      {/* SCHÉMAS STATISTIQUES HEBDOMADAIRES DES TECHNICIENS */}
      <WeeklyStatsDiagram 
        pageTitle="Statistiques Multi-Périodes des Équipes & Techniciens"
        subtitle="Heures d'intervention par semaine, charge de travail et taux de réussite FTFR"
        context="techniciens"
      />

      {/* Registre des Techniciens */}
      <section className="section">
        <div className="section-heading">
          <div>
            <div className="section-label">EFFECTIF D'INTERVENTION</div>
            <div className="section-title">Liste des Techniciens & Compétences</div>
          </div>
        </div>

        <div className="filters-bar" style={{ background: 'var(--card-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div className="search-box">
            <Search className="search-icon" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher par nom, matricule ou spécialité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-selects">
            <select 
              className="filter-select"
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
            >
              <option value="all">Toutes les équipes</option>
              <option value="Équipe A - Quai Minéralier">Équipe A - Quai Minéralier</option>
              <option value="Équipe B - Énergie & Systèmes">Équipe B - Énergie & Systèmes</option>
              <option value="Équipe C - Terminal Conteneurs">Équipe C - Terminal Conteneurs</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper" style={{ marginTop: '16px' }}>
          <table>
            <thead>
              <tr>
                <th>Matricule</th>
                <th>Nom & Prénom</th>
                <th>Spécialité</th>
                <th>Équipe</th>
                <th>Expérience</th>
                <th>Intervention Active</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTechs.map((tech) => (
                <tr key={tech.id}>
                  <td style={{ fontWeight: 700 }}>{tech.matricule}</td>
                  <td style={{ fontWeight: 600 }}>{tech.name}</td>
                  <td>{tech.specialty}</td>
                  <td>{tech.team}</td>
                  <td>{tech.experienceYears} ans</td>
                  <td>
                    <span className="tag-badge">{tech.activeWO || 'Disponible'}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${tech.status === 'Actif' ? 'status-done' : 'status-late'}`}>
                      {tech.status}
                    </span>
                    {tech.needsReview && (
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
                        onClick={() => setSelectedTech(tech)}
                      >
                        Détails
                      </button>
                      {onDeleteTechnician && isAdmin && (
                        <button
                          type="button"
                          className="action-btn-sm"
                          style={{ color: 'var(--red)', borderColor: 'rgba(239,71,111,0.4)' }}
                          onClick={() => onDeleteTechnician(tech.id, tech.name)}
                          title="Supprimer ce technicien"
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

      {/* Modal Détails Technicien */}
      {selectedTech && (
        <div className="modal-overlay" onClick={() => setSelectedTech(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Fiche Technicien · {selectedTech.name}</div>
              <button type="button" className="modal-close" onClick={() => setSelectedTech(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', fontSize: '13px' }}>
                <div><strong>Matricule :</strong> {selectedTech.matricule}</div>
                <div><strong>Nom Complet :</strong> {selectedTech.name}</div>
                <div><strong>Spécialité :</strong> {selectedTech.specialty}</div>
                <div><strong>Équipe :</strong> {selectedTech.team}</div>
                <div><strong>Expérience :</strong> {selectedTech.experienceYears} ans</div>
                <div><strong>Téléphone :</strong> {selectedTech.phone}</div>
                <div><strong>Email :</strong> {selectedTech.email || `${selectedTech.name.toLowerCase().replace(/\s+/g, '.')}@omp.ga`}</div>
                <div><strong>Work Order en cours :</strong> {selectedTech.activeWO || 'Aucun (Disponible)'}</div>
                <div><strong>Taux résolution 1er passage :</strong> {selectedTech.firstTimeFixRate || 92}%</div>
              </div>
            </div>
            <div className="modal-footer">
              {onDeleteTechnician && isAdmin && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ color: 'var(--red)', borderColor: 'rgba(239,71,111,0.4)' }}
                  onClick={() => {
                    onDeleteTechnician(selectedTech.id, selectedTech.name);
                    setSelectedTech(null);
                  }}
                >
                  <Trash2 size={15} /> Supprimer
                </button>
              )}
              <button type="button" className="btn-secondary" onClick={() => setSelectedTech(null)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
