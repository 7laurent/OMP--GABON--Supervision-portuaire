import React, { useState, useMemo } from 'react';
import { Activity, Clock, Percent, ShieldCheck, Calendar, Maximize2, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { calculateKpiTrendSeries, getAvailableYears } from '../utils/kpiCalculations.js';

const KPI_CONFIGS = {
  dispo: { short: 'DISPO', label: 'Disponibilité', unit: '%', color: 'var(--green)', target: 90, icon: Percent, formula: 'D = MTBF / (MTBF + MTTR) × 100' },
  mtbf: { short: 'MTBF', label: 'MTBF (moyenne)', unit: 'h', color: '#2563eb', target: null, icon: Activity, formula: 'MTBF = Σ TBF / N' },
  mttr: { short: 'MTTR', label: 'MTTR (moyenne)', unit: 'h', color: 'var(--orange)', target: null, icon: Clock, formula: 'MTTR = Σ TTR / N' },
  trc: { short: 'TRC', label: 'TRC (Taux de Réalisation Curative)', unit: '%', color: 'var(--red)', target: 90, icon: ShieldCheck, formula: 'TRC = Pannes résolues / Pannes déclarées × 100' }
};

function computeTrend(known, kpiKey) {
  if (known.length < 2) return null;
  const n = known.length;
  const sumX = known.reduce((s, p) => s + p.i, 0);
  const sumY = known.reduce((s, p) => s + p[kpiKey], 0);
  const sumXY = known.reduce((s, p) => s + p.i * p[kpiKey], 0);
  const sumXX = known.reduce((s, p) => s + p.i * p.i, 0);
  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return null;
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

function computeGridLevels(unit, maxVal) {
  if (unit === '%') return [0, 20, 40, 60, 80, 100];
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal || 1)));
  const niceMax = Math.max(magnitude, Math.ceil((maxVal || 1) / magnitude) * magnitude);
  return [0, 1, 2, 3, 4, 5].map((i) => Number(((niceMax * i) / 5).toFixed(1)));
}

/** Calcule moyenne / tendance / niveaux de grille pour un KPI donné, réutilisé par la
 * mini-carte et par la vue agrandie afin de garder les deux rendus cohérents. */
function useKpiGeometry(series, kpiKey, config) {
  const seriesWithIndex = series.map((p, i) => ({ ...p, i }));
  const known = seriesWithIndex.filter((p) => p.hasData && p[kpiKey] !== null && p[kpiKey] !== undefined);
  const values = known.map((p) => p[kpiKey]);
  const average = values.length ? Number((values.reduce((s, v) => s + v, 0) / values.length).toFixed(1)) : null;
  const trend = computeTrend(known, kpiKey);
  const maxVal = Math.max(1, ...values, config.target || 0);
  const gridLevels = computeGridLevels(config.unit, maxVal);
  const axisMax = gridLevels[gridLevels.length - 1] || 1;
  return { seriesWithIndex, known, average, trend, gridLevels, axisMax };
}

/** Tracé SVG générique pour un KPI, paramétré en taille (mini-carte vs vue agrandie).
 * En granularité "semaine" (jusqu'à 52/53 points), la largeur du graphique s'étire pour
 * garder un espacement lisible entre chaque semaine (S1 à S52 clairement séparées et
 * étiquetées) plutôt que de tout compresser sur une largeur fixe — le graphique devient
 * alors défilable horizontalement dans sa carte. */
function KpiChartSvg({ kpiKey, series, isDarkMode, dims, granularity }) {
  const config = KPI_CONFIGS[kpiKey];
  const { seriesWithIndex, known, average, trend, gridLevels, axisMax } = useKpiGeometry(series, kpiKey, config);

  if (known.length === 0) {
    return (
      <div style={{ padding: dims.compact ? '18px 8px' : '30px', textAlign: 'center', color: 'var(--muted)', fontSize: dims.compact ? '10px' : '13px' }}>
        Aucune donnée pour {config.label}.
      </div>
    );
  }

  const { H, padL, padR, padT, padB, fontAxis, fontPoint, strokeWidth, pointRadius } = dims;
  const n = series.length;
  const isWeekly = granularity === 'week';
  const minSpacing = isWeekly ? (dims.compact ? 15 : 22) : 0;
  const W = isWeekly ? Math.max(dims.W, padL + padR + Math.max(1, n - 1) * minSpacing) : dims.W;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const scaleX = (i) => padL + (n <= 1 ? 0 : (i / (n - 1)) * plotW);
  const scaleY = (v) => padT + plotH - (Math.max(0, Math.min(axisMax, v)) / axisMax) * plotH;

  const segments = [];
  let current = [];
  seriesWithIndex.forEach((p) => {
    const v = p[kpiKey];
    if (p.hasData && v !== null && v !== undefined) {
      current.push(p);
    } else if (current.length) {
      segments.push(current);
      current = [];
    }
  });
  if (current.length) segments.push(current);

  const axisColor = isDarkMode ? '#2a4a72' : '#cbd5e1';
  const textColor = isDarkMode ? '#93a5c4' : '#64748b';

  const chart = (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: isWeekly ? `${W}px` : '100%', height: 'auto', overflow: 'visible', display: 'block' }}>
      {gridLevels.map((lvl) => (
        <g key={lvl}>
          <line x1={padL} y1={scaleY(lvl)} x2={W - padR} y2={scaleY(lvl)} stroke={axisColor} strokeWidth="1" />
          <text x={padL - 6} y={scaleY(lvl) + 3} textAnchor="end" fontSize={fontAxis} fill={textColor}>{lvl}</text>
        </g>
      ))}

      {config.target !== null && (
        <line x1={padL} y1={scaleY(config.target)} x2={W - padR} y2={scaleY(config.target)} stroke="#22c55e" strokeWidth="1.3" strokeDasharray="5 3" />
      )}

      {average !== null && (
        <line x1={padL} y1={scaleY(average)} x2={W - padR} y2={scaleY(average)} stroke="#f59e0b" strokeWidth="1.3" strokeDasharray="5 3" />
      )}

      {trend && n > 1 && (
        <line
          x1={scaleX(0)} y1={scaleY(trend.intercept)}
          x2={scaleX(n - 1)} y2={scaleY(trend.slope * (n - 1) + trend.intercept)}
          stroke="#8b5cf6" strokeWidth="1.3" strokeDasharray="3 3"
        />
      )}

      {/* Chaque segment continu (semaines/mois consécutifs avec données) est relié par sa
          propre petite ligne, pour bien montrer l'évolution pas à pas plutôt qu'une courbe unique. */}
      {segments.map((seg, i) => (
        <polyline
          key={i}
          points={seg.map((p) => `${scaleX(p.i)},${scaleY(p[kpiKey])}`).join(' ')}
          fill="none"
          stroke={config.color}
          strokeWidth={strokeWidth}
        />
      ))}

      {seriesWithIndex.map((p) => (p.hasData && p[kpiKey] !== null && p[kpiKey] !== undefined) ? (
        <g key={p.key}>
          <circle cx={scaleX(p.i)} cy={scaleY(p[kpiKey])} r={pointRadius} fill={config.color}>
            {isWeekly && <title>{`${p.label} : ${p[kpiKey]}${config.unit}`}</title>}
          </circle>
          {!isWeekly && (
            <text x={scaleX(p.i)} y={scaleY(p[kpiKey]) - (pointRadius + 5)} textAnchor="middle" fontSize={fontPoint} fontWeight="700" fill="var(--text)">
              {p[kpiKey]}{config.unit}
            </text>
          )}
        </g>
      ) : null)}

      {seriesWithIndex.map((p) => (
        <text
          key={`lbl-${p.key}`}
          x={scaleX(p.i)}
          y={H - 8}
          textAnchor={isWeekly ? 'end' : 'middle'}
          fontSize={fontAxis}
          fill={textColor}
          transform={isWeekly ? `rotate(-60 ${scaleX(p.i)} ${H - 8})` : undefined}
        >
          {p.label}
        </text>
      ))}
    </svg>
  );

  return isWeekly ? <div style={{ overflowX: 'auto', paddingBottom: '2px' }}>{chart}</div> : chart;
}

function KpiChartLegend({ kpiKey, series }) {
  const config = KPI_CONFIGS[kpiKey];
  const { known, average, trend } = useKpiGeometry(series, kpiKey, config);
  return (
    <div style={{ display: 'flex', gap: '14px', fontSize: '11px', flexWrap: 'wrap', marginBottom: '8px' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span style={{ width: '14px', height: '2px', background: config.color, display: 'inline-block' }} /> {config.short} réel
      </span>
      {average !== null && (
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '14px', height: '0', borderTop: '2px dashed #f59e0b', display: 'inline-block' }} /> Moyenne ({average}{config.unit})
        </span>
      )}
      {config.target !== null && (
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '14px', height: '0', borderTop: '2px dashed #22c55e', display: 'inline-block' }} /> Objectif ({config.target}{config.unit})
        </span>
      )}
      {known.length >= 2 && trend && (
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '14px', height: '0', borderTop: '2px dashed #8b5cf6', display: 'inline-block' }} /> Tendance
        </span>
      )}
    </div>
  );
}

const SMALL_DIMS = { W: 380, H: 190, padL: 34, padR: 10, padT: 16, padB: 26, fontAxis: 8, fontPoint: 9, strokeWidth: 2, pointRadius: 3, compact: true };
const LARGE_DIMS = { W: 760, H: 280, padL: 46, padR: 20, padT: 20, padB: 34, fontAxis: 9, fontPoint: 10, strokeWidth: 2.5, pointRadius: 4, compact: false };

/** Sélecteur de granularité (Semaine/Mois/Année) + année, partagé par les deux modes. */
function PeriodControls({ granularity, setGranularity, year, setYear, availableYears }) {
  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '2px', padding: '3px', borderRadius: '8px', background: 'var(--hover-bg)', border: '1px solid var(--border)' }}>
        {['week', 'month', 'year'].map((g) => (
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
            {g === 'week' ? 'Par semaine' : g === 'month' ? 'Par mois' : 'Par année'}
          </button>
        ))}
      </div>

      {granularity !== 'year' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
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

/**
 * Graphique(s) d'évolution des 4 KPI majeurs (Disponibilité, MTBF, MTTR, TRC), avec
 * granularité Semaine / Mois (année choisie) / Année. Deux modes :
 * - `mode="grid"` (par défaut, utilisé dans le Bilan Global) : les 4 KPI en mini-graphiques
 *   simultanés (deux par deux), chacun agrandissable dans une modale.
 * - `mode="single"` (utilisé dans les KPI individuels d'une machine, pour ne pas surcharger
 *   la fiche) : un seul schéma à la fois, avec un sélecteur pour changer de KPI affiché.
 */
export default function KpiTrendChart({ pannes = [], workOrders = [], equipments = [], equipmentId = 'all', category = 'all', mode = 'grid' }) {
  const { isDarkMode } = useTheme();
  const [granularity, setGranularity] = useState('month');
  const availableYears = useMemo(() => getAvailableYears(pannes), [pannes]);
  const [year, setYear] = useState(availableYears[0]);
  const [expandedKpi, setExpandedKpi] = useState(null);
  const [selectedKpi, setSelectedKpi] = useState('dispo');

  const series = useMemo(
    () => calculateKpiTrendSeries(pannes, workOrders, equipments, { granularity, year, equipmentId, category }),
    [pannes, workOrders, equipments, granularity, year, equipmentId, category]
  );

  const scopeLabel = equipmentId && equipmentId !== 'all' ? 'Machine sélectionnée' : category && category !== 'all' ? `Catégorie : ${category}` : 'Tout le parc';
  const periodLabel = granularity === 'year' ? 'Par année' : granularity === 'week' ? `Par semaine (${year})` : `Par mois (${year})`;
  const expandedConfig = expandedKpi ? KPI_CONFIGS[expandedKpi] : null;
  const ExpandedIcon = expandedConfig ? expandedConfig.icon : null;

  if (mode === 'single') {
    const config = KPI_CONFIGS[selectedKpi];
    return (
      <div className="performance-card" style={{ padding: '20px', background: isDarkMode ? '#07182e' : '#fff', border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '20px' }} id="kpi-trend-chart">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
          <strong style={{ fontSize: '14px', color: 'var(--text)' }}>
            Évolution — {config.label} ({periodLabel})
          </strong>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '2px', padding: '3px', borderRadius: '8px', background: isDarkMode ? '#0d223c' : '#f1f5f9', border: '1px solid var(--border)' }}>
              {Object.entries(KPI_CONFIGS).map(([key, c]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedKpi(key)}
                  style={{
                    padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, border: 'none', cursor: 'pointer',
                    backgroundColor: selectedKpi === key ? c.color : 'transparent',
                    color: selectedKpi === key ? '#ffffff' : 'var(--text)'
                  }}
                >
                  {c.short}
                </button>
              ))}
            </div>
            <PeriodControls granularity={granularity} setGranularity={setGranularity} year={year} setYear={setYear} availableYears={availableYears} />
          </div>
        </div>

        <KpiChartLegend kpiKey={selectedKpi} series={series} />
        <KpiChartSvg kpiKey={selectedKpi} series={series} isDarkMode={isDarkMode} dims={LARGE_DIMS} granularity={granularity} />

        <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border)', fontSize: '11px', fontFamily: 'monospace', marginTop: '12px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
          <span>{config.formula}</span>
          <span style={{ color: 'var(--muted)' }}>Filtre : {scopeLabel}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="performance-card" style={{ padding: '20px', background: isDarkMode ? '#07182e' : '#fff', border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '20px' }} id="kpi-trend-chart">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <strong style={{ fontSize: '14px', color: 'var(--text)' }}>
          Évolution des Indicateurs Clés — Disponibilité / MTBF / MTTR / TRC ({periodLabel})
        </strong>

        <PeriodControls granularity={granularity} setGranularity={setGranularity} year={year} setYear={setYear} availableYears={availableYears} />
      </div>

      {/* 4 GRAPHIQUES SIMULTANÉS, UN PAR KPI, DISPOSÉS DEUX PAR DEUX */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(300px, 1fr))', gap: '16px' }}>
        {Object.entries(KPI_CONFIGS).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <div
              key={key}
              id={`kpi-trend-mini-${key}`}
              style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', background: isDarkMode ? '#0a1d35' : '#f8fafc' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon size={14} style={{ color: config.color }} />
                  <strong style={{ fontSize: '12px', color: 'var(--text)' }}>{config.label}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setExpandedKpi(key)}
                  title={`Agrandir ${config.label}`}
                  style={{ border: '1px solid var(--border)', background: 'var(--card-bg)', cursor: 'pointer', color: 'var(--muted)', padding: '4px', borderRadius: '6px', display: 'flex' }}
                >
                  <Maximize2 size={13} />
                </button>
              </div>
              <KpiChartSvg kpiKey={key} series={series} isDarkMode={isDarkMode} dims={SMALL_DIMS} granularity={granularity} />
            </div>
          );
        })}
      </div>

      <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border)', fontSize: '11px', marginTop: '14px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
        <span style={{ color: 'var(--muted)' }}>Cliquez sur <Maximize2 size={11} style={{ verticalAlign: 'middle' }} /> pour agrandir un graphique.</span>
        <span style={{ color: 'var(--muted)' }}>Filtre : {scopeLabel}</span>
      </div>

      {/* VUE AGRANDIE D'UN SEUL KPI */}
      {expandedKpi && (
        <div className="modal-overlay" onClick={() => setExpandedKpi(null)}>
          <div className="modal-box large" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '860px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="kpi-icon" style={{ background: expandedConfig.color, color: '#fff' }}>
                  <ExpandedIcon size={20} />
                </div>
                <div>
                  <div className="modal-title">{expandedConfig.label} — {periodLabel}</div>
                  <div className="modal-subtitle">Filtre : {scopeLabel}</div>
                </div>
              </div>
              <button type="button" className="modal-close" onClick={() => setExpandedKpi(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <KpiChartLegend kpiKey={expandedKpi} series={series} />
              <KpiChartSvg kpiKey={expandedKpi} series={series} isDarkMode={isDarkMode} dims={LARGE_DIMS} granularity={granularity} />
              <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border)', fontSize: '11px', fontFamily: 'monospace', marginTop: '12px' }}>
                {expandedConfig.formula}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setExpandedKpi(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
