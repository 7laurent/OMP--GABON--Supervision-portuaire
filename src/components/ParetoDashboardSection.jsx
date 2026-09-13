import React, { useMemo, useState } from 'react';
import ParetoChart from './ParetoChart.jsx';
import { calculateFailureTypeRanking, calculateEquipmentRanking } from '../utils/kpiCalculations.js';

/**
 * Widget Pareto pour le Dashboard : un sélecteur Pannes / Équipements pour ne
 * pas surcharger la page avec les deux schémas en permanence.
 */
export default function ParetoDashboardSection({ equipments = [], pannes = [], workOrders = [] }) {
  const [view, setView] = useState('pannes');

  const pannesItems = useMemo(
    () => calculateFailureTypeRanking(pannes, {}).map((t) => ({ label: t.type, value: t.count })),
    [pannes]
  );
  const equipmentItems = useMemo(
    () => calculateEquipmentRanking(equipments, pannes, workOrders, {}).map((r) => ({ label: `${r.code} — ${r.name}`, value: r.panneCount })),
    [equipments, pannes, workOrders]
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <div style={{ display: 'flex', gap: '2px', padding: '3px', borderRadius: '8px', background: 'var(--hover-bg)', border: '1px solid var(--border)' }}>
          {['pannes', 'equipements'].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              style={{
                padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, border: 'none', cursor: 'pointer',
                backgroundColor: view === v ? 'var(--orange)' : 'transparent',
                color: view === v ? '#ffffff' : 'var(--text)'
              }}
            >
              {v === 'pannes' ? 'Pareto Pannes' : 'Pareto Équipements'}
            </button>
          ))}
        </div>
      </div>

      {view === 'pannes' ? (
        <ParetoChart items={pannesItems} title="Pareto des Pannes — Types les Plus Fréquents (Loi des 80/20)" valueLabel="Occurrences" />
      ) : (
        <ParetoChart items={equipmentItems} title="Pareto des Équipements — Machines les Plus en Panne (Loi des 80/20)" valueLabel="Pannes" />
      )}
    </div>
  );
}
