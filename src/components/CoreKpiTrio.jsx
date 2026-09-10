import React, { useState } from 'react';
import { 
  Activity, 
  Clock, 
  Percent, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Info,
  ShieldCheck,
  Zap,
  ArrowRight,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

export default function CoreKpiTrio({
  mtbf: initialMtbf = 152.4,
  mttr: initialMttr = 2.45,
  availability: initialAvailability = 96.8,
  di = 98.4,
  doVal = 94.2,
  onNavigate
}) {
  const { isDarkMode } = useTheme();
  const [granularity, setGranularity] = useState('week');

  // Données et dates reliées par granularité
  const TEMPORAL_KPIS = {
    month: {
      label: 'Mensuel',
      dateRange: 'Mars 2025 (01/03/2025 au 31/03/2025)',
      mtbf: 168.5,
      mttr: 2.10,
      availability: 97.4,
      di: 98.7,
      doVal: 95.1,
      targetDispo: 95.0,
      evolutionMtbf: '+11.4%',
      evolutionMttr: '-0.35 h',
      prevMtbfPeriod: 'Fév 2025 (151.2 h)',
      weeksStats: [
        { label: 'Oct 2024', dispo: 94.8, mtbf: 142, mttr: 2.8 },
        { label: 'Nov 2024', dispo: 95.5, mtbf: 155, mttr: 2.6 },
        { label: 'Déc 2024', dispo: 93.9, mtbf: 138, mttr: 3.1 },
        { label: 'Jan 2025', dispo: 96.2, mtbf: 168, mttr: 2.4 },
        { label: 'Fév 2025', dispo: 97.4, mtbf: 182, mttr: 2.1 },
        { label: 'Mar 2025', dispo: 98.1, mtbf: 195, mttr: 1.9 }
      ]
    },
    week: {
      label: 'Hebdomadaire',
      dateRange: 'Semaine 09 (24/02/2025 au 02/03/2025)',
      mtbf: 184.2,
      mttr: 1.85,
      availability: 98.1,
      di: 98.9,
      doVal: 96.3,
      targetDispo: 95.0,
      evolutionMtbf: '+14.2%',
      evolutionMttr: '-0.42 h',
      prevMtbfPeriod: 'Semaine 08 (161.0 h)',
      weeksStats: [
        { label: 'S04 (20-26 Jan)', dispo: 95.2, mtbf: 150, mttr: 2.7 },
        { label: 'S05 (27 Jan - 02 Fév)', dispo: 96.0, mtbf: 162, mttr: 2.4 },
        { label: 'S06 (03-09 Fév)', dispo: 96.8, mtbf: 170, mttr: 2.2 },
        { label: 'S07 (10-16 Fév)', dispo: 97.2, mtbf: 178, mttr: 2.0 },
        { label: 'S08 (17-23 Fév)', dispo: 97.6, mtbf: 185, mttr: 1.9 },
        { label: 'S09 (24 Fév - 02 Mar)', dispo: 98.1, mtbf: 192, mttr: 1.8 }
      ]
    },
    day: {
      label: 'Journalier',
      dateRange: 'Dimanche 02 Mars 2025 (00h00 à 23h59)',
      mtbf: 202.0,
      mttr: 1.45,
      availability: 98.8,
      di: 99.2,
      doVal: 97.5,
      targetDispo: 95.0,
      evolutionMtbf: '+5.8%',
      evolutionMttr: '-0.20 h',
      prevMtbfPeriod: 'Samedi 01 Mars (190.8 h)',
      weeksStats: [
        { label: '25 Fév', dispo: 96.5, mtbf: 165, mttr: 2.3 },
        { label: '26 Fév', dispo: 97.0, mtbf: 172, mttr: 2.1 },
        { label: '27 Fév', dispo: 97.8, mtbf: 180, mttr: 1.9 },
        { label: '28 Fév', dispo: 98.2, mtbf: 189, mttr: 1.8 },
        { label: '01 Mar', dispo: 98.5, mtbf: 194, mttr: 1.7 },
        { label: '02 Mar', dispo: 98.8, mtbf: 202, mttr: 1.5 }
      ]
    },
    hour: {
      label: 'Horaire',
      dateRange: 'Poste 1 (08:00 - 16:00, Dimanche 02/03/2025)',
      mtbf: 215.0,
      mttr: 1.10,
      availability: 99.2,
      di: 99.5,
      doVal: 98.1,
      targetDispo: 95.0,
      evolutionMtbf: '+3.2%',
      evolutionMttr: '-0.15 h',
      prevMtbfPeriod: 'Créneau 00:00 - 08:00 (208.3 h)',
      weeksStats: [
        { label: '08h-10h', dispo: 98.5, mtbf: 195, mttr: 1.7 },
        { label: '10h-12h', dispo: 99.0, mtbf: 205, mttr: 1.5 },
        { label: '12h-14h', dispo: 98.8, mtbf: 200, mttr: 1.6 },
        { label: '14h-16h', dispo: 99.2, mtbf: 210, mttr: 1.4 },
        { label: '16h-18h', dispo: 99.0, mtbf: 208, mttr: 1.5 },
        { label: '18h-20h', dispo: 99.3, mtbf: 215, mttr: 1.3 }
      ]
    }
  };

  const current = TEMPORAL_KPIS[granularity];

  return (
    <div className="section" id="section-core-kpis-trio">
      <div className="section-heading" style={{ marginBottom: '16px' }}>
        <div>
          <div className="section-label" style={{ color: 'var(--orange)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} />
            <span>INDICATEURS CLÉS AFNOR (NF EN 13306 & NF X 60-015) · PORT D'OWENDO</span>
          </div>
          <div className="section-title">Indicateurs Majeurs : MTTR, MTBF & Disponibilité par Échéance</div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
            Métriques de fiabilité et maintenabilité des 7 équipements portuaires. Données reliées aux dates exactes par mois, semaine, jour ou heure.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* SÉLECTEUR DE GRANULARITÉ TEMPORELLE */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 6px',
              borderRadius: '8px',
              backgroundColor: isDarkMode ? '#0d223c' : '#f1f5f9',
              border: '1px solid var(--border)'
            }}
          >
            <Calendar size={13} style={{ color: 'var(--orange)' }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', marginRight: '4px' }}>Granularité :</span>
            {(['month', 'week', 'day', 'hour']).map(gKey => (
              <button
                key={gKey}
                type="button"
                onClick={() => setGranularity(gKey)}
                style={{
                  padding: '3px 10px',
                  borderRadius: '5px',
                  fontSize: '11px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: granularity === gKey ? 'var(--orange)' : 'transparent',
                  color: granularity === gKey ? '#ffffff' : 'var(--text)'
                }}
              >
                {gKey === 'month' ? 'Mois' : gKey === 'week' ? 'Semaine' : gKey === 'day' ? 'Jour' : 'Heure'}
              </button>
            ))}
          </div>

          {onNavigate && (
            <button 
              type="button" 
              className="action-btn-sm" 
              onClick={() => onNavigate('calcul_kpis')}
              id="btn-view-all-kpi-formulas"
            >
              <span>Détail Formules</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* BANDEAU DATE EXACTE RELIÉE AUX KPIS */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '10px 16px',
          borderRadius: '8px',
          backgroundColor: isDarkMode ? '#081a2f' : '#f8fafc',
          border: '1px solid var(--border)',
          marginBottom: '16px',
          fontSize: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 700, color: 'var(--text)' }}>Échéance de calcul active :</span>
          <span 
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: isDarkMode ? '#1e3a5f' : '#e0f2fe',
              color: '#0284c7',
              fontFamily: 'monospace',
              fontWeight: 700
            }}
          >
            {current.dateRange}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: 'var(--muted)' }}>
          <span>Parc : <strong>14 engins portuaires</strong></span>
          <span>·</span>
          <span>Norme : <strong>AFNOR NF EN 13306</strong></span>
          <span>·</span>
          <span style={{ color: 'var(--green)', fontWeight: 700 }}>Temps Réel Validé</span>
        </div>
      </div>

      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}
      >
        {/* =========================================================
            1. MTBF - FIABILITÉ INTRINSÈQUE
            ========================================================= */}
        <div 
          className="kpi-card" 
          id="card-kpi-mtbf"
          style={{
            borderLeft: '4px solid #3b82f6',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div className="kpi-top">
            <div>
              <span className="kpi-title" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                MTBF · TEMPS MOYEN DE BON FONCTIONNEMENT
              </span>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                Mean Time Between Failures · Fiabilité {current.label}
              </div>
            </div>
            <div 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: isDarkMode ? '#172554' : '#eff6ff',
                color: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Activity size={18} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '14px 0 8px' }}>
            <div className="kpi-number" style={{ color: '#2563eb', fontSize: '36px', lineHeight: 1 }}>
              {current.mtbf} <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--muted)' }}>heures</span>
            </div>
          </div>

          {/* Formule AFNOR en encadré */}
          <div 
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              backgroundColor: 'var(--hover-bg)',
              border: '1px solid var(--border)',
              fontSize: '11px',
              fontFamily: 'monospace',
              color: 'var(--text)',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>MTBF = Σ TBF / N</span>
            <span style={{ color: 'var(--muted)' }}>AFNOR NF EN 13306</span>
          </div>

          {/* Mini-schéma statistique des 6 dernières périodes */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>
              <span>Évolution MTBF (6 dernières échéances) :</span>
              <span style={{ fontWeight: 700, color: '#2563eb' }}>{current.evolutionMtbf}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '26px' }}>
              {current.weeksStats.map((w, idx) => (
                <div 
                  key={idx}
                  title={`${w.label} : ${w.mtbf}h`}
                  style={{
                    flex: 1,
                    height: `${Math.max(6, (w.mtbf / 220) * 26)}px`,
                    borderRadius: '2px',
                    backgroundColor: idx === current.weeksStats.length - 1 ? '#2563eb' : (isDarkMode ? '#1e3a5f' : '#bfdbfe')
                  }}
                />
              ))}
            </div>
          </div>

          <div className="kpi-bottom" style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
            <span className="positive" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={14} /> {current.evolutionMtbf}
            </span>
            <span className="kpi-caption">vs {current.prevMtbfPeriod}</span>
          </div>
        </div>

        {/* =========================================================
            2. MTTR - MAINTENABILITÉ & RÉPARATION
            ========================================================= */}
        <div 
          className="kpi-card" 
          id="card-kpi-mttr"
          style={{
            borderLeft: '4px solid var(--orange)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div className="kpi-top">
            <div>
              <span className="kpi-title" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                MTTR · TEMPS MOYEN DE RÉPARATION
              </span>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                Mean Time To Repair · Maintenabilité {current.label}
              </div>
            </div>
            <div 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: isDarkMode ? '#431407' : '#fff7ed',
                color: 'var(--orange)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Clock size={18} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '14px 0 8px' }}>
            <div className="kpi-number" style={{ color: 'var(--orange)', fontSize: '36px', lineHeight: 1 }}>
              {current.mttr} <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--muted)' }}>heures</span>
            </div>
          </div>

          {/* Formule AFNOR en encadré */}
          <div 
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              backgroundColor: 'var(--hover-bg)',
              border: '1px solid var(--border)',
              fontSize: '11px',
              fontFamily: 'monospace',
              color: 'var(--text)',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>MTTR = Σ TTR / N</span>
            <span style={{ color: 'var(--muted)' }}>AFNOR NF X 60-015</span>
          </div>

          {/* Mini-schéma statistique des 6 dernières périodes */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>
              <span>Évolution MTTR (dépannage plus rapide) :</span>
              <span style={{ fontWeight: 700, color: 'var(--green)' }}>{current.evolutionMttr}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '26px' }}>
              {current.weeksStats.map((w, idx) => (
                <div 
                  key={idx}
                  title={`${w.label} : ${w.mttr}h`}
                  style={{
                    flex: 1,
                    height: `${Math.max(6, (w.mttr / 3.5) * 26)}px`,
                    borderRadius: '2px',
                    backgroundColor: idx === current.weeksStats.length - 1 ? 'var(--orange)' : (isDarkMode ? '#3f2214' : '#fed7aa')
                  }}
                />
              ))}
            </div>
          </div>

          <div className="kpi-bottom" style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
            <span className="positive" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingDown size={14} /> {current.evolutionMttr}
            </span>
            <span className="kpi-caption">gain de rapidité d'astreinte portuaire</span>
          </div>
        </div>

        {/* =========================================================
            3. DISPONIBILITÉ GLOBALE (Do & Di)
            ========================================================= */}
        <div 
          className="kpi-card" 
          id="card-kpi-disponibilite"
          style={{
            borderLeft: '4px solid var(--green)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div className="kpi-top">
            <div>
              <span className="kpi-title" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                DISPONIBILITÉ OPÉRATIONNELLE & INHÉRENTE
              </span>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                Availability Index · Taux d'engagement {current.label}
              </div>
            </div>
            <div 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: isDarkMode ? '#064e3b' : '#ecfdf5',
                color: 'var(--green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Percent size={18} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', margin: '14px 0 8px' }}>
            <div className="kpi-number" style={{ color: 'var(--green)', fontSize: '36px', lineHeight: 1 }}>
              {current.availability}%
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>
              (Di : {current.di}% | Do : {current.doVal}%)
            </span>
          </div>

          {/* Formule AFNOR en encadré */}
          <div 
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              backgroundColor: 'var(--hover-bg)',
              border: '1px solid var(--border)',
              fontSize: '11px',
              fontFamily: 'monospace',
              color: 'var(--text)',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>D = MTBF / (MTBF + MTTR)</span>
            <span style={{ color: 'var(--muted)' }}>AFNOR NF EN 13306</span>
          </div>

          {/* Mini-schéma statistique des 6 dernières périodes */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>
              <span>Taux de disponibilité :</span>
              <span style={{ fontWeight: 700, color: 'var(--green)' }}>Conforme cible &gt; {current.targetDispo}%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '26px' }}>
              {current.weeksStats.map((w, idx) => (
                <div 
                  key={idx}
                  title={`${w.label} : ${w.dispo}%`}
                  style={{
                    flex: 1,
                    height: `${Math.max(6, (w.dispo - 90) * 2.6)}px`,
                    borderRadius: '2px',
                    backgroundColor: idx === current.weeksStats.length - 1 ? 'var(--green)' : (isDarkMode ? '#0d3824' : '#bbf7d0')
                  }}
                />
              ))}
            </div>
          </div>

          <div className="kpi-bottom" style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
            <span className="positive" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={14} /> Haute Disponibilité
            </span>
            <span className="kpi-caption">Flotte portuaire sous contrôle</span>
          </div>
        </div>
      </div>
    </div>
  );
}
