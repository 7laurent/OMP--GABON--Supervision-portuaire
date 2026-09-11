import React, { useState, useMemo } from 'react';
import {
  Activity,
  Clock,
  Percent,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Calendar
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { bucketByPeriod, calculateMTBF, calculateMTTR, calculateDo, calculateDi, calculateTRC } from '../utils/kpiCalculations.js';

const WINDOW_HOURS = { day: 24, week: 168, month: 730 };

/**
 * Les 4 KPI majeurs affichés au même endroit partout dans l'app : MTBF, MTTR,
 * Disponibilité et TRC. Deux modes :
 * - Mode "réel" (props `equipments`/`pannes`/`workOrders` fournies) : tout est
 *   calculé en direct depuis les données Supabase, par granularité jour/semaine/mois,
 *   avec le nombre EXACT de pannes de la période affiché sur chaque carte.
 * - Mode "simulateur" (scalaires `mtbf`/`mttr`/... fournis directement, ex. page
 *   Calcul des KPI) : affiche les valeurs telles quelles, sans granularité.
 */
export default function CoreKpiTrio({
  equipments = null,
  pannes = [],
  workOrders = [],
  mtbf,
  mttr,
  availability,
  di,
  doVal,
  trc,
  onNavigate
}) {
  const { isDarkMode } = useTheme();
  const [granularity, setGranularity] = useState('week');
  const isRealMode = Array.isArray(equipments);

  const real = useMemo(() => {
    if (!isRealMode) return null;
    // Les lignes marquées "à valider" (incohérence détectée à l'import) sont exclues
    // des calculs tant qu'un admin ne les a pas confirmées, pour éviter de fausser
    // MTBF/MTTR/Disponibilité/TRC avec des données non vérifiées.
    const reliableEquipments = equipments.filter((e) => !e.needsReview);
    const reliablePannes = pannes.filter((p) => !p.needsReview);
    const reliableWorkOrders = workOrders.filter((w) => !w.needsReview);
    const activeEquip = Math.max(1, reliableEquipments.length);
    const windowHours = WINDOW_HOURS[granularity];
    const buckets = bucketByPeriod(reliablePannes, (p) => `${p.date}T${p.time || '00:00'}:00`, granularity);
    const woBuckets = bucketByPeriod(reliableWorkOrders, (w) => w._createdAt || w._plannedStart, granularity);

    const withMetrics = buckets.slice(-6).map((b) => {
      const durationSum = b.items.reduce((s, p) => s + (Number(p.durationHours) || 0), 0);
      return {
        label: b.label,
        pannesCount: b.count,
        mtbf: calculateMTBF(windowHours * activeEquip, b.count || 1),
        mttr: calculateMTTR(durationSum || 1, b.count || 1),
        dispo: calculateDo(windowHours * activeEquip, durationSum),
        trc: calculateTRC(b.items).trc
      };
    });

    const last = withMetrics[withMetrics.length - 1] || { pannesCount: 0, mtbf: 0, mttr: 0, dispo: 100, trc: 100 };
    const prev = withMetrics[withMetrics.length - 2] || null;
    const lastBucket = buckets[buckets.length - 1];
    const lastWoBucket = woBuckets[woBuckets.length - 1];
    const trcInfo = lastBucket ? calculateTRC(lastBucket.items) : { trc: 100, resolved: 0, total: 0 };

    return {
      dateRange: lastBucket?.label || '— (aucune donnée sur cette période)',
      mtbf: last.mtbf,
      mttr: last.mttr,
      availability: last.dispo,
      di: calculateDi(last.mtbf, last.mttr),
      doVal: last.dispo,
      trc: trcInfo.trc,
      trcResolved: trcInfo.resolved,
      trcTotal: trcInfo.total,
      pannesCount: last.pannesCount,
      woCount: lastWoBucket ? lastWoBucket.count : 0,
      equipmentsCount: activeEquip,
      evolutionMtbf: prev && prev.mtbf > 0 ? `${(((last.mtbf - prev.mtbf) / prev.mtbf) * 100).toFixed(1)}%` : '—',
      evolutionMttr: prev ? `${(last.mttr - prev.mttr).toFixed(2)} h` : '—',
      sparkline: withMetrics
    };
  }, [isRealMode, equipments, pannes, workOrders, granularity]);

  const current = isRealMode ? real : {
    dateRange: 'Simulation manuelle',
    mtbf, mttr, availability, di, doVal, trc,
    trcResolved: null, trcTotal: null, pannesCount: null, woCount: null, equipmentsCount: null,
    evolutionMtbf: '—', evolutionMttr: '—', sparkline: []
  };

  const fmt = (v, digits = 1) => (v === null || v === undefined || isNaN(v) ? '—' : Number(v).toFixed(digits));

  const Sparkline = ({ field, max, color, unit }) => {
    if (!current.sparkline.length) {
      return <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Historique insuffisant pour ce graphique.</div>;
    }
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '26px' }}>
        {current.sparkline.map((w, idx) => (
          <div
            key={idx}
            title={`${w.label} : ${w[field]}${unit || ''}`}
            style={{
              flex: 1,
              height: `${Math.max(6, (w[field] / max) * 26)}px`,
              borderRadius: '2px',
              backgroundColor: idx === current.sparkline.length - 1 ? color : (isDarkMode ? '#1e3a5f' : '#dbeafe')
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="section" id="section-core-kpis-trio">
      <div className="section-heading" style={{ marginBottom: '16px' }}>
        <div>
          <div className="section-label" style={{ color: 'var(--orange)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} />
            <span>INDICATEURS CLÉS AFNOR (NF EN 13306 & NF X 60-015) · DONNÉES RÉELLES</span>
          </div>
          <div className="section-title">Indicateurs Majeurs : MTBF, MTTR, Disponibilité & TRC</div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
            {isRealMode
              ? `Calculés en direct sur ${current.equipmentsCount} équipement(s) enregistré(s).`
              : 'Valeurs du simulateur manuel ci-dessous.'}
          </p>
        </div>

        {isRealMode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 6px', borderRadius: '8px',
                backgroundColor: isDarkMode ? '#0d223c' : '#f1f5f9', border: '1px solid var(--border)'
              }}
            >
              <Calendar size={13} style={{ color: 'var(--orange)' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', marginRight: '4px' }}>Granularité :</span>
              {(['month', 'week', 'day']).map((gKey) => (
                <button
                  key={gKey}
                  type="button"
                  onClick={() => setGranularity(gKey)}
                  style={{
                    padding: '3px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: 700, border: 'none', cursor: 'pointer',
                    backgroundColor: granularity === gKey ? 'var(--orange)' : 'transparent',
                    color: granularity === gKey ? '#ffffff' : 'var(--text)'
                  }}
                >
                  {gKey === 'month' ? 'Mois' : gKey === 'week' ? 'Semaine' : 'Jour'}
                </button>
              ))}
            </div>

            {onNavigate && (
              <button type="button" className="action-btn-sm" onClick={() => onNavigate('calcul_kpis')} id="btn-view-all-kpi-formulas">
                <span>Détail Formules</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {isRealMode && (
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
            padding: '10px 16px', borderRadius: '8px', backgroundColor: isDarkMode ? '#081a2f' : '#f8fafc',
            border: '1px solid var(--border)', marginBottom: '16px', fontSize: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, color: 'var(--text)' }}>Dernière période ({granularity === 'month' ? 'mois' : granularity === 'week' ? 'semaine' : 'jour'}) :</span>
            <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: isDarkMode ? '#1e3a5f' : '#e0f2fe', color: '#0284c7', fontFamily: 'monospace', fontWeight: 700 }}>
              {current.dateRange}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: 'var(--muted)' }}>
            <span>Pannes : <strong style={{ color: 'var(--text)' }}>{current.pannesCount}</strong></span>
            <span>·</span>
            <span>Work Orders : <strong style={{ color: 'var(--text)' }}>{current.woCount}</strong></span>
            <span>·</span>
            <span style={{ color: 'var(--green)', fontWeight: 700 }}>Temps Réel</span>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        {/* 1. MTBF */}
        <div className="kpi-card" id="card-kpi-mtbf" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div className="kpi-top">
            <div>
              <span className="kpi-title" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>MTBF</span>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>Mean Time Between Failures</div>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: isDarkMode ? '#172554' : '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={18} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '14px 0 8px' }}>
            <div className="kpi-number" style={{ color: '#2563eb', fontSize: '32px', lineHeight: 1 }}>
              {fmt(current.mtbf)} <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--muted)' }}>h</span>
            </div>
          </div>

          <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border)', fontSize: '11px', fontFamily: 'monospace', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
            <span>MTBF = Σ TBF / N</span>
            <span style={{ color: 'var(--muted)' }}>NF EN 13306</span>
          </div>

          {isRealMode && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>
                <span>Évolution :</span>
                <span style={{ fontWeight: 700, color: '#2563eb' }}>{current.evolutionMtbf}</span>
              </div>
              <Sparkline field="mtbf" max={Math.max(1, ...current.sparkline.map((s) => s.mtbf))} color="#2563eb" unit="h" />
            </div>
          )}
        </div>

        {/* 2. MTTR */}
        <div className="kpi-card" id="card-kpi-mttr" style={{ borderLeft: '4px solid var(--orange)' }}>
          <div className="kpi-top">
            <div>
              <span className="kpi-title" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>MTTR</span>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>Mean Time To Repair</div>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: isDarkMode ? '#431407' : '#fff7ed', color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '14px 0 8px' }}>
            <div className="kpi-number" style={{ color: 'var(--orange)', fontSize: '32px', lineHeight: 1 }}>
              {fmt(current.mttr, 2)} <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--muted)' }}>h</span>
            </div>
          </div>

          <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border)', fontSize: '11px', fontFamily: 'monospace', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
            <span>MTTR = Σ TTR / N</span>
            <span style={{ color: 'var(--muted)' }}>NF X 60-015</span>
          </div>

          {isRealMode && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>
                <span>Évolution :</span>
                <span style={{ fontWeight: 700, color: 'var(--green)' }}>{current.evolutionMttr}</span>
              </div>
              <Sparkline field="mttr" max={Math.max(1, ...current.sparkline.map((s) => s.mttr))} color="var(--orange)" unit="h" />
            </div>
          )}
        </div>

        {/* 3. DISPONIBILITÉ */}
        <div className="kpi-card" id="card-kpi-disponibilite" style={{ borderLeft: '4px solid var(--green)' }}>
          <div className="kpi-top">
            <div>
              <span className="kpi-title" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>DISPONIBILITÉ</span>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>Availability (Do / Di)</div>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: isDarkMode ? '#064e3b' : '#ecfdf5', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Percent size={18} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', margin: '14px 0 8px' }}>
            <div className="kpi-number" style={{ color: 'var(--green)', fontSize: '32px', lineHeight: 1 }}>
              {fmt(current.availability)}%
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)' }}>
              (Di : {fmt(current.di)}% | Do : {fmt(current.doVal)}%)
            </span>
          </div>

          <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border)', fontSize: '11px', fontFamily: 'monospace', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
            <span>D = MTBF / (MTBF + MTTR)</span>
            <span style={{ color: 'var(--muted)' }}>NF EN 13306</span>
          </div>

          {isRealMode && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>
                <span>Évolution :</span>
                <span style={{ fontWeight: 700, color: 'var(--green)' }}>Cible &gt; 90%</span>
              </div>
              <Sparkline field="dispo" max={100} color="var(--green)" unit="%" />
            </div>
          )}
        </div>

        {/* 4. TRC — Taux de Réalisation Curative */}
        <div className="kpi-card" id="card-kpi-trc" style={{ borderLeft: '4px solid var(--red)' }}>
          <div className="kpi-top">
            <div>
              <span className="kpi-title" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>TRC</span>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>Taux de Réalisation Curative</div>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: isDarkMode ? '#450a0a' : '#fef2f2', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '14px 0 8px' }}>
            <div className="kpi-number" style={{ color: 'var(--red)', fontSize: '32px', lineHeight: 1 }}>
              {fmt(current.trc)}%
            </div>
          </div>

          <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border)', fontSize: '11px', fontFamily: 'monospace', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
            <span>TRC = Résolues / Déclarées</span>
            <span style={{ color: 'var(--muted)' }}>OMP</span>
          </div>

          {isRealMode ? (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>
                <span>Détail de la période :</span>
                <span style={{ fontWeight: 700, color: 'var(--text)' }}>{current.trcResolved} / {current.trcTotal} pannes</span>
              </div>
              <Sparkline field="trc" max={100} color="var(--red)" unit="%" />
            </div>
          ) : (
            <div style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '12px' }}>Simulateur TRC ci-dessous.</div>
          )}

          <div className="kpi-bottom" style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
            <span className="positive" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={14} /> Cible &gt; 90%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
