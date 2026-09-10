import React from 'react';
import { 
  ArrowRight, 
  Wrench, 
  AlertTriangle, 
  ClipboardList, 
  Users, 
  Package, 
  History, 
  BarChart3, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  ChevronRight,
  Anchor,
  Activity
} from 'lucide-react';
import PortSynopticDiagram from '../components/PortSynopticDiagram.jsx';
import AfnorTemporalDiagram from '../components/AfnorTemporalDiagram.jsx';
import CoreKpiTrio from '../components/CoreKpiTrio.jsx';

export default function AccueilPage({ 
  onNavigate = () => {},
  equipmentsCount = 128,
  pannesCount = 17,
  workOrdersCount = 46,
  techniciansCount = 24,
  mtbf = 152.4,
  mttr = 2.45,
  availability = 96.8
}) {
  return (
    <div className="accueil-page-root" id="accueil-page-wrapper">
      {/* ================= HEADER ACCUEIL ================= */}
      <header className="accueil-header">
        <div className="accueil-header-container">
          <div 
            className="accueil-logo-link" 
            onClick={() => onNavigate('dashboard')} 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
          >
            <div className="omp-logo-badge" style={{ width: '42px', height: '42px', fontSize: '15px' }}>
              OMP
            </div>
            <div className="logo-text">
              <span className="logo-title" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>
                OMP
              </span>
              <span className="logo-subtitle" style={{ fontSize: '10px', letterSpacing: '1.4px', color: 'var(--orange)' }}>
                MAINTENANCE GABON
              </span>
            </div>
          </div>

          <nav className="accueil-navigation">
            <a href="#accueil" className="active">Accueil</a>
            <a href="#presentation">Présentation</a>
            <a href="#schemas">Schémas</a>
            <a href="#indicateurs">Indicateurs</a>
            <a href="#modules">Modules</a>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="accueil-header-btn"
              onClick={() => onNavigate('dashboard')}
              id="btn-accueil-access-system"
            >
              Accéder au système <ArrowRight size={15} style={{ marginLeft: '4px' }} />
            </button>
          </div>
        </div>
      </header>

      <main className="accueil-main">
        {/* ================= HERO ================= */}
        <section id="accueil" className="accueil-hero">
          <div className="accueil-hero-content">
            <span className="accueil-hero-label">
              PORTAIL DE CENTRALISATION INDUSTRIELLE
            </span>

            <h1>
              Gestion intelligente
              <br />
              <span>de la maintenance portuaire</span>
            </h1>

            <p>
              Centralisez, consultez et analysez l'ensemble des données liées à la maintenance 
              de vos équipements et infrastructures du Terminal Minéralier d'Owendo.
            </p>

            <div className="accueil-hero-buttons">
              <button
                type="button"
                className="accueil-primary-button"
                onClick={() => onNavigate('dashboard')}
                id="btn-accueil-hero-dashboard"
              >
                Accéder au Dashboard <span>→</span>
              </button>

              <a href="#schemas" className="accueil-secondary-button">
                Explorer les Schémas ↓
              </a>
            </div>
          </div>

          {/* Bloc Décoratif Géométrique */}
          <div className="accueil-hero-decoration">
            <div className="accueil-circle circle-one"></div>
            <div className="accueil-circle circle-two"></div>
            <div className="accueil-port-line"></div>
            <div className="terminal-badge-floating">
              <Anchor size={20} color="var(--orange)" />
              <div>
                <strong>Terminal Minéralier</strong>
                <small>Owendo, Estuaire Gabon</small>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION INDICATEURS MAJEURS (MTTR, MTBF, DISPONIBILITÉ) ================= */}
        <section className="accueil-section" id="kpis-afnor-top" style={{ padding: '0 24px', maxWidth: '1400px', margin: '0 auto 60px' }}>
          <div className="accueil-section-title">
            <span>PERFORMANCE & FIABILITÉ AFNOR</span>
            <h2>Indicateurs Essentiels du Terminal</h2>
            <p>Les métriques normatives certifiées NF EN 13306 pour piloter la disponibilité de la flotte.</p>
          </div>

          <CoreKpiTrio 
            mtbf={mtbf}
            mttr={mttr}
            availability={availability}
            di={98.4}
            doVal={94.2}
            onNavigate={onNavigate}
          />
        </section>

        {/* ================= SECTION SCHÉMAS TECHNIQUES & ILLUSTRATIONS ================= */}
        <section id="schemas" className="accueil-section" style={{ padding: '0 24px', maxWidth: '1400px', margin: '0 auto 70px' }}>
          <div className="accueil-section-title">
            <span>SYNOPTIQUE & PROCESS</span>
            <h2>Schémas de la Chaîne Logistique</h2>
            <p>
              Illustration vectorielle interactive de la manutention portuaire continue et 
              du découpage temporel normalisé AFNOR.
            </p>
          </div>

          {/* 1. Schéma synoptique du port d'Owendo */}
          <div style={{ marginBottom: '40px' }}>
            <PortSynopticDiagram onNavigate={onNavigate} />
          </div>

          {/* 2. Schémas temporels et workflow d'intervention */}
          <div>
            <AfnorTemporalDiagram onNavigate={onNavigate} />
          </div>
        </section>

        {/* ================= PRÉSENTATION ================= */}
        <section id="presentation" className="accueil-section" style={{ padding: '0 24px', maxWidth: '1400px', margin: '0 auto 70px' }}>
          <div className="accueil-section-title">
            <span>OMP MAINTENANCE</span>
            <h2>Une vision centralisée de la maintenance</h2>
          </div>

          <div className="accueil-presentation-grid">
            <div className="accueil-presentation-text">
              <p>
                Le portail OMP Maintenance permet de centraliser toutes les informations relatives 
                aux équipements, aux pannes déclarées, aux ordres de travail (Work Orders) et aux 
                pièces de rechange.
              </p>
              <p>
                L'objectif est d'accélérer la résolution des défaillances, d'accroître le MTBF, 
                de réduire le MTTR et de garantir un taux de disponibilité supérieur à 94% 
                sur l'ensemble des quais et lignes de convoyage.
              </p>
              <button 
                type="button" 
                className="accueil-text-link"
                onClick={() => onNavigate('bilan_global')}
              >
                Explorer le Bilan Global KPIs →
              </button>
            </div>

            <div className="accueil-info-card">
              <div className="accueil-info-number">01</div>
              <h3>Centraliser</h3>
              <p>
                Regrouper toutes les données de maintenance et de télémétrie dans un même 
                environnement sécurisé avec synchronisation Supabase en temps réel.
              </p>
            </div>

            <div className="accueil-info-card">
              <div className="accueil-info-number">02</div>
              <h3>Analyser</h3>
              <p>
                Transformer les arrêts et interventions en indicateurs AFNOR (MTBF, MTTR, 
                Disponibilité Opérationnelle et Inhérente) directement exploitables.
              </p>
            </div>

            <div className="accueil-info-card">
              <div className="accueil-info-number">03</div>
              <h3>Optimiser</h3>
              <p>
                Automatiser le plan préventif, réduire les ruptures de stock au magasin de pièces 
                et fluidifier l'astreinte des équipes techniques.
              </p>
            </div>
          </div>
        </section>

        {/* ================= INDICATEURS COMPTEURS ================= */}
        <section id="indicateurs" className="accueil-numbers-section">
          <div className="accueil-numbers-header">
            <span>À UN COUP D'ŒIL</span>
            <h2>Les indicateurs clés en chiffres</h2>
          </div>

          <div className="accueil-numbers-grid">
            <div className="accueil-number-card" onClick={() => onNavigate('equipements')}>
              <div className="accueil-number-icon">⚙</div>
              <strong>{equipmentsCount}</strong>
              <span>Équipements supervisés</span>
            </div>

            <div className="accueil-number-card" onClick={() => onNavigate('work_orders')}>
              <div className="accueil-number-icon">🔧</div>
              <strong>{workOrdersCount}</strong>
              <span>Work Orders actifs</span>
            </div>

            <div className="accueil-number-card" onClick={() => onNavigate('pannes')}>
              <div className="accueil-number-icon">⚠</div>
              <strong>{pannesCount}</strong>
              <span>Pannes sous suivi</span>
            </div>

            <div className="accueil-number-card" onClick={() => onNavigate('techniciens')}>
              <div className="accueil-number-icon">👨‍🔧</div>
              <strong>{techniciansCount}</strong>
              <span>Techniciens mobilisés</span>
            </div>
          </div>
        </section>

        {/* ================= MODULES ================= */}
        <section id="modules" className="accueil-section" style={{ padding: '0 24px', maxWidth: '1400px', margin: '80px auto' }}>
          <div className="accueil-section-title">
            <span>LE SYSTÈME</span>
            <h2>Les modules de maintenance</h2>
            <p>Accédez directement aux différents espaces opérationnels de l'application.</p>
          </div>

          <div className="accueil-modules-grid">
            <div className="accueil-module-card" onClick={() => onNavigate('equipements')}>
              <span className="accueil-module-number">01</span>
              <div className="accueil-module-icon"><Wrench size={22} /></div>
              <h3>Équipements</h3>
              <p>Consultez le registre technique complet, la criticité et l'état opérationnel de chaque machine.</p>
              <span className="accueil-module-arrow">→</span>
            </div>

            <div className="accueil-module-card" onClick={() => onNavigate('pannes')}>
              <span className="accueil-module-number">02</span>
              <div className="accueil-module-icon"><AlertTriangle size={22} /></div>
              <h3>Pannes</h3>
              <p>Déclarez les incidents critiques, suivez les urgences et analysez les causes de défaillance.</p>
              <span className="accueil-module-arrow">→</span>
            </div>

            <div className="accueil-module-card" onClick={() => onNavigate('work_orders')}>
              <span className="accueil-module-number">03</span>
              <div className="accueil-module-icon"><ClipboardList size={22} /></div>
              <h3>Work Orders</h3>
              <p>Planifiez, affectez et clôturez les ordres d'intervention préventive et corrective.</p>
              <span className="accueil-module-arrow">→</span>
            </div>

            <div className="accueil-module-card" onClick={() => onNavigate('pieces')}>
              <span className="accueil-module-number">04</span>
              <div className="accueil-module-icon"><Package size={22} /></div>
              <h3>Pièces & Magasin</h3>
              <p>Contrôlez les niveaux de stock, les seuils critiques et les réapprovisionnements de roulements.</p>
              <span className="accueil-module-arrow">→</span>
            </div>

            <div className="accueil-module-card" onClick={() => onNavigate('techniciens')}>
              <span className="accueil-module-number">05</span>
              <div className="accueil-module-icon"><Users size={22} /></div>
              <h3>Techniciens</h3>
              <p>Gérez les équipes A, B, C, la charge de travail, les compétences et les certifications.</p>
              <span className="accueil-module-arrow">→</span>
            </div>

            <div className="accueil-module-card" onClick={() => onNavigate('historique')}>
              <span className="accueil-module-number">06</span>
              <div className="accueil-module-icon"><History size={22} /></div>
              <h3>Historique</h3>
              <p>Journal d'audit complet de toutes les opérations, filtrable et exportable pour certification.</p>
              <span className="accueil-module-arrow">→</span>
            </div>
          </div>
        </section>

        {/* ================= CALL TO ACTION ================= */}
        <section className="accueil-cta">
          <div className="accueil-cta-inner">
            <div>
              <span className="accueil-cta-eyebrow">OMP MAINTENANCE</span>
              <h2>Prêt à accéder au système de supervision ?</h2>
              <p>Basculez directement vers le tableau de bord temps réel ou le bilan complet des indicateurs.</p>
            </div>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="accueil-cta-button"
                onClick={() => onNavigate('dashboard')}
                id="btn-accueil-cta-dashboard"
              >
                Accéder au Dashboard →
              </button>
              <button
                type="button"
                className="accueil-cta-button-secondary"
                onClick={() => onNavigate('bilan_global')}
                id="btn-accueil-cta-bilan"
              >
                Bilan Global KPIs
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="accueil-footer">
        <div className="accueil-footer-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="omp-logo-badge" style={{ width: '38px', height: '38px', fontSize: '13px' }}>
              OMP
            </div>
            <div className="accueil-footer-text">
              <strong>OMP Maintenance</strong>
              <p>Système de centralisation et de pilotage de la maintenance · Terminal d'Owendo, Gabon</p>
            </div>
          </div>

          <div className="accueil-footer-copy">
            © 2026 Owendo Mineral Port. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
