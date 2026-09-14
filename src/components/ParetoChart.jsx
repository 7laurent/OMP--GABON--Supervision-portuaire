import React, { useMemo, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { buildPareto } from '../utils/kpiCalculations.js';
import { smoothPath } from '../utils/chartHelpers.js';

function computeGridLevels(maxVal) {
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal || 1)));
  const niceMax = Math.max(magnitude, Math.ceil((maxVal || 1) / magnitude) * magnitude);
  return [0, 1, 2, 3, 4, 5].map((i) => Number(((niceMax * i) / 5).toFixed(1)));
}

const ABC_COLOR = { A: 'var(--red)', B: 'var(--orange)', C: 'var(--muted)' };

/**
 * Diagramme de Pareto générique (loi des 80/20) : barres triées par valeur
 * décroissante + courbe du cumul en %, plus un tableau explicatif détaillé avec
 * classement ABC (A = jusqu'à 80% cumulé, B = 80-95%, C = 95-100%).
 * `items` = [{label, value}], calculé en amont depuis les vraies données
 * (pannes par type, machines par nombre de pannes, pièces par valeur de stock...).
 * `showChart=false` n'affiche que le tableau (demandé pour les pièces).
 */
export default function ParetoChart({ items = [], title, valueLabel = 'Valeur', unit = '', showChart = true, showTable = true, maxChartItems = 10, embedded = false }) {
  const { isDarkMode } = useTheme();
  const [activePoint, setActivePoint] = useState(null);
  const pareto = useMemo(() => buildPareto(items), [items]);

  const chartData = useMemo(() => {
    if (pareto.length <= maxChartItems) return pareto;
    const top = pareto.slice(0, maxChartItems - 1);
    const rest = pareto.slice(maxChartItems - 1);
    const restValue = Number(rest.reduce((s, r) => s + r.value, 0).toFixed(2));
    return [...top, { label: `Autres (${rest.length})`, value: restValue, percent: Number(rest.reduce((s, r) => s + r.percent, 0).toFixed(1)), cumulativePercent: 100, abcClass: 'C' }];
  }, [pareto, maxChartItems]);

  const vitalFew = pareto.filter((p) => p.abcClass === 'A');
  const insight = pareto.length > 0
    ? `${vitalFew.length} élément(s) sur ${pareto.length} (${Number(((vitalFew.length / pareto.length) * 100).toFixed(0))}%) représentent 80% du total.`
    : null;

  const maxValue = Math.max(1, ...chartData.map((d) => d.value));
  const gridLevels = computeGridLevels(maxValue);
  const axisMax = gridLevels[gridLevels.length - 1] || 1;

  const W = 780, H = 300, padL = 46, padR = 46, padT = 20, padB = 84;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const n = chartData.length;
  const bandWidth = n > 0 ? plotW / n : plotW;
  const barWidth = Math.min(38, bandWidth * 0.55);
  const scaleX = (i) => padL + i * bandWidth + bandWidth / 2;
  const scaleYLeft = (v) => padT + plotH - (Math.max(0, Math.min(axisMax, v)) / axisMax) * plotH;
  const scaleYRight = (p) => padT + plotH - (Math.max(0, Math.min(100, p)) / 100) * plotH;

  const axisColor = isDarkMode ? '#2a4a72' : '#cbd5e1';
  const textColor = isDarkMode ? '#93a5c4' : '#64748b';

  return (
    <div
      className={embedded ? '' : 'performance-card'}
      style={embedded
        ? { marginBottom: '16px' }
        : { padding: '20px', background: isDarkMode ? '#07182e' : '#fff', border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '20px' }}
    >
      {title && <strong style={{ fontSize: '14px', color: 'var(--text)' }}>{title}</strong>}

      {insight && (
        <div style={{
          marginTop: '10px', marginBottom: showChart ? '4px' : '14px', padding: '10px 14px', borderRadius: '8px',
          border: '1px solid var(--border)', borderLeft: '4px solid var(--red)', background: isDarkMode ? '#1a0e14' : '#fef2f2',
          display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', color: 'var(--text)'
        }}>
          <TrendingUp size={14} color="var(--red)" style={{ flexShrink: 0 }} />
          <span><strong>Loi de Pareto :</strong> {insight}</span>
        </div>
      )}

      {showChart && (
        pareto.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>Aucune donnée à analyser.</div>
        ) : (
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible', marginTop: '10px' }}>
            {gridLevels.map((lvl) => (
              <g key={lvl}>
                <line x1={padL} y1={scaleYLeft(lvl)} x2={W - padR} y2={scaleYLeft(lvl)} stroke={axisColor} strokeWidth="1" />
                <text x={padL - 6} y={scaleYLeft(lvl) + 3} textAnchor="end" fontSize="9" fill={textColor}>{lvl}</text>
              </g>
            ))}
            {[0, 25, 50, 80, 100].map((p) => (
              <text key={p} x={W - padR + 6} y={scaleYRight(p) + 3} textAnchor="start" fontSize="9" fill={p === 80 ? 'var(--red)' : textColor}>{p}%</text>
            ))}
            <line x1={padL} y1={scaleYRight(80)} x2={W - padR} y2={scaleYRight(80)} stroke="var(--red)" strokeWidth="1.3" strokeDasharray="5 3" />

            {chartData.map((d, i) => (
              <rect
                key={`bar-${d.label}`} x={scaleX(i) - barWidth / 2} y={scaleYLeft(d.value)} width={barWidth}
                height={Math.max(0, scaleYLeft(0) - scaleYLeft(d.value))} fill={ABC_COLOR[d.abcClass] || 'var(--orange)'} rx="2"
                style={{ cursor: 'pointer', opacity: activePoint?.label === d.label ? 1 : 0.92, transition: 'opacity 0.15s ease' }}
                onClick={() => setActivePoint((cur) => (cur?.label === d.label ? null : d))}
              >
                <title>{`${d.label} : ${d.value}${unit} (${d.percent}%)`}</title>
              </rect>
            ))}

            <path
              d={smoothPath(chartData.map((d, i) => [scaleX(i), scaleYRight(d.cumulativePercent)]))}
              fill="none" stroke={isDarkMode ? '#a78bfa' : '#7c3aed'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
            {chartData.map((d, i) => (
              <circle
                key={`pt-${d.label}`} cx={scaleX(i)} cy={scaleYRight(d.cumulativePercent)}
                r={activePoint?.label === d.label ? 5 : 3.5} fill={isDarkMode ? '#a78bfa' : '#7c3aed'}
                style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                onClick={() => setActivePoint((cur) => (cur?.label === d.label ? null : d))}
              >
                <title>{`Cumulé : ${d.cumulativePercent}%`}</title>
              </circle>
            ))}

            {chartData.map((d, i) => (
              <text
                key={`lbl-${d.label}`}
                x={scaleX(i)} y={H - padB + 14}
                textAnchor="end" fontSize="9" fill={textColor}
                transform={`rotate(-40 ${scaleX(i)} ${H - padB + 14})`}
              >
                {d.label}
              </text>
            ))}

            {activePoint && (() => {
              const idx = chartData.findIndex((d) => d.label === activePoint.label);
              if (idx === -1) return null;
              const boxW = 148, boxH = 64;
              const px = Math.min(Math.max(scaleX(idx) - boxW / 2, 2), W - boxW - 2);
              const py = Math.max(Math.min(scaleYLeft(activePoint.value), scaleYRight(activePoint.cumulativePercent)) - boxH - 12, 2);
              return (
                <foreignObject x={px} y={py} width={boxW} height={boxH} style={{ overflow: 'visible' }}>
                  <div style={{
                    background: isDarkMode ? '#0d223c' : '#ffffff', border: `1.5px solid ${ABC_COLOR[activePoint.abcClass] || 'var(--orange)'}`,
                    borderRadius: '8px', padding: '6px 9px', boxShadow: '0 6px 18px rgba(0,0,0,0.28)', fontSize: '10px', color: 'var(--text)', position: 'relative'
                  }}>
                    <button
                      type="button"
                      onClick={() => setActivePoint(null)}
                      style={{ position: 'absolute', top: '2px', right: '4px', border: 'none', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontSize: '11px', lineHeight: 1, padding: 0 }}
                    >
                      ×
                    </button>
                    <div style={{ fontWeight: 700, marginBottom: '2px' }}>{activePoint.label}</div>
                    <div style={{ fontWeight: 800, fontSize: '13px' }}>{typeof activePoint.value === 'number' ? activePoint.value.toLocaleString() : activePoint.value}{unit} <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--muted)' }}>({activePoint.percent}%)</span></div>
                    <div style={{ color: 'var(--muted)', marginTop: '2px' }}>Cumulé : {activePoint.cumulativePercent}% · Classe {activePoint.abcClass}</div>
                  </div>
                </foreignObject>
              );
            })()}
          </svg>
        )
      )}

      {showChart && pareto.length > 0 && (
        <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '11px', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '12px', height: '12px', background: 'var(--red)', borderRadius: '2px', display: 'inline-block' }} /> Classe A (vital few)</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '12px', height: '12px', background: 'var(--orange)', borderRadius: '2px', display: 'inline-block' }} /> Classe B</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '12px', height: '12px', background: 'var(--muted)', borderRadius: '2px', display: 'inline-block' }} /> Classe C</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '14px', height: '0', borderTop: '2px solid #7c3aed', display: 'inline-block' }} /> % Cumulé</span>
        </div>
      )}

      {showTable && (
        <div className="table-wrapper" style={{ marginTop: '16px' }}>
          <table>
            <thead>
              <tr>
                <th>Rang</th>
                <th>Élément</th>
                <th>{valueLabel}</th>
                <th>% du total</th>
                <th>% Cumulé</th>
                <th>Classe ABC</th>
              </tr>
            </thead>
            <tbody>
              {pareto.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: '20px' }}>Aucune donnée à analyser.</td></tr>
              ) : pareto.map((p) => (
                <tr key={p.label}>
                  <td>{p.rank}</td>
                  <td style={{ fontWeight: 700 }}>{p.label}</td>
                  <td style={{ fontWeight: 700, color: 'var(--orange)' }}>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}{unit}</td>
                  <td>{p.percent}%</td>
                  <td>{p.cumulativePercent}%</td>
                  <td>
                    <span className={`status-badge ${p.abcClass === 'A' ? 'status-late' : p.abcClass === 'B' ? 'status-progress' : 'status-info'}`}>
                      {p.abcClass}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
