import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  Calendar,
  Clock,
  Activity,
  AlertTriangle,
  Wrench,
  Filter
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import EquipmentKpiModal from './modals/EquipmentKpiModal.jsx';
import { bucketByPeriod, calculateMTBF, calculateMTTR, calculateDo } from '../utils/kpiCalculations.js';

const WINDOW_HOURS = { day: 24, week: 168, month: 730 };

/**
 * SCHÉMA STATISTIQUE MULTI-PÉRIODES — calculé en direct depuis les données réelles
 * (aucune donnée fictive). Regroupe les pannes/Work Orders par jour, semaine ou mois
 * et affiche Disponibilité / MTBF / MTTR dérivés du nombre réel d'événements par période.
 */
export default function WeeklyStatsDiagram({
  pageTitle = 'Statistiques de Maintenance',
  subtitle = 'Suivi temporel des indicateurs de performance AFNOR',
  context = 'dashboard',
  equipments = [],
  pannes = [],
  workOrders = [],
  onSelectMachineKpi = null
}) {
  const { isDarkMode } = useTheme();
  const [granularity, setGranularity] = useState('week');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [internalSelectedMachineForKpi, setInternalSelectedMachineForKpi] = useState(null);

  const categories = useMemo(() => {
    const set = new Set(equipments.map((e) => e.category).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [equipments]);

  const filteredEquipments = selectedCategory === 'all'
    ? equipments
    : equipments.filter((e) => e.category === selectedCategory);

  // Les lignes "à valider" (incohérence détectée à l'import) sont exclues des
  // calculs tant qu'un admin ne les a pas confirmées.
  const reliablePannes = pannes.filter((p) => !p.needsReview);
  const reliableWO = workOrders.filter((w) => !w.needsReview);

  const filteredPannes = selectedCategory === 'all'
    ? reliablePannes
    : reliablePannes.filter((p) => p._category === selectedCategory);

  const filteredWO = selectedCategory === 'all'
    ? reliableWO
    : reliableWO.filter((w) => w._category === selectedCategory);

  const activeEquipmentCount = Math.max(1, filteredEquipments.length);

  const buckets = useMemo(() => {
    const panneBuckets = bucketByPeriod(filteredPannes, (p) => `${p.date}T${p.time || '00:00'}:00`, granularity);
    const woBuckets = bucketByPeriod(filteredWO, (w) => w._createdAt || w._plannedStart, granularity);
    const keys = new Set([...panneBuckets.map((b) => b.key), ...woBuckets.map((b) => b.key)]);

    const merged = Array.from(keys).sort().map((key) => {
      const pb = panneBuckets.find((b) => b.key === key);
      const wb = woBuckets.find((b) => b.key === key);
      const pannesCount = pb ? pb.count : 0;
      const woCount = wb ? wb.count : 0;
      const durationSum = pb ? pb.items.reduce((s, p) => s + (Number(p.durationHours) || 0), 0) : 0;
      const windowHours = WINDOW_HOURS[granularity] || 168;
      const mtbf = calculateMTBF(windowHours * activeEquipmentCount, pannesCount || 1);
      const mttr = calculateMTTR(durationSum || 1, pannesCount || 1);
      const dispo = calculateDo(windowHours * activeEquipmentCount, durationSum);
      return {
        key,
        name: (pb && pb.label) || (wb && wb.label) || key,
        pannes: pannesCount,
        wo: woCount,
        mtbf,
        mttr,
        dispo
      };
    });

    return merged.slice(-8);
  }, [filteredPannes, filteredWO, granularity, activeEquipmentCount]);

  const currentPeriod = buckets[buckets.length - 1] || { pannes: 0, wo: 0, mtbf: 0, mttr: 0, dispo: 100, name: '—' };

  // Statistiques par catégorie d'équipement (regroupement réel du parc)
  const fleetStats = useMemo(() => {
    const cats = categories.filter((c) => c !== 'all');
    return cats.map((cat) => {
      const eqOfCat = equipments.filter((e) => e.category === cat && !e.needsReview);
      const pannesOfCat = pannes.filter((p) => p._category === cat && !p.needsReview);
      const totalOperating = eqOfCat.reduce((s, e) => s + (e.operatingHours || 0), 0);
      const totalDowntime = eqOfCat.reduce((s, e) => s + (e.downtimeHours || 0), 0);
      const mtbf = calculateMTBF(totalOperating, pannesOfCat.length || 1);
      const mttr = calculateMTTR(pannesOfCat.reduce((s, p) => s + (Number(p.durationHours) || 0), 0) || 1, pannesOfCat.length || 1);
      const dispo = calculateDo(totalOperating, totalDowntime);
      const lastPanne = [...pannesOfCat].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
      return {
        type: cat,
        count: eqOfCat.length,
        dispo,
        mtbf,
        mttr,
        pannesCount: pannesOfCat.length,
        lastIntervention: lastPanne ? `${lastPanne.date} ${lastPanne.time || ''}`.trim() : '—',
        status: eqOfCat.some((e) => e.status === "À l'arrêt") ? "À l'arrêt" : eqOfCat.some((e) => e.status === 'En maintenance') ? 'En maintenance' : 'Opérationnel',
        sample: eqOfCat[0]
      };
    });
  }, [categories, equipments, pannes]);

  return (
    <div className="section" id="weekly-stats-diagram-container" style={{ marginBottom: '32px' }}>
      <div className="section-heading" style={{ flexWrap: 'wrap', gap: '16px', alignItems: 'flex-start' }}>
        <div>
          <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BarChart3 size={15} color="var(--orange)" />
            <span>SCHÉMA STATISTIQUE &amp; GRANULARITÉ TEMPORELLE DES KPIS (DONNÉES RÉELLES)</span>
          </div>
          <div className="section-title" style={{ fontSize: '24px', marginTop: '4px' }}>
            {pageTitle}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
            {subtitle}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <div style={{ display: 'inline-flex', background: isDarkMode ? '#0d223f' : '#e2e8f0', padding: '3px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            {[
              { id: 'month', label: 'Mois' },
              { id: 'week', label: 'Semaine' },
              { id: 'day', label: 'Jour' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setGranularity(tab.id)}
                style={{
                  padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, border: 'none',
                  cursor: 'pointer', transition: 'all 0.2s',
                  background: granularity === tab.id ? 'var(--orange)' : 'transparent',
                  color: granularity === tab.id ? '#ffffff' : 'var(--text-muted)'
                }}
                id={`btn-granularity-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={13} color="var(--muted)" />
            <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>Catégorie :</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}
              id="select-weekly-stats-category"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === 'all' ? 'Toutes catégories' : c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="kpi-card" style={{ padding: '18px', borderTop: '3px solid var(--green)' }}>
          <div className="kpi-top">
            <span className="kpi-title">Disponibilité ({granularity === 'day' ? 'JOUR' : granularity === 'month' ? 'MOIS' : 'SEMAINE'})</span>
            <Activity size={18} color="var(--green)" />
          </div>
          <div className="kpi-number" style={{ fontSize: '32px', color: 'var(--green)', margin: '10px 0 4px' }}>
            {currentPeriod.dispo}%
          </div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>
            Do = Exposition / (Exposition + Arrêts) — Norme AFNOR NF EN 13306
          </div>
        </div>

        <div className="kpi-card" style={{ padding: '18px', borderTop: '3px solid var(--orange)' }}>
          <div className="kpi-top">
            <span className="kpi-title">MTBF (dernière période)</span>
            <Clock size={18} color="var(--orange)" />
          </div>
          <div className="kpi-number" style={{ fontSize: '32px', color: 'var(--orange)', margin: '10px 0 4px' }}>
            {currentPeriod.mtbf} h
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
            {currentPeriod.name}
          </div>
        </div>

        <div className="kpi-card" style={{ padding: '18px', borderTop: '3px solid #3b82f6' }}>
          <div className="kpi-top">
            <span className="kpi-title">MTTR (dernière période)</span>
            <Wrench size={18} color="#3b82f6" />
          </div>
          <div className="kpi-number" style={{ fontSize: '32px', color: '#3b82f6', margin: '10px 0 4px' }}>
            {currentPeriod.mttr} h
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
            Durée moyenne de remise en état
          </div>
        </div>

        <div className="kpi-card" style={{ padding: '18px', borderTop: '3px solid var(--dark-blue)' }}>
          <div className="kpi-top">
            <span className="kpi-title">Pannes / Work Orders</span>
            <AlertTriangle size={18} color="var(--orange)" />
          </div>
          <div className="kpi-number" style={{ fontSize: '32px', color: 'var(--text)', margin: '10px 0 4px' }}>
            {currentPeriod.pannes} <span style={{ fontSize: '16px', color: 'var(--muted)' }}>/ {currentPeriod.wo} WO</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
            Enregistrements réels Supabase
          </div>
        </div>
      </div>

      <div className="performance-card" style={{ padding: '24px', backgroundColor: isDarkMode ? '#07182e' : '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <strong style={{ fontSize: '15px', color: 'var(--text)' }}>
              Évolution Réelle · {granularity === 'week' ? 'Par Semaine' : granularity === 'month' ? 'Par Mois' : 'Par Jour'}
            </strong>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
              Disponibilité (barres), MTBF (heures) et nombre de pannes par période
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', fontSize: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', background: 'var(--green)', borderRadius: '2px' }} />
              Disponibilité (%)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', background: 'var(--red)', borderRadius: '2px' }} />
              Pannes
            </span>
          </div>
        </div>

        {buckets.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
            Aucune donnée réelle sur cette période. Déclarez une panne ou créez un Work Order pour alimenter ce schéma.
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '190px', gap: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '10px', overflowX: 'auto' }}>
            {buckets.map((item, idx) => {
              const barHeight = Math.max(20, item.dispo * 1.3);
              const isLatest = idx === buckets.length - 1;
              return (
                <div key={item.key} style={{ flex: '0 0 64px', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', cursor: 'pointer' }} title={`${item.name} : Dispo ${item.dispo}% | MTBF ${item.mtbf}h | MTTR ${item.mttr}h | ${item.pannes} panne(s) | ${item.wo} WO`}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: isLatest ? 'var(--orange)' : 'var(--text)', marginBottom: '2px' }}>
                    {item.dispo}%
                  </span>
                  <span style={{ fontSize: '9px', color: 'var(--muted)', marginBottom: '2px' }}>
                    {item.pannes} panne(s) · {item.wo} WO
                  </span>
                  <div style={{ width: '100%', maxWidth: '44px', display: 'flex', alignItems: 'flex-end', gap: '3px', height: '130px' }}>
                    <div style={{ flex: 1, height: `${barHeight}px`, background: isLatest ? 'var(--green)' : isDarkMode ? '#1e3a8a' : '#93c5fd', borderRadius: '4px 4px 0 0', transition: 'height 0.4s ease' }} />
                    <div style={{ width: '8px', height: `${Math.min(120, item.pannes * 20)}px`, background: item.pannes > 3 ? 'var(--red)' : 'var(--orange)', borderRadius: '2px 2px 0 0' }} title={`${item.pannes} pannes`} />
                  </div>
                  <span style={{ fontSize: '10px', color: isLatest ? 'var(--orange)' : 'var(--muted)', marginTop: '8px', fontWeight: isLatest ? 700 : 500, textAlign: 'center' }}>
                    {item.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <strong style={{ fontSize: '15px', color: 'var(--text)' }}>
              Indicateurs par Catégorie d'Équipement (Parc Réel)
            </strong>
            <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '2px 0 0' }}>
              Regroupement dynamique selon les catégories réellement enregistrées.
            </p>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
            {fleetStats.length} catégorie(s) d'équipements
          </span>
        </div>

        {fleetStats.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
            Aucun équipement enregistré pour le moment.
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Catégorie</th>
                  <th>Parc</th>
                  <th>Disponibilité</th>
                  <th>MTBF</th>
                  <th>MTTR</th>
                  <th>Pannes</th>
                  <th>Dernière Intervention</th>
                  <th>État</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fleetStats.map((item) => (
                  <tr key={item.type}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--text)' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.status === 'Opérationnel' ? 'var(--green)' : 'var(--orange)' }} />
                        {item.type}
                      </div>
                    </td>
                    <td><strong>{item.count}</strong> unités</td>
                    <td><strong style={{ color: item.dispo >= 90 ? 'var(--green)' : 'var(--orange)' }}>{item.dispo}%</strong></td>
                    <td><strong>{item.mtbf} h</strong></td>
                    <td><span style={{ color: item.mttr <= 4 ? 'var(--green)' : 'var(--orange)' }}>{item.mttr} h</span></td>
                    <td><span className={`status-badge ${item.pannesCount === 0 ? 'status-done' : 'status-progress'}`}>{item.pannesCount}</span></td>
                    <td style={{ fontSize: '11px', color: 'var(--muted)' }}>{item.lastIntervention}</td>
                    <td><span className={`status-badge ${item.status === 'Opérationnel' ? 'status-done' : 'status-progress'}`}>{item.status}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="outline-button"
                        style={{ padding: '5px 10px', fontSize: '11px', borderRadius: '5px', borderColor: 'var(--orange)', color: 'var(--orange)' }}
                        onClick={() => {
                          const machine = item.sample;
                          if (!machine) return;
                          if (onSelectMachineKpi) onSelectMachineKpi(machine);
                          else setInternalSelectedMachineForKpi(machine);
                        }}
                      >
                        Voir les KPI →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {internalSelectedMachineForKpi && (
        <EquipmentKpiModal
          equipment={internalSelectedMachineForKpi}
          pannes={pannes}
          workOrders={workOrders}
          onClose={() => setInternalSelectedMachineForKpi(null)}
        />
      )}
    </div>
  );
}
