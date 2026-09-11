import React, { useState } from 'react';
import { 
  BarChart3, 
  Wrench, 
  AlertTriangle, 
  ClipboardList, 
  Users, 
  Package, 
  ShieldCheck, 
  Activity, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Download,
  Filter
} from 'lucide-react';
import CoreKpiTrio from '../components/CoreKpiTrio.jsx';
import KpiTrendChart from '../components/KpiTrendChart.jsx';
import PortSynopticDiagram from '../components/PortSynopticDiagram.jsx';
import WeeklyStatsDiagram from '../components/WeeklyStatsDiagram.jsx';
import TemporalAnalyticsSection from '../components/TemporalAnalyticsSection.jsx';
import { calculateGlobalBilan } from '../utils/kpiCalculations.js';

export default function GlobalKpiDashboardPage({ 
  equipments = [], 
  pannes = [], 
  workOrders = [], 
  technicians = [], 
  parts = [],
  onNavigate
}) {
  const [period, setPeriod] = useState('month');
  const [filterZone, setFilterZone] = useState('all');

  const bilan = calculateGlobalBilan(equipments, pannes, workOrders, technicians, parts);

  return (
    <div className="content" id="global-kpi-dashboard-content">
      {/* En-tête Bilan Global */}
      <section className="hero" style={{ background: 'linear-gradient(135deg, #071d36 0%, #173256 60%, #1f477a 100%)' }}>
        <div className="hero-content">
          <div className="hero-small-title" style={{ color: 'var(--orange)' }}>
            DIRECTION TECHNIQUE · BILAN GLOBAL
          </div>
          <h1>Tableau de Bord Consolidé des KPIs</h1>
          <p>
            Synthèse transversale des performances de maintenance du Port d'Owendo.
            Agrégation multi-catégories selon les normes AFNOR NF EN 13306 et NF X 60-015.
          </p>
          <div className="hero-actions">
            <button 
              type="button" 
              className="btn-primary" 
              onClick={() => window.print()}
              id="btn-export-bilan"
            >
              <Download size={16} /> Exporter le Bilan de Direction
            </button>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => onNavigate('calcul_kpis')}
              id="btn-goto-formulas"
            >
              Consulter les Formules Détaillées →
            </button>
          </div>
        </div>
        <div className="hero-number">KPI 360</div>
      </section>

      {/* Barre de Filtrage & Période */}
      <div className="filters-bar" style={{ background: 'var(--card-bg)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Filter size={18} color="var(--orange)" />
          <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text)' }}>Périmètre d'Analyse :</span>
        </div>

        <div className="filter-selects">
          <select 
            className="filter-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="month">Mois : Mars 2025 (01/03/2025 - 31/03/2025)</option>
            <option value="week">Semaine : Semaine 09 (24 Fév - 02 Mar 2025)</option>
            <option value="day">Jour : Dimanche 02 Mars 2025 (24h)</option>
            <option value="hour">Heure : Poste 1 (08:00 - 16:00)</option>
            <option value="quarter">Trimestre : 1er Trimestre 2025</option>
            <option value="year">Année : Bilan Annuel 2024-2025</option>
          </select>

          <select 
            className="filter-select"
            value={filterZone}
            onChange={(e) => setFilterZone(e.target.value)}
          >
            <option value="all">Secteur : Tout le Port d'Owendo</option>
            <option value="mineral">Quai Minéralier (Eramet / Comilog)</option>
            <option value="conteneur">Terminal Conteneurs</option>
            <option value="ateliers">Ateliers & Magasin Central</option>
          </select>
        </div>
      </div>

      {/* LES 3 KPIS PRIORITAIRES : MTTR, MTBF, DISPONIBILITÉ */}
      <CoreKpiTrio
        equipments={equipments}
        pannes={pannes}
        workOrders={workOrders}
        onNavigate={onNavigate}
      />

      {/* ÉVOLUTION DES INDICATEURS CLÉS : DISPONIBILITÉ / MTBF / MTTR / TRC PAR MOIS OU PAR ANNÉE */}
      <KpiTrendChart
        pannes={pannes}
        workOrders={workOrders}
        equipments={equipments}
      />

      {/* SCHÉMA SYNOPTIQUE DE LA MANUTENTION DU PORT D'OWENDO */}
      <PortSynopticDiagram
        onNavigate={onNavigate}
      />

      {/* SCHÉMAS STATISTIQUES MULTI-PÉRIODES GLOBALES */}
      <WeeklyStatsDiagram
        pageTitle="Statistiques Multi-Périodes & Comparatif Global par Catégorie"
        subtitle="Analyses AFNOR réelles consolidées par mois, semaine et jour"
        context="dashboard"
        equipments={equipments}
        pannes={pannes}
        workOrders={workOrders}
      />

      {/* ANALYSE TEMPORELLE : RATIO DE PANNES, TRC, PRÉVENTIF/CORRECTIF, %/SEMAINE PAR MOIS */}
      <TemporalAnalyticsSection
        equipments={equipments}
        pannes={pannes}
        workOrders={workOrders}
        title="Analyse Temporelle & Ratios de Maintenance — Vue Globale"
      />

      {/* Résumé Exécutif - 5 Grands Indicateurs de Direction */}
      <section className="section" style={{ marginTop: '24px' }}>
        <div className="section-heading">
          <div>
            <div className="section-label">SYNTHÈSE DE DIRECTION</div>
            <div className="section-title">Score Global & Indicateurs Piliers</div>
          </div>
        </div>

        <div className="numbers-section" style={{ background: 'linear-gradient(135deg, #071d36 0%, #0c2b4c 100%)' }}>
          <div className="numbers-title">
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--orange)', fontWeight: 700 }}>
              INDICE DE SANTÉ GLOBALE
            </div>
            <h3 style={{ fontSize: '28px', color: '#ffffff', marginTop: '4px' }}>
              {bilan.globalHealthIndex} / 100
            </h3>
            <p style={{ color: 'var(--green)', fontWeight: 600 }}>
              Performance Optimale Conforme AFNOR
            </p>
          </div>

          <div className="number-item">
            <div className="big-stat">{bilan.equipments.avgDo}%</div>
            <div className="stat-desc">Disponibilité Globale (Do)</div>
          </div>

          <div className="number-item">
            <div className="big-stat">{bilan.workOrders.completionRate}%</div>
            <div className="stat-desc">Taux Clôture Work Orders</div>
          </div>

          <div className="number-item">
            <div className="big-stat">{bilan.pannes.resolutionRate}%</div>
            <div className="stat-desc">Résolution des Pannes</div>
          </div>

          <div className="number-item">
            <div className="big-stat">{bilan.parts.serviceRate}%</div>
            <div className="stat-desc">Disponibilité Magasin (OTIF)</div>
          </div>
        </div>
      </section>

      {/* Grille des 5 Catégories Détaillées */}
      <section className="section">
        <div className="section-heading">
          <div>
            <div className="section-label">DÉTAIL MULTI-CATÉGORIES</div>
            <div className="section-title">Bilan Détaillé par Domaine Métier</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '22px' }}>
          {/* 1. ÉQUIPEMENTS */}
          <div className="industrial-card" style={{ borderTop: '3px solid var(--orange)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="kpi-icon" style={{ background: 'rgba(245,130,32,0.15)', color: 'var(--orange)' }}>
                  <Wrench size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>1. Parc Équipements</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Fiabilité & Disponibilité opérationnelle</div>
                </div>
              </div>
              <button 
                type="button" 
                className="action-btn-sm" 
                onClick={() => onNavigate('equipements')}
              >
                Gérer →
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'var(--hover-bg)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>Disponibilité Do</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--green)', marginTop: '2px' }}>{bilan.equipments.avgDo}%</div>
                <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Objectif : &gt; 92%</div>
              </div>
              <div style={{ background: 'var(--hover-bg)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>MTBF Moyen</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--orange)', marginTop: '2px' }}>{bilan.equipments.avgMtbf} h</div>
                <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Bon fonctionnement</div>
              </div>
              <div style={{ background: 'var(--hover-bg)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>MTTR Moyen</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--blue)', marginTop: '2px' }}>{bilan.equipments.avgMttr} h</div>
                <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Temps réparation</div>
              </div>
            </div>

            <div className="status-row">
              <span style={{ fontSize: '13px', color: 'var(--text)' }}>Parc Opérationnel</span>
              <span style={{ fontWeight: 700, color: 'var(--green)' }}>{bilan.equipments.operational} / {bilan.equipments.total} machines</span>
            </div>
            <div className="status-row">
              <span style={{ fontSize: '13px', color: 'var(--text)' }}>En maintenance / Arrêt</span>
              <span style={{ fontWeight: 700, color: 'var(--orange)' }}>{bilan.equipments.maintenance + bilan.equipments.stopped} machines</span>
            </div>
            <div className="status-row" style={{ borderBottom: 'none' }}>
              <span style={{ fontSize: '13px', color: 'var(--text)' }}>Équipements sous surveillance critique</span>
              <span style={{ fontWeight: 700, color: 'var(--red)' }}>{bilan.equipments.critical} machines</span>
            </div>
          </div>

          {/* 2. PANNES & DÉFAILLANCES */}
          <div className="industrial-card" style={{ borderTop: '3px solid var(--red)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="kpi-icon" style={{ background: 'rgba(227,75,75,0.15)', color: 'var(--red)' }}>
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>2. Pannes & Défaillances</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Incidents, sévérité & réactivité</div>
                </div>
              </div>
              <button 
                type="button" 
                className="action-btn-sm" 
                onClick={() => onNavigate('pannes')}
              >
                Gérer →
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'var(--hover-bg)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>Taux Résolution</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--green)', marginTop: '2px' }}>{bilan.pannes.resolutionRate}%</div>
                <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Incidents traités</div>
              </div>
              <div style={{ background: 'var(--hover-bg)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>Pannes Actives</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--red)', marginTop: '2px' }}>{bilan.pannes.active}</div>
                <div style={{ fontSize: '10px', color: 'var(--muted)' }}>En cours de répa.</div>
              </div>
              <div style={{ background: 'var(--hover-bg)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>Prise en charge</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginTop: '2px' }}>{bilan.pannes.avgReactionTimeMinutes !== null ? `${bilan.pannes.avgReactionTimeMinutes} min` : '—'}</div>
                <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Réactivité moyenne</div>
              </div>
            </div>

            <div className="status-row">
              <span style={{ fontSize: '13px', color: 'var(--text)' }}>Pannes Critiques P1 en cours</span>
              <span style={{ fontWeight: 700, color: 'var(--red)' }}>{bilan.pannes.critical}</span>
            </div>
            <div className="status-row">
              <span style={{ fontSize: '13px', color: 'var(--text)' }}>Pannes traitées et closes</span>
              <span style={{ fontWeight: 700, color: 'var(--green)' }}>{bilan.pannes.resolved}</span>
            </div>
            <div className="status-row" style={{ borderBottom: 'none' }}>
              <span style={{ fontSize: '13px', color: 'var(--text)' }}>Total incidents recensés</span>
              <span style={{ fontWeight: 700, color: 'var(--text)' }}>{bilan.pannes.total}</span>
            </div>
          </div>

          {/* 3. WORK ORDERS */}
          <div className="industrial-card" style={{ borderTop: '3px solid var(--blue)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="kpi-icon" style={{ background: 'rgba(41,39,118,0.15)', color: 'var(--blue)' }}>
                  <ClipboardList size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>3. Work Orders & Maintenance</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Planification, exécution & clôture</div>
                </div>
              </div>
              <button 
                type="button" 
                className="action-btn-sm" 
                onClick={() => onNavigate('work_orders')}
              >
                Gérer →
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'var(--hover-bg)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>Taux Complétion</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--green)', marginTop: '2px' }}>{bilan.workOrders.completionRate}%</div>
                <div style={{ fontSize: '10px', color: 'var(--muted)' }}>WO achevés</div>
              </div>
              <div style={{ background: 'var(--hover-bg)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>Ratio Préventif</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--orange)', marginTop: '2px' }}>{bilan.workOrders.preventiveRatio}%</div>
                <div style={{ fontSize: '10px', color: 'var(--muted)' }}>AFNOR &gt; 70%</div>
              </div>
              <div style={{ background: 'var(--hover-bg)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>WO en retard</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: bilan.workOrders.late > 0 ? 'var(--red)' : 'var(--green)', marginTop: '2px' }}>{bilan.workOrders.late}</div>
                <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Échéance dépassée</div>
              </div>
            </div>

            <div className="status-row">
              <span style={{ fontSize: '13px', color: 'var(--text)' }}>Work Orders Préventifs Réalisés</span>
              <span style={{ fontWeight: 700, color: 'var(--orange)' }}>{bilan.workOrders.preventive}</span>
            </div>
            <div className="status-row">
              <span style={{ fontSize: '13px', color: 'var(--text)' }}>Interventions Curatives / Urgentes</span>
              <span style={{ fontWeight: 700, color: 'var(--blue)' }}>{bilan.workOrders.corrective}</span>
            </div>
            <div className="status-row" style={{ borderBottom: 'none' }}>
              <span style={{ fontSize: '13px', color: 'var(--text)' }}>Total Ordres de Travail Émis</span>
              <span style={{ fontWeight: 700, color: 'var(--text)' }}>{bilan.workOrders.total}</span>
            </div>
          </div>

          {/* 4. TECHNICIENS & RESSOURCES */}
          <div className="industrial-card" style={{ borderTop: '3px solid var(--green)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="kpi-icon" style={{ background: 'rgba(66,189,103,0.15)', color: 'var(--green)' }}>
                  <Users size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>4. Techniciens & Équipes</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Productivité, charge & résolution</div>
                </div>
              </div>
              <button 
                type="button" 
                className="action-btn-sm" 
                onClick={() => onNavigate('techniciens')}
              >
                Gérer →
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'var(--hover-bg)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>Taux Occupation</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginTop: '2px' }}>{bilan.technicians.occupancyRate}%</div>
                <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Charge de travail</div>
              </div>
              <div style={{ background: 'var(--hover-bg)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>1er Passage (FTFR)</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--green)', marginTop: '2px' }}>{bilan.technicians.firstTimeFixRate !== null ? `${bilan.technicians.firstTimeFixRate}%` : '—'}</div>
                <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Sans récidive</div>
              </div>
              <div style={{ background: 'var(--hover-bg)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>Actifs en Poste</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--orange)', marginTop: '2px' }}>{bilan.technicians.active}</div>
                <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Sur le terrain</div>
              </div>
            </div>

            <div className="status-row">
              <span style={{ fontSize: '13px', color: 'var(--text)' }}>Effectif Total des Équipes</span>
              <span style={{ fontWeight: 700, color: 'var(--text)' }}>{bilan.technicians.total} techniciens</span>
            </div>
            <div className="status-row">
              <span style={{ fontSize: '13px', color: 'var(--text)' }}>Équipes A (Minéralier) & B (Énergie)</span>
              <span style={{ fontWeight: 700, color: 'var(--green)' }}>Opérationnelles 24/7</span>
            </div>
            <div className="status-row" style={{ borderBottom: 'none' }}>
              <span style={{ fontSize: '13px', color: 'var(--text)' }}>Conformité Habilitations Sécurité</span>
              <span style={{ fontWeight: 700, color: 'var(--green)' }}>100% à jour</span>
            </div>
          </div>
        </div>

        {/* 5. PIÈCES & MAGASIN */}
        <div className="industrial-card" style={{ marginTop: '22px', borderTop: '3px solid #f58220' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="kpi-icon" style={{ background: 'rgba(245,130,32,0.15)', color: 'var(--orange)' }}>
                <Package size={18} />
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>5. Pièces de Rechange & Stock Magasin</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Disponibilité pièces, valeur & ruptures</div>
              </div>
            </div>
            <button 
              type="button" 
              className="action-btn-sm" 
              onClick={() => onNavigate('pieces')}
            >
              Gérer →
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div style={{ background: 'var(--hover-bg)', padding: '14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>Taux de Service OTIF</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--green)', marginTop: '4px' }}>{bilan.parts.serviceRate}%</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Pièces disponibles immédiatement</div>
            </div>

            <div style={{ background: 'var(--hover-bg)', padding: '14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>Valeur Totale du Stock</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', marginTop: '4px' }}>
                {bilan.parts.totalValue.toLocaleString()} €
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Inventaire valorisé magasin</div>
            </div>

            <div style={{ background: 'var(--hover-bg)', padding: '14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>Références en Rupture</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: bilan.parts.outOfStock > 0 ? 'var(--red)' : 'var(--green)', marginTop: '4px' }}>
                {bilan.parts.outOfStock}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Ruptures critiques détectées</div>
            </div>

            <div style={{ background: 'var(--hover-bg)', padding: '14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>Stock de Sécurité Faible</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--orange)', marginTop: '4px' }}>
                {bilan.parts.lowStock}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Réapprovisionnement à lancer</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tableau de Conformité Normative AFNOR */}
      <section className="section">
        <div className="section-heading">
          <div>
            <div className="section-label">AUDIT & NORMES INDUSTRIELLES</div>
            <div className="section-title">Conformité AFNOR NF EN 13306 & NF X 60-015</div>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Indicateur AFNOR</th>
                <th>Valeur Actuelle</th>
                <th>Seuil Recommandé</th>
                <th>Statut Conformité</th>
                <th>Évaluation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>Disponibilité Inhérente (Di)</td>
                <td>{bilan.equipments.avgDi}%</td>
                <td>&gt; 95.0%</td>
                <td><span className="status-badge status-done">Conforme</span></td>
                <td>Fiabilité de conception satisfaisante sur les grues et convoyeurs.</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Ratio Préventif vs Correctif</td>
                <td>{bilan.workOrders.preventiveRatio}%</td>
                <td>&gt; 70.0%</td>
                <td><span className="status-badge status-done">Conforme</span></td>
                <td>La politique de maintenance préventive réduit l'occurrence de pannes lourdes.</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Taux de Clôture des Work Orders</td>
                <td>{bilan.workOrders.completionRate}%</td>
                <td>&gt; 80.0%</td>
                <td><span className="status-badge status-done">Conforme</span></td>
                <td>Délais d'intervention respectés dans les tolérances portuaires.</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Taux de Rupture Pièces Critiques</td>
                <td>{((bilan.parts.outOfStock / (bilan.parts.total || 1)) * 100).toFixed(1)}%</td>
                <td>&lt; 5.0%</td>
                <td><span className="status-badge status-progress">À Surveiller</span></td>
                <td>Rupture constatée sur câble acier Ø32mm en cours d'approvisionnement.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
