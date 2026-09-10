import React from 'react';
import { X, Maximize2 } from 'lucide-react';

export default function ZoomModal({ onClose }) {
  const months = ['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
  const data = [
    { prev: 42, corr: 12 },
    { prev: 38, corr: 18 },
    { prev: 45, corr: 14 },
    { prev: 50, corr: 9 },
    { prev: 48, corr: 11 },
    { prev: 52, corr: 8 },
    { prev: 47, corr: 13 },
    { prev: 55, corr: 7 },
    { prev: 51, corr: 10 },
    { prev: 58, corr: 6 },
    { prev: 54, corr: 9 },
    { prev: 60, corr: 5 }
  ];

  return (
    <div className="modal-overlay" onClick={onClose} id="chart-zoom-modal">
      <div className="modal-box large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Maximize2 size={20} color="var(--orange)" />
            <div className="modal-title">Vue Détaillée · Performance Annuelle de Maintenance</div>
          </div>
          <button type="button" className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          <div className="chart-header">
            <div className="chart-title">Interventions : Maintenance Préventive vs Corrective</div>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-dot preventive" />
                <span>Préventif (Moyenne : 78%)</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot corrective" />
                <span>Correctif (Moyenne : 22%)</span>
              </div>
            </div>
          </div>

          {/* Histogramme grand format */}
          <div style={{ padding: '20px 10px', background: 'var(--hover-bg)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', height: '260px', gap: '16px', padding: '0 10px' }}>
              {data.map((item, idx) => (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', width: '100%', justifyContent: 'center' }}>
                    <div
                      style={{
                        width: '16px',
                        height: `${item.prev * 3.5}px`,
                        backgroundColor: 'var(--orange)',
                        borderRadius: '4px 4px 0 0'
                      }}
                      title={`Préventif : ${item.prev} interventions`}
                    />
                    <div
                      style={{
                        width: '16px',
                        height: `${item.corr * 3.5}px`,
                        backgroundColor: '#292776',
                        borderRadius: '4px 4px 0 0'
                      }}
                      title={`Correctif : ${item.corr} interventions`}
                    />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '8px' }}>
                    {months[idx]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '10px' }}>
            <div className="kpi-card" style={{ minHeight: 'auto', padding: '16px' }}>
              <span className="kpi-title">Total Interventions 2025</span>
              <div className="kpi-number" style={{ fontSize: '28px' }}>678</div>
              <span className="kpi-caption">+14.2% vs année précédente</span>
            </div>
            <div className="kpi-card" style={{ minHeight: 'auto', padding: '16px' }}>
              <span className="kpi-title">Ratio Préventif Global</span>
              <div className="kpi-number" style={{ fontSize: '28px', color: 'var(--green)' }}>78.4%</div>
              <span className="kpi-caption">Conforme norme AFNOR (&gt;70%)</span>
            </div>
            <div className="kpi-card" style={{ minHeight: 'auto', padding: '16px' }}>
              <span className="kpi-title">Heures de Pannes Évitées</span>
              <div className="kpi-number" style={{ fontSize: '28px', color: 'var(--orange)' }}>412 h</div>
              <span className="kpi-caption">Grâce aux visites préventives</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}
