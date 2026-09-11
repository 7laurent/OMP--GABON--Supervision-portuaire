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
  calculateTRS,
  calculatePreventiveRatio,
  calculateTRC
} from '../utils/kpiCalculations.js';

export default function CalculKpisPage({ equipments = [], pannes = [], workOrders = [] }) {
  // Simulateur interactif
  const [simOperatingHours, setSimOperatingHours] = useState(2500);
  const [simFailureCount, setSimFailureCount] = useState(4);
  const [simRepairHours, setSimRepairHours] = useState(14.5);
  const [simDowntimeHours, setSimDowntimeHours] = useState(38);
  const [simTotalPannes, setSimTotalPannes] = useState(10);
  const [simPannesResolues, setSimPannesResolues] = useState(8);

  const simMtbf = calculateMTBF(simOperatingHours, simFailureCount);
  const simMttr = calculateMTTR(simRepairHours, simFailureCount);
  const simDi = calculateDi(simMtbf, simMttr);
  const simDo = calculateDo(simOperatingHours, simDowntimeHours);
  const simLambda = calculateFailureRate(simMtbf);
  const simMu = calculateRepairRate(simMttr);
  const simTrc = simTotalPannes > 0 ? Number(((simPannesResolues / simTotalPannes) * 100).toFixed(1)) : 100;

  // Valeurs réelles calculées à partir des données Supabase actuelles (lignes "à valider"
  // exclues tant qu'un admin ne les a pas confirmées, pour ne pas fausser ces moyennes)
  const reliableEquipments = equipments.filter((e) => !e.needsReview);
  const reliablePannes = pannes.filter((p) => !p.needsReview);
  const reliableWorkOrders = workOrders.filter((w) => !w.needsReview);
  const totalOperatingHours = reliableEquipments.reduce((s, e) => s + (e.operatingHours || 0), 0);
  const totalDowntimeHours = reliableEquipments.reduce((s, e) => s + (e.downtimeHours || 0), 0);
  const realMtbf = calculateMTBF(totalOperatingHours, reliablePannes.length || 1);
  const realMttr = calculateMTTR(reliablePannes.reduce((s, p) => s + (Number(p.durationHours) || 0), 0) || 1, reliablePannes.length || 1);
  const realDi = calculateDi(realMtbf, realMttr);
  const realDo = calculateDo(totalOperatingHours, totalDowntimeHours);
  const realTrc = calculateTRC(pannes).trc;
  const preventiveWO = reliableWorkOrders.filter((w) => w._maintenanceType === 'Preventive Maintenance').length;
  const correctiveWO = reliableWorkOrders.length - preventiveWO;
  const realPreventiveRatio = calculatePreventiveRatio(preventiveWO, correctiveWO);

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
      currentValue: `${realMtbf} h`,
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
      currentValue: `${realMttr} h`,
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
      currentValue: `${realDi} %`,
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
      currentValue: `${realDo} %`,
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
      currentValue: `${calculateFailureRate(realMtbf)} /h`,
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
      currentValue: `${calculateRepairRate(realMttr)} /h`,
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
      currentValue: `${calculateTRS(realDo / 100)} %`,
      target: '> 80.0 %',
      explanation: 'Indicateur clé industriel d\'efficacité productive globale combinant le temps utile, la vitesse et la qualité. La disponibilité utilisée est réelle (Do) ; performance et qualité restent à renseigner (valeurs par défaut tant qu\'aucune donnée de cadence/qualité n\'est enregistrée).'
    },
    {
      code: 'Ratio Préventif',
      name: 'Ratio de Maintenance Préventive',
      norm: 'Bonnes pratiques & AFNOR',
      category: 'Gestion',
      formula: 'Ratio = [ Work Orders Préventifs / Total Work Orders ] × 100 %',
      variables: [
        'Nombre de Work Orders de type "Preventive Maintenance"',
        'Nombre total de Work Orders (Préventif + Correctif)'
      ],
      currentValue: `${realPreventiveRatio} %`,
      target: '> 70.0 %',
      explanation: 'Garantit que la majorité des ressources est consacrée à l\'anticipation plutôt qu\'à l\'urgence.'
    },
    {
      code: 'TRC',
      name: 'Taux de Réalisation Curative',
      norm: 'Indicateur de gestion OMP',
      category: 'Maintenabilité',
      formula: 'TRC = [ Pannes déclarées effectivement clôturées & résolues / Total des pannes déclarées ] × 100 %',
      variables: [
        'Nombre de pannes dont le Work Order est clôturé (COMPLETED) avec le problème résolu',
        'Nombre total de pannes déclarées sur la période'
      ],
      currentValue: `${realTrc} % (${calculateTRC(pannes).resolved}/${calculateTRC(pannes).total} pannes)`,
      target: '> 90.0 %',
      explanation: 'Mesure la capacité réelle des équipes à mener une intervention curative jusqu\'à sa résolution effective, plutôt qu\'à la simple déclaration de l\'incident.'
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
        trc={simTrc}
      />

      {/* SCHÉMAS DÉCOMPOSITION TEMPORELLE AFNOR ET WORKFLOW D'INTERVENTION */}
      <AfnorTemporalDiagram />

      {/* SCHÉMAS STATISTIQUES MULTI-PÉRIODES AFNOR */}
      <WeeklyStatsDiagram
        pageTitle="Statistiques Multi-Périodes et Taux AFNOR"
        subtitle="Suivi réel de la disponibilité Do, MTBF et MTTR par mois, semaine et jour"
        context="dashboard"
        equipments={equipments}
        pannes={pannes}
        workOrders={workOrders}
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

      {/* SIMULATEUR TRC (TAUX DE RÉALISATION CURATIVE) */}
      <section className="section">
        <div className="section-heading">
          <div>
            <div className="section-label">NOUVEAU KPI</div>
            <div className="section-title">Simulateur TRC — Taux de Réalisation Curative</div>
          </div>
        </div>

        <div className="industrial-card" style={{ borderLeft: '4px solid var(--red)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
            <div className="form-group">
              <label className="form-label">Total des Pannes Déclarées (période)</label>
              <input
                type="number"
                className="form-control"
                value={simTotalPannes}
                onChange={(e) => setSimTotalPannes(Number(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Pannes Résolues (Work Order clôturé)</label>
              <input
                type="number"
                className="form-control"
                value={simPannesResolues}
                onChange={(e) => setSimPannesResolues(Number(e.target.value) || 0)}
              />
            </div>
          </div>

          <div style={{ background: 'var(--hover-bg)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)', maxWidth: '320px' }}>
            <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>TRC Résultant</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--red)', marginTop: '4px' }}>
              {simTrc}%
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>= {simPannesResolues} / {simTotalPannes} × 100</div>
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
