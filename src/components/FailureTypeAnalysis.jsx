import React, { useMemo, useState } from 'react';
import { Repeat } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { calculateFailureTypeRanking, getPeriodRange, getAvailableYears } from '../utils/kpiCalculations.js';
import PeriodFilterBar, { getCurrentWeekValue, getCurrentMonthValue } from './PeriodFilterBar.jsx';

/**
 * Classement réel des types de pannes les plus récurrents sur une période choisie
 * (semaine/mois/année/tout), avec la machine la plus touchée par chaque type —
 * filtrable par machine et/ou catégorie de machines.
 */
export default function FailureTypeAnalysis({ equipments = [], pannes = [] }) {
  const { isDarkMode } = useTheme();
  const [granularity, setGranularity] = useState('month');
  const [weekValue, setWeekValue] = useState(getCurrentWeekValue());
  const [monthValue, setMonthValue] = useState(getCurrentMonthValue());
  const [year, setYear] = useState(new Date().getFullYear());
  const [category, setCategory] = useState('all');
  const [equipmentId, setEquipmentId] = useState('all');

  const availableYears = useMemo(() => getAvailableYears(pannes), [pannes]);
  const categories = useMemo(() => Array.from(new Set(equipments.map((e) => e.category).filter(Boolean))), [equipments]);

  const { from, to } = useMemo(
    () => getPeriodRange({ granularity, weekValue, monthValue, year }),
    [granularity, weekValue, monthValue, year]
  );

  const ranking = useMemo(
    () => calculateFailureTypeRanking(pannes, { from, to, equipmentId, category }),
    [pannes, from, to, equipmentId, category]
  );

  const topType = ranking[0] || null;

  return (
    <div className="performance-card" style={{ padding: '20px', background: isDarkMode ? '#07182e' : '#fff', border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '20px' }} id="failure-type-analysis">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <strong style={{ fontSize: '14px', color: 'var(--text)' }}>Types de Pannes les Plus Récurrents</strong>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={category} onChange={(e) => { setCategory(e.target.value); setEquipmentId('all'); }} className="filter-select" style={{ fontSize: '11px' }}>
            <option value="all">Toutes catégories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)} className="filter-select" style={{ fontSize: '11px' }}>
            <option value="all">Toutes les machines</option>
            {equipments
              .filter((e) => category === 'all' || e.category === category)
              .map((e) => <option key={e.id} value={e.id}>{e.code} — {e.name}</option>)}
          </select>
          <PeriodFilterBar
            granularity={granularity} setGranularity={setGranularity}
            weekValue={weekValue} setWeekValue={setWeekValue}
            monthValue={monthValue} setMonthValue={setMonthValue}
            year={year} setYear={setYear}
            availableYears={availableYears}
          />
        </div>
      </div>

      <div style={{
        padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border)', borderLeft: '4px solid var(--orange)',
        background: isDarkMode ? '#1a1206' : '#fff7ed', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px'
      }}>
        <Repeat size={16} color="var(--orange)" />
        {topType ? (
          <span style={{ fontSize: '13px', color: 'var(--text)' }}>
            La panne la plus récurrente est <strong>{topType.type}</strong> ({topType.count} occurrence(s), {topType.percent}% du total)
            — principalement sur <strong>{topType.topEquipment}</strong> ({topType.topEquipmentCount} fois).
          </span>
        ) : (
          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Aucune panne sur cette période / ce périmètre.</span>
        )}
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Type de panne</th>
              <th>Occurrences</th>
              <th>% du total</th>
              <th>Machine la plus touchée</th>
            </tr>
          </thead>
          <tbody>
            {ranking.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)', padding: '20px' }}>Aucune panne sur cette période / ce périmètre.</td></tr>
            ) : ranking.slice(0, 10).map((t) => (
              <tr key={t.type}>
                <td style={{ fontWeight: 700 }}>{t.type}</td>
                <td style={{ fontWeight: 700, color: 'var(--orange)' }}>{t.count}</td>
                <td>{t.percent}%</td>
                <td>{t.topEquipment} <span style={{ color: 'var(--muted)' }}>({t.topEquipmentCount})</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {ranking.length > 10 && (
          <div style={{ padding: '8px', color: 'var(--muted)', fontSize: '11px' }}>... et {ranking.length - 10} autre(s) type(s) de panne.</div>
        )}
      </div>
    </div>
  );
}
