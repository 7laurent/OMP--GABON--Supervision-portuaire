import React, { useMemo, useState } from 'react';
import { calculatePreventiveCorrectiveRatioSeries } from '../utils/kpiCalculations.js';
import PreventiveCorrectiveHoursChart from './PreventiveCorrectiveHoursChart.jsx';

/**
 * Version autonome (avec ses propres filtres) du ratio horaire Correctif/Préventif,
 * affichée directement sur la page Pannes plutôt que cachée dans une modale.
 */
export default function PreventiveCorrectiveHoursSection({ equipments = [], workOrders = [] }) {
  const [granularity, setGranularity] = useState('month');
  const [category, setCategory] = useState('all');

  const categories = useMemo(() => Array.from(new Set(equipments.map((e) => e.category).filter(Boolean))), [equipments]);

  const series = useMemo(
    () => calculatePreventiveCorrectiveRatioSeries(workOrders, { granularity, category }),
    [workOrders, granularity, category]
  );

  const granularityLabel = granularity === 'day' ? 'Jour' : granularity === 'week' ? 'Semaine' : 'Mois';

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
        {categories.length > 0 && (
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="filter-select" style={{ fontSize: '11px' }}>
            <option value="all">Toutes catégories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
        <div style={{ display: 'flex', gap: '2px', padding: '3px', borderRadius: '8px', background: 'var(--hover-bg)', border: '1px solid var(--border)' }}>
          {['day', 'week', 'month'].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGranularity(g)}
              style={{
                padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, border: 'none', cursor: 'pointer',
                backgroundColor: granularity === g ? 'var(--orange)' : 'transparent',
                color: granularity === g ? '#ffffff' : 'var(--text)'
              }}
            >
              {g === 'day' ? 'Jour' : g === 'week' ? 'Semaine' : 'Mois'}
            </button>
          ))}
        </div>
      </div>

      <PreventiveCorrectiveHoursChart series={series} granularityLabel={granularityLabel} />
    </div>
  );
}
