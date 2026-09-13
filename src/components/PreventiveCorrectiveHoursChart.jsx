import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

function computeGridLevels(maxVal) {
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal || 1)));
  const niceMax = Math.max(magnitude, Math.ceil((maxVal || 1) / magnitude) * magnitude);
  return [0, 1, 2, 3, 4, 5].map((i) => Number(((niceMax * i) / 5).toFixed(1)));
}

/**
 * Schéma (barres groupées) + tableau du ratio horaire réel Correctif vs Préventif,
 * période par période. Composant purement présentationnel — reçoit une série déjà
 * calculée par calculatePreventiveCorrectiveRatioSeries (partagée avec
 * TemporalAnalyticsSection pour éviter deux implémentations divergentes).
 */
export default function PreventiveCorrectiveHoursChart({ series = [], granularityLabel = 'Mois' }) {
  const { isDarkMode } = useTheme();
  const visible = series.slice(-12);
  const maxHours = Math.max(1, ...visible.map((b) => Math.max(b.preventiveHours, b.correctiveHours)));
  const gridLevels = computeGridLevels(maxHours);
  const axisMax = gridLevels[gridLevels.length - 1] || 1;

  const W = 780, H = 260, padL = 42, padR = 16, padT = 16, padB = 40;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const n = visible.length;
  const groupWidth = n > 0 ? plotW / n : plotW;
  const barWidth = Math.min(22, groupWidth * 0.32);
  const scaleY = (v) => padT + plotH - (Math.max(0, Math.min(axisMax, v)) / axisMax) * plotH;

  const axisColor = isDarkMode ? '#2a4a72' : '#cbd5e1';
  const textColor = isDarkMode ? '#93a5c4' : '#64748b';

  const totalPreventive = Number(series.reduce((s, b) => s + b.preventiveHours, 0).toFixed(1));
  const totalCorrective = Number(series.reduce((s, b) => s + b.correctiveHours, 0).toFixed(1));
  const totalHours = Number((totalPreventive + totalCorrective).toFixed(1));
  const preventivePercent = totalHours > 0 ? Number(((totalPreventive / totalHours) * 100).toFixed(1)) : 0;
  const correctivePercent = totalHours > 0 ? Number(((totalCorrective / totalHours) * 100).toFixed(1)) : 0;

  const last14 = series.slice(-14);

  return (
    <div className="performance-card" style={{ padding: '20px', background: isDarkMode ? '#07182e' : '#fff', border: '1px solid var(--border)', borderRadius: '12px' }} id="preventive-corrective-hours-chart">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <strong style={{ fontSize: '14px', color: 'var(--text)' }}>Ratio Horaire Correctif / Préventif par {granularityLabel}</strong>
        <div style={{ display: 'flex', gap: '14px', fontSize: '11px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '12px', height: '12px', background: 'var(--green)', borderRadius: '2px', display: 'inline-block' }} /> Préventif</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '12px', height: '12px', background: 'var(--blue)', borderRadius: '2px', display: 'inline-block' }} /> Correctif</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', margin: '14px 0 16px' }}>
        <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'var(--hover-bg)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>Heures Préventif</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--green)' }}>{totalPreventive} h <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)' }}>({preventivePercent}%)</span></div>
        </div>
        <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'var(--hover-bg)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>Heures Correctif</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--blue)' }}>{totalCorrective} h <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)' }}>({correctivePercent}%)</span></div>
        </div>
        <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'var(--hover-bg)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>Total Heures</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>{totalHours} h</div>
        </div>
      </div>

      {visible.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>Aucun Work Order sur cette période.</div>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
          {gridLevels.map((lvl) => (
            <g key={lvl}>
              <line x1={padL} y1={scaleY(lvl)} x2={W - padR} y2={scaleY(lvl)} stroke={axisColor} strokeWidth="1" />
              <text x={padL - 6} y={scaleY(lvl) + 3} textAnchor="end" fontSize="9" fill={textColor}>{lvl}</text>
            </g>
          ))}
          {visible.map((b, i) => {
            const groupX = padL + i * groupWidth + groupWidth / 2;
            const xPrev = groupX - barWidth - 2;
            const xCorr = groupX + 2;
            return (
              <g key={b.key}>
                <rect x={xPrev} y={scaleY(b.preventiveHours)} width={barWidth} height={Math.max(0, scaleY(0) - scaleY(b.preventiveHours))} fill="var(--green)" rx="2">
                  <title>{`${b.label} — Préventif : ${b.preventiveHours} h (${b.preventiveCount} WO)`}</title>
                </rect>
                <rect x={xCorr} y={scaleY(b.correctiveHours)} width={barWidth} height={Math.max(0, scaleY(0) - scaleY(b.correctiveHours))} fill="var(--blue)" rx="2">
                  <title>{`${b.label} — Correctif : ${b.correctiveHours} h (${b.correctiveCount} WO)`}</title>
                </rect>
                <text x={groupX} y={H - padB + 16} textAnchor="middle" fontSize="9" fill={textColor}>{b.label}</text>
              </g>
            );
          })}
        </svg>
      )}

      <div className="table-wrapper" style={{ marginTop: '16px' }}>
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
            {series.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--muted)', padding: '20px' }}>Aucun Work Order sur cette période.</td></tr>
            ) : last14.slice().reverse().map((b) => (
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
            {series.length > 0 && (
              <tr style={{ borderTop: '2px solid var(--border)' }}>
                <td style={{ fontWeight: 800 }}>Total période affichée</td>
                <td style={{ fontWeight: 800 }}>{last14.reduce((s, b) => s + b.preventiveCount, 0)}</td>
                <td style={{ fontWeight: 800, color: 'var(--green)' }}>{Number(last14.reduce((s, b) => s + b.preventiveHours, 0).toFixed(1))} h</td>
                <td style={{ fontWeight: 800 }}>{last14.reduce((s, b) => s + b.correctiveCount, 0)}</td>
                <td style={{ fontWeight: 800, color: 'var(--blue)' }}>{Number(last14.reduce((s, b) => s + b.correctiveHours, 0).toFixed(1))} h</td>
                <td style={{ fontWeight: 800 }}>{Number(last14.reduce((s, b) => s + b.preventiveHours + b.correctiveHours, 0).toFixed(1))} h</td>
                <td colSpan={2} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
