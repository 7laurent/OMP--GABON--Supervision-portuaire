import React, { useState } from 'react';
import { 
  Calculator, 
  BookOpen, 
  HelpCircle, 
  Activity, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  TrendingUp,
  RotateCw
} from 'lucide-react';
import CoreKpiTrio from '../components/CoreKpiTrio.jsx';
import AfnorTemporalDiagram from '../components/AfnorTemporalDiagram.jsx';
import WeeklyStatsDiagram from '../components/WeeklyStatsDiagram.jsx';
import { 
  calculateMTBF, 
  calculateMTTR, 
  calculateDi, 
  calculateDo, 
  calculateFailureRate, 
  calculateRepairRate, 
  calculateTRS 
} from '../utils/kpiCalculations.js';

export default function CalculKpisPage() {
  // Simulateur interactif
  const [simOperatingHours, setSimOperatingHours] = useState(2500);
  const [simFailureCount, setSimFailureCount] = useState(4);
  const [simRepairHours, setSimRepairHours] = useState(14.5);
  const [simDowntimeHours, setSimDowntimeHours] = useState(38);

  const simMtbf = calculateMTBF(simOperatingHours, simFailureCount);
  const simMttr = calculateMTTR(simRepairHours, simFailureCount);
  const simDi = calculateDi(simMtbf, simMttr);
  const simDo = calculateDo(simOperatingHours, simDowntimeHours);
  const simLambda = calculateFailureRate(simMtbf);
  const simMu = calculateRepairRate(simMttr);

  // Dictionnaire des indicateurs
  const kpiDefinitions = [
    {
      code: 'MTBF',
      name: 'Mean Time Between Failures (Moyenne des Temps de Bon Fonctionnement)',
      norm: 'AFNOR NF EN 13306 & NF X 60-015',
      category: 'Fiabilité',
      formula: 'MTBF = Σ TBF / N = (Heures de fonctionnement cumulées) / (Nombre total de pannes)',
      variables: [
        'Heures de fonctionnement cumulées de la machine (heures au compteur)',
        'Nombre total de pannes et défaillances enregistrées'
      ],
      currentValue: '152.4 h',
      target: '> 120 h',
      explanation: 'Mesure la capacité d\'une machine à fonctionner sans interruption inopinée. Plus le MTBF est élevé, plus l\'équipement est fiable.'
    },
    {
      code: 'MTTR',
      name: 'Mean Time To Repair (Moyenne des Temps Techniques de Réparation)',
      norm: 'AFNOR NF EN 13306 & NF X 60-015',
      category: 'Maintenabilité',
      formula: 'MTTR = Σ TTR / N = (Temps total d\'intervention curative) / (Nombre de réparations)',
      variables: [
        'Temps effectif passé par les techniciens pour dépanner et réparer (heures)',
        'Nombre d\'interventions curatives réalisées'
      ],
      currentValue: '2.45 h',
      target: '< 4.0 h',
      explanation: 'Mesure l\'aptitude d\'une installation à être remise en état de marche. Un MTTR faible prouve l\'efficacité des équipes et la disponibilité des pièces de rechange.'
    },
    {
      code: 'Di',
      name: 'Disponibilité Inhérente (Intrinsic Availability)',
      norm: 'AFNOR NF X 60-015',
      category: 'Disponibilité',
      formula: 'Di = [ MTBF / (MTBF + MTTR) ] × 100 %',
      variables: [
        'MTBF (Temps Moyen de Bon Fonctionnement)',
        'MTTR (Temps Moyen de Réparation)'
      ],
      currentValue: '98.4 %',
      target: '> 96.0 %',
      explanation: 'Disponibilité intrinsèque de l\'équipement ne prenant en compte que les temps de panne purs (sans les temps d\'attente logistique ou d\'organisation).'
    },
    {
      code: 'Do',
      name: 'Disponibilité Opérationnelle (Operational Availability)',
      norm: 'AFNOR NF EN 13306',
      category: 'Disponibilité',
      formula: 'Do = [ Heures de Fonctionnement / (Heures de Fonctionnement + Arrêts Totaux) ] × 100 %',
      variables: [
        'Heures de fonctionnement réelles',
        'Heures d\'arrêt total (maintenance curative, préventive, attente pièces, consignation)'
      ],
      currentValue: '94.2 %',
      target: '> 92.0 %',
      explanation: 'Taux réel de mise à disposition pour la production portuaire. Tient compte des temps d\'intervention et de la logistique globale.'
    },
    {
      code: 'λ (Lambda)',
      name: 'Taux de Défaillance (Failure Rate)',
      norm: 'AFNOR NF X 60-010',
      category: 'Fiabilité',
      formula: 'λ = 1 / MTBF (exprimé en défaillances par heure)',
      variables: [
        'MTBF calculé'
      ],
      currentValue: '0.00656 /h',
      target: '< 0.008 /h',
      explanation: 'Fréquence instantanée d\'apparition des avaries sur la machine pendant sa phase de vie utile.'
    },
    {
      code: 'μ (Mu)',
      name: 'Taux de Réparation (Repair Rate)',
      norm: 'AFNOR NF X 60-010',
      category: 'Maintenabilité',
      formula: 'μ = 1 / MTTR (exprimé en réparations par heure)',
      variables: [
        'MTTR calculé'
      ],
      currentValue: '0.408 /h',
      target: '> 0.25 /h',
      explanation: 'Capacité de traitement horaire des pannes par les équipes de maintenance.'
    },
    {
      code: 'TRS / OEE',
      name: 'Taux de Rendement Synthétique (Overall Equipment Effectiveness)',
      norm: 'Norme NF E 60-182',
      category: 'Performance',
      formula: 'TRS = Disponibilité × Performance × Qualité × 100 %',
      variables: [
        'Taux de Disponibilité des grues et convoyeurs',
        'Taux de cadence/performance de déchargement',
        'Taux de conformité sans rejet'
      ],
      currentValue: '82.6 %',
      target: '> 80.0 %',
      explanation: 'Indicateur clé industriel d\'efficacité productive globale combinant le temps utile, la vitesse et la qualité.'
    },
    {
      code: 'Ratio Préventif',
      name: 'Ratio de Maintenance Préventive',
      norm: 'Bonnes pratiques Eramet & AFNOR',
      category: 'Gestion',
      formula: 'Ratio = [ Heures de Maintenance Préventive / Heures Totales de Maintenance ] × 100 %',
      variables: [
        'Heures pointées sur Work Orders Préventifs',
        'Heures totales (Préventif + Curatif)'
      ],
      currentValue: '78.4 %',
      target: '> 70.0 %',
      explanation: 'Garantit que la majorité des ressources est consacrée à l\'anticipation plutôt qu\'à l\'urgence.'
    }
  ];

  return (
    <div className="content" id="calcul-kpis-content">
      {/* En-tête */}
      <section className="hero" style={{ background: 'linear-gradient(135deg, #071d36 0%, #112845 60%, #1e4572 100%)' }}>
        <div className="hero-content">
          <div className="hero-small-title" style={{ color: 'var(--orange)' }}>
            RÉFÉRENTIEL TECHNIQUE & MÉTHODOLOGIE
          </div>
          <h1>Guide & Calcul des KPIs de Maintenance</h1>
          <p>
            Dictionnaire complet des indicateurs de supervision portuaire conformément aux normes AFNOR NF EN 13306,
            NF X 60-015 et NF E 60-182. Formules mathématiques, données d'entrée et simulateur en direct.
          </p>
        </div>
        <div className="hero-number">AFNOR</div>
      </section>

      {/* LES 3 KPIS ESSENTIELS : MTTR, MTBF & DISPONIBILITÉ */}
      <CoreKpiTrio 
        mtbf={simMtbf}
        mttr={simMttr}
        availability={simDi}
        di={simDi}
        doVal={simDo}
      />

      {/* SCHÉMAS DÉCOMPOSITION TEMPORELLE AFNOR ET WORKFLOW D'INTERVENTION */}
      <AfnorTemporalDiagram />

      {/* SCHÉMAS STATISTIQUES MULTI-PÉRIODES AFNOR */}
      <WeeklyStatsDiagram 
        pageTitle="Statistiques Multi-Périodes et Taux AFNOR par Semaine"
        subtitle="Suivi de la disponibilité Do, MTBF et MTTR selon la granularité temporelle (Mois, Semaine, Jour, Heure)"
        context="dashboard"
      />

      {/* SECTION SIMULATEUR INTERACTIF */}
      <section className="section">
        <div className="section-heading">
          <div>
            <div className="section-label">SIMULATEUR EN DIRECT</div>
            <div className="section-title">Testez vos données et recalculez les indicateurs AFNOR</div>
          </div>
        </div>

        <div className="industrial-card" style={{ borderLeft: '4px solid var(--orange)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
            <div className="form-group">
              <label className="form-label">Heures de Fonctionnement (Σ TBF)</label>
              <input
                type="number"
                className="form-control"
                value={simOperatingHours}
                onChange={(e) => setSimOperatingHours(Number(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nombre de Pannes (N)</label>
              <input
                type="number"
                className="form-control"
                value={simFailureCount}
                onChange={(e) => setSimFailureCount(Number(e.target.value) || 1)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Temps de Réparation Total (Σ TTR h)</label>
              <input
                type="number"
                step="0.5"
                className="form-control"
                value={simRepairHours}
                onChange={(e) => setSimRepairHours(Number(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Heures d'Arrêt Totales (h)</label>
              <input
                type="number"
                step="0.5"
                className="form-control"
                value={simDowntimeHours}
                onChange={(e) => setSimDowntimeHours(Number(e.target.value) || 0)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div style={{ background: 'var(--hover-bg)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>MTBF Résultant</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--orange)', marginTop: '4px' }}>
                {simMtbf} h
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>= {simOperatingHours} / {simFailureCount}</div>
            </div>

            <div style={{ background: 'var(--hover-bg)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>MTTR Résultant</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--blue)', marginTop: '4px' }}>
                {simMttr} h
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>= {simRepairHours} / {simFailureCount}</div>
            </div>

            <div style={{ background: 'var(--hover-bg)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>Disponibilité Inhérente (Di)</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--green)', marginTop: '4px' }}>
                {simDi}%
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>MTBF / (MTBF + MTTR)</div>
            </div>

            <div style={{ background: 'var(--hover-bg)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>Disponibilité Opérationnelle (Do)</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--green)', marginTop: '4px' }}>
                {simDo}%
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Fonctionnement / Total</div>
            </div>
          </div>
        </div>
      </section>

      {/* DICTIONNAIRE DÉTAILLÉ DES INDICATEURS */}
      <section className="section">
        <div className="section-heading">
          <div>
            <div className="section-label">RÉFÉRENTIEL EXHAUSTIF</div>
            <div className="section-title">Formules Mathématiques & Données Utilisées</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {kpiDefinitions.map((kpi, idx) => (
            <div key={idx} className="industrial-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--orange)' }}>
                      {kpi.code}
                    </span>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>
                      · {kpi.name}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                    Norme : <strong>{kpi.norm}</strong> | Domaine : <strong>{kpi.category}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>Port Owendo</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--green)' }}>{kpi.currentValue}</div>
                  </div>
                  <div style={{ textAlign: 'right', borderLeft: '1px solid var(--border)', paddingLeft: '16px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>Cible Recommandée</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{kpi.target}</div>
                  </div>
                </div>
              </div>

              {/* Formule encadrée */}
              <div style={{
                marginTop: '16px',
                padding: '14px 18px',
                background: 'var(--hover-bg)',
                borderRadius: '8px',
                borderLeft: '4px solid var(--blue)',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text)'
              }}>
                📐 Formule : {kpi.formula}
              </div>

              {/* Explication & Variables */}
              <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Signification & Objectif Industriel :
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: '1.6' }}>
                    {kpi.explanation}
                  </p>
                </div>

                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Données & Variables Utilisées :
                  </div>
                  <ul style={{ paddingLeft: '18px', fontSize: '12px', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {kpi.variables.map((v, i) => (
                      <li key={i}>{v}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
