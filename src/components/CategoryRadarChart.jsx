import React, { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

const AXES = [
  { key: 'dispo', label: 'Disponibilité', unit: '%' },
  { key: 'trc', label: 'TRC', unit: '%' },
  { key: 'mtbf', label: 'MTBF', unit: ' h', normalized: true, higherIsBetter: true },
  { key: 'mttr', label: 'MTTR', unit: ' h', normalized: true, higherIsBetter: false },
  { key: 'preventiveRatio', label: 'Préventif', unit: '%' },
  { key: 'correctiveRatio', label: 'Correctif', unit: '%' },
  { key: 'woCompletionRate', label: 'Clôture WO', unit: '%' }
];

const SERIES_COLORS = ['var(--orange)', 'var(--green)', 'var(--blue)', 'var(--red)', '#a78bfa', '#f472b6'];

/**
 * Radar de performance par catégorie de machines, sur tous les KPI réels :
 * Disponibilité, TRC, MTBF, MTTR, Ratio Préventif, Ratio Correctif, Taux de
 * clôture des Work Orders. MTBF/MTTR ne sont pas des %, donc positionnés sur
 * l'axe via une normalisation RELATIVE (min-max) entre les catégories comparées
 * plutôt qu'une échelle fixe inventée — les valeurs réelles restent affichées
 * dans l'infobulle/le tableau, seule la position sur l'axe est mise à l'échelle.
 * `data` = sortie de calculateCategoryPerformanceRadar.
 */
export default function CategoryRadarChart({ data = [] }) {
  const { isDarkMode } = useTheme();
  const series = data.slice(0, 6);

  const ranges = useMemo(() => {
    const r = {};
    AXES.forEach((axis) => {
      if (!axis.normalized) return;
      const vals = series.map((s) => s[axis.key]).filter((v) => v !== null && v !== undefined);
      r[axis.key] = vals.length ? { min: Math.min(...vals), max: Math.max(...vals) } : null;
    });
    return r;
  }, [series]);

  const axisScore = (s, axis) => {
    const raw = s[axis.key];
    if (raw === null || raw === undefined) return 0;
    if (!axis.normalized) return raw;
    const range = ranges[axis.key];
    if (!range || range.max === range.min) return 60;
    const t = (raw - range.min) / (range.max - range.min);
    return (axis.higherIsBetter ? t : 1 - t) * 100;
  };

  const size = 360, center = size / 2, maxR = size / 2 - 70;
  const angleStep = (2 * Math.PI) / AXES.length;

  const pointFor = (axisIndex, score) => {
    const angle = -Math.PI / 2 + axisIndex * angleStep;
    const r = (Math.max(0, Math.min(100, score)) / 100) * maxR;
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
  };

  const labelPointFor = (axisIndex) => {
    const angle = -Math.PI / 2 + axisIndex * angleStep;
    const r = maxR + 26;
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
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', maxWidth: '460px', height: 'auto', display: 'block', margin: '0 auto', overflow: 'visible' }}>
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
              {axis.label}{axis.normalized ? ' *' : ''}
            </text>
          );
        })}

        {series.map((s, si) => {
          const color = SERIES_COLORS[si % SERIES_COLORS.length];
          const pts = AXES.map((axis, i) => pointFor(i, axisScore(s, axis)).join(',')).join(' ');
          return (
            <g key={s.category}>
              <polygon points={pts} fill={color} fillOpacity="0.14" stroke={color} strokeWidth="2" />
              {AXES.map((axis, i) => {
                const [x, y] = pointFor(i, axisScore(s, axis));
                const raw = s[axis.key];
                const rawLabel = raw === null || raw === undefined ? '—' : `${raw}${axis.unit}`;
                return (
                  <circle key={axis.key} cx={x} cy={y} r="3.5" fill={color}>
                    <title>{`${s.category} — ${axis.label} : ${rawLabel}`}</title>
                  </circle>
                );
              })}
            </g>
          );
        })}
      </svg>

      <p style={{ fontSize: '10px', color: 'var(--muted)', textAlign: 'center', margin: '4px 0 0' }}>
        * MTBF/MTTR positionnés en relatif entre les catégories affichées (survolez un point pour la valeur réelle en heures).
      </p>

      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
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
