import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

const AXES = [
  { key: 'dispo', label: 'Disponibilité' },
  { key: 'trc', label: 'TRC' },
  { key: 'preventiveRatio', label: 'Préventif' },
  { key: 'woCompletionRate', label: 'Clôture WO' }
];

const SERIES_COLORS = ['var(--orange)', 'var(--green)', 'var(--blue)', 'var(--red)', '#a78bfa', '#f472b6'];

/**
 * Radar de performance par catégorie de machines, sur 4 axes réels (tous déjà
 * en %) : Disponibilité, TRC, Ratio Préventif, Taux de clôture des Work Orders.
 * `data` = sortie de calculateCategoryPerformanceRadar (déjà réelle, pas de
 * normalisation fictive).
 */
export default function CategoryRadarChart({ data = [] }) {
  const { isDarkMode } = useTheme();
  const series = data.slice(0, 6);

  const size = 340, center = size / 2, maxR = size / 2 - 64;
  const angleStep = (2 * Math.PI) / AXES.length;

  const pointFor = (axisIndex, value) => {
    const angle = -Math.PI / 2 + axisIndex * angleStep;
    const r = (Math.max(0, Math.min(100, value)) / 100) * maxR;
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
  };

  const labelPointFor = (axisIndex) => {
    const angle = -Math.PI / 2 + axisIndex * angleStep;
    const r = maxR + 24;
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
  };

  const axisColor = isDarkMode ? '#2a4a72' : '#cbd5e1';
  const textColor = isDarkMode ? '#93a5c4' : '#64748b';
  const gridLevels = [20, 40, 60, 80, 100];

  if (series.length === 0) {
    return <div style={{ padding: '30px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>Aucune catégorie de machines à comparer.</div>;
  }

  return (
    <div>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', maxWidth: '420px', height: 'auto', display: 'block', margin: '0 auto', overflow: 'visible' }}>
        {gridLevels.map((lvl) => (
          <polygon
            key={lvl}
            points={AXES.map((_, i) => pointFor(i, lvl).join(',')).join(' ')}
            fill="none"
            stroke={axisColor}
            strokeWidth="1"
          />
        ))}

        {AXES.map((axis, i) => {
          const [x, y] = pointFor(i, 100);
          return <line key={axis.key} x1={center} y1={center} x2={x} y2={y} stroke={axisColor} strokeWidth="1" />;
        })}

        {AXES.map((axis, i) => {
          const [x, y] = labelPointFor(i);
          return (
            <text key={axis.key} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="700" fill={textColor}>
              {axis.label}
            </text>
          );
        })}

        {series.map((s, si) => {
          const color = SERIES_COLORS[si % SERIES_COLORS.length];
          const pts = AXES.map((axis, i) => pointFor(i, s[axis.key] ?? 0).join(',')).join(' ');
          return (
            <g key={s.category}>
              <polygon points={pts} fill={color} fillOpacity="0.14" stroke={color} strokeWidth="2" />
              {AXES.map((axis, i) => {
                const [x, y] = pointFor(i, s[axis.key] ?? 0);
                return (
                  <circle key={axis.key} cx={x} cy={y} r="3.5" fill={color}>
                    <title>{`${s.category} — ${axis.label} : ${s[axis.key]}%`}</title>
                  </circle>
                );
              })}
            </g>
          );
        })}
      </svg>

      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '12px' }}>
        {series.map((s, si) => (
          <span key={s.category} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text)' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: SERIES_COLORS[si % SERIES_COLORS.length], display: 'inline-block' }} />
            {s.category} <span style={{ color: 'var(--muted)' }}>({s.machineCount})</span>
          </span>
        ))}
      </div>
    </div>
  );
}
