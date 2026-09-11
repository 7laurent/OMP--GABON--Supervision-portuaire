import React from 'react';
import { Calendar, Plus, CheckCircle2, Clock, AlertTriangle, ShieldCheck, Trash2 } from 'lucide-react';
import WeeklyStatsDiagram from '../components/WeeklyStatsDiagram.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function PreventivePlanPage({ equipments = [], plans = [], onDeletePlan }) {
  const { isAdmin } = useAuth();
  const executionRate = plans.length > 0
    ? Number(((plans.filter((p) => p.status !== 'Urgent').length / plans.length) * 100).toFixed(1))
    : 100;
  const nextPlan = [...plans]
    .filter((p) => p.nextDate)
    .sort((a, b) => (a.nextDate < b.nextDate ? -1 : 1))[0];

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
          <div className="kpi-number" style={{ color: 'var(--green)' }}>{executionRate}%</div>
          <span className="kpi-caption">Plans non urgents</span>
        </div>

        <div className="kpi-card border-accent">
          <div className="kpi-top">
            <span className="kpi-title">Prochaine Échéance</span>
            <div className="kpi-icon"><Clock size={18} color="var(--orange)" /></div>
          </div>
          <div className="kpi-number" style={{ fontSize: '20px', color: 'var(--orange)' }}>{nextPlan?.nextDate || '—'}</div>
          <span className="kpi-caption">{nextPlan?.equipment || 'Aucun plan actif'}</span>
        </div>

        <div className="kpi-card border-accent">
          <div className="kpi-top">
            <span className="kpi-title">Plans Urgents</span>
            <div className="kpi-icon"><ShieldCheck size={18} color="var(--red)" /></div>
          </div>
          <div className="kpi-number" style={{ color: 'var(--red)' }}>{plans.filter((p) => p.status === 'Urgent').length}</div>
          <span className="kpi-caption">Échéance dépassée</span>
        </div>
      </div>

      {/* SCHÉMAS STATISTIQUES MULTI-PÉRIODES POUR LE PRÉVENTIF */}
      <WeeklyStatsDiagram
        pageTitle="Statistiques Multi-Périodes du Plan Préventif"
        subtitle="Parc réel par catégorie d'équipement et échéances de maintenance"
        context="preventive"
        equipments={equipments}
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
                {onDeletePlan && isAdmin && <th style={{ textAlign: 'right' }}>Action</th>}
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
                  <td>{p.durationHours ?? '—'} h</td>
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
                  {onDeletePlan && isAdmin && (
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="action-btn-sm"
                        style={{ color: 'var(--red)', borderColor: 'rgba(239,71,111,0.4)' }}
                        onClick={() => onDeletePlan(p._planId, p.title)}
                        title="Supprimer ce plan"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {plans.length === 0 && (
                <tr>
                  <td colSpan={onDeletePlan && isAdmin ? 8 : 7} style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px' }}>
                    Aucun plan de maintenance préventive enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
