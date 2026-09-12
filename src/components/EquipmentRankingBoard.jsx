import React, { useMemo, useState } from 'react';
import { Trophy, AlertTriangle, ArrowUpDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { calculateEquipmentRanking, getPeriodRange, getAvailableYears } from '../utils/kpiCalculations.js';
import PeriodFilterBar, { getCurrentWeekValue, getCurrentMonthValue } from './PeriodFilterBar.jsx';

const COLUMNS = [
  { key: 'panneCount', label: 'Pannes' },
  { key: 'mtbf', label: 'MTBF' },
  { key: 'mttr', label: 'MTTR' },
  { key: 'dispo', label: 'Disponibilité' },
  { key: 'trc', label: 'TRC' }
];

/**
 * Classement réel des machines par nombre de pannes et par efficacité (disponibilité),
 * sur une période choisie (semaine/mois/année/tout), pour répondre directement à
 * "quelle machine a eu le plus de pannes" et "quelle machine a été la plus efficace".
 */
export default function EquipmentRankingBoard({ equipments = [], pannes = [], workOrders = [] }) {
  const { isDarkMode } = useTheme();
  const [granularity, setGranularity] = useState('month');
  const [weekValue, setWeekValue] = useState(getCurrentWeekValue());
  const [monthValue, setMonthValue] = useState(getCurrentMonthValue());
  const [year, setYear] = useState(new Date().getFullYear());
  const [category, setCategory] = useState('all');
  const [sortKey, setSortKey] = useState('panneCount');
  const [sortDir, setSortDir] = useState('desc');

  const availableYears = useMemo(() => getAvailableYears(pannes), [pannes]);
  const categories = useMemo(() => Array.from(new Set(equipments.map((e) => e.category).filter(Boolean))), [equipments]);

  const { from, to } = useMemo(
    () => getPeriodRange({ granularity, weekValue, monthValue, year }),
    [granularity, weekValue, monthValue, year]
  );

  const ranking = useMemo(
    () => calculateEquipmentRanking(equipments, pannes, workOrders, { from, to, category }),
    [equipments, pannes, workOrders, from, to, category]
  );

  const mostBrokenDown = useMemo(() => {
    const withPannes = ranking.filter((r) => r.panneCount > 0);
    if (!withPannes.length) return null;
    return [...withPannes].sort((a, b) => b.panneCount - a.panneCount)[0];
  }, [ranking]);

  const mostEfficient = useMemo(() => {
    const withActivity = ranking.filter((r) => r.panneCount > 0 || r.woCount > 0);
    const pool = withActivity.length ? withActivity : ranking;
    if (!pool.length) return null;
    return [...pool].sort((a, b) => b.dispo - a.dispo)[0];
  }, [ranking]);

  const sorted = useMemo(() => {
    const copy = [...ranking];
    copy.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      const an = av === null || av === undefined ? -1 : av;
      const bn = bv === null || bv === undefined ? -1 : bv;
      return sortDir === 'desc' ? bn - an : an - bn;
    });
    return copy;
  }, [ranking, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  const fmt = (v, unit = '', digits = 1) => (v === null || v === undefined ? '—' : `${Number(v).toFixed(digits)}${unit}`);

  return (
    <div className="performance-card" style={{ padding: '20px', background: isDarkMode ? '#07182e' : '#fff', border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '20px' }} id="equipment-ranking-board">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <strong style={{ fontSize: '14px', color: 'var(--text)' }}>Classement des Machines — Pannes &amp; Efficacité</strong>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {!!categories.length && (
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="filter-select" style={{ fontSize: '11px' }}>
              <option value="all">Toutes catégories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          <PeriodFilterBar
            granularity={granularity} setGranularity={setGranularity}
            weekValue={weekValue} setWeekValue={setWeekValue}
            monthValue={monthValue} setMonthValue={setMonthValue}
            year={year} setYear={setYear}
            availableYears={availableYears}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '18px' }}>
        <div style={{ padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--border)', borderLeft: '4px solid var(--red)', background: isDarkMode ? '#1a0e14' : '#fef2f2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase' }}>
            <AlertTriangle size={14} /> Machine la plus en panne
          </div>
          {mostBrokenDown ? (
            <>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }}>{mostBrokenDown.name} ({mostBrokenDown.code})</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{mostBrokenDown.panneCount} panne(s) sur la période · {mostBrokenDown.category}</div>
            </>
          ) : (
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>Aucune panne sur cette période.</div>
          )}
        </div>

        <div style={{ padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--border)', borderLeft: '4px solid var(--green)', background: isDarkMode ? '#0c1f16' : '#ecfdf5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase' }}>
            <Trophy size={14} /> Machine la plus efficace
          </div>
          {mostEfficient ? (
            <>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }}>{mostEfficient.name} ({mostEfficient.code})</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                {fmt(mostEfficient.dispo, '%')} de disponibilité · {mostEfficient.panneCount} panne(s) · {mostEfficient.category}
              </div>
            </>
          ) : (
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>Aucune donnée sur cette période.</div>
          )}
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Machine</th>
              <th>Catégorie</th>
              {COLUMNS.map((c) => (
                <th key={c.key} style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort(c.key)}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {c.label} <ArrowUpDown size={11} style={{ opacity: sortKey === c.key ? 1 : 0.35 }} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: '20px' }}>Aucun équipement à afficher.</td></tr>
            ) : sorted.map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 700 }}>{r.code} — {r.name}</td>
                <td>{r.category}</td>
                <td style={{ fontWeight: 700, color: r.panneCount > 0 ? 'var(--red)' : 'var(--muted)' }}>{r.panneCount}</td>
                <td>{fmt(r.mtbf, ' h')}</td>
                <td>{fmt(r.mttr, ' h', 2)}</td>
                <td style={{ fontWeight: 700, color: 'var(--green)' }}>{fmt(r.dispo, '%')}</td>
                <td>{fmt(r.trc, '%')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
