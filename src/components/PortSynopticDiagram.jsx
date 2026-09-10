import React, { useState } from 'react';
import { 
  Ship, 
  ArrowRight, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  Info, 
  Gauge, 
  Anchor,
  Maximize2,
  RefreshCw,
  Zap,
  Calendar,
  Truck,
  Layers
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

export default function PortSynopticDiagram({ onSelectEquipment, onNavigate }) {
  const { isDarkMode } = useTheme();
  const [selectedNode, setSelectedNode] = useState('PM-01');
  const [granularity, setGranularity] = useState('week');

  // Dates et données temporelles détaillées par période
  const periodDetails = {
    month: {
      label: 'Mensuel',
      dateRange: 'Mars 2025 (01/03/2025 - 31/03/2025)',
      trend: [94, 95, 96, 95, 97, 98]
    },
    week: {
      label: 'Hebdomadaire',
      dateRange: 'Semaine 09 (24 Fév - 02 Mar 2025)',
      trend: [95, 96, 96, 97, 98, 98]
    },
    day: {
      label: 'Journalier',
      dateRange: 'Dimanche 02 Mars 2025 (00h00 - 23h59)',
      trend: [96, 97, 97, 98, 98, 99]
    },
    hour: {
      label: 'Horaire',
      dateRange: 'Créneau 08:00 - 16:00 (Poste 1)',
      trend: [98, 98, 99, 98, 99, 99]
    }
  };

  // Nœuds de la chaîne cinématique et logistique des engins portuaires d'Owendo
  const portNodes = [
    {
      id: 'PM-01',
      name: 'Pelle mécanique CAT 349D',
      tag: 'Extraction & Alimentation',
      category: 'Pelle mécanique',
      status: 'Opérationnel',
      color: '#42bd67',
      rate: '650 t/h',
      mtbf: '240 h',
      mttr: '0.8 h',
      availability: '98.5%',
      desc: 'Alimentation continue du circuit minéralier et extraction du minerai au front de stock.',
      x: 60,
      y: 110,
      hours: '8 450 h',
      lastMnt: '18/02/2025',
      nextMnt: '25/03/2025'
    },
    {
      id: 'DP-01',
      name: 'Dumper Articulé CAT 745C',
      tag: 'Transport Lourd 41T',
      category: 'Dumper',
      status: 'Opérationnel',
      color: '#42bd67',
      rate: '820 t/h',
      mtbf: '190 h',
      mttr: '1.2 h',
      availability: '97.5%',
      desc: 'Transport de roche et pondéreux entre le parc de stockage tampon et la fosse de reprise.',
      x: 220,
      y: 110,
      hours: '13 900 h',
      lastMnt: '14/02/2025',
      nextMnt: '20/03/2025'
    },
    {
      id: 'BL-01',
      name: 'Bulldozer / Bull CAT D8T',
      tag: 'Régalage & Pousse',
      category: 'Bulldozer / Bull',
      status: 'Opérationnel',
      color: '#42bd67',
      rate: '1 100 t/h',
      mtbf: '280 h',
      mttr: '0.7 h',
      availability: '98.8%',
      desc: 'Régalage en terril, mise en tas et nivellement de la plateforme de chargement.',
      x: 380,
      y: 110,
      hours: '10 400 h',
      lastMnt: '10/02/2025',
      nextMnt: '01/04/2025'
    },
    {
      id: 'CH-01',
      name: 'Chargeuse sur pneus CAT 988K',
      tag: 'Reprise & Trémie',
      category: 'Chargeuse',
      status: 'Opérationnel',
      color: '#42bd67',
      rate: '950 t/h',
      mtbf: '215 h',
      mttr: '0.9 h',
      availability: '98.0%',
      desc: 'Reprise du minerai et alimentation à haute cadence des trémies de transfert maritime.',
      x: 540,
      y: 110,
      hours: '11 300 h',
      lastMnt: '26/02/2025',
      nextMnt: '28/03/2025'
    },
    {
      id: 'TR-01',
      name: 'Tracteur de Quai Terberg YT220',
      tag: 'Traction & Transfert Quai',
      category: 'Tracteur',
      status: 'Opérationnel',
      color: '#42bd67',
      rate: '36t attelage',
      mtbf: '320 h',
      mttr: '0.6 h',
      availability: '99.1%',
      desc: 'Navettes et traction continue des remorques de matériel et vrac lourd bord à quai.',
      x: 700,
      y: 110,
      hours: '5 800 h',
      lastMnt: '08/02/2025',
      nextMnt: '05/05/2025'
    },
    {
      id: 'TP-01',
      name: 'Tractopelle JCB 4CX',
      tag: 'Maintenance Voies & Réseaux',
      category: 'Tractopelle',
      status: 'Opérationnel',
      color: '#42bd67',
      rate: 'Polyvalent',
      mtbf: '350 h',
      mttr: '0.5 h',
      availability: '99.2%',
      desc: 'Assistance technique, terrassement voirie, curage fossés et levage polyvalent du port.',
      x: 840,
      y: 110,
      hours: '5 400 h',
      lastMnt: '28/01/2025',
      nextMnt: '25/04/2025'
    },
    {
      id: 'SL-01',
      name: 'Chargeur de Navire (Ship Loader)',
      tag: 'Quai Minéralier Maritime',
      category: 'Chargement Maritime',
      status: 'Opérationnel',
      color: '#2563eb',
      rate: '2 400 t/h',
      mtbf: '195 h',
      mttr: '1.4 h',
      availability: '98.6%',
      desc: 'Déversement dans les cales du vraquier minéralier Panamax amarré au quai d\'Owendo.',
      x: 950,
      y: 110,
      hours: '14 200 h',
      lastMnt: '24/02/2025',
      nextMnt: '15/03/2025'
    }
  ];

  const currentNode = portNodes.find(n => n.id === selectedNode) || portNodes[0];
  const currentPeriod = periodDetails[granularity];

  return (
    <div className="section" id="section-port-synoptic">
      <div className="section-heading">
        <div>
          <div className="section-label" style={{ color: 'var(--orange)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Anchor size={14} />
            <span>SCHÉMA SYNOPTIQUE PORTUAIRE · FLOTTE DE MAINTENANCE</span>
          </div>
          <div className="section-title">Chaîne Logistique Portuaire & Engins de Manutention d'Owendo</div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
            Schéma synoptique interactif représentant le flux des 7 engins du port : Pelle mécanique, Dumper, Bulldozer / Bull, Chargeuse, Camion, Tracteur et Tractopelle.
          </p>
        </div>

        {/* Sélecteur temporel pour les KPIs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 6px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: isDarkMode ? '#0d233e' : '#f1f5f9' }}>
            <Calendar size={13} style={{ color: 'var(--orange)' }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)' }}>Période :</span>
            {(['month', 'week', 'day', 'hour']).map(pKey => (
              <button
                key={pKey}
                type="button"
                onClick={() => setGranularity(pKey)}
                style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: granularity === pKey ? 'var(--orange)' : 'transparent',
                  color: granularity === pKey ? '#ffffff' : 'var(--text)'
                }}
              >
                {pKey === 'month' ? 'Mois' : pKey === 'week' ? 'Semaine' : pKey === 'day' ? 'Jour' : 'Heure'}
              </button>
            ))}
          </div>

          <span 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: isDarkMode ? '#064e3b' : '#ecfdf5',
              color: 'var(--green)'
            }}
          >
            <span className="status-dot" style={{ width: '6px', height: '6px', margin: 0 }} />
            Flux portuaire opérationnel
          </span>
        </div>
      </div>

      {/* Cadre du Schéma Synoptique */}
      <div 
        className="performance-card"
        style={{
          padding: '24px',
          backgroundColor: isDarkMode ? '#08172b' : '#ffffff',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden'
        }}
      >
        {/* Légende du schéma & Date exacte */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px',
            paddingBottom: '14px',
            borderBottom: '1px solid var(--border)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--muted)' }}>
            <span style={{ fontWeight: 600, color: 'var(--text)' }}>Légende d'état :</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--green)' }} />
              Opérationnel
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--orange)' }} />
              En maintenance
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2563eb' }} />
              Quai / Chargement
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
            <span style={{ color: 'var(--muted)' }}>Période active :</span>
            <span style={{ fontWeight: 700, color: 'var(--orange)', fontFamily: 'monospace' }}>
              {currentPeriod.dateRange}
            </span>
          </div>
        </div>

        {/* Schéma vectoriel SVG interactif des 7 équipements */}
        <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '8px' }}>
          <div style={{ minWidth: '960px', position: 'relative' }}>
            <svg 
              viewBox="0 0 1000 230" 
              style={{ width: '100%', height: 'auto', display: 'block' }}
            >
              <defs>
                {/* Ligne de flux animée */}
                <linearGradient id="flowGradPort" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f58220" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#42bd67" stopOpacity="1" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Ligne du sol portuaire / Piste de roulage */}
              <line x1="20" y1="180" x2="780" y2="180" stroke="var(--border)" strokeWidth="4" />
              <line x1="780" y1="180" x2="800" y2="210" stroke="var(--border)" strokeWidth="4" />
              
              {/* Océan / Bassin quai minéralier */}
              <rect x="800" y="195" width="190" height="30" fill={isDarkMode ? '#031326' : '#e0f2fe'} rx="4" />
              <text x="895" y="215" textAnchor="middle" fill="#0284c7" fontSize="10" fontWeight="700">
                Bassin d'Owendo
              </text>

              {/* Ligne de flux cinématique animée */}
              <path 
                d="M 90 110 L 220 110 L 380 110 L 540 110 L 700 110 L 840 110 L 940 90" 
                fill="none" 
                stroke="url(#flowGradPort)" 
                strokeWidth="5" 
                strokeDasharray="8 6"
              >
                <animate 
                  attributeName="stroke-dashoffset" 
                  from="100" 
                  to="0" 
                  dur="4s" 
                  repeatCount="indefinite" 
                />
              </path>

              {/* Flèches de direction du flux */}
              <polygon points="160,107 172,110 160,113" fill="var(--orange)" />
              <polygon points="310,107 322,110 310,113" fill="var(--green)" />
              <polygon points="470,107 482,110 470,113" fill="var(--green)" />
              <polygon points="630,107 642,110 630,113" fill="var(--orange)" />
              <polygon points="780,107 792,110 780,113" fill="var(--green)" />

              {/* ========================================================
                  BLOCS DES 7 ENGINS DU PORT
                  ======================================================== */}

              {/* 1. Pelle mécanique (PM-01) */}
              <g onClick={() => setSelectedNode('PM-01')} style={{ cursor: 'pointer' }} transform="translate(30, 50)">
                <rect 
                  x="0" y="0" width="115" height="115" rx="8" 
                  fill={selectedNode === 'PM-01' ? (isDarkMode ? '#0e2b4d' : '#e0f2fe') : (isDarkMode ? '#0a1e38' : '#f8fafc')}
                  stroke={selectedNode === 'PM-01' ? 'var(--orange)' : 'var(--border)'} 
                  strokeWidth={selectedNode === 'PM-01' ? '2.5' : '1.5'}
                />
                <circle cx="57" cy="38" r="20" fill={isDarkMode ? '#061324' : '#ffffff'} stroke="#42bd67" strokeWidth="2" />
                <path d="M 47 44 L 62 44 L 67 30 L 57 26 Z" fill="#f58220" />
                <text x="57" y="74" textAnchor="middle" fill="var(--text)" fontSize="11" fontWeight="800">PM-01</text>
                <text x="57" y="87" textAnchor="middle" fill="var(--muted)" fontSize="9">Pelle mécanique</text>
                <rect x="18" y="94" width="80" height="14" rx="3" fill="#42bd67" />
                <text x="57" y="104" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="700">CAT 349D · DISPO</text>
              </g>

              {/* 2. Dumper (DP-01) */}
              <g onClick={() => setSelectedNode('DP-01')} style={{ cursor: 'pointer' }} transform="translate(180, 50)">
                <rect 
                  x="0" y="0" width="115" height="115" rx="8" 
                  fill={selectedNode === 'DP-01' ? (isDarkMode ? '#0e2b4d' : '#e0f2fe') : (isDarkMode ? '#0a1e38' : '#f8fafc')}
                  stroke={selectedNode === 'DP-01' ? 'var(--orange)' : 'var(--border)'} 
                  strokeWidth={selectedNode === 'DP-01' ? '2.5' : '1.5'}
                />
                <circle cx="57" cy="38" r="20" fill={isDarkMode ? '#061324' : '#ffffff'} stroke="#42bd67" strokeWidth="2" />
                <rect x="42" y="32" width="22" height="12" rx="2" fill="#f58220" />
                <circle cx="46" cy="46" r="3.5" fill="var(--muted)" />
                <circle cx="62" cy="46" r="3.5" fill="var(--muted)" />
                <text x="57" y="74" textAnchor="middle" fill="var(--text)" fontSize="11" fontWeight="800">DP-01</text>
                <text x="57" y="87" textAnchor="middle" fill="var(--muted)" fontSize="9">Dumper Articulé</text>
                <rect x="18" y="94" width="80" height="14" rx="3" fill="#42bd67" />
                <text x="57" y="104" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="700">41T · DISPO</text>
              </g>

              {/* 3. Bulldozer / Bull (BL-01) */}
              <g onClick={() => setSelectedNode('BL-01')} style={{ cursor: 'pointer' }} transform="translate(330, 50)">
                <rect 
                  x="0" y="0" width="115" height="115" rx="8" 
                  fill={selectedNode === 'BL-01' ? (isDarkMode ? '#0e2b4d' : '#e0f2fe') : (isDarkMode ? '#0a1e38' : '#f8fafc')}
                  stroke={selectedNode === 'BL-01' ? 'var(--orange)' : 'var(--border)'} 
                  strokeWidth={selectedNode === 'BL-01' ? '2.5' : '1.5'}
                />
                <circle cx="57" cy="38" r="20" fill={isDarkMode ? '#061324' : '#ffffff'} stroke="#42bd67" strokeWidth="2" />
                <rect x="44" y="30" width="26" height="13" fill="#f58220" rx="2" />
                <line x1="40" y1="45" x2="74" y2="45" stroke="var(--muted)" strokeWidth="3" />
                <text x="57" y="74" textAnchor="middle" fill="var(--text)" fontSize="11" fontWeight="800">BL-01</text>
                <text x="57" y="87" textAnchor="middle" fill="var(--muted)" fontSize="9">Bulldozer / Bull</text>
                <rect x="18" y="94" width="80" height="14" rx="3" fill="#42bd67" />
                <text x="57" y="104" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="700">CAT D8T · DISPO</text>
              </g>

              {/* 4. Chargeuse (CH-01) */}
              <g onClick={() => setSelectedNode('CH-01')} style={{ cursor: 'pointer' }} transform="translate(480, 50)">
                <rect 
                  x="0" y="0" width="115" height="115" rx="8" 
                  fill={selectedNode === 'CH-01' ? (isDarkMode ? '#0e2b4d' : '#e0f2fe') : (isDarkMode ? '#0a1e38' : '#f8fafc')}
                  stroke={selectedNode === 'CH-01' ? 'var(--orange)' : 'var(--border)'} 
                  strokeWidth={selectedNode === 'CH-01' ? '2.5' : '1.5'}
                />
                <circle cx="57" cy="38" r="20" fill={isDarkMode ? '#061324' : '#ffffff'} stroke="#42bd67" strokeWidth="2" />
                <polygon points="46,42 66,42 69,32 54,32" fill="#f58220" />
                <circle cx="48" cy="46" r="3.5" fill="var(--muted)" />
                <circle cx="64" cy="46" r="3.5" fill="var(--muted)" />
                <text x="57" y="74" textAnchor="middle" fill="var(--text)" fontSize="11" fontWeight="800">CH-01</text>
                <text x="57" y="87" textAnchor="middle" fill="var(--muted)" fontSize="9">Chargeuse Pneus</text>
                <rect x="18" y="94" width="80" height="14" rx="3" fill="#42bd67" />
                <text x="57" y="104" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="700">CAT 988K · DISPO</text>
              </g>

              {/* 5. Tracteur (TR-01) */}
              <g onClick={() => setSelectedNode('TR-01')} style={{ cursor: 'pointer' }} transform="translate(630, 50)">
                <rect 
                  x="0" y="0" width="115" height="115" rx="8" 
                  fill={selectedNode === 'TR-01' ? (isDarkMode ? '#0e2b4d' : '#e0f2fe') : (isDarkMode ? '#0a1e38' : '#f8fafc')}
                  stroke={selectedNode === 'TR-01' ? 'var(--orange)' : 'var(--border)'} 
                  strokeWidth={selectedNode === 'TR-01' ? '2.5' : '1.5'}
                />
                <circle cx="57" cy="38" r="20" fill={isDarkMode ? '#061324' : '#ffffff'} stroke="#42bd67" strokeWidth="2" />
                <rect x="45" y="32" width="18" height="12" fill="#f58220" rx="2" />
                <circle cx="48" cy="45" r="3" fill="var(--muted)" />
                <circle cx="63" cy="45" r="4" fill="var(--muted)" />
                <text x="57" y="74" textAnchor="middle" fill="var(--text)" fontSize="11" fontWeight="800">TR-01</text>
                <text x="57" y="87" textAnchor="middle" fill="var(--muted)" fontSize="9">Tracteur de Quai</text>
                <rect x="18" y="94" width="80" height="14" rx="3" fill="#42bd67" />
                <text x="57" y="104" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="700">Terberg · DISPO</text>
              </g>

              {/* 6. Tractopelle (TP-01) */}
              <g onClick={() => setSelectedNode('TP-01')} style={{ cursor: 'pointer' }} transform="translate(775, 50)">
                <rect 
                  x="0" y="0" width="105" height="115" rx="8" 
                  fill={selectedNode === 'TP-01' ? (isDarkMode ? '#0e2b4d' : '#e0f2fe') : (isDarkMode ? '#0a1e38' : '#f8fafc')}
                  stroke={selectedNode === 'TP-01' ? 'var(--orange)' : 'var(--border)'} 
                  strokeWidth={selectedNode === 'TP-01' ? '2.5' : '1.5'}
                />
                <circle cx="52" cy="38" r="19" fill={isDarkMode ? '#061324' : '#ffffff'} stroke="#42bd67" strokeWidth="2" />
                <line x1="42" y1="36" x2="62" y2="36" stroke="#f58220" strokeWidth="3" />
                <line x1="62" y1="36" x2="68" y2="44" stroke="#f58220" strokeWidth="2" />
                <circle cx="44" cy="44" r="3" fill="var(--muted)" />
                <circle cx="58" cy="44" r="3" fill="var(--muted)" />
                <text x="52" y="74" textAnchor="middle" fill="var(--text)" fontSize="11" fontWeight="800">TP-01</text>
                <text x="52" y="87" textAnchor="middle" fill="var(--muted)" fontSize="9">Tractopelle</text>
                <rect x="14" y="94" width="76" height="14" rx="3" fill="#42bd67" />
                <text x="52" y="104" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="700">JCB 4CX · DISPO</text>
              </g>

              {/* 7. Quai & Ship Loader (SL-01) */}
              <g onClick={() => setSelectedNode('SL-01')} style={{ cursor: 'pointer' }} transform="translate(895, 50)">
                <rect 
                  x="0" y="0" width="95" height="115" rx="8" 
                  fill={selectedNode === 'SL-01' ? (isDarkMode ? '#0e2b4d' : '#e0f2fe') : (isDarkMode ? '#0a1e38' : '#f8fafc')}
                  stroke={selectedNode === 'SL-01' ? '#2563eb' : 'var(--border)'} 
                  strokeWidth="2"
                />
                <circle cx="47" cy="38" r="18" fill={isDarkMode ? '#061324' : '#ffffff'} stroke="#2563eb" strokeWidth="2" />
                <path d="M 38 42 L 56 42 L 52 28 Z" fill="#2563eb" />
                <text x="47" y="74" textAnchor="middle" fill="var(--text)" fontSize="11" fontWeight="800">SL-01</text>
                <text x="47" y="87" textAnchor="middle" fill="var(--muted)" fontSize="9">Ship Loader</text>
                <rect x="10" y="94" width="76" height="14" rx="3" fill="#2563eb" />
                <text x="47" y="104" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="700">QUAI · CHARGEMENT</text>
              </g>
            </svg>
          </div>
        </div>

        {/* Détail interactif de l'équipement sélectionné avec Granularité & Dates */}
        <div 
          style={{
            marginTop: '16px',
            padding: '16px 20px',
            borderRadius: '10px',
            backgroundColor: isDarkMode ? '#07182c' : '#f8fafc',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div 
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '8px',
                backgroundColor: currentNode.color,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '14px'
              }}
            >
              {currentNode.id}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>
                  {currentNode.name}
                </h4>
                <span 
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: currentNode.color,
                    color: '#ffffff'
                  }}
                >
                  {currentNode.status}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--muted)', border: '1px solid var(--border)', padding: '1px 6px', borderRadius: '4px' }}>
                  {currentNode.tag}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '3px' }}>
                {currentNode.desc} · <strong style={{ color: 'var(--text)' }}>Heures compteur : {currentNode.hours}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>MTBF {currentPeriod.label}</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#2563eb' }}>{currentNode.mtbf}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>MTTR {currentPeriod.label}</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--orange)' }}>{currentNode.mttr}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Disponibilité</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--green)' }}>{currentNode.availability}</div>
            </div>

            {/* Sparkline d'évolution */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <span style={{ fontSize: '9px', color: 'var(--muted)' }}>Tendance (6 {currentPeriod.label.toLowerCase()}s)</span>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '22px' }}>
                {currentPeriod.trend.map((val, idx) => (
                  <div 
                    key={idx}
                    style={{
                      width: '6px',
                      height: `${(val - 90) * 2.2}px`,
                      borderRadius: '1px',
                      backgroundColor: idx === currentPeriod.trend.length - 1 ? 'var(--orange)' : 'var(--border)'
                    }}
                  />
                ))}
              </div>
            </div>

            {onNavigate && (
              <button 
                type="button" 
                className="btn-primary" 
                style={{ padding: '8px 14px', fontSize: '12px' }}
                onClick={() => onNavigate('equipements')}
              >
                <span>Détail Engin</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
