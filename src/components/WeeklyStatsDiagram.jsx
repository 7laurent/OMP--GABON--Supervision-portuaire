import React, { useState } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Layers, 
  Wrench, 
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import EquipmentKpiModal from './modals/EquipmentKpiModal.jsx';

/**
 * COMPOSANT DE SCHÉMAS STATISTIQUES HEBDOMADAIRES & MULTI-PÉRIODES
 * Permet de visualiser les KPI détaillés avec les dates reliées :
 * - Par Mois
 * - Par Semaine (S05 à S10)
 * - Par Jour (Lundi à Dimanche)
 * - Par Heure / Quart (3x8)
 * Et affiche la comparaison des 7 types d'équipements portuaires :
 * Pelle mécanique, Chargeuse, Dumper, Bulldozer / Bull, Tracteur, Camion, Tractopelle.
 */
export default function WeeklyStatsDiagram({ 
  pageTitle = "Statistiques de Maintenance Portuaire",
  subtitle = "Suivi hebdomadaire & analyse temporelle des indicateurs de performance AFNOR",
  context = "dashboard",
  onSelectMachineKpi = null
}) {
  const { isDarkMode } = useTheme();

  // Granularité temporelle : 'mois' | 'semaine' | 'jour' | 'heure'
  const [granularity, setGranularity] = useState('semaine');
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(0);
  const [selectedEquipmentFilter, setSelectedEquipmentFilter] = useState('all');
  const [internalSelectedMachineForKpi, setInternalSelectedMachineForKpi] = useState(null);

  // Les 7 types d'engins portuaires officiels
  const equipmentTypes = [
    { id: 'all', label: 'Tous les engins (Flotte Complète)' },
    { id: 'pelle', label: 'Pelle mécanique', code: 'PM' },
    { id: 'chargeuse', label: 'Chargeuse', code: 'CH' },
    { id: 'dumper', label: 'Dumper', code: 'DP' },
    { id: 'bulldozer', label: 'Bulldozer / Bull', code: 'BL' },
    { id: 'tracteur', label: 'Tracteur', code: 'TR' },
    { id: 'camion', label: 'Camion', code: 'CM' },
    { id: 'tractopelle', label: 'Tractopelle', code: 'TP' },
  ];

  // Données temporelles selon la granularité sélectionnée
  const temporalData = {
    mois: [
      {
        label: 'Mars 2025 (En cours)',
        dateRange: '01/03/2025 au 31/03/2025',
        timestamp: '09/03/2025 à 15:30:00',
        mtbf: 154.8,
        mttr: 2.35,
        disponibilite: 96.9,
        operatingHours: 5820,
        downtimeHours: 185,
        pannesCount: 14,
        workOrdersCount: 42,
        chartData: [
          { name: 'Oct 2024', dispo: 92.4, mtbf: 130, mttr: 3.1, pannes: 22 },
          { name: 'Nov 2024', dispo: 93.8, mtbf: 138, mttr: 2.9, pannes: 19 },
          { name: 'Déc 2024', dispo: 91.5, mtbf: 125, mttr: 3.4, pannes: 25 },
          { name: 'Jan 2025', dispo: 94.6, mtbf: 144, mttr: 2.6, pannes: 16 },
          { name: 'Fév 2025', dispo: 95.7, mtbf: 149, mttr: 2.5, pannes: 15 },
          { name: 'Mar 2025', dispo: 96.9, mtbf: 155, mttr: 2.3, pannes: 14 }
        ]
      },
      {
        label: 'Février 2025',
        dateRange: '01/02/2025 au 28/02/2025',
        timestamp: '28/02/2025 à 23:59:59',
        mtbf: 149.2,
        mttr: 2.50,
        disponibilite: 95.7,
        operatingHours: 18450,
        downtimeHours: 820,
        pannesCount: 58,
        workOrdersCount: 134,
        chartData: [
          { name: 'Sem 05', dispo: 94.8, mtbf: 142, mttr: 2.7, pannes: 16 },
          { name: 'Sem 06', dispo: 95.2, mtbf: 146, mttr: 2.6, pannes: 15 },
          { name: 'Sem 07', dispo: 96.1, mtbf: 151, mttr: 2.4, pannes: 13 },
          { name: 'Sem 08', dispo: 96.8, mtbf: 158, mttr: 2.2, pannes: 14 }
        ]
      }
    ],
    semaine: [
      {
        label: 'Semaine 10 (03/03 - 09/03/2025) · Semaine en cours',
        dateRange: 'Du Lundi 03 Mars au Dimanche 09 Mars 2025',
        timestamp: '09/03/2025 à 15:30:00 (Temps Réel)',
        mtbf: 156.4,
        mttr: 2.20,
        disponibilite: 97.4,
        operatingHours: 4320,
        downtimeHours: 114,
        pannesCount: 6,
        workOrdersCount: 18,
        chartData: [
          { name: 'Semaine S05 (27 Jan - 02 Fév)', dispo: 93.5, mtbf: 135, mttr: 2.9, pannes: 18, wo: 34 },
          { name: 'Semaine S06 (03 Fév - 09 Fév)', dispo: 94.8, mtbf: 142, mttr: 2.7, pannes: 15, wo: 38 },
          { name: 'Semaine S07 (10 Fév - 16 Fév)', dispo: 95.6, mtbf: 148, mttr: 2.5, pannes: 12, wo: 40 },
          { name: 'Semaine S08 (17 Fév - 23 Fév)', dispo: 96.2, mtbf: 152, mttr: 2.4, pannes: 10, wo: 42 },
          { name: 'Semaine S09 (24 Fév - 02 Mar)', dispo: 96.8, mtbf: 154, mttr: 2.3, pannes: 8, wo: 45 },
          { name: 'Semaine S10 (03 Mar - 09 Mar)', dispo: 97.4, mtbf: 156, mttr: 2.2, pannes: 6, wo: 48 }
        ]
      },
      {
        label: 'Semaine 09 (24/02 - 02/03/2025)',
        dateRange: 'Du Lundi 24 Février au Dimanche 02 Mars 2025',
        timestamp: '02/03/2025 à 23:59:59',
        mtbf: 154.1,
        mttr: 2.30,
        disponibilite: 96.8,
        operatingHours: 4280,
        downtimeHours: 138,
        pannesCount: 8,
        workOrdersCount: 45,
        chartData: [
          { name: 'S05', dispo: 93.5, mtbf: 135, mttr: 2.9, pannes: 18, wo: 34 },
          { name: 'S06', dispo: 94.8, mtbf: 142, mttr: 2.7, pannes: 15, wo: 38 },
          { name: 'S07', dispo: 95.6, mtbf: 148, mttr: 2.5, pannes: 12, wo: 40 },
          { name: 'S08', dispo: 96.2, mtbf: 152, mttr: 2.4, pannes: 10, wo: 42 },
          { name: 'S09', dispo: 96.8, mtbf: 154, mttr: 2.3, pannes: 8, wo: 45 }
        ]
      }
    ],
    jour: [
      {
        label: "Aujourd'hui · Dimanche 09 Mars 2025",
        dateRange: '09/03/2025 (00:00 - 23:59)',
        timestamp: '09/03/2025 à 15:30:00',
        mtbf: 168.0,
        mttr: 1.80,
        disponibilite: 98.2,
        operatingHours: 640,
        downtimeHours: 12,
        pannesCount: 1,
        workOrdersCount: 5,
        chartData: [
          { name: 'Lun 03/03', dispo: 96.4, mtbf: 150, mttr: 2.4, pannes: 2 },
          { name: 'Mar 04/03', dispo: 97.0, mtbf: 155, mttr: 2.2, pannes: 1 },
          { name: 'Mer 05/03', dispo: 95.8, mtbf: 148, mttr: 2.6, pannes: 3 },
          { name: 'Jeu 06/03', dispo: 97.2, mtbf: 158, mttr: 2.1, pannes: 1 },
          { name: 'Ven 07/03', dispo: 96.9, mtbf: 154, mttr: 2.3, pannes: 2 },
          { name: 'Sam 08/03', dispo: 98.0, mtbf: 162, mttr: 1.9, pannes: 0 },
          { name: 'Dim 09/03', dispo: 98.2, mtbf: 168, mttr: 1.8, pannes: 1 }
        ]
      },
      {
        label: 'Hier · Samedi 08 Mars 2025',
        dateRange: '08/03/2025 (00:00 - 23:59)',
        timestamp: '08/03/2025 à 23:59:59',
        mtbf: 162.5,
        mttr: 1.90,
        disponibilite: 98.0,
        operatingHours: 680,
        downtimeHours: 14,
        pannesCount: 0,
        workOrdersCount: 4,
        chartData: [
          { name: 'Lun 03/03', dispo: 96.4, mtbf: 150, mttr: 2.4, pannes: 2 },
          { name: 'Mar 04/03', dispo: 97.0, mtbf: 155, mttr: 2.2, pannes: 1 },
          { name: 'Mer 05/03', dispo: 95.8, mtbf: 148, mttr: 2.6, pannes: 3 },
          { name: 'Jeu 06/03', dispo: 97.2, mtbf: 158, mttr: 2.1, pannes: 1 },
          { name: 'Ven 07/03', dispo: 96.9, mtbf: 154, mttr: 2.3, pannes: 2 },
          { name: 'Sam 08/03', dispo: 98.0, mtbf: 162, mttr: 1.9, pannes: 0 }
        ]
      }
    ],
    heure: [
      {
        label: 'Quart Actuel · 14:00 - 22:00 (Quart d\'Après-Midi)',
        dateRange: '09/03/2025 entre 14:00 et 22:00',
        timestamp: '09/03/2025 à 15:30:00',
        mtbf: 172.0,
        mttr: 1.50,
        disponibilite: 98.8,
        operatingHours: 195,
        downtimeHours: 2.4,
        pannesCount: 0,
        workOrdersCount: 2,
        chartData: [
          { name: '06h-08h', dispo: 97.8, mtbf: 165, mttr: 2.0, pannes: 0 },
          { name: '08h-10h', dispo: 98.2, mtbf: 170, mttr: 1.8, pannes: 0 },
          { name: '10h-12h', dispo: 96.5, mtbf: 152, mttr: 2.4, pannes: 1 },
          { name: '12h-14h', dispo: 98.0, mtbf: 168, mttr: 1.9, pannes: 0 },
          { name: '14h-16h', dispo: 98.8, mtbf: 172, mttr: 1.5, pannes: 0 }
        ]
      },
      {
        label: 'Quart Matin · 06:00 - 14:00',
        dateRange: '09/03/2025 entre 06:00 et 14:00',
        timestamp: '09/03/2025 à 14:00:00',
        mtbf: 166.5,
        mttr: 1.95,
        disponibilite: 97.6,
        operatingHours: 510,
        downtimeHours: 12.5,
        pannesCount: 1,
        workOrdersCount: 3,
        chartData: [
          { name: '06h-08h', dispo: 97.8, mtbf: 165, mttr: 2.0, pannes: 0 },
          { name: '08h-10h', dispo: 98.2, mtbf: 170, mttr: 1.8, pannes: 0 },
          { name: '10h-12h', dispo: 96.5, mtbf: 152, mttr: 2.4, pannes: 1 },
          { name: '12h-14h', dispo: 98.0, mtbf: 168, mttr: 1.9, pannes: 0 }
        ]
      }
    ]
  };

  // Période courante sélectionnée
  const activePeriods = temporalData[granularity] || temporalData.semaine;
  const currentPeriod = activePeriods[selectedPeriodIndex] || activePeriods[0];

  // Données statistiques par engin portuaire (les 7 engins demandés)
  const equipmentFleetStats = [
    {
      type: 'Pelle mécanique',
      code: 'PM',
      count: 14,
      dispoSemaine: 96.8,
      mtbfSemaine: 162.0,
      mttrSemaine: 2.1,
      pannesSemaine: 1,
      lastIntervention: '07/03/2025 à 11:20',
      status: 'Opérationnel'
    },
    {
      type: 'Chargeuse',
      code: 'CH',
      count: 18,
      dispoSemaine: 97.5,
      mtbfSemaine: 170.5,
      mttrSemaine: 1.9,
      pannesSemaine: 1,
      lastIntervention: '06/03/2025 à 16:45',
      status: 'Opérationnel'
    },
    {
      type: 'Dumper',
      code: 'DP',
      count: 22,
      dispoSemaine: 95.9,
      mtbfSemaine: 148.0,
      mttrSemaine: 2.4,
      pannesSemaine: 2,
      lastIntervention: '08/03/2025 à 09:10',
      status: 'En maintenance'
    },
    {
      type: 'Bulldozer / Bull',
      code: 'BL',
      count: 12,
      dispoSemaine: 96.4,
      mtbfSemaine: 155.0,
      mttrSemaine: 2.2,
      pannesSemaine: 1,
      lastIntervention: '05/03/2025 à 14:00',
      status: 'Opérationnel'
    },
    {
      type: 'Tracteur',
      code: 'TR',
      count: 26,
      dispoSemaine: 98.1,
      mtbfSemaine: 182.0,
      mttrSemaine: 1.6,
      pannesSemaine: 0,
      lastIntervention: '04/03/2025 à 08:30',
      status: 'Opérationnel'
    },
    {
      type: 'Camion',
      code: 'CM',
      count: 24,
      dispoSemaine: 97.2,
      mtbfSemaine: 160.0,
      mttrSemaine: 2.0,
      pannesSemaine: 1,
      lastIntervention: '07/03/2025 à 15:15',
      status: 'Opérationnel'
    },
    {
      type: 'Tractopelle',
      code: 'TP',
      count: 12,
      dispoSemaine: 97.8,
      mtbfSemaine: 174.0,
      mttrSemaine: 1.7,
      pannesSemaine: 0,
      lastIntervention: '03/03/2025 à 10:00',
      status: 'Opérationnel'
    }
  ];

  // Filtrer selon la sélection
  const filterStr = String(selectedEquipmentFilter || 'all').toLowerCase();
  const displayedFleetStats = filterStr === 'all' 
    ? equipmentFleetStats 
    : equipmentFleetStats.filter(e => 
        e.type.toLowerCase().includes(filterStr) || 
        (e.code && e.code.toLowerCase().includes(filterStr))
      );

  return (
    <div className="section" id="weekly-stats-diagram-container" style={{ marginBottom: '32px' }}>
      {/* En-tête du composant avec Titre et Sélecteur temporel */}
      <div className="section-heading" style={{ flexWrap: 'wrap', gap: '16px', alignItems: 'flex-start' }}>
        <div>
          <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BarChart3 size={15} color="var(--orange)" />
            <span>SCHÉMA STATISTIQUE &amp; GRANULARITÉ TEMPORELLE DES KPIS</span>
          </div>
          <div className="section-title" style={{ fontSize: '24px', marginTop: '4px' }}>
            {pageTitle}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
            {subtitle}
          </p>
        </div>

        {/* Boutons sélecteurs de granularité : Mois, Semaine, Jour, Heure */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <div 
            style={{ 
              display: 'inline-flex', 
              background: isDarkMode ? '#0d223f' : '#e2e8f0', 
              padding: '3px', 
              borderRadius: '8px',
              border: '1px solid var(--border)'
            }}
          >
            {[
              { id: 'mois', label: 'Mois' },
              { id: 'semaine', label: 'Semaine (Recommandé)' },
              { id: 'jour', label: 'Jour' },
              { id: 'heure', label: 'Heure (Quart 3×8)' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setGranularity(tab.id);
                  setSelectedPeriodIndex(0);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: granularity === tab.id ? 'var(--orange)' : 'transparent',
                  color: granularity === tab.id ? '#ffffff' : 'var(--text-muted)'
                }}
                id={`btn-granularity-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sélecteur de période spécifique */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
              Période :
            </span>
            <select
              value={selectedPeriodIndex}
              onChange={(e) => setSelectedPeriodIndex(Number(e.target.value))}
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                fontSize: '12px',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
              id="select-period-detail"
            >
              {activePeriods.map((period, idx) => (
                <option key={idx} value={idx}>{period.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cartouche d'informations temporelles reliées */}
      <div 
        style={{
          background: isDarkMode ? '#0a1d35' : '#f8fafc',
          border: '1px solid var(--border)',
          borderLeft: '4px solid var(--orange)',
          borderRadius: '8px',
          padding: '12px 18px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} color="var(--orange)" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
              {currentPeriod.dateRange}
            </span>
          </div>
          <span style={{ color: 'var(--border)' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--muted)' }}>
            <Clock size={14} />
            <span>Dernier recalcul d'échantillonnage : <strong>{currentPeriod.timestamp}</strong></span>
          </div>
        </div>

        {/* Filtre d'équipement (Pelle, Chargeuse, Dumper, Bull, Tracteur, Camion, Tractopelle) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={14} color="var(--muted)" />
          <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Filtrer engin :</span>
          <select
            value={selectedEquipmentFilter}
            onChange={(e) => setSelectedEquipmentFilter(e.target.value)}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontSize: '12px',
              padding: '4px 8px',
              borderRadius: '6px'
            }}
          >
            {equipmentTypes.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TRIO DES KPIS CALCULÉS SUR LA PÉRIODE SÉLECTIONNÉE */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        {/* 1. DISPONIBILITÉ */}
        <div className="kpi-card" style={{ padding: '18px', borderTop: '3px solid var(--green)' }}>
          <div className="kpi-top">
            <span className="kpi-title">Disponibilité ({granularity.toUpperCase()})</span>
            <Activity size={18} color="var(--green)" />
          </div>
          <div className="kpi-number" style={{ fontSize: '32px', color: 'var(--green)', margin: '10px 0 4px' }}>
            {currentPeriod.disponibilite}%
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Fonct: <strong>{currentPeriod.operatingHours} h</strong></span>
            <span>Arrêts: <strong>{currentPeriod.downtimeHours} h</strong></span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>
            Norme AFNOR NF EN 13306
          </div>
        </div>

        {/* 2. MTBF */}
        <div className="kpi-card" style={{ padding: '18px', borderTop: '3px solid var(--orange)' }}>
          <div className="kpi-top">
            <span className="kpi-title">MTBF (Fiabilité moyenne)</span>
            <Clock size={18} color="var(--orange)" />
          </div>
          <div className="kpi-number" style={{ fontSize: '32px', color: 'var(--orange)', margin: '10px 0 4px' }}>
            {currentPeriod.mtbf} h
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
            TBF moyen entre 2 défaillances
          </div>
          <div style={{ fontSize: '10px', color: 'var(--green)', fontWeight: 700, marginTop: '4px' }}>
            ↑ +4.2% vs période précédente
          </div>
        </div>

        {/* 3. MTTR */}
        <div className="kpi-card" style={{ padding: '18px', borderTop: '3px solid #3b82f6' }}>
          <div className="kpi-top">
            <span className="kpi-title">MTTR (Maintenabilité)</span>
            <Wrench size={18} color="#3b82f6" />
          </div>
          <div className="kpi-number" style={{ fontSize: '32px', color: '#3b82f6', margin: '10px 0 4px' }}>
            {currentPeriod.mttr} h
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
            Durée moyenne de remise en état
          </div>
          <div style={{ fontSize: '10px', color: 'var(--green)', fontWeight: 700, marginTop: '4px' }}>
            ↓ -12m de gain de réactivité
          </div>
        </div>

        {/* 4. INCIDENTS & WORK ORDERS */}
        <div className="kpi-card" style={{ padding: '18px', borderTop: '3px solid var(--dark-blue)' }}>
          <div className="kpi-top">
            <span className="kpi-title">Pannes / Work Orders</span>
            <AlertTriangle size={18} color="var(--orange)" />
          </div>
          <div className="kpi-number" style={{ fontSize: '32px', color: 'var(--text)', margin: '10px 0 4px' }}>
            {currentPeriod.pannesCount} <span style={{ fontSize: '16px', color: 'var(--muted)' }}>/ {currentPeriod.workOrdersCount} WO</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
            Taux de résolution : <strong>92%</strong>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>
            Enregistrements certifiés GMAO
          </div>
        </div>
      </div>

      {/* SCHÉMA STATISTIQUE HEBDOMADAIRE MULTI-SEMAINES / CHRONOLOGIQUE */}
      <div 
        className="performance-card"
        style={{
          padding: '24px',
          backgroundColor: isDarkMode ? '#07182e' : '#ffffff',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '24px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <strong style={{ fontSize: '15px', color: 'var(--text)' }}>
              Évolution Statistique Représentative · {granularity === 'semaine' ? 'Par Semaine (S05 à S10)' : granularity === 'mois' ? 'Par Mois' : granularity === 'jour' ? 'Par Jour (Semaine en cours)' : 'Par Tranche Horaire (Quart 3×8)'}
            </strong>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
              Disponibilité opérationnelle (barres vertes), MTBF (heures) et nombre d'arrêts
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', fontSize: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', background: 'var(--green)', borderRadius: '2px' }} />
              Disponibilité (%)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', background: 'var(--orange)', borderRadius: '2px' }} />
              MTBF (h)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', background: 'var(--red)', borderRadius: '2px' }} />
              Pannes
            </span>
          </div>
        </div>

        {/* Bar Chart CSS/SVG Dynamique */}
        <div style={{ display: 'flex', alignItems: 'flex-end', height: '190px', gap: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
          {currentPeriod.chartData.map((item, idx) => {
            const barHeight = Math.max(20, (item.dispo - 85) * 12); // Échelle ajustée
            const isLatest = idx === currentPeriod.chartData.length - 1;
            return (
              <div 
                key={idx} 
                style={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  height: '100%', 
                  justifyContent: 'flex-end',
                  cursor: 'pointer'
                }}
                title={`${item.name} : Dispo ${item.dispo}% | MTBF ${item.mtbf}h | MTTR ${item.mttr}h | ${item.pannes} pannes`}
              >
                {/* Valeur affichée au dessus de la barre */}
                <span style={{ fontSize: '10px', fontWeight: 700, color: isLatest ? 'var(--orange)' : 'var(--text)', marginBottom: '4px' }}>
                  {item.dispo}%
                </span>

                {/* Barre combinée avec indicateur */}
                <div style={{ width: '100%', maxWidth: '44px', display: 'flex', alignItems: 'flex-end', gap: '3px', height: '130px' }}>
                  <div 
                    style={{ 
                      flex: 1, 
                      height: `${barHeight}px`, 
                      background: isLatest ? 'var(--green)' : isDarkMode ? '#1e3a8a' : '#93c5fd', 
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.4s ease'
                    }} 
                  />
                  <div 
                    style={{ 
                      width: '8px', 
                      height: `${Math.min(120, item.pannes * 6)}px`, 
                      background: item.pannes > 15 ? 'var(--red)' : 'var(--orange)', 
                      borderRadius: '2px 2px 0 0'
                    }} 
                    title={`${item.pannes} pannes`}
                  />
                </div>

                {/* Étiquette d'axe temporel */}
                <span style={{ fontSize: '11px', color: isLatest ? 'var(--orange)' : 'var(--muted)', marginTop: '8px', fontWeight: isLatest ? 700 : 500, textAlign: 'center' }}>
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* TABLEAU DES 7 ÉQUIPEMENTS PORTUAIRES AVEC LEURS KPIS DÉTAILLÉS & BOUTON "VOIR LES KPI" */}
      <div 
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <strong style={{ fontSize: '15px', color: 'var(--text)' }}>
              Indicateurs Spécifiques par Équipement de Manutention ({currentPeriod.dateRange})
            </strong>
            <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '2px 0 0' }}>
              Pelle mécanique, Chargeuse, Dumper, Bulldozer / Bull, Tracteur, Camion, Tractopelle.
            </p>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
            {displayedFleetStats.length} type(s) d'équipements répertoriés
          </span>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Type d'Équipement</th>
                <th>Code</th>
                <th>Parc Enregistré</th>
                <th>Disponibilité</th>
                <th>MTBF (Moyenne)</th>
                <th>MTTR</th>
                <th>Pannes ({granularity})</th>
                <th>Dernière Intervention</th>
                <th>État</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedFleetStats.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--text)' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.status === 'Opérationnel' ? 'var(--green)' : 'var(--orange)' }} />
                      {item.type}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, padding: '2px 6px', background: isDarkMode ? '#112240' : '#e2e8f0', borderRadius: '4px' }}>
                      {item.code}
                    </span>
                  </td>
                  <td>
                    <strong>{item.count}</strong> unités
                  </td>
                  <td>
                    <strong style={{ color: item.dispoSemaine >= 96 ? 'var(--green)' : 'var(--orange)' }}>
                      {item.dispoSemaine}%
                    </strong>
                  </td>
                  <td>
                    <strong>{item.mtbfSemaine} h</strong>
                  </td>
                  <td>
                    <span style={{ color: item.mttrSemaine <= 2.0 ? 'var(--green)' : 'var(--orange)' }}>
                      {item.mttrSemaine} h
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${item.pannesSemaine === 0 ? 'status-done' : 'status-progress'}`}>
                      {item.pannesSemaine}
                    </span>
                  </td>
                  <td style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    {item.lastIntervention}
                  </td>
                  <td>
                    <span className={`status-badge ${item.status === 'Opérationnel' ? 'status-done' : 'status-progress'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="outline-button"
                      style={{ padding: '5px 10px', fontSize: '11px', borderRadius: '5px', borderColor: 'var(--orange)', color: 'var(--orange)' }}
                      onClick={() => {
                        const machineData = {
                          id: `EQ-${item.code}-01`,
                          name: `${item.type} (${item.code}-01)`,
                          code: `${item.code}-01`,
                          category: item.type,
                          status: item.status,
                          criticality: 'Critique',
                          location: 'Terminal Portuaire d’Owendo',
                          operatingHours: Math.round(item.mtbfSemaine * 15),
                          downtimeHours: Math.round(item.mttrSemaine * item.pannesSemaine * 4 + 14),
                          mtbf: item.mtbfSemaine,
                          mttr: `${item.mttrSemaine}h`,
                          dispo: item.dispoSemaine
                        };

                        if (onSelectMachineKpi) {
                          onSelectMachineKpi(machineData);
                        } else {
                          setInternalSelectedMachineForKpi(machineData);
                        }
                      }}
                    >
                      Voir les KPI →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal KPI si non géré par la page parente */}
      {internalSelectedMachineForKpi && (
        <EquipmentKpiModal
          equipment={internalSelectedMachineForKpi}
          onClose={() => setInternalSelectedMachineForKpi(null)}
        />
      )}
    </div>
  );
}
