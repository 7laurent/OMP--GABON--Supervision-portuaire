import React, { useMemo, useState } from 'react';
import { Filter, Calendar, TrendingUp, Wrench, AlertTriangle, BarChart3, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import {
  calculateTRC,
  calculateFailureRatioSeries,
  calculatePreventiveCorrectiveRatioSeries,
  calculateWeeklyPercentagesByMonth,
  calculateHourVolumeBreakdown
} from '../utils/kpiCalculations.js';

/**
 * Analyse temporelle réutilisable : Ratio de pannes, TRC, Ratio Préventif/Correctif
 * (par jour/mois sur une période précise) + répartition hebdomadaire par mois d'une année,
 * pour Équipements / Pannes / Work Orders. Peut être filtrée par machine ou par catégorie,
 * ou pré-figée sur une machine/catégorie donnée (filtres masqués) via les props
 * `fixedEquipmentId` / `fixedCategory`.
 */
export default function TemporalAnalyticsSection({
  equipments = [],
  pannes = [],
  workOrders = [],
  fixedEquipmentId = null,
  fixedCategory = null,
  showFilters = true,
  title = 'Analyse Temporelle & Ratios de Maintenance'
}) {
  const { isDarkMode } = useTheme();
  const [granularity, setGranularity] = useState('month');
  const [equipmentId, setEquipmentId] = useState(fixedEquipmentId || 'all');
  const [category, setCategory] = useState(fixedCategory || 'all');
  const [year, setYear] = useState(new Date().getFullYear());
  const [weeklyMetric, setWeeklyMetric] = useState('pannes');

  const effectiveEquipmentId = fixedEquipmentId || equipmentId;
  const effectiveCategory = fixedCategory || category;

  const categories = useMemo(() => Array.from(new Set(equipments.map((e) => e.category).filter(Boolean))), [equipments]);

  const failureSeries = useMemo(() => calculateFailureRatioSeries(pannes, equipments, {
    granularity, equipmentId: effectiveEquipmentId, category: effectiveCategory
  }), [pannes, equipments, granularity, effectiveEquipmentId, effectiveCategory]);

  const ratioSeries = useMemo(() => calculatePreventiveCorrectiveRatioSeries(workOrders, {
    granularity, equipmentId: effectiveEquipmentId, category: effectiveCategory
  }), [workOrders, granularity, effectiveEquipmentId, effectiveCategory]);

  const scopedPannes = useMemo(() => pannes.filter((p) => {
    const matchesEq = effectiveEquipmentId === 'all' || String(p._equipmentId) === String(effectiveEquipmentId);
    const matchesCat = effectiveCategory === 'all' || p._category === effectiveCategory;
    return matchesEq && matchesCat;
  }), [pannes, effectiveEquipmentId, effectiveCategory]);

  const trc = calculateTRC(scopedPannes);

  const hourVolume = useMemo(() => calculateHourVolumeBreakdown(pannes, workOrders, equipments, {
    equipmentId: effectiveEquipmentId, category: effectiveCategory
  }), [pannes, workOrders, equipments, effectiveEquipmentId, effectiveCategory]);

  const weeklyData = useMemo(() => calculateWeeklyPercentagesByMonth(pannes, workOrders, year, {
    equipmentId: effectiveEquipmentId, category: effectiveCategory
  }), [pannes, workOrders, year, effectiveEquipmentId, effectiveCategory]);

  const weeklyMonths = weeklyData[weeklyMetric] || [];
  const availableYears = useMemo(() => {
    const years = new Set([new Date().getFullYear()]);
    [...pannes, ...workOrders].forEach((r) => {
      const raw = r.date ? `${r.date}T00:00:00` : (r._createdAt || r._plannedStart);
      const d = raw ? new Date(raw) : null;
      if (d && !isNaN(d.getTime())) years.add(d.getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [pannes, workOrders]);

  const latestPreventiveRatio = ratioSeries.length ? ratioSeries[ratioSeries.length - 1].preventiveRatio : 0;
  const latestCorrectiveRatio = ratioSeries.length ? ratioSeries[ratioSeries.length - 1].correctiveRatio : 0;
  const latestFailureRatio = failureSeries.length ? failureSeries[failureSeries.length - 1].failureRatio : 0;
  const latestPreventiveHours = ratioSeries.length ? ratioSeries[ratioSeries.length - 1].preventiveHours : 0;
  const latestCorrectiveHours = ratioSeries.length ? ratioSeries[ratioSeries.length - 1].correctiveHours : 0;
  const granularityLabel = granularity === 'day' ? 'Jour' : granularity === 'week' ? 'Semaine' : 'Mois';

  return (
    <section className="section" id="temporal-analytics-section" style={{ marginTop: '24px' }}>
      <div className="section-heading" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={15} color="var(--orange)" />
            <span>RATIOS DE PANNES · TRC · PRÉVENTIF/CORRECTIF (DONNÉES RÉELLES)</span>
          </div>
          <div className="section-title">{title}</div>
        </div>

        {showFilters && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'inline-flex', background: isDarkMode ? '#0d223f' : '#e2e8f0', padding: '3px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              {[{ id: 'day', label: 'Jour' }, { id: 'week', label: 'Semaine' }, { id: 'month', label: 'Mois' }].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGranularity(g.id)}
                  style={{ padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', background: granularity === g.id ? 'var(--orange)' : 'transparent', color: granularity === g.id ? '#fff' : 'var(--text-muted)' }}
                >
                  {g.label}
                </button>
              ))}
            </div>

            {!fixedCategory && (
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="filter-select" id="select-analytics-category">
                <option value="all">Toutes catégories</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            )}

            {!fixedEquipmentId && (
              <select value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)} className="filter-select" id="select-analytics-equipment">
                <option value="all">Toutes les machines</option>
                {equipments
                  .filter((e) => category === 'all' || e.category === category)
                  .map((e) => <option key={e.id} value={e.id}>{e.code} — {e.name}</option>)}
              </select>
            )}
          </div>
        )}
      </div>

      {/* CARTES TRC + RATIOS ACTUELS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="kpi-card" style={{ padding: '18px', borderTop: '3px solid var(--red)' }}>
          <div className="kpi-top">
            <span className="kpi-title">TRC — Taux de Réalisation Curative</span>
            <ShieldCheck size={18} color="var(--red)" />
          </div>
          <div className="kpi-number" style={{ fontSize: '30px', color: 'var(--red)', margin: '8px 0 4px' }}>
            {trc.trc}%
          </div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'monospace' }}>
            = {trc.resolved} résolues / {trc.total} déclarées
          </div>
        </div>

        <div className="kpi-card" style={{ padding: '18px', borderTop: '3px solid var(--orange)' }}>
          <div className="kpi-top">
            <span className="kpi-title">Ratio de Pannes (dernière période)</span>
            <AlertTriangle size={18} color="var(--orange)" />
          </div>
          <div className="kpi-number" style={{ fontSize: '30px', color: 'var(--orange)', margin: '8px 0 4px' }}>
            {latestFailureRatio}%
          </div>
          <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Pannes / équipements concernés</div>
          <div style={{ fontSize: '10px', color: 'var(--text)', marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed var(--border)' }}>
            Volume horaire pannes : <strong>{hourVolume.pannesHours} h</strong> ({hourVolume.pannesPercent}% du temps dispo)
          </div>
        </div>

        <div className="kpi-card" style={{ padding: '18px', borderTop: '3px solid var(--green)' }}>
          <div className="kpi-top">
            <span className="kpi-title">Ratio Préventif</span>
            <Wrench size={18} color="var(--green)" />
          </div>
          <div className="kpi-number" style={{ fontSize: '30px', color: 'var(--green)', margin: '8px 0 4px' }}>
            {latestPreventiveRatio}%
          </div>
          <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Work Orders préventifs / total</div>
          <div style={{ fontSize: '10px', color: 'var(--text)', marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed var(--border)' }}>
            Heures préventif (dernière {granularityLabel.toLowerCase()}) : <strong style={{ color: 'var(--green)' }}>{latestPreventiveHours} h</strong>
          </div>
        </div>

        <div className="kpi-card" style={{ padding: '18px', borderTop: '3px solid var(--blue)' }}>
          <div className="kpi-top">
            <span className="kpi-title">Ratio Correctif</span>
            <Wrench size={18} color="var(--blue)" />
          </div>
          <div className="kpi-number" style={{ fontSize: '30px', color: 'var(--blue)', margin: '8px 0 4px' }}>
            {latestCorrectiveRatio}%
          </div>
          <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Work Orders correctifs / total</div>
          <div style={{ fontSize: '10px', color: 'var(--text)', marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed var(--border)' }}>
            Heures correctif (dernière {granularityLabel.toLowerCase()}) : <strong style={{ color: 'var(--blue)' }}>{latestCorrectiveHours} h</strong>
          </div>
        </div>
      </div>

      {/* VOLUME HORAIRE DE MAINTENANCE — ÉQUIPEMENT(S) CONCERNÉ(S) */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '18px', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 18px', borderRadius: '10px', background: isDarkMode ? '#0a1d35' : '#f8fafc',
        border: '1px solid var(--border)', borderLeft: '4px solid var(--orange)', marginBottom: '20px', fontSize: '12px'
      }}>
        <div>
          <strong style={{ color: 'var(--text)' }}>Volume Horaire de Maintenance — Réparation vs Prévention</strong>
          <div style={{ color: 'var(--muted)', marginTop: '2px' }}>
            {hourVolume.equipmentCount} machine(s) concernée(s) sur {hourVolume.spanDays} jour(s) de données réelles
            = <strong style={{ color: 'var(--text)' }}>{hourVolume.availableHours} h</strong> disponibles au total
          </div>
        </div>
        <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
          <span>Pannes déclarées : <strong style={{ color: 'var(--orange)' }}>{hourVolume.pannesHours} h</strong> ({hourVolume.pannesPercent}%)</span>
          <span>Réparation (Correctif) : <strong style={{ color: 'var(--red)' }}>{hourVolume.correctiveHours} h</strong> ({hourVolume.correctivePercent}%)</span>
          <span>Prévention (Préventif) : <strong style={{ color: 'var(--green)' }}>{hourVolume.preventiveHours} h</strong> ({hourVolume.preventivePercent}%)</span>
          <span>Total Work Orders : <strong style={{ color: 'var(--blue)' }}>{hourVolume.woHours} h</strong></span>
          <span>Total Général : <strong style={{ color: 'var(--text)' }}>{hourVolume.totalMaintenanceHours} h</strong></span>
        </div>
      </div>

      {/* GRAPHIQUE RATIO DE PANNES DANS LE TEMPS (avec nombre exact de pannes affiché) */}
      <div className="performance-card" style={{ padding: '20px', background: isDarkMode ? '#07182e' : '#fff', border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '20px' }}>
        <strong style={{ fontSize: '14px', color: 'var(--text)' }}>Ratio &amp; Nombre Exact de Pannes par {granularityLabel}</strong>
        {failureSeries.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>Aucune panne sur cette période.</div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '150px', gap: '10px', marginTop: '16px', overflowX: 'auto', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            {failureSeries.slice(-14).map((b) => (
              <div key={b.key} style={{ flex: '0 0 52px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }} title={`${b.label} : ${b.failureRatio}% — TRC ${b.trc}%`}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text)' }}>{b.count}</span>
                <span style={{ fontSize: '9px', color: 'var(--muted)' }}>panne(s)</span>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--orange)', marginTop: '2px' }}>{b.failureRatio}%</span>
                <div style={{ width: '26px', height: `${Math.max(4, Math.min(80, b.failureRatio))}px`, background: 'var(--orange)', borderRadius: '3px 3px 0 0', marginTop: '4px' }} />
                <span style={{ fontSize: '9px', color: 'var(--muted)', marginTop: '6px', textAlign: 'center' }}>{b.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GRAPHIQUE RATIO PRÉVENTIF / CORRECTIF DANS LE TEMPS (avec nombre exact de Work Orders) */}
      <div className="performance-card" style={{ padding: '20px', background: isDarkMode ? '#07182e' : '#fff', border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '20px' }}>
        <strong style={{ fontSize: '14px', color: 'var(--text)' }}>Ratio &amp; Nombre Exact de Work Orders (Préventif / Correctif) par {granularityLabel}</strong>
        {ratioSeries.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>Aucun Work Order sur cette période.</div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '150px', gap: '10px', marginTop: '16px', overflowX: 'auto', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            {ratioSeries.slice(-14).map((b) => (
              <div key={b.key} style={{ flex: '0 0 66px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }} title={`${b.label} : ${b.preventiveCount} préventif(s) [${b.preventiveHours}h] / ${b.correctiveCount} correctif(s) [${b.correctiveHours}h]`}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text)' }}>{b.count}</span>
                <span style={{ fontSize: '9px', color: 'var(--muted)' }}>WO ({b.preventiveCount}P/{b.correctiveCount}C)</span>
                <span style={{ fontSize: '9px', fontWeight: 700, marginTop: '1px' }}>
                  <span style={{ color: 'var(--green)' }}>{b.preventiveHours}h</span>
                  {' / '}
                  <span style={{ color: 'var(--blue)' }}>{b.correctiveHours}h</span>
                </span>
                <div style={{ width: '26px', display: 'flex', flexDirection: 'column-reverse', height: '90px', borderRadius: '3px', overflow: 'hidden', marginTop: '4px' }}>
                  <div style={{ height: `${b.preventiveRatio}%`, background: 'var(--green)' }} />
                  <div style={{ height: `${b.correctiveRatio}%`, background: 'var(--blue)' }} />
                </div>
                <span style={{ fontSize: '9px', color: 'var(--muted)', marginTop: '6px', textAlign: 'center' }}>{b.label}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '11px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '10px', height: '10px', background: 'var(--green)', borderRadius: '2px' }} /> Préventif</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '10px', height: '10px', background: 'var(--blue)', borderRadius: '2px' }} /> Correctif</span>
        </div>
      </div>

      {/* TABLEAU DÉDIÉ : HEURES PRÉVENTIF VS CORRECTIF PAR PÉRIODE */}
      <div className="performance-card" style={{ padding: '20px', background: isDarkMode ? '#07182e' : '#fff', border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '20px' }}>
        <strong style={{ fontSize: '14px', color: 'var(--text)' }}>Tableau — Heures Dédiées au Préventif vs Correctif par {granularityLabel}</strong>
        <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '2px 0 12px' }}>
          Combien d'heures ont été consacrées à la maintenance préventive et corrective, période par période.
        </p>
        {ratioSeries.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>Aucun Work Order sur cette période.</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>{granularityLabel}</th>
                  <th>WO Préventifs</th>
                  <th>Heures Préventif</th>
                  <th>WO Correctifs</th>
                  <th>Heures Correctif</th>
                  <th>Total Heures</th>
                  <th>% Préventif</th>
                  <th>% Correctif</th>
                </tr>
              </thead>
              <tbody>
                {ratioSeries.slice(-14).reverse().map((b) => (
                  <tr key={b.key}>
                    <td style={{ fontWeight: 700 }}>{b.label}</td>
                    <td>{b.preventiveCount}</td>
                    <td style={{ color: 'var(--green)', fontWeight: 700 }}>{b.preventiveHours} h</td>
                    <td>{b.correctiveCount}</td>
                    <td style={{ color: 'var(--blue)', fontWeight: 700 }}>{b.correctiveHours} h</td>
                    <td style={{ fontWeight: 700 }}>{Number((b.preventiveHours + b.correctiveHours).toFixed(1))} h</td>
                    <td>{b.preventiveRatio}%</td>
                    <td>{b.correctiveRatio}%</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid var(--border)' }}>
                  <td style={{ fontWeight: 800 }}>Total période affichée</td>
                  <td style={{ fontWeight: 800 }}>{ratioSeries.slice(-14).reduce((s, b) => s + b.preventiveCount, 0)}</td>
                  <td style={{ fontWeight: 800, color: 'var(--green)' }}>
                    {Number(ratioSeries.slice(-14).reduce((s, b) => s + b.preventiveHours, 0).toFixed(1))} h
                  </td>
                  <td style={{ fontWeight: 800 }}>{ratioSeries.slice(-14).reduce((s, b) => s + b.correctiveCount, 0)}</td>
                  <td style={{ fontWeight: 800, color: 'var(--blue)' }}>
                    {Number(ratioSeries.slice(-14).reduce((s, b) => s + b.correctiveHours, 0).toFixed(1))} h
                  </td>
                  <td style={{ fontWeight: 800 }}>
                    {Number(ratioSeries.slice(-14).reduce((s, b) => s + b.preventiveHours + b.correctiveHours, 0).toFixed(1))} h
                  </td>
                  <td colSpan={2} />
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RÉPARTITION HEBDOMADAIRE PAR MOIS SUR UNE ANNÉE */}
      <div className="performance-card" style={{ padding: '20px', background: isDarkMode ? '#07182e' : '#fff', border: '1px solid var(--border)', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
          <div>
            <strong style={{ fontSize: '14px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BarChart3 size={15} color="var(--orange)" /> Répartition (%) par Semaine, Mois par Mois — {year}
            </strong>
            <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '2px 0 0' }}>
              Pour chaque mois, part de chaque semaine ISO dans le total mensuel.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select value={weeklyMetric} onChange={(e) => setWeeklyMetric(e.target.value)} className="filter-select" id="select-weekly-metric">
              <option value="equipements">Équipements concernés</option>
              <option value="pannes">Pannes</option>
              <option value="workOrders">Work Orders</option>
            </select>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="filter-select" id="select-weekly-year">
              {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          {weeklyMonths.map((m) => (
            <div key={m.month} style={{ background: 'var(--hover-bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span>{m.label}</span>
                <span style={{ color: 'var(--muted)', fontWeight: 500 }}>{m.total}</span>
              </div>
              {m.weeks.length === 0 ? (
                <div style={{ fontSize: '10px', color: 'var(--muted)', padding: '10px 0', textAlign: 'center' }}>—</div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '70px' }}>
                  {m.weeks.map((w) => (
                    <div key={w.week} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }} title={`Semaine S${w.week} : ${w.value} (${w.percent}% du mois)`}>
                      <span style={{ fontSize: '8px', fontWeight: 700, color: 'var(--text)' }}>{w.value}</span>
                      <div style={{ width: '100%', maxWidth: '16px', height: `${Math.max(4, w.percent * 0.45)}px`, background: 'var(--orange)', borderRadius: '2px 2px 0 0', marginTop: '2px' }} />
                      <span style={{ fontSize: '8px', color: 'var(--muted)', marginTop: '2px' }}>S{w.week}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
