import React from 'react';
import { 
  Wrench, 
  AlertTriangle, 
  ClipboardList, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight, 
  Maximize2, 
  Plus, 
  Upload, 
  ArrowRight, 
  Package, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import CoreKpiTrio from '../components/CoreKpiTrio.jsx';
import PortSynopticDiagram from '../components/PortSynopticDiagram.jsx';
import AfnorTemporalDiagram from '../components/AfnorTemporalDiagram.jsx';
import WeeklyStatsDiagram from '../components/WeeklyStatsDiagram.jsx';
import { calculateDo, bucketByPeriod } from '../utils/kpiCalculations.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function DashboardPage({
  equipments = [],
  pannes = [],
  workOrders = [], 
  technicians = [], 
  onNavigate, 
  onOpenDocumentModal, 
  onOpenZoomModal,
  onOpenWorkOrderDetails = () => {}
}) {
  const { isAdmin } = useAuth();

  // Lignes marquées "à valider" (incohérence détectée) : exclues des calculs de KPI
  // agrégés (MTBF/MTTR/Disponibilité/ratios) tant qu'un admin ne les a pas confirmées,
  // mais restent visibles telles quelles dans les listes/registres.
  const equipmentsForCalc = equipments.filter((e) => !e.needsReview);
  const workOrdersForCalc = workOrders.filter((w) => !w.needsReview);

  // Calculs dynamiques de base
  const totalEquipments = equipments.length;
  const operationalEquipments = equipments.filter(e => e.status === 'Opérationnel').length;
  const maintenanceEquipments = equipments.filter(e => e.status === 'En maintenance').length;
  const stoppedEquipments = equipments.filter(e => e.status === "À l'arrêt").length;

  const totalPannes = pannes.length;
  const activePannes = pannes.filter(p => p.status === 'En cours').length;
  const totalWO = workOrders.length;
  const completedWO = workOrders.filter(w => w.status === 'Terminé').length;
  const completionRate = totalWO > 0 ? Math.round((completedWO / totalWO) * 100) : 84;
  const totalTechs = technicians.length;
  const pctOperational = totalEquipments > 0 ? Number(((operationalEquipments / totalEquipments) * 100).toFixed(1)) : 0;
  const pctMaintenance = totalEquipments > 0 ? Number(((maintenanceEquipments / totalEquipments) * 100).toFixed(1)) : 0;
  const pctStopped = totalEquipments > 0 ? Number(((stoppedEquipments / totalEquipments) * 100).toFixed(1)) : 0;
  const criticalEquipmentsCount = equipments.filter((e) => e.criticality === 'Critique' || e.criticality === 'Élevée').length;

  // Calculs MTBF / MTTR / Disponibilité réels
  const totalOperatingHours = equipmentsForCalc.reduce((s, e) => s + (e.operatingHours || 0), 0);
  const totalDowntimeHours = equipmentsForCalc.reduce((s, e) => s + (e.downtimeHours || 0), 0);
  const computedDispo = calculateDo(totalOperatingHours, totalDowntimeHours);

  // Données graphiques Préventif vs Correctif — 6 derniers mois réels
  const performanceMonths = bucketByPeriod(workOrdersForCalc, (w) => w._createdAt || w._plannedStart, 'month')
    .slice(-6)
    .map((b) => ({
      month: b.label,
      prev: b.items.filter((w) => w._maintenanceType === 'Preventive Maintenance').length,
      corr: b.items.filter((w) => w._maintenanceType !== 'Preventive Maintenance').length
    }));
  const maxMonthCount = Math.max(1, ...performanceMonths.map((m) => m.prev + m.corr));

  return (
    <div className="content" id="dashboard-page-content">
      {/* 1. HERO SECTION (Dossier 1) */}
      <section className="hero" id="hero-banner">
        <div className="hero-content">
          <div className="hero-small-title">OMP · MAINTENANCE MANAGEMENT</div>
          <h1>Piloter la maintenance. Anticiper les défaillances.</h1>
          <p>
            Plateforme centralisée de supervision portuaire pour le terminal d'Owendo. Suivi en temps réel des équipements,
            des indicateurs de fiabilité AFNOR, des pannes critiques et des plannings d'intervention.
          </p>
          <div className="hero-actions">
            {/* Restriction admin retirée temporairement pour tests d'import — remettre disabled={!isAdmin} pour la réactiver */}
            <button
              type="button"
              className="btn-primary"
              onClick={onOpenDocumentModal}
              id="btn-hero-add-doc"
            >
              <Plus size={16} /> Importer un fichier Excel
            </button>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => onNavigate('bilan_global')}
              id="btn-hero-bilan"
            >
              Voir le Bilan Global KPIs ↓
            </button>
          </div>
        </div>
        <div className="hero-number">OMP 01</div>
      </section>

      {/* 2. LE TRIO DE KPIS PRIORITAIRES : MTTR, MTBF, DISPONIBILITÉ */}
      <CoreKpiTrio
        equipments={equipments}
        pannes={pannes}
        workOrders={workOrders}
        onNavigate={onNavigate}
      />

      {/* 3. SCHÉMA SYNOPTIQUE INDUSTRIEL DU PORT D'OWENDO */}
      <PortSynopticDiagram 
        onNavigate={onNavigate}
      />

      {/* 4. SCHÉMAS NORMATIFS AFNOR NF EN 13306 & WORKFLOW D'INTERVENTION GMAO */}
      <AfnorTemporalDiagram 
        onNavigate={onNavigate}
      />

      {/* 5. SCHÉMAS STATISTIQUES HEBDOMADAIRES & MULTI-PÉRIODES (MOIS, SEMAINE, JOUR, HEURE) */}
      <WeeklyStatsDiagram
        pageTitle="Statistiques Multi-Périodes & Comparatif par Catégorie"
        subtitle="Analyses réelles par mois, semaine et jour"
        context="dashboard"
        equipments={equipments}
        pannes={pannes}
        workOrders={workOrders}
      />

      {/* 2. SECTION AT A GLANCE (Dossier 1) */}
      <section className="section" id="section-at-a-glance">
        <div className="section-heading">
          <div>
            <div className="section-label">VUE D'ENSEMBLE</div>
            <div className="section-title">At a glance</div>
          </div>
        </div>

        <div className="kpi-grid">
          {/* Carte Équipements */}
          <div className="kpi-card border-accent" onClick={() => onNavigate('equipements')} style={{ cursor: 'pointer' }}>
            <div className="kpi-top">
              <span className="kpi-title">Équipements</span>
              <div className="kpi-icon">
                <Wrench size={18} />
              </div>
            </div>
            <div className="kpi-number">{totalEquipments}</div>
            <div className="kpi-bottom">
              <span className="positive">
                <ArrowUpRight size={14} /> +8.4%
              </span>
              <span className="kpi-caption">vs mois précédent</span>
            </div>
          </div>

          {/* Carte Pannes */}
          <div className="kpi-card border-accent" onClick={() => onNavigate('pannes')} style={{ cursor: 'pointer' }}>
            <div className="kpi-top">
              <span className="kpi-title">Pannes Actives</span>
              <div className="kpi-icon">
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="kpi-number" style={{ color: activePannes > 0 ? 'var(--red)' : 'var(--text)' }}>
              {activePannes}
            </div>
            <div className="kpi-bottom">
              <span className="positive">
                <ArrowDownRight size={14} /> -5.2%
              </span>
              <span className="kpi-caption">défaillances critiques</span>
            </div>
          </div>

          {/* Carte Work Orders */}
          <div className="kpi-card border-accent" onClick={() => onNavigate('work_orders')} style={{ cursor: 'pointer' }}>
            <div className="kpi-top">
              <span className="kpi-title">Work Orders</span>
              <div className="kpi-icon">
                <ClipboardList size={18} />
              </div>
            </div>
            <div className="kpi-number">{totalWO}</div>
            <div className="kpi-bottom">
              <span className="positive">
                <ArrowUpRight size={14} /> +12.7%
              </span>
              <span className="kpi-caption">{completionRate}% complétés</span>
            </div>
          </div>

          {/* Carte Techniciens */}
          <div className="kpi-card border-accent" onClick={() => onNavigate('techniciens')} style={{ cursor: 'pointer' }}>
            <div className="kpi-top">
              <span className="kpi-title">Techniciens</span>
              <div className="kpi-icon">
                <Users size={18} />
              </div>
            </div>
            <div className="kpi-number">{totalTechs}</div>
            <div className="kpi-bottom">
              <span className="positive">
                <ArrowUpRight size={14} /> 100%
              </span>
              <span className="kpi-caption">Équipes A, B & C actives</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION PERFORMANCE (Dossier 1 Bar Chart) */}
      <section className="section" id="section-performance">
        <div className="section-heading">
          <div>
            <div className="section-label">ACTIVITÉ MAINTENANCE</div>
            <div className="section-title">Performance des interventions</div>
          </div>
          <button 
            type="button" 
            className="action-btn-sm" 
            onClick={onOpenZoomModal}
            id="btn-zoom-performance"
          >
            <Maximize2 size={14} /> Agrandir le graphique
          </button>
        </div>

        <div className="performance-card">
          <div className="chart-header">
            <div className="chart-title">Interventions : Préventif vs Correctif (6 derniers mois)</div>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-dot preventive" />
                <span>Préventif (Orange)</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot corrective" />
                <span>Correctif (Bleu)</span>
              </div>
            </div>
          </div>

          {/* Barres d'activité responsive */}
          <div style={{ padding: '10px 0' }}>
            {performanceMonths.length === 0 ? (
              <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                Aucun Work Order enregistré pour le moment.
              </div>
            ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', height: '180px', gap: '24px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
              {performanceMonths.map((item, idx) => (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', width: '100%', justifyContent: 'center' }}>
                    <div
                      style={{
                        width: '20px',
                        height: `${Math.max(2, (item.prev / maxMonthCount) * 160)}px`,
                        backgroundColor: 'var(--orange)',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s'
                      }}
                      title={`Préventif : ${item.prev}`}
                    />
                    <div
                      style={{
                        width: '20px',
                        height: `${Math.max(2, (item.corr / maxMonthCount) * 160)}px`,
                        backgroundColor: '#292776',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s'
                      }}
                      title={`Correctif : ${item.corr}`}
                    />
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px', fontWeight: 600 }}>
                    {item.month}
                  </span>
                </div>
              ))}
            </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. SECTION STATUS & CENTRALISATION (Dossier 1 Split Section) */}
      <section className="section" id="section-status-centralisation">
        <div className="split-section">
          {/* État des équipements Donut */}
          <div className="industrial-card">
            <div className="section-label">PARC MATÉRIEL</div>
            <div className="chart-title" style={{ marginTop: '4px' }}>État des équipements</div>

            <div className="status-content">
              {/* Donut Chart SVG */}
              <div className="donut-container">
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  {/* Background ring */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="var(--hover-bg)"
                    strokeWidth="3.8"
                  />
                  {/* Opérationnels (Vert) — pourcentage réel */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="var(--green)"
                    strokeWidth="3.8"
                    strokeDasharray={`${pctOperational}, 100`}
                  />
                  {/* Maintenance (Orange) — pourcentage réel */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="var(--orange)"
                    strokeWidth="3.8"
                    strokeDasharray={`${pctMaintenance}, 100`}
                    strokeDashoffset={`${-pctOperational}`}
                  />
                  {/* À l'arrêt (Rouge) — pourcentage réel */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="var(--red)"
                    strokeWidth="3.8"
                    strokeDasharray={`${pctStopped}, 100`}
                    strokeDashoffset={`${-(pctOperational + pctMaintenance)}`}
                  />
                </svg>

                <div className="donut-center">
                  <div className="donut-number">{totalEquipments}</div>
                  <div className="donut-label">Total Parc</div>
                </div>
              </div>

              {/* Status breakdown list */}
              <div className="status-list">
                <div className="status-row">
                  <div className="status-name">
                    <span className="legend-dot" style={{ background: 'var(--green)' }} />
                    <span>Opérationnels</span>
                  </div>
                  <div className="status-count">{operationalEquipments}</div>
                </div>
                <div className="status-row">
                  <div className="status-name">
                    <span className="legend-dot" style={{ background: 'var(--orange)' }} />
                    <span>En maintenance</span>
                  </div>
                  <div className="status-count">{maintenanceEquipments}</div>
                </div>
                <div className="status-row">
                  <div className="status-name">
                    <span className="legend-dot" style={{ background: 'var(--red)' }} />
                    <span>À l'arrêt</span>
                  </div>
                  <div className="status-count">{stoppedEquipments}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Centralisation Banner Card */}
          <div className="document-card">
            <div>
              <div className="section-label" style={{ color: 'var(--orange)' }}>CENTRALISATION</div>
              <div className="document-title">Importez vos données depuis un fichier Excel</div>
              <p className="document-desc">
                Chargez un classeur .xlsx contenant des feuilles Equipements, Pannes, WorkOrders, Techniciens et/ou Pieces :
                chaque ligne est automatiquement répartie dans la bonne catégorie et créée dans la base Supabase.
              </p>
            </div>
            <div>
              {/* Restriction admin retirée temporairement pour tests d'import — remettre disabled={!isAdmin} pour la réactiver */}
              <button
                type="button"
                className="btn-primary"
                onClick={onOpenDocumentModal}
                id="btn-centralisation-add-doc"
              >
                <Upload size={16} /> + Importer un fichier Excel
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION BY THE NUMBERS (Dossier 1 Dark Navy Banner) */}
      <section className="numbers-section" id="section-by-the-numbers">
        <div className="numbers-title">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--orange)', fontWeight: 700 }}>
            BY THE NUMBERS
          </div>
          <h3>Indicateurs Clés OMP Maintenance</h3>
          <p>Mise à jour en continu depuis Supabase.</p>
        </div>

        <div className="number-item">
          <div className="big-stat">{completionRate}%</div>
          <div className="stat-desc">Work Orders terminés</div>
        </div>

        <div className="number-item">
          <div className="big-stat">{computedDispo}%</div>
          <div className="stat-desc">Disponibilité équipements</div>
        </div>

        <div className="number-item">
          <div className="big-stat" style={{ color: '#ffffff' }}>{criticalEquipmentsCount}</div>
          <div className="stat-desc">Équipements critiques sous alerte</div>
        </div>

        <div className="number-item">
          <div className="big-stat">24/7</div>
          <div className="stat-desc">Suivi des opérations</div>
        </div>
      </section>

      {/* 6. SECTION WORK ORDERS RÉCENTS (Dossier 1 Table) */}
      <section className="section" id="section-recent-wo">
        <div className="section-heading">
          <div>
            <div className="section-label">INTERVENTIONS RÉCENTES</div>
            <div className="section-title">Derniers Work Orders</div>
          </div>
          <button 
            type="button" 
            className="action-btn-sm" 
            onClick={() => onNavigate('work_orders')}
            id="btn-see-all-wo"
          >
            Voir tous les Work Orders <ArrowRight size={14} />
          </button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Équipement</th>
                <th>Technicien</th>
                <th>Type</th>
                <th>Priorité</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.slice(0, 5).map((wo) => (
                <tr key={wo.id}>
                  <td style={{ fontWeight: 700 }}>{wo.id}</td>
                  <td>{wo.equipment}</td>
                  <td>{wo.technician}</td>
                  <td>
                    <span className="tag-badge">{wo.type}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${wo.priority === 'Critique' ? 'status-late' : wo.priority === 'Élevée' ? 'status-progress' : 'status-info'}`}>
                      {wo.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${wo.status === 'Terminé' ? 'status-done' : wo.status === 'En retard' ? 'status-late' : 'status-progress'}`}>
                      {wo.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      type="button" 
                      className="action-btn-sm"
                      onClick={() => onOpenWorkOrderDetails && onOpenWorkOrderDetails(wo)}
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 7. SECTION ACCÈS RAPIDE (Dossier 1 Quick Access) */}
      <section className="section" id="section-quick-access">
        <div className="section-heading">
          <div>
            <div className="section-label">NAVIGATION DIRECTE</div>
            <div className="section-title">Accès Rapide aux Modules</div>
          </div>
        </div>

        <div className="quick-grid">
          <div className="quick-card" onClick={() => onNavigate('equipements')} id="quick-equipements">
            <div>
              <div className="quick-title">Équipements</div>
              <div className="quick-desc">Registre technique, disponibilité et KPIs par machine</div>
            </div>
            <ArrowRight size={18} color="var(--orange)" />
          </div>

          <div className="quick-card" onClick={() => onNavigate('pannes')} id="quick-pannes">
            <div>
              <div className="quick-title">Pannes & Défaillances</div>
              <div className="quick-desc">Déclarer un incident, suivi MTBF et MTTR</div>
            </div>
            <ArrowRight size={18} color="var(--orange)" />
          </div>

          <div className="quick-card" onClick={() => onNavigate('pieces')} id="quick-pieces">
            <div>
              <div className="quick-title">Pièces & Magasin</div>
              <div className="quick-desc">Suivi des stocks, réapprovisionnement et roulements</div>
            </div>
            <ArrowRight size={18} color="var(--orange)" />
          </div>

          <div className="quick-card" onClick={() => onNavigate('techniciens')} id="quick-techniciens">
            <div>
              <div className="quick-title">Techniciens</div>
              <div className="quick-desc">Affectations d'équipes, charge et disponibilité</div>
            </div>
            <ArrowRight size={18} color="var(--orange)" />
          </div>
        </div>
      </section>
    </div>
  );
}
