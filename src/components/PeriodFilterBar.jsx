import React from 'react';
import { Calendar } from 'lucide-react';
import { getIsoWeek } from '../utils/kpiCalculations.js';

export function getCurrentWeekValue() {
  const now = new Date();
  return `${now.getFullYear()}-W${String(getIsoWeek(now)).padStart(2, '0')}`;
}

export function getCurrentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

const GRANULARITY_LABELS = { week: 'Semaine', month: 'Mois', year: 'Année', all: 'Tout' };

/**
 * Sélecteur de période réutilisable (Semaine / Mois / Année / Tout), avec les
 * champs natifs adaptés (input week/month, ou liste d'années). Utilisé par les
 * classements de machines et de types de pannes récurrents.
 */
export default function PeriodFilterBar({
  granularity, setGranularity,
  weekValue, setWeekValue,
  monthValue, setMonthValue,
  year, setYear,
  availableYears = []
}) {
  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '2px', padding: '3px', borderRadius: '8px', background: 'var(--hover-bg)', border: '1px solid var(--border)' }}>
        {['week', 'month', 'year', 'all'].map((g) => (
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
            {GRANULARITY_LABELS[g]}
          </button>
        ))}
      </div>

      {granularity === 'week' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Calendar size={13} style={{ color: 'var(--orange)' }} />
          <input
            type="week"
            value={weekValue}
            onChange={(e) => setWeekValue(e.target.value)}
            style={{ fontSize: '11px', padding: '3px 6px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)' }}
          />
        </div>
      )}

      {granularity === 'month' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Calendar size={13} style={{ color: 'var(--orange)' }} />
          <input
            type="month"
            value={monthValue}
            onChange={(e) => setMonthValue(e.target.value)}
            style={{ fontSize: '11px', padding: '3px 6px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)' }}
          />
        </div>
      )}

      {granularity === 'year' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Calendar size={13} style={{ color: 'var(--orange)' }} />
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            style={{ fontSize: '11px', padding: '3px 6px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)' }}
          >
            {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}
