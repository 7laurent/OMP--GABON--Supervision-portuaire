import React, { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  Search, 
  BarChart2, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Eye,
  Trash2
} from 'lucide-react';
import EquipmentKpiModal from '../components/modals/EquipmentKpiModal.jsx';
import PortSynopticDiagram from '../components/PortSynopticDiagram.jsx';
import CoreKpiTrio from '../components/CoreKpiTrio.jsx';
import WeeklyStatsDiagram from '../components/WeeklyStatsDiagram.jsx';
import EquipmentRankingBoard from '../components/EquipmentRankingBoard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function EquipementsPage({
  equipments = [],
  pannes = [],
  workOrders = [],
  onAddEquipment,
  onDeleteEquipment,
  onOpenAddModal
}) {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterCriticality, setFilterCriticality] = useState('all');
  
  // Machine sélectionnée pour la modal "Voir les KPI"
  const [selectedMachineForKpi, setSelectedMachineForKpi] = useState(null);
  const [selectedMachineDetails, setSelectedMachineDetails] = useState(null);

  // Statistiques
  const total = equipments.length;
  const operational = equipments.filter(e => e.status === 'Opérationnel').length;
  const inMaintenance = equipments.filter(e => e.status === 'En maintenance').length;
  const stopped = equipments.filter(e => e.status === "À l'arrêt").length;
  const availabilityRate = total > 0 ? Number(((operational / total) * 100).toFixed(1)) : 94.2;

  // Filtrage
  const filteredEquipments = equipments.filter(eq => {
    const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          eq.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          eq.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || eq.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || eq.category === filterCategory;
    const matchesCrit = filterCriticality === 'all' || eq.criticality === filterCriticality;
    return matchesSearch && matchesStatus && matchesCategory && matchesCrit;
  });

  return (
    <div className="content" id="equipements-page-content">
      {/* En-tête Page (Dossier 1) */}
      <div className="section-heading" style={{ marginBottom: '28px' }}>
        <div>
          <div className="section-label">PARC MATÉRIEL</div>
          <div className="section-title" style={{ fontSize: '28px', marginTop: '4px' }}>
            Équipements
          </div>
          <p style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '4px' }}>
            Centralisez les informations techniques, suivez l'état opérationnel et visualisez les KPI propres à chaque machine.
          </p>
        </div>
        <button 
          type="button"
          className="btn-primary"
          onClick={onOpenAddModal}
          id="btn-add-equipment"
        >
          <Plus size={16} /> + Ajouter un équipement
        </button>
      </div>

      {/* 4 Cartes de statistiques (Dossier 1) */}
      <div className="kpi-grid" style={{ marginBottom: '30px' }}>
        <div className="kpi-card border-accent">
          <div className="kpi-top">
            <span className="kpi-title">Total Équipements</span>
            <div className="kpi-icon"><Wrench size={18} /></div>
          </div>
          <div className="kpi-number">{total}</div>
          <span className="kpi-caption">Parc global supervisé</span>
        </div>

        <div className="kpi-card border-accent">
          <div className="kpi-top">
            <span className="kpi-title">Opérationnels</span>
            <div className="kpi-icon"><CheckCircle2 size={18} color="var(--green)" /></div>
          </div>
          <div className="kpi-number" style={{ color: 'var(--green)' }}>{operational}</div>
          <span className="kpi-caption">En service actif ({availabilityRate}%)</span>
        </div>

        <div className="kpi-card border-accent">
          <div className="kpi-top">
            <span className="kpi-title">En Maintenance</span>
            <div className="kpi-icon"><Clock size={18} color="var(--orange)" /></div>
          </div>
          <div className="kpi-number" style={{ color: 'var(--orange)' }}>{inMaintenance}</div>
          <span className="kpi-caption">Interventions programmées</span>
        </div>

        <div className="kpi-card border-accent">
          <div className="kpi-top">
            <span className="kpi-title">À l'Arrêt</span>
            <div className="kpi-icon"><AlertCircle size={18} color="var(--red)" /></div>
          </div>
          <div className="kpi-number" style={{ color: 'var(--red)' }}>{stopped}</div>
          <span className="kpi-caption">Défaillance ou arrêt majeur</span>
        </div>
      </div>

      {/* KPIS DE FIABILITÉ & MAINTENABILITÉ : MTTR, MTBF, DISPONIBILITÉ */}
      <CoreKpiTrio
        equipments={equipments}
        pannes={pannes}
        workOrders={workOrders}
      />

      {/* CLASSEMENT DES MACHINES : LA PLUS EN PANNE / LA PLUS EFFICACE, SUR UNE PÉRIODE CHOISIE */}
      <EquipmentRankingBoard
        equipments={equipments}
        pannes={pannes}
        workOrders={workOrders}
      />

      {/* SCHÉMA SYNOPTIQUE DE LOCALISATION DES MACHINES DU TERMINAL D'OWENDO */}
      <PortSynopticDiagram />

      {/* SCHÉMA STATISTIQUE HEBDOMADAIRE & MULTI-PÉRIODES (MOIS, SEMAINE, JOUR, HEURE) */}
      <WeeklyStatsDiagram
        pageTitle="Statistiques Multi-Périodes des Équipements"
        subtitle="Évolution réelle par mois, semaine et jour, par catégorie d'équipement"
        context="equipements"
        equipments={equipments}
        pannes={pannes}
        workOrders={workOrders}
        onSelectMachineKpi={(machineData) => {
          if (!machineData) return;

          // Si machineData est déjà un objet équipement complet présent dans la liste
          if (typeof machineData === 'object' && machineData.id && equipments.some(e => e.id === machineData.id)) {
            setSelectedMachineForKpi(machineData);
            return;
          }

          const codeStr = typeof machineData === 'string' 
            ? machineData.toLowerCase() 
            : String(machineData.code || '').toLowerCase();
          const nameStr = typeof machineData === 'string' 
            ? machineData.toLowerCase() 
            : String(machineData.name || machineData.type || '').toLowerCase();

          const match = equipments.find(e => {
            const eCode = String(e.code || '').toLowerCase();
            const eName = String(e.name || '').toLowerCase();
            return (
              (codeStr && (eCode === codeStr || eCode.includes(codeStr) || codeStr.includes(eCode))) ||
              (nameStr && (eName.includes(nameStr) || nameStr.includes(eName)))
            );
          });

          if (match) {
            setSelectedMachineForKpi(match);
          } else if (typeof machineData === 'object') {
            setSelectedMachineForKpi({
              id: machineData.id || `EQ-${Date.now()}`,
              name: machineData.name || machineData.type || 'Équipement Portuaire',
              code: machineData.code || 'EQ-01',
              category: machineData.category || machineData.type || 'Engin',
              status: machineData.status || 'Opérationnel',
              location: machineData.location || 'Zone Terminal Portuaire',
              operatingHours: machineData.operatingHours || 1850,
              downtimeHours: machineData.downtimeHours || 25,
              mtbf: machineData.mtbf || 160,
              mttr: machineData.mttr || '2.0h',
              dispo: machineData.dispo || 97.5,
              ...machineData
            });
          }
        }}
      />

      {/* Section Registre des équipements */}
      <section className="section">
        <div className="section-heading">
          <div>
            <div className="section-label">REGISTRE TECHNIQUE</div>
            <div className="section-title">Liste des Équipements & Accès aux KPI</div>
          </div>
        </div>

        {/* Filtres & Recherche */}
        <div className="filters-bar" style={{ background: 'var(--card-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div className="search-box">
            <Search className="search-icon" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher par nom, code ou localisation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              id="search-equipments-input"
            />
          </div>

          <div className="filter-selects">
            <select 
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tous les états</option>
              <option value="Opérationnel">Opérationnel</option>
              <option value="En maintenance">En maintenance</option>
              <option value="À l'arrêt">À l'arrêt</option>
            </select>

            <select 
              className="filter-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">Toutes catégories</option>
              <option value="Pelle mécanique">Pelle mécanique</option>
              <option value="Chargeuse">Chargeuse</option>
              <option value="Dumper">Dumper</option>
              <option value="Bulldozer / Bull">Bulldozer / Bull</option>
              <option value="Tracteur">Tracteur</option>
              <option value="Camion">Camion</option>
              <option value="Tractopelle">Tractopelle</option>
              <option value="Barge">Barge</option>
            </select>

            <select 
              className="filter-select"
              value={filterCriticality}
              onChange={(e) => setFilterCriticality(e.target.value)}
            >
              <option value="all">Toutes criticités</option>
              <option value="Critique">Critique</option>
              <option value="Élevée">Élevée</option>
              <option value="Moyenne">Moyenne</option>
              <option value="Faible">Faible</option>
            </select>
          </div>
        </div>

        {/* Tableau Registre */}
        <div className="table-wrapper" style={{ marginTop: '16px' }}>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Équipement</th>
                <th>Catégorie</th>
                <th>Localisation</th>
                <th>État</th>
                <th>Criticité</th>
                <th>Heures de Marche</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEquipments.map((eq) => (
                <tr key={eq.id}>
                  <td style={{ fontWeight: 700, color: 'var(--orange)' }}>{eq.code}</td>
                  <td style={{ fontWeight: 600 }}>{eq.name}</td>
                  <td>{eq.category}</td>
                  <td>{eq.location}</td>
                  <td>
                    <span className={`status-badge ${eq.status === 'Opérationnel' ? 'status-done' : eq.status === 'En maintenance' ? 'status-progress' : 'status-late'}`}>
                      {eq.status}
                    </span>
                    {eq.needsReview && (
                      <span className="status-badge status-late" style={{ marginLeft: '6px' }} title="Incohérence détectée à l'import — exclu des calculs de KPI jusqu'à confirmation">
                        À valider
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${eq.criticality === 'Critique' || eq.criticality === 'Élevée' ? 'status-late' : 'status-info'}`}>
                      {eq.criticality}
                    </span>
                  </td>
                  <td>{(eq.operatingHours || 14000).toLocaleString()} h</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      {/* BOUTON « VOIR LES KPI » DEMANDÉ PAR L'UTILISATEUR */}
                      <button 
                        type="button"
                        className="action-btn-kpi"
                        onClick={() => setSelectedMachineForKpi(eq)}
                        id={`btn-kpi-${eq.code}`}
                        title="Afficher les KPI propres à cette machine"
                      >
                        <BarChart2 size={13} /> Voir les KPI
                      </button>

                      <button
                        type="button"
                        className="action-btn-sm"
                        onClick={() => setSelectedMachineDetails(eq)}
                      >
                        <Eye size={13} /> Détails
                      </button>

                      {onDeleteEquipment && isAdmin && (
                        <button
                          type="button"
                          className="action-btn-sm"
                          style={{ color: 'var(--red)', borderColor: 'rgba(239,71,111,0.4)' }}
                          onClick={() => onDeleteEquipment(eq.id, eq.name)}
                          title="Supprimer cet équipement"
                          id={`btn-delete-eq-${eq.code}`}
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

      {/* Section Analyse & Disponibilité (Dossier 1) */}
      <section className="section">
        <div className="split-section">
          <div className="industrial-card">
            <div className="section-label">PERFORMANCE OPÉRATIONNELLE</div>
            <div className="chart-title" style={{ marginTop: '4px' }}>Taux de disponibilité du parc</div>

            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Disponibilité globale calculée Do</span>
                <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--green)' }}>{availabilityRate}%</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill progress-green" style={{ width: `${availabilityRate}%` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                <span>Seuil contractuel : 90%</span>
                <span>Objectif Eramet : 95%</span>
              </div>
            </div>
          </div>

          <div className="industrial-card">
            <div className="section-label">ALERTES CRITIQUES</div>
            <div className="chart-title" style={{ marginTop: '4px' }}>Équipements à surveiller</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              <div style={{ padding: '12px 14px', background: 'rgba(227,75,75,0.08)', borderRadius: '8px', borderLeft: '4px solid var(--red)' }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text)' }}>
                  Convoyeur CV-101 (Liaison Silo - Quai)
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                  Échauffement palier tambour de commande. Arrêt maintenance programmé en cours.
                </div>
              </div>

              <div style={{ padding: '12px 14px', background: 'rgba(245,130,32,0.08)', borderRadius: '8px', borderLeft: '4px solid var(--orange)' }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text)' }}>
                  Ship Loader SL-02 (Poste Haute Mer)
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                  Réfection circuit relevage de flèche requise avant le prochain accostage.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal « Voir les KPI » propre à la machine */}
      {selectedMachineForKpi && (
        <EquipmentKpiModal
          equipment={selectedMachineForKpi}
          pannes={pannes}
          workOrders={workOrders}
          onClose={() => setSelectedMachineForKpi(null)}
        />
      )}

      {/* Modal Détails machine rapide */}
      {selectedMachineDetails && (
        <div className="modal-overlay" onClick={() => setSelectedMachineDetails(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Fiche Technique · {selectedMachineDetails.name}</div>
              <button type="button" className="modal-close" onClick={() => setSelectedMachineDetails(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', fontSize: '13px' }}>
                <div><strong>Code :</strong> {selectedMachineDetails.code}</div>
                <div><strong>Catégorie :</strong> {selectedMachineDetails.category}</div>
                <div><strong>Localisation :</strong> {selectedMachineDetails.location}</div>
                <div><strong>État :</strong> {selectedMachineDetails.status}</div>
                <div><strong>Criticité :</strong> {selectedMachineDetails.criticality}</div>
                <div><strong>Heures de marche :</strong> {selectedMachineDetails.operatingHours} h</div>
                <div><strong>Fabricant :</strong> {selectedMachineDetails.manufacturer || 'N/A'}</div>
                <div><strong>N° Série :</strong> {selectedMachineDetails.serialNumber || 'N/A'}</div>
              </div>
              <div style={{ marginTop: '10px' }}>
                <strong>Notes :</strong>
                <p style={{ marginTop: '4px', color: 'var(--muted)', fontSize: '13px' }}>
                  {selectedMachineDetails.notes || 'Aucune note spécifique.'}
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn-primary"
                onClick={() => {
                  const m = selectedMachineDetails;
                  setSelectedMachineDetails(null);
                  setSelectedMachineForKpi(m);
                }}
              >
                <BarChart2 size={15} /> Voir les KPI de cette machine
              </button>
              <button type="button" className="btn-secondary" onClick={() => setSelectedMachineDetails(null)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
