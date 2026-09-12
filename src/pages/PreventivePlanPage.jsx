import React, { useMemo, useState } from 'react';
import { Calendar, CheckCircle2, Clock, ShieldCheck, Search } from 'lucide-react';
import WeeklyStatsDiagram from '../components/WeeklyStatsDiagram.jsx';
import { calculatePreventiveMaintenanceSummary } from '../utils/kpiCalculations.js';

/**
 * Plan préventif dérivé directement des Work Orders réels de type "Préventif"
 * (la table preventive_plan n'est alimentée par aucun formulaire ni l'import Excel,
 * donc s'y fier laisserait la page vide) — une ligne par machine, y compris celles
 * sans aucun historique préventif, pour repérer les manques.
 */
export default function PreventivePlanPage({ equipments = [], workOrders = [] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const summary = useMemo(
    () => calculatePreventiveMaintenanceSummary(equipments, workOrders),
    [equipments, workOrders]
  );

  const filtered = summary.filter((s) => {
    const term = searchTerm.toLowerCase();
    return !term || s.name.toLowerCase().includes(term) || s.code.toLowerCase().includes(term) || s.category.toLowerCase().includes(term);
  });

  const planned = summary.filter((s) => s.status !== 'Aucune planifiée');
  const late = summary.filter((s) => s.status === 'En retard');
  const coverageRate = summary.length > 0 ? Number(((planned.length / summary.length) * 100).toFixed(1)) : 0;
  const nextUp = [...summary].filter((s) => s.nextDate).sort((a, b) => (a.nextDate < b.nextDate ? -1 : 1))[0];

  const fmtDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR');
  };

  return (
    <div className="content" id="preventive-plan-page-content">
      {/* En-tête */}
      <div className="section-heading" style={{ marginBottom: '28px' }}>
        <div>
          <div className="section-label">ANTICIPATION & FIABILITÉ</div>
          <div className="section-title" style={{ fontSize: '28px', marginTop: '4px' }}>
            Planning de Maintenance Préventive
          </div>
          <p style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '4px' }}>
            Toutes les machines, avec leur dernière maintenance préventive réelle et la prochaine planifiée.
          </p>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: '30px' }}>
        <div className="kpi-card border-accent">
          <div className="kpi-top">
            <span className="kpi-title">Machines Suivies</span>
            <div className="kpi-icon"><Calendar size={18} /></div>
          </div>
          <div className="kpi-number">{summary.length}</div>
          <span className="kpi-caption">Parc total</span>
        </div>

        <div className="kpi-card border-accent">
          <div className="kpi-top">
            <span className="kpi-title">Taux de Couverture</span>
            <div className="kpi-icon"><CheckCircle2 size={18} color="var(--green)" /></div>
          </div>
          <div className="kpi-number" style={{ color: 'var(--green)' }}>{coverageRate}%</div>
          <span className="kpi-caption">Avec un préventif planifié</span>
        </div>

        <div className="kpi-card border-accent">
          <div className="kpi-top">
            <span className="kpi-title">Prochaine Échéance</span>
            <div className="kpi-icon"><Clock size={18} color="var(--orange)" /></div>
          </div>
          <div className="kpi-number" style={{ fontSize: '20px', color: 'var(--orange)' }}>{fmtDate(nextUp?.nextDate)}</div>
          <span className="kpi-caption">{nextUp?.name || 'Aucune planifiée'}</span>
        </div>

        <div className="kpi-card border-accent">
          <div className="kpi-top">
            <span className="kpi-title">Échéances en Retard</span>
            <div className="kpi-icon"><ShieldCheck size={18} color="var(--red)" /></div>
          </div>
          <div className="kpi-number" style={{ color: 'var(--red)' }}>{late.length}</div>
          <span className="kpi-caption">Date planifiée dépassée</span>
        </div>
      </div>

      {/* SCHÉMAS STATISTIQUES MULTI-PÉRIODES POUR LE PRÉVENTIF */}
      <WeeklyStatsDiagram
        pageTitle="Statistiques Multi-Périodes du Plan Préventif"
        subtitle="Parc réel par catégorie d'équipement et échéances de maintenance"
        context="preventive"
        equipments={equipments}
      />

      {/* Liste des machines */}
      <section className="section">
        <div className="section-heading">
          <div>
            <div className="section-label">TOUTES LES MACHINES</div>
            <div className="section-title">Dernière & Prochaine Maintenance Préventive</div>
          </div>
        </div>

        <div className="search-box" style={{ marginBottom: '14px', maxWidth: '360px' }}>
          <Search className="search-icon" size={16} />
          <input
            type="text"
            placeholder="Rechercher une machine ou une catégorie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Machine</th>
                <th>Catégorie</th>
                <th>Dernière Maintenance Préventive</th>
                <th>Prochaine Maintenance Prévue</th>
                <th>Technicien Assigné</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px' }}>
                    Aucune machine ne correspond à la recherche.
                  </td>
                </tr>
              ) : filtered.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 700, color: 'var(--orange)' }}>{s.code}</td>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td>{s.category}</td>
                  <td>{fmtDate(s.lastDate)}</td>
                  <td style={{ fontWeight: 700 }}>{fmtDate(s.nextDate)}</td>
                  <td style={{ fontSize: '13px', color: 'var(--muted)' }}>{s.nextTechnician || '—'}</td>
                  <td>
                    <span className={`status-badge ${
                      s.status === 'En retard' ? 'status-late' :
                      s.status === 'Planifiée' ? 'status-done' : 'status-info'
                    }`}>
                      {s.status}
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
