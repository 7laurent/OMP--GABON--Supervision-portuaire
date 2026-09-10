import React, { useState } from 'react';
import { 
  Wrench, 
  Truck, 
  Maximize2, 
  History, 
  PlusCircle, 
  Package, 
  CheckCircle2, 
  AlertTriangle, 
  CheckSquare, 
  Calendar, 
  Gauge, 
  ChevronRight,
  Clock,
  TrendingUp,
  Filter,
  BarChart3,
  Layers
} from 'lucide-react';
import { Equipment } from '../types';
import { useTheme } from '../context/ThemeContext';

interface CategorySupervisionProps {
  equipments: Equipment[];
  onSelectEquipment: (eq: Equipment) => void;
  onCreateWoForEquipment: (eqName: string, category: string) => void;
  onOpenParts: (machineName: string) => void;
  onValidateStep: (stepTitle: string) => void;
}

// Données temporelles détaillées pour chaque granularité avec dates exactes
const PERIOD_DATA = {
  month: {
    label: 'Mensuel',
    currentPeriod: 'Mars 2025 (01/03/2025 - 31/03/2025)',
    periods: [
      { label: 'Oct 2024 (01/10 - 31/10)', dispo: 94.8, mtbf: 142, mttr: 2.8 },
      { label: 'Nov 2024 (01/11 - 30/11)', dispo: 95.5, mtbf: 155, mttr: 2.6 },
      { label: 'Déc 2024 (01/12 - 31/12)', dispo: 93.9, mtbf: 138, mttr: 3.1 },
      { label: 'Jan 2025 (01/01 - 31/01)', dispo: 96.2, mtbf: 168, mttr: 2.4 },
      { label: 'Fév 2025 (01/02 - 28/02)', dispo: 97.4, mtbf: 182, mttr: 2.1 },
      { label: 'Mar 2025 (01/03 - 31/03)', dispo: 98.1, mtbf: 195, mttr: 1.9 }
    ]
  },
  week: {
    label: 'Hebdomadaire',
    currentPeriod: 'Semaine 09 (24 Fév - 02 Mar 2025)',
    periods: [
      { label: 'S04 (20/01 - 26/01/2025)', dispo: 95.2, mtbf: 150, mttr: 2.7 },
      { label: 'S05 (27/01 - 02/02/2025)', dispo: 96.0, mtbf: 162, mttr: 2.4 },
      { label: 'S06 (03/02 - 09/02/2025)', dispo: 96.8, mtbf: 170, mttr: 2.2 },
      { label: 'S07 (10/02 - 16/02/2025)', dispo: 97.2, mtbf: 178, mttr: 2.0 },
      { label: 'S08 (17/02 - 23/02/2025)', dispo: 97.6, mtbf: 185, mttr: 1.9 },
      { label: 'S09 (24/02 - 02/03/2025)', dispo: 98.0, mtbf: 192, mttr: 1.8 }
    ]
  },
  day: {
    label: 'Journalier',
    currentPeriod: 'Dimanche 02 Mars 2025',
    periods: [
      { label: 'Mar 25 Fév 2025', dispo: 96.5, mtbf: 165, mttr: 2.3 },
      { label: 'Mer 26 Fév 2025', dispo: 97.0, mtbf: 172, mttr: 2.1 },
      { label: 'Jeu 27 Fév 2025', dispo: 97.8, mtbf: 180, mttr: 1.9 },
      { label: 'Ven 28 Fév 2025', dispo: 98.2, mtbf: 189, mttr: 1.8 },
      { label: 'Sam 01 Mar 2025', dispo: 98.5, mtbf: 194, mttr: 1.7 },
      { label: 'Dim 02 Mar 2025', dispo: 98.9, mtbf: 202, mttr: 1.6 }
    ]
  },
  hour: {
    label: 'Horaire',
    currentPeriod: 'Poste 1 : 08:00 - 16:00 (02/03/2025)',
    periods: [
      { label: '06h-08h (02/03)', dispo: 98.0, mtbf: 190, mttr: 1.8 },
      { label: '08h-10h (02/03)', dispo: 98.5, mtbf: 195, mttr: 1.7 },
      { label: '10h-12h (02/03)', dispo: 99.0, mtbf: 205, mttr: 1.5 },
      { label: '12h-14h (02/03)', dispo: 98.8, mtbf: 200, mttr: 1.6 },
      { label: '14h-16h (02/03)', dispo: 99.2, mtbf: 210, mttr: 1.4 },
      { label: '16h-18h (02/03)', dispo: 99.0, mtbf: 208, mttr: 1.5 }
    ]
  }
};

// Les 7 familles d'équipements du port de maintenance
const EQUIPMENT_CATEGORIES = [
  {
    key: 'Pelle mécanique',
    title: 'Pelle mécanique',
    iconName: 'Wrench',
    tag: 'Extraction & Chargement',
    desc: 'Alimentation continue des circuits minéraliers, carrière et fronts de taille',
    dispo: '97.2%',
    mtbf: '220 h',
    mttr: '1.4 h',
    fleetCount: '2 machines',
    items: [
      {
        code: 'PM-01',
        name: 'Pelle mécanique CAT 349D',
        status: 'Opérationnel',
        location: 'Quai Minéralier - Zone Stock',
        mtbf: '240h',
        mttr: '45m',
        dispo: '98.5%',
        hours: '8 450 h',
        specs: [
          { label: 'Pression hydraulique circuit principal', val: '350 bar (Nominal)', ok: true },
          { label: 'Godet renforcé Hardox 3.2 m³', val: 'Usure 18% (Conforme)', ok: true },
          { label: 'Moteur CAT C13 ACERT', val: '1 800 rpm · Régime stable', ok: true }
        ]
      },
      {
        code: 'PM-02',
        name: 'Pelle mécanique Komatsu PC490LC',
        status: 'Opérationnel',
        location: 'Parc à Minerai - Poste Nord',
        mtbf: '210h',
        mttr: '55m',
        dispo: '97.8%',
        hours: '6 200 h',
        specs: [
          { label: 'Vérin de flèche & godet', val: 'Étanchéité certifiée RAS', ok: true },
          { label: 'Température huile hydraulique', val: '68°C (Plage optimale)', ok: true },
          { label: 'Train de chenilles Komatsu', val: 'Tension normale 4.2 bar', ok: true }
        ]
      }
    ]
  },
  {
    key: 'Chargeuse',
    title: 'Chargeuse',
    iconName: 'Truck',
    tag: 'Reprise & Trémie',
    desc: 'Reprise du minerai au sol, chargement trémie et mise en stock',
    dispo: '96.5%',
    mtbf: '195 h',
    mttr: '1.6 h',
    fleetCount: '2 machines',
    items: [
      {
        code: 'CH-01',
        name: 'Chargeuse sur pneus CAT 988K',
        status: 'Opérationnel',
        location: 'Quai Minéralier - Reprise Trémie',
        mtbf: '215h',
        mttr: '50m',
        dispo: '98.0%',
        hours: '11 300 h',
        specs: [
          { label: 'Capacité godet 6.9 m³', val: 'Pesée embarquée OK', ok: true },
          { label: 'Pression pneus Michelin X-Mine', val: '6.5 bar (Équilibré)', ok: true },
          { label: 'Transmission Powershift', val: 'Température 74°C OK', ok: true }
        ]
      },
      {
        code: 'CH-02',
        name: 'Chargeuse Volvo L250H',
        status: 'En maintenance',
        location: 'Silo Central & Terrains Tampons',
        mtbf: '175h',
        mttr: '2.1h',
        dispo: '94.2%',
        hours: '7 850 h',
        specs: [
          { label: 'Intervention préventive 500h', val: 'Filtres hydrauliques en cours', ok: false },
          { label: 'Articulation centrale', val: 'Graissage validé', ok: true },
          { label: 'Moteur Volvo D13J', val: 'Vidange et analyse spectro', ok: true }
        ]
      }
    ]
  },
  {
    key: 'Dumper',
    title: 'Dumper',
    iconName: 'Truck',
    tag: 'Transport Pondéreux',
    desc: 'Transport lourd grand volume entre front de taille, concassage et quai',
    dispo: '95.1%',
    mtbf: '180 h',
    mttr: '2.0 h',
    fleetCount: '2 machines',
    items: [
      {
        code: 'DP-01',
        name: 'Dumper Articulé CAT 745C',
        status: 'Opérationnel',
        location: 'Piste Roulage Fosse - Quai',
        mtbf: '190h',
        mttr: '1.2h',
        dispo: '97.5%',
        hours: '13 900 h',
        specs: [
          { label: 'Charge utile 41 Tonnes', val: 'Suspension oléopneumatique OK', ok: true },
          { label: 'Vérin de bennage télescopique', val: 'Course complète testée', ok: true },
          { label: 'Ralentisseur hydraulique', val: 'Efficacité 100%', ok: true }
        ]
      },
      {
        code: 'DP-02',
        name: 'Dumper Rigide Komatsu HD785-7',
        status: 'À l\'arrêt',
        location: 'Circuit Fosse Minéralière Sud',
        mtbf: '155h',
        mttr: '3.4h',
        dispo: '91.8%',
        hours: '16 800 h',
        specs: [
          { label: 'Disques de freins humides', val: 'Remplacement requis (WO-044)', ok: false },
          { label: 'Vérin de bennage droit', val: 'Joint haute pression en dépose', ok: false },
          { label: 'Châssis haute résistance', val: 'Contrôle magnétoscopie OK', ok: true }
        ]
      }
    ]
  },
  {
    key: 'Bulldozer / Bull',
    title: 'Bulldozer / Bull',
    iconName: 'Layers',
    tag: 'Régalage & Terrassement',
    desc: 'Régalage des stocks de minerai, talutage et poussage haute puissance',
    dispo: '98.2%',
    mtbf: '260 h',
    mttr: '1.2 h',
    fleetCount: '2 machines',
    items: [
      {
        code: 'BL-01',
        name: 'Bulldozer / Bull CAT D8T',
        status: 'Opérationnel',
        location: 'Plateforme Régalage Stock',
        mtbf: '280h',
        mttr: '40m',
        dispo: '98.8%',
        hours: '10 400 h',
        specs: [
          { label: 'Lame semi-universelle SU 8.7 m³', val: 'Blindages d\'usure neufs', ok: true },
          { label: 'Ripper mono-dent', val: 'Pression descente nominale', ok: true },
          { label: 'Train de roulement suspendu', val: 'Galets lubrifiés à vie OK', ok: true }
        ]
      },
      {
        code: 'BL-02',
        name: 'Bulldozer / Bull Komatsu D375A',
        status: 'Opérationnel',
        location: 'Terril Minéralier Ouest',
        mtbf: '240h',
        mttr: '1.1h',
        dispo: '97.6%',
        hours: '6 900 h',
        specs: [
          { label: 'Puissance 630 CV', val: 'Régime sous charge 1 800 rpm', ok: true },
          { label: 'Tension des chenilles', val: 'Ajustée sous 4.5 bar', ok: true },
          { label: 'Convertisseur de couple', val: 'Verrouillage automatique OK', ok: true }
        ]
      }
    ]
  },
  {
    key: 'Tracteur',
    title: 'Tracteur',
    iconName: 'Truck',
    tag: 'Traction Portuaire & Roulage',
    desc: 'Traction des remorques ro-ro, transfert sur quai et manœuvres logistiques',
    dispo: '98.9%',
    mtbf: '310 h',
    mttr: '0.9 h',
    fleetCount: '2 machines',
    items: [
      {
        code: 'TR-01',
        name: 'Tracteur de Quai Terberg YT220',
        status: 'Opérationnel',
        location: 'Quai & Roulage Terminal',
        mtbf: '320h',
        mttr: '35m',
        dispo: '99.1%',
        hours: '5 800 h',
        specs: [
          { label: 'Sellette d\'attelage hydraulique', val: 'Capacité 36T relevée OK', ok: true },
          { label: 'Système graissage centralisé', val: 'Cartouche neuve rechargée', ok: true },
          { label: 'Moteur Cummins Stage V', val: 'Consommation 14.2 L/h optimisée', ok: true }
        ]
      },
      {
        code: 'TR-02',
        name: 'Tracteur Kalmar TT618i',
        status: 'Opérationnel',
        location: 'Terminal Manutention Conteneurs',
        mtbf: '300h',
        mttr: '45m',
        dispo: '98.7%',
        hours: '4 100 h',
        specs: [
          { label: 'Freinage pneumatique double circuit', val: '8.5 bar certifié conforme', ok: true },
          { label: 'Cabine pivotante ergonomique', val: 'Climatisation révisée', ok: true },
          { label: 'Transmission automatique Allison', val: 'Passage rapports fluide', ok: true }
        ]
      }
    ]
  },
  {
    key: 'Camion',
    title: 'Camion',
    iconName: 'Truck',
    tag: 'Évacuation & Benne Renforcée',
    desc: 'Évacuation rapide des déblais, transport agrégats et liaisons voirie portuaire',
    dispo: '97.8%',
    mtbf: '250 h',
    mttr: '1.3 h',
    fleetCount: '2 machines',
    items: [
      {
        code: 'CM-01',
        name: 'Camion Benne Mercedes Actros 4144 8x4',
        status: 'Opérationnel',
        location: 'Navette Quai - Parc Stock',
        mtbf: '260h',
        mttr: '50m',
        dispo: '98.2%',
        hours: '9 200 h',
        specs: [
          { label: 'Benne Meiller 22 m³ Hardox', val: 'Fond de benne intègre', ok: true },
          { label: 'Ponts à réducteurs droits', val: 'Niveau huile contrôlé', ok: true },
          { label: 'Suspension à lames trapézoïdales', val: 'Contrôle flèche conforme', ok: true }
        ]
      },
      {
        code: 'CM-02',
        name: 'Camion Benne Renault K480 Heavy',
        status: 'Opérationnel',
        location: 'Piste Portuaire Est',
        mtbf: '240h',
        mttr: '1.1h',
        dispo: '97.4%',
        hours: '7 100 h',
        specs: [
          { label: 'Ralentisseur Optibrake+', val: 'Puissance freinage 382 kW', ok: true },
          { label: 'Pneumatiques 13R22.5 chantier', val: 'Sculpture résiduelle 82%', ok: true },
          { label: 'Direction assistée double circuit', val: 'Pression 160 bar conforme', ok: true }
        ]
      }
    ]
  },
  {
    key: 'Tractopelle',
    title: 'Tractopelle',
    iconName: 'Wrench',
    tag: 'Polyvalent & Maintenance Réseaux',
    desc: 'Interventions polyvalentes sur voies, curage fossés, levage et réfection voirie',
    dispo: '99.0%',
    mtbf: '340 h',
    mttr: '0.8 h',
    fleetCount: '2 machines',
    items: [
      {
        code: 'TP-01',
        name: 'Tractopelle Polyvalent JCB 4CX',
        status: 'Opérationnel',
        location: 'Atelier Central & Réseaux Portuaires',
        mtbf: '350h',
        mttr: '30m',
        dispo: '99.2%',
        hours: '5 400 h',
        specs: [
          { label: 'Godet 4 en 1 avant 1.3 m³', val: 'Clapets anti-retour vérifiés', ok: true },
          { label: 'Flèche télescopique arrière Extradig', val: 'Portée 6.5 m sans jeu', ok: true },
          { label: '4 roues directrices égales', val: 'Rayon braquage 9.1 m', ok: true }
        ]
      },
      {
        code: 'TP-02',
        name: 'Tractopelle CAT 432F2',
        status: 'Opérationnel',
        location: 'Maintenance Quai & Voies',
        mtbf: '330h',
        mttr: '40m',
        dispo: '98.8%',
        hours: '3 600 h',
        specs: [
          { label: 'Circuit marteau / BRH auxiliaire', val: 'Pression 180 bar disponible', ok: true },
          { label: 'Transmission Autoshift', val: 'Passage souple sous charge', ok: true },
          { label: 'Stabilisateurs télescopiques', val: 'Pieds orientables sécurisés', ok: true }
        ]
      }
    ]
  }
];

export const CategorySupervision: React.FC<CategorySupervisionProps> = ({
  equipments,
  onSelectEquipment,
  onCreateWoForEquipment,
  onOpenParts,
  onValidateStep
}) => {
  const { isDarkMode } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [granularity, setGranularity] = useState<'month' | 'week' | 'day' | 'hour'>('week');
  const [validatedSteps, setValidatedSteps] = useState<Record<string, boolean>>({});

  const activePeriodInfo = PERIOD_DATA[granularity];

  const handleStepToggle = (code: string, stepDesc: string) => {
    setValidatedSteps(prev => ({
      ...prev,
      [code]: !prev[code]
    }));
    onValidateStep(stepDesc);
  };

  const filteredCategories = selectedCategory === 'all' 
    ? EQUIPMENT_CATEGORIES 
    : EQUIPMENT_CATEGORIES.filter(c => c.key === selectedCategory);

  return (
    <div className="space-y-6 mb-8" id="category-supervision-container">
      {/* ========================================================================= */}
      {/* 1. EN-TÊTE DE LA SUPERVISION : TITRE, SÉLECTEUR DE GRANULARITÉ & DATES   */}
      {/* ========================================================================= */}
      <div className="rounded-xl border p-5 transition-all shadow-sm bg-white dark:bg-[#0b1b33] border-slate-200 dark:border-[#1a3a66]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1d3a63]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wide bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300">
                Port Maintenance · 7 Familles d'Engins
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">| Flotte Owendo ERAMET</span>
            </div>
            <h2 className="text-xl font-bold font-space text-slate-900 dark:text-white mt-1">
              Supervision des Engins Portuaires & KPIs Temporels Détaillés
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pelle mécanique · Chargeuse · Dumper · Bulldozer / Bull · Tracteur · Camion · Tractopelle
            </p>
          </div>

          {/* SÉLECTEUR DE GRANULARITÉ TEMPORELLE (MOIS, SEMAINE, JOUR, HEURE) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-orange-500" />
              <span>Granularité :</span>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[#0e2240] border border-slate-200 dark:border-[#1a3861]">
              {(['month', 'week', 'day', 'hour'] as const).map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setGranularity(mode)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    granularity === mode
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {mode === 'month' ? 'Mois' : mode === 'week' ? 'Semaine' : mode === 'day' ? 'Jour' : 'Heure'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* BANDEAU DATE EXACTE & ÉVOLUTION STATISTIQUE MULTI-PÉRIODE */}
        <div className="mt-4 pt-1 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-200">Période d'analyse active :</span>
            <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-[#122847] border border-slate-200 dark:border-[#1d3d6e] font-mono font-bold text-orange-600 dark:text-orange-400">
              {activePeriodInfo.currentPeriod}
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-slate-500 dark:text-slate-400">Tendance sur 6 périodes :</span>
            <div className="flex items-end gap-1.5 h-7">
              {activePeriodInfo.periods.map((p, idx) => (
                <div key={idx} className="flex flex-col items-center gap-0.5 group relative" title={`${p.label} : Dispo ${p.dispo}% | MTBF ${p.mtbf}h`}>
                  <div 
                    className={`w-3.5 rounded-t transition-all ${
                      idx === activePeriodInfo.periods.length - 1 
                        ? 'bg-orange-600' 
                        : 'bg-slate-300 dark:bg-[#1e4274] hover:bg-orange-400'
                    }`}
                    style={{ height: `${Math.max(8, (p.dispo - 90) * 2.8)}px` }}
                  />
                  <span className="text-[8px] text-slate-400 font-mono">{idx + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FILTRE PAR CATÉGORIE D'ÉQUIPEMENT */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#163359] flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filtrer :
          </span>
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 dark:bg-[#122847] dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Toutes les 7 Familles (14 engins)
          </button>
          {EQUIPMENT_CATEGORIES.map(cat => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat.key
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-100 text-slate-600 dark:bg-[#122847] dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. LISTE DES FAMILLES D'ÉQUIPEMENTS DU PORT MAINTENANCE                  */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        {filteredCategories.map((cat, catIdx) => (
          <div 
            key={cat.key}
            id={`category-block-${catIdx}`}
            className={`rounded-xl border overflow-hidden transition-all shadow-sm ${
              isDarkMode 
                ? 'bg-[#0b1b33] border-[#1a3a66]' 
                : 'bg-white border-slate-200'
            }`}
          >
            {/* Category Header Bar */}
            <div className="px-5 py-3 border-b border-slate-100 dark:border-[#163359] bg-slate-50/70 dark:bg-[#0e2240] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-sm">
                  {cat.title.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm font-space text-slate-900 dark:text-white">
                      {cat.title}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300">
                      {cat.tag}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {cat.desc}
                  </div>
                </div>
              </div>

              {/* KPIs de la catégorie avec Granularité appliquée */}
              <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 flex-wrap">
                <span>Disponibilité : <strong className="text-emerald-600 dark:text-emerald-400">{cat.dispo}</strong></span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span>MTBF : <strong>{cat.mtbf}</strong></span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span>MTTR : <strong>{cat.mttr}</strong></span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="bg-slate-200/70 dark:bg-[#152e52] px-2 py-0.5 rounded text-[11px] font-medium">
                  Parc : <strong className="text-emerald-600 dark:text-emerald-400">{cat.fleetCount}</strong>
                </span>
              </div>
            </div>

            {/* Cartes d'Équipements individuels */}
            <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {cat.items.map(item => {
                const isStepDone = validatedSteps[item.code] || false;
                const matchedEq = equipments.find(e => e.code === item.code) || {
                  id: 99,
                  code: item.code,
                  name: item.name,
                  category: cat.title,
                  location: item.location,
                  status: item.status,
                  criticality: 'Critique',
                  operatingHours: 8500,
                  downtimeHours: 90
                } as unknown as Equipment;

                return (
                  <div 
                    key={item.code}
                    className={`p-4 rounded-lg border transition-all ${
                      isDarkMode 
                        ? 'bg-[#0e213d] border-[#1e4274] hover:border-orange-500/50' 
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    {/* Item Top Bar */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            item.status === 'Opérationnel' 
                              ? 'bg-emerald-500' 
                              : item.status === 'En maintenance' 
                                ? 'bg-amber-500' 
                                : 'bg-red-500'
                          }`}></span>
                          <h3 className="font-bold text-sm font-space text-slate-900 dark:text-white">
                            {item.name}
                          </h3>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>Code : <strong className="text-slate-700 dark:text-slate-200">{item.code}</strong></span>
                          <span>·</span>
                          <span>{item.location}</span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${
                        item.status === 'Opérationnel'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-300'
                          : item.status === 'En maintenance'
                            ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/90 dark:text-amber-300'
                            : 'bg-red-100 text-red-900 dark:bg-red-950/90 dark:text-red-300'
                      }`}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>

                    {/* 4 Stat Boxes avec valeurs reliées à la période */}
                    <div className="grid grid-cols-4 gap-2 text-center mb-3">
                      <div className="p-2 rounded bg-slate-50 dark:bg-[#122847] border border-slate-100 dark:border-[#1a3861]">
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">MTBF</div>
                        <div className="text-sm font-extrabold font-space text-slate-900 dark:text-white">{item.mtbf}</div>
                      </div>
                      <div className="p-2 rounded bg-slate-50 dark:bg-[#122847] border border-slate-100 dark:border-[#1a3861]">
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">MTTR</div>
                        <div className="text-sm font-extrabold font-space text-amber-600 dark:text-amber-400">{item.mttr}</div>
                      </div>
                      <div className="p-2 rounded bg-slate-50 dark:bg-[#122847] border border-slate-100 dark:border-[#1a3861]">
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Dispo</div>
                        <div className="text-sm font-extrabold font-space text-emerald-600 dark:text-emerald-400">{item.dispo}</div>
                      </div>
                      <div className="p-2 rounded bg-slate-50 dark:bg-[#122847] border border-slate-100 dark:border-[#1a3861]">
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Heures</div>
                        <div className="text-sm font-extrabold font-space text-slate-900 dark:text-white">{item.hours}</div>
                      </div>
                    </div>

                    {/* Telemetry & Technical Specs */}
                    <div className="text-xs space-y-1.5 py-2.5 border-y border-slate-100 dark:border-[#1a3861] text-slate-600 dark:text-slate-300">
                      {item.specs.map((spec, sIdx) => (
                        <div key={sIdx} className="flex justify-between items-center">
                          <span className="text-slate-500 dark:text-slate-400">{spec.label} :</span>
                          <span className={`font-semibold ${spec.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {spec.val}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-3 text-xs flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <button 
                          type="button"
                          onClick={() => onSelectEquipment(matchedEq)}
                          className="text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1 font-medium"
                        >
                          <Maximize2 className="w-3 h-3" /> Agrandir KPIs
                        </button>
                        <button 
                          type="button"
                          onClick={() => onSelectEquipment(matchedEq)}
                          className="text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1 font-medium"
                        >
                          <History className="w-3 h-3" /> Historique
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          type="button"
                          onClick={() => onCreateWoForEquipment(item.name, cat.title)}
                          className="px-2.5 py-1 rounded bg-[#ea580c] hover:bg-[#d44f0b] text-white font-bold text-[11px] flex items-center gap-1 shadow-sm"
                        >
                          <PlusCircle className="w-3 h-3" /> + Créer WO
                        </button>
                        <button 
                          type="button"
                          onClick={() => onOpenParts(item.name)}
                          className="px-2.5 py-1 rounded bg-slate-100 dark:bg-[#173053] text-slate-700 dark:text-slate-200 hover:bg-slate-200 text-[11px] font-medium flex items-center gap-1"
                        >
                          <Package className="w-3 h-3" /> Pièces
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
