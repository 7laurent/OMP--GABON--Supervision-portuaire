import React, { useState } from 'react';
import { 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  ShieldCheck, 
  Activity, 
  ArrowRight,
  TrendingUp,
  FileText,
  Workflow
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

export default function AfnorTemporalDiagram({ onNavigate }) {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('temps'); // 'temps' | 'workflow'

  return (
    <div className="section" id="section-afnor-temporal-schema">
      <div className="section-heading">
        <div>
          <div className="section-label" style={{ color: 'var(--orange)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Workflow size={14} />
            <span>RÉFÉRENTIEL TECHNIQUE AFNOR NF EN 13306 & PROCESSUS GMAO</span>
          </div>
          <div className="section-title">Schémas Normatifs : Décomposition Temporelle & Cycle de Panne</div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
            Illustrations normalisées de la décomposition des temps de fonctionnement et du workflow d'intervention d'astreinte.
          </p>
        </div>

        {/* Sélecteur d'onglet du schéma */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className={activeTab === 'temps' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveTab('temps')}
            style={{ padding: '7px 14px', fontSize: '12px' }}
          >
            <Clock size={14} />
            <span>1. Schéma Temporel (AFNOR)</span>
          </button>
          <button
            type="button"
            className={activeTab === 'workflow' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveTab('workflow')}
            style={{ padding: '7px 14px', fontSize: '12px' }}
          >
            <Workflow size={14} />
            <span>2. Workflow d'Intervention (GMAO)</span>
          </button>
        </div>
      </div>

      <div 
        className="performance-card"
        style={{
          padding: '24px',
          backgroundColor: isDarkMode ? '#08172b' : '#ffffff',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {activeTab === 'temps' ? (
          /* =========================================================================
             SCHÉMA 1 : DÉCOMPOSITION TEMPORELLE DES ÉTATS D'UN ÉQUIPEMENT (NF EN 13306)
             ========================================================================= */
          <div>
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>
                Arborescence et Découpage des Temps de Disponibilité (Norme NF EN 13306 & NF X 60-015)
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                Ce schéma illustre mathématiquement d'où proviennent le MTBF, le MTTR et le calcul exact de la Disponibilité opérationnelle ($D_o$).
              </p>
            </div>

            {/* Représentation visuelle des blocs temporels empilés */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '20px 0' }}>
              {/* Niveau 1 : Temps Total (TT) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                  <span>NIVEAU 1 : TEMPS TOTAL DE RÉFÉRENCE (TT = 8 760 h/an ou 720 h/mois)</span>
                  <span style={{ color: 'var(--muted)' }}>100% de la période</span>
                </div>
                <div 
                  style={{
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: isDarkMode ? '#1e293b' : '#e2e8f0',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--text)',
                    letterSpacing: '0.5px'
                  }}
                >
                  TT · Temps Total du Calendrier Portuaire (24h/24, 7j/7)
                </div>
              </div>

              {/* Niveau 2 : Découpage TO vs TNU */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>
                  <span>NIVEAU 2 : EXPLOITATION DU TERMINAL</span>
                  <span>Temps d'Ouverture (TO : 92%) + Non-Utilisation (TNU : 8%)</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', height: '36px' }}>
                  <div 
                    style={{
                      flex: '92',
                      borderRadius: '6px',
                      backgroundColor: isDarkMode ? '#0369a1' : '#bae6fd',
                      color: isDarkMode ? '#ffffff' : '#0369a1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700
                    }}
                  >
                    TO · Temps d'Ouverture Portuaire (Disponibilité programmée navires)
                  </div>
                  <div 
                    style={{
                      flex: '8',
                      borderRadius: '6px',
                      backgroundColor: isDarkMode ? '#334155' : '#cbd5e1',
                      color: 'var(--muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 600
                    }}
                    title="Arrêts hors contrat / Marée basse / Grèves"
                  >
                    TNU
                  </div>
                </div>
              </div>

              {/* Niveau 3 : Découpage Temps Requis (TR) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>
                  <span>NIVEAU 3 : PHASE OPÉRATIONNELLE</span>
                  <span>Temps Requis (TR = 96% de TO) + Temps Non Requis (TNR = 4%)</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', height: '36px' }}>
                  <div 
                    style={{
                      flex: '88',
                      borderRadius: '6px',
                      backgroundColor: isDarkMode ? '#1d4ed8' : '#bfdbfe',
                      color: isDarkMode ? '#ffffff' : '#1e40af',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700
                    }}
                  >
                    TR · Temps Requis pour l'Évacuation du Minerai
                  </div>
                  <div 
                    style={{
                      flex: '12',
                      borderRadius: '6px',
                      backgroundColor: isDarkMode ? '#1e293b' : '#e2e8f0',
                      color: 'var(--muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px'
                    }}
                  >
                    TNR
                  </div>
                </div>
              </div>

              {/* Niveau 4 : TBF (Base MTBF) vs Arrêts Totaux (Base MTTR) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>
                  <span style={{ color: 'var(--green)' }}>NIVEAU 4 : TBF (TEMPS DE BON FONCTIONNEMENT)</span>
                  <span style={{ color: 'var(--red)' }}>TA (TEMPS D'ARRÊT POUR DÉFAILLANCES)</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', height: '48px' }}>
                  {/* TBF -> Engendre le MTBF */}
                  <div 
                    style={{
                      flex: '85',
                      borderRadius: '6px',
                      backgroundColor: isDarkMode ? '#065f46' : '#d1fae5',
                      border: '2px solid var(--green)',
                      color: isDarkMode ? '#ffffff' : '#065f46',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 800 }}>TBF · Temps de Bon Fonctionnement (Σ TBF)</span>
                    <span style={{ fontSize: '11px', fontWeight: 600 }}>→ Base de calcul du MTBF = Σ TBF / N = 152.4 h</span>
                  </div>

                  {/* TA -> Engendre le MTTR */}
                  <div 
                    style={{
                      flex: '15',
                      borderRadius: '6px',
                      backgroundColor: isDarkMode ? '#7f1d1d' : '#fee2e2',
                      border: '2px solid var(--red)',
                      color: isDarkMode ? '#ffffff' : '#991b1b',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 800 }}>TA · Arrêts</span>
                    <span style={{ fontSize: '10px', fontWeight: 600 }}>MTTR = 2.45 h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Encadré Récapitulatif des Formules Associées */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '14px',
                marginTop: '18px',
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: 'var(--hover-bg)',
                border: '1px solid var(--border)'
              }}
            >
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                  1. Fiabilité (MTBF)
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>
                  MTBF = Σ TBF / Nombre de Défaillances
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '3px' }}>
                  Temps sans interruption. Cible : &gt; 120 h
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                  2. Maintenabilité (MTTR)
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--orange)', marginTop: '2px' }}>
                  MTTR = Σ Temps Réparations / N
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '3px' }}>
                  Temps d'immobilisation curative. Cible : &lt; 4.0 h
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                  3. Disponibilité Inhérente (Di)
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--green)', marginTop: '2px' }}>
                  Di = [ MTBF / (MTBF + MTTR) ] × 100%
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '3px' }}>
                  Taux pur d'aptitude machine = 98.4%
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================================
             SCHÉMA 2 : WORKFLOW DE GESTION DES DÉFAILLANCES & GMAO
             ========================================================================= */
          <div>
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>
                Cycle de Vie d'une Intervention de Maintenance (Workflow OMP)
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                Processus standardisé depuis la télémétrie capteur jusqu'à la réintégration dans le calcul des KPI portuaires.
              </p>
            </div>

            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                margin: '24px 0'
              }}
            >
              {/* Étape 1 */}
              <div 
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  backgroundColor: isDarkMode ? '#0a1d35' : '#f8fafc',
                  border: '1px solid var(--border)',
                  position: 'relative'
                }}
              >
                <div 
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--red)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '12px',
                    marginBottom: '10px'
                  }}
                >
                  1
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text)' }}>
                  Détection & Alerte
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '6px', lineHeight: 1.4 }}>
                  Capteurs vibratoires (SCADA) ou signalement d'astreinte 24/7 par l'opérateur de quai.
                </div>
                <div style={{ marginTop: '10px', fontSize: '10px', fontWeight: 700, color: 'var(--red)' }}>
                  Début du compteur d'arrêt
                </div>
              </div>

              {/* Étape 2 */}
              <div 
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  backgroundColor: isDarkMode ? '#0a1d35' : '#f8fafc',
                  border: '1px solid var(--border)'
                }}
              >
                <div 
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--orange)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '12px',
                    marginBottom: '10px'
                  }}
                >
                  2
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text)' }}>
                  Émission Work Order
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '6px', lineHeight: 1.4 }}>
                  Génération automatique du bon de travail (WO), affectation brigade et criticité (P1, P2, P3).
                </div>
                <div style={{ marginTop: '10px', fontSize: '10px', fontWeight: 700, color: 'var(--orange)' }}>
                  Affectation sous 15 min
                </div>
              </div>

              {/* Étape 3 */}
              <div 
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  backgroundColor: isDarkMode ? '#0a1d35' : '#f8fafc',
                  border: '1px solid var(--border)'
                }}
              >
                <div 
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '12px',
                    marginBottom: '10px'
                  }}
                >
                  3
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text)' }}>
                  Consignation & Sécurité
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '6px', lineHeight: 1.4 }}>
                  Cadenassage électrique et mécanique selon le protocole de sécurité portuaire OMP.
                </div>
                <div style={{ marginTop: '10px', fontSize: '10px', fontWeight: 700, color: '#3b82f6' }}>
                  Zéro accident visé
                </div>
              </div>

              {/* Étape 4 */}
              <div 
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  backgroundColor: isDarkMode ? '#0a1d35' : '#f8fafc',
                  border: '1px solid var(--border)'
                }}
              >
                <div 
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#8b5cf6',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '12px',
                    marginBottom: '10px'
                  }}
                >
                  4
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text)' }}>
                  Réparation & Pièces
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '6px', lineHeight: 1.4 }}>
                  Sortie magasin pièces détachées (roulements, réducteur, bande) et intervention curative.
                </div>
                <div style={{ marginTop: '10px', fontSize: '10px', fontWeight: 700, color: '#8b5cf6' }}>
                  Temps effectif = MTTR
                </div>
              </div>

              {/* Étape 5 */}
              <div 
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  backgroundColor: isDarkMode ? '#0a1d35' : '#f8fafc',
                  border: '1px solid var(--border)'
                }}
              >
                <div 
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--green)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '12px',
                    marginBottom: '10px'
                  }}
                >
                  5
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text)' }}>
                  Clôture & Recalcul
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '6px', lineHeight: 1.4 }}>
                  Essai en charge, visa du responsable, fermeture du WO et recalcul automatique du MTTR & MTBF.
                </div>
                <div style={{ marginTop: '10px', fontSize: '10px', fontWeight: 700, color: 'var(--green)' }}>
                  Remise à disposition quai
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
