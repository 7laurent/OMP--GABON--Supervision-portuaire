import React, { useState } from 'react';
import { Calendar, Plus, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import WeeklyStatsDiagram from '../components/WeeklyStatsDiagram.jsx';

export default function PreventivePlanPage({ equipments = [] }) {
  const [plans, setPlans] = useState([
    {
      id: 'PLAN-001',
      title: 'Contrôle Mensuel Hydraulique & Flexibles 350 bar',
      equipment: 'Pelle mécanique CAT 349D (PM-01)',
      periodicity: 'Mensuel (30 jours)',
      nextDate: '2025-03-25',
      durationHours: 6,
      assignedTeam: 'Équipe A - Quai Minéralier',
      status: 'À venir'
    },
    {
      id: 'PLAN-002',
      title: 'Vidange Moteur, Filtres & Analyse d\'Huile D13J',
      equipment: 'Chargeuse Volvo L250H (CH-02)',
      periodicity: 'Trimestriel (500 heures)',
      nextDate: '2025-03-12',
      durationHours: 4,
      assignedTeam: 'Équipe B - Énergie & Roulage',
      status: 'Urgent'
    },
    {
      id: 'PLAN-003',
      title: 'Remplacement Disques de Freins Immergés & Contrôle Bennage',
      equipment: 'Dumper Rigide Komatsu HD785-7 (DP-02)',
      periodicity: 'Bimensuel (15 jours)',
      nextDate: '2025-03-08',
      durationHours: 7.5,
      assignedTeam: 'Équipe C - Fosse Minéralière',
      status: 'En cours'
    },
    {
      id: 'PLAN-004',
      title: 'Contrôle Train de Roulement, Galets & Chenilles Suspendues',
      equipment: 'Bulldozer / Bull CAT D8T (BL-01)',
      periodicity: 'Semestriel (180 jours)',
      nextDate: '2025-04-12',
      durationHours: 8,
      assignedTeam: 'Équipe A - Quai Minéralier',
      status: 'Planifié'
    },
    {
      id: 'PLAN-005',
      title: 'Révision Sellette Hydraulique & Circuit Pneumatique Freins',
      equipment: 'Tracteur de Quai Terberg YT220 (TR-01)',
      periodicity: 'Mensuel (30 jours)',
      nextDate: '2025-03-28',
      durationHours: 3.5,
      assignedTeam: 'Équipe B - Énergie & Roulage',
      status: 'Planifié'
    },
    {
      id: 'PLAN-006',
      title: 'Contrôle Ralentisseur Optibrake+ & Géométrie Essieux 8x4',
      equipment: 'Camion Benne Mercedes Actros 4144 (CM-01)',
      periodicity: 'Trimestriel (90 jours)',
      nextDate: '2025-04-02',
      durationHours: 5,
      assignedTeam: 'Équipe B - Énergie & Roulage',
      status: 'Planifié'
    },
    {
      id: 'PLAN-007',
      title: 'Étalonnage Clapets Anti-Retour Godet 4en1 & Bras Télescopique',
      equipment: 'Tractopelle JCB 4CX (TP-01)',
      periodicity: 'Bimensuel (15 jours)',
      nextDate: '2025-03-18',
      durationHours: 4,
      assignedTeam: 'Équipe C - Fosse Minéralière',
      status: 'À venir'
    }
  ]);

  return (
    <div className="content" id="preventive-plan-page-content">
      {/* En-tête Dossier 1 */}
      <div className="section-heading" style={{ marginBottom: '28px' }}>
        <div>
          <div className="section-label">ANTICIPATION & FIABILITÉ</div>
          <div className="section-title" style={{ fontSize: '28px', marginTop: '4px' }}>
            Planning de Maintenance Préventive
          </div>
          <p style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '4px' }}>
            Planifiez les visites périodiques, les graissages, les contrôles et les révisions préventives des 7 engins portuaires.
          </p>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: '30px' }}>
        <div className="kpi-card border-accent">
          <div className="kpi-top">
            <span className="kpi-title">Plans Actifs</span>
            <div className="kpi-icon"><Calendar size={18} /></div>
          </div>
          <div className="kpi-number">{plans.length}</div>
          <span className="kpi-caption">Gammes de maintenance</span>
        </div>

        <div className="kpi-card border-accent">
          <div className="kpi-top">
            <span className="kpi-title">Taux d'Exécution</span>
            <div className="kpi-icon"><CheckCircle2 size={18} color="var(--green)" /></div>
          </div>
          <div className="kpi-number" style={{ color: 'var(--green)' }}>96.8%</div>
          <span className="kpi-caption">Visites tenues dans les délais</span>
        </div>

        <div className="kpi-card border-accent">
          <div className="kpi-top">
            <span className="kpi-title">Prochaine Échéance</span>
            <div className="kpi-icon"><Clock size={18} color="var(--orange)" /></div>
          </div>
          <div className="kpi-number" style={{ fontSize: '24px', color: 'var(--orange)' }}>08 Mars</div>
          <span className="kpi-caption">Dumper Komatsu DP-02 Freins</span>
        </div>

        <div className="kpi-card border-accent">
          <div className="kpi-top">
            <span className="kpi-title">Conformité Sécurité</span>
            <div className="kpi-icon"><ShieldCheck size={18} color="var(--green)" /></div>
          </div>
          <div className="kpi-number" style={{ color: 'var(--green)' }}>100%</div>
          <span className="kpi-caption">Contrôles réglementaires valides</span>
        </div>
      </div>

      {/* SCHÉMAS STATISTIQUES MULTI-PÉRIODES POUR LE PRÉVENTIF */}
      <WeeklyStatsDiagram 
        pageTitle="Statistiques Multi-Périodes du Plan Préventif"
        subtitle="Respect des plannings par semaine, mois, jour et heure avec calendrier détaillé"
        context="preventive"
      />

      {/* Calendrier & Liste des Visites */}
      <section className="section">
        <div className="section-heading">
          <div>
            <div className="section-label">GAMMES PROGRAMMÉES</div>
            <div className="section-title">Calendrier des Interventions Préventives</div>
          </div>
        </div>

        <div className="table-responsive" style={{ background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Code Plan</th>
                <th>Titre de l'Intervention</th>
                <th>Équipement Concerne</th>
                <th>Périodicité</th>
                <th>Prochaine Date</th>
                <th>Durée Estimée</th>
                <th>Équipe Affectée</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700, color: 'var(--orange)' }}>{p.id}</td>
                  <td style={{ fontWeight: 600 }}>{p.title}</td>
                  <td>
                    <span className="badge badge-subtle">{p.equipment}</span>
                  </td>
                  <td style={{ fontSize: '13px' }}>{p.periodicity}</td>
                  <td style={{ fontWeight: 700 }}>{p.nextDate}</td>
                  <td>{p.durationHours} h</td>
                  <td style={{ fontSize: '13px', color: 'var(--muted)' }}>{p.assignedTeam}</td>
                  <td>
                    <span className={`badge ${
                      p.status === 'Urgent' ? 'badge-danger' :
                      p.status === 'En cours' ? 'badge-warning' :
                      p.status === 'À venir' ? 'badge-info' : 'badge-neutral'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
