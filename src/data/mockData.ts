import { 
  Equipment, 
  KpiSummary, 
  PanneIncident, 
  SparePart, 
  Technician, 
  WorkOrder 
} from '../types';

export const initialKpis: KpiSummary = {
  equipementsTotal: 128,
  equipementsEvolution: '+8.4% vs M-1',
  pannesActives: 17,
  pannesP1: 4,
  pannesEvolution: '-5.2% résol. rapide',
  workOrdersTotal: 46,
  workOrdersPreventif: 28,
  workOrdersCuratif: 18,
  workOrdersEvolution: '+12.7% cadence',
  techniciensTerrain: 24,
  techniciensShift: 'Postés en quart 3×8',
  techniciensBrigade: '100% Brigade active',
  disponibiliteUsine: 94.2,
  disponibiliteNorme: 'AFNOR NF X 60-015',
  disponibiliteCible: 'Cible contractuelle > 90%',
  mtbfGlobal: 142.5,
  mttrGlobal: 1.80,
  ratioGlobal: 98.7,
};

export const initialWorkOrders: WorkOrder[] = [
  {
    id: '#WO-4180',
    category: 'Dumper',
    equipment: 'Dumper Komatsu HD785-7 (DP-02)',
    equipmentSn: 'Komatsu HD785 - Fosse Minéralière',
    technician: 'Marc V.',
    type: 'Préventif 5000h',
    priority: 'P3',
    priorityLabel: 'P3 Normale',
    deadline: "Aujourd'hui 16:00",
    progress: 65,
    status: 'En cours',
    description: 'Révision majeure 5 000h : vidange carter, remplacement filtres et contrôle vérins bennage.',
    estimatedHours: 12,
    spentHours: 7.5,
    partsUsed: ['Kit Filtres Donaldson Gazole', 'Huile Moteur 15W40 900L', 'Joints régulateur'],
    steps: [
      { title: 'Vidange carter moteur & analyse spectro', done: true },
      { title: 'Remplacement filtres Donaldson gazole', done: true },
      { title: 'Étalonnage vérins hydrauliques de bennage', done: false },
      { title: 'Essai dynamique sur piste de roulage', done: false }
    ]
  },
  {
    id: '#WO-4182',
    category: 'Levage Lourd',
    equipment: 'Portique PQ-03 (Palier Treuil)',
    equipmentSn: 'Konecranes 65T - Poste 3',
    technician: 'Alain M. (Astreinte)',
    type: 'Curatif Urgent',
    priority: 'P1',
    priorityLabel: 'P1 Critique',
    deadline: 'Immédiat (+45m)',
    progress: 25,
    status: 'En cours',
    description: 'Échauffement anormal palier réducteur principal de levage (78°C). Remplacement roulement à rotule.',
    estimatedHours: 4,
    spentHours: 1.0,
    partsUsed: ['Roulement SKF 23230 CC/W33', 'Graisse haute température Mobilith SHC 460'],
    steps: [
      { title: 'Consignation électrique HT 6.6 kV', done: true },
      { title: 'Désaccouplement moteur/treuil', done: false },
      { title: 'Extraction roulement usagé', done: false },
      { title: 'Montage roulement par induction & graissage', done: false }
    ]
  },
  {
    id: '#WO-4177',
    category: 'Convoyage',
    equipment: 'Convoyeur CV-102 (Rouleaux)',
    equipmentSn: 'EP800 - Ligne Quai 850m',
    technician: 'Didier K.',
    type: 'Préventif Conditionnel',
    priority: 'P2',
    priorityLabel: 'P2 Haute',
    deadline: 'Demain 08:00',
    progress: 80,
    status: 'En cours',
    description: 'Patinage 12% détecté sous charge. Remplacement de 2 rouleaux guides et réajustement tension contrepoids.',
    estimatedHours: 3,
    spentHours: 2.4,
    partsUsed: ['Rouleaux lisses D133 L500 (x2)', 'Capteur tachymétrique Sick'],
    steps: [
      { title: 'Arrêt créneau d’inoccupation navire', done: true },
      { title: 'Démontage rouleaux bloqués', done: true },
      { title: 'Pose nouveaux rouleaux renforcés', done: true },
      { title: 'Contrôle alignement et calibrage tachymètre', done: false }
    ]
  },
  {
    id: '#WO-4169',
    category: 'Énergie',
    equipment: 'Compresseur GA55 (Filtres)',
    equipmentSn: 'Atlas Copco GA55-VSD',
    technician: 'Stéphane B.',
    type: 'Préventif 8000h',
    priority: 'P3',
    priorityLabel: 'P3 Normale',
    deadline: '18 Mars 2024',
    progress: 40,
    status: 'En attente pièces',
    description: 'Maintenance programmée 8000h : remplacement séparateur d’huile et cartouche filtre à air.',
    estimatedHours: 6,
    spentHours: 2.5,
    partsUsed: ['Kit Service 8000h Atlas Copco 2901-0999-00', 'Huile Roto-Xtend Duty'],
    steps: [
      { title: 'Isolement réseau air comprimé', done: true },
      { title: 'Vidange huile de synthèse', done: true },
      { title: 'Remplacement cartouche séparateur', done: false },
      { title: 'Mise sous pression et test fuites', done: false }
    ]
  },
  {
    id: '#WO-4175',
    category: 'Pelle mécanique',
    equipment: 'Pelle mécanique CAT 349D (PM-01)',
    equipmentSn: 'CAT-349D - Front de Taille',
    technician: 'Marc V.',
    type: 'Contrôle Hebdo',
    priority: 'P4',
    priorityLabel: 'P4 Faible',
    deadline: 'Fin de semaine',
    progress: 100,
    status: 'Terminé',
    description: 'Contrôle des flexibles hydrauliques godet et mesure des jeux d\'articulation. Pression 350 bar certifiée.',
    estimatedHours: 2,
    spentHours: 2.0,
    partsUsed: ['Kits joints toriques haute pression'],
    steps: [
      { title: 'Inspection visuelle flexibles godet', done: true },
      { title: 'Mesure usure dents de godet', done: true },
      { title: 'Purge décanteur circuit gasoil', done: true }
    ]
  },
  {
    id: '#WO-4184',
    category: 'Levage Lourd',
    equipment: 'Portique PQ-01',
    equipmentSn: 'ZPMC 65T - Poste 1',
    technician: 'Patrick N.',
    type: 'Contrôle Magnétique Câble',
    priority: 'P3',
    priorityLabel: 'P3 Normale',
    deadline: '22 Mars 2024',
    progress: 15,
    status: 'Nouveau',
    description: 'Contrôle magnétographique semestriel des torons du câble de levage principal (diamètre 48mm).',
    estimatedHours: 5,
    spentHours: 0.5,
    steps: [
      { title: 'Installation tête de mesure magnétique', done: false },
      { title: 'Déroulement contrôlé 250m de câble', done: false },
      { title: 'Traitement graphique des échos magnétiques', done: false }
    ]
  }
];

export const initialEquipments: Equipment[] = [
  {
    id: 'EQ-01',
    name: 'Pelle mécanique CAT 349D (PM-01)',
    code: 'PM-01',
    power: '430 CV (317 kW)',
    category: 'A',
    categoryLabel: 'Pelle mécanique',
    subCategory: 'Terrassement & Extraction Portuaire',
    sn: 'CAT-349D-SN8901 - Zone Fosse',
    location: 'Quai Minéralier - Zone Stockage',
    status: 'optimal',
    statusBadge: 'EN SERVICE OPTIMAL',
    statusColor: 'green',
    mtbf: 154,
    mttr: '2.4h',
    dispo: 98.4,
    fuelOrLoad: 'Carburant 92%',
    criticality: 'Critique',
    specs: {
      'Moteur C13 ACERT': '1 800 rpm - Nominal',
      'Hydraulique principale': 'Pression 350 bar OK',
      'Capacité Godet': '3.2 m³ Renforcé',
      'Débit Pompes': '2 x 380 L/min',
      'Capacité réservoir': '720 Litres Gazole',
      'Train de chenilles': 'Tuiles 600 mm triple arête'
    },
    telemetry: {
      'Vitesse rotation': '9.8 rpm',
      'Pression huile moteur': '4.2 bar',
      'Température huile hydr.': '68°C',
      'Volume extrait': '4 200 Tonnes / jour'
    },
    lastMaintenance: '12 Février 2025 (Vidange + Filtres)',
    nextMaintenance: '15 Avril 2025 (Contrôle Flexibles)'
  },
  {
    id: 'EQ-02',
    name: 'Dumper Komatsu HD785-7 (DP-02)',
    code: 'DP-02',
    power: '1200 CV (895 kW)',
    category: 'A',
    categoryLabel: 'Dumper',
    subCategory: 'Roulage & Transport Lourd Minéralier',
    sn: 'HD785-7-89102 - Fosse Minérale',
    location: 'Atelier Roulage Zone Sud',
    status: 'revision',
    statusBadge: 'RÉVISION 5000H',
    statusColor: 'amber',
    mtbf: 135,
    mttr: '3.1h',
    dispo: 91.4,
    fuelOrLoad: 'Vidange en cours (0%)',
    criticality: 'Critique',
    specs: {
      'Moteur Komatsu SAA12V140E-3': 'En maintenance programmée',
      'Transmission K-Atomics': 'Contrôle embrayages hydrauliques',
      'Freins immergés': 'Remplacement disques bain d\'huile',
      'Capacité benne': '60 m³ en dôme (91 Tonnes)'
    },
    telemetry: {
      'Avancement révision': '65% complété',
      'Technicien en charge': 'Marc V. (Équipe Mécanique)',
      'Échéance': 'Demain 16:00',
      'Consigne sécurité': 'LOTO Consigné - Énergie 0'
    },
    lastMaintenance: '28 Novembre 2024',
    nextMaintenance: 'En cours (Livraison Demain)'
  },
  {
    id: 'EQ-03',
    name: 'Portique de Quai PQ-01',
    code: 'PQ-01',
    power: 'Capacité 65T',
    category: 'B',
    categoryLabel: 'Engins Portuaires & Levage Lourd',
    subCategory: 'Quai Minéralier Port d’Owendo',
    sn: 'Poste d’amarrage 3 - Navire "MV OGOOUÉ CAPE"',
    location: 'Quai Minéralier Poste 3',
    status: 'chargement',
    statusBadge: 'EN SERVICE CHARGEMENT',
    statusColor: 'green',
    mtbf: 180,
    mttr: '1.5 h',
    dispo: 95.8,
    fuelOrLoad: 'Charge 38.4 Tonnes',
    criticality: 'Critique',
    specs: {
      'État Résiduel Câble': '88% (Contrôle magnéto. OK)',
      'Remplacement prévu': '1 200 heures restantes',
      'Vitesse levage': '1.8 m/s',
      'T° Réducteur planétaire': '62°C (Huile VG320 OK)',
      'Palan Auxiliaire': 'Opérationnel 15T',
      'Alimentation Électrique': '6.6 kV Enrouleur tambour'
    },
    telemetry: {
      'Cadence chargement': '1 950 T/h',
      'Cycles effectués': '412 cycles aujourd’hui',
      'Vent anémomètre': '14 nœuds (Seuil arrêt 42 nds)',
      'Tension câble': '185 kN'
    },
    lastMaintenance: '02 Mars 2024 (Graissage chemins de roulement)',
    nextMaintenance: '25 Mars 2024 (Contrôle Galets)'
  },
  {
    id: 'EQ-04',
    name: 'Convoyeur à Bande CV-102',
    code: 'CV-102',
    power: '75 kW SEW',
    category: 'C',
    categoryLabel: 'Convoyage Minéralier & Stockage',
    subCategory: 'Flux Continu - Ligne Quai',
    sn: 'Longueur: 850 mètres · Largeur 1400 mm EP800',
    location: 'Galerie Quai Ligne Principale',
    status: 'surveillance',
    statusBadge: 'SOUS SURVEILLANCE PATINAGE',
    statusColor: 'amber',
    mtbf: 165,
    mttr: '1.1 h',
    dispo: 94.6,
    fuelOrLoad: 'Débit 3 200 T/h',
    criticality: 'Majeur',
    specs: {
      'Tension bande': '4.2 kN',
      'Vitesse linéaire': '3.4 m/s',
      'Moteur SEW 75 kW': '99.1% charge nominale',
      'Température paliers': '54°C (Normal < 70°C)',
      'Tambour tête': 'Garni céramique 12mm OK',
      'Contrepoids gravitaire': '6.5 Tonnes position OK'
    },
    telemetry: {
      'Alerte patinage': '12% sous surveillance active',
      'Dérive de bande': '4mm (Seuil arrêt 15mm)',
      'Détecteur déchirure': 'Boucles inductives saines',
      'Ambiance galerie': '31°C - Humidité 84%'
    },
    lastMaintenance: '18 Février 2024',
    nextMaintenance: 'Intervention planifiée prochain créneau'
  },
  {
    id: 'EQ-05',
    name: 'Compresseur à Vis Atlas Copco GA55',
    code: 'GA55',
    power: '55 kW VSD',
    category: 'D',
    categoryLabel: 'Énergie, Air Comprimé & Utilités',
    subCategory: 'Centrale Air Comprimé N°1',
    sn: 'Alimentation freins ferroviaires & dépoussiéreurs',
    location: 'Bâtiment Utilités Sud',
    status: 'optimal',
    statusBadge: 'RÉGIME OPTIMAL (EN CHARGE)',
    statusColor: 'green',
    mtbf: 450,
    mttr: '0.8 h',
    dispo: 99.4,
    fuelOrLoad: 'Pression 7.8 bar',
    criticality: 'Standard',
    specs: {
      'Puissance absorbée': '44.2 kW',
      'dP Filtre air admission': '0.20 bar (Sain)',
      'Température bloc vis': '88.2°C',
      'Point de rosée sécheur': '+3°C',
      'Potentiel huile Roto-Glide': '180 h restantes',
      'Cuve tampon': '5 000L sous 7.8 bar nominal'
    },
    telemetry: {
      'Débit air produit': '9.8 m³/min',
      'Tension réseau': '400V triphasé équilibré',
      'Secours groupe auto': 'Veille active prêt à démarrer',
      'Compteur horaire': '14 820 heures'
    },
    lastMaintenance: '10 Janvier 2024',
    nextMaintenance: 'Kit 8000h dans 14 jours'
  }
];

export const initialIncidents: PanneIncident[] = [
  {
    id: 'INC-2024-089',
    equipmentId: 'EQ-03',
    equipmentName: 'Portique PQ-03 (Treuil)',
    category: 'Levage Lourd',
    title: 'Échauffement critique palier treuil principal',
    description: 'Sonde PT100 indique 78°C sur le roulement palier arbre de transmission. Risque de grippage en cours de chargement navire.',
    priority: 'P1',
    status: 'En astreinte',
    reportedAt: 'Il y a 35 min',
    reporter: 'Capteur SCADA Quai 3',
    assignedTech: 'Alain M.',
    impactMinutes: 45,
    financialImpact: '8 500 € / heure d’escale'
  },
  {
    id: 'INC-2024-088',
    equipmentId: 'EQ-04',
    equipmentName: 'Convoyeur CV-102',
    category: 'Convoyage Minéralier',
    title: 'Patinage supérieur à 10% sur tambour de commande',
    description: 'Taux de glissement constaté 12% lors de la reprise après pluie torrentielle. 2 rouleaux guides grippés.',
    priority: 'P2',
    status: 'Diagnostiqué',
    reportedAt: 'Il y a 2h 10min',
    reporter: 'Tachymètre Ligne CV',
    assignedTech: 'Didier K.',
    impactMinutes: 20,
    financialImpact: 'Ralentissement cadence 15%'
  },
  {
    id: 'INC-2024-085',
    equipmentId: 'EQ-02',
    equipmentName: 'Dumper Komatsu HD785-7 (DP-02)',
    category: 'Dumper',
    title: 'Code défaut régulation bennage banc d’essai',
    description: 'Dérive de consigne de 3% lors de la commande proportionnelle de levée de benne.',
    priority: 'P3',
    status: 'En réparation',
    reportedAt: 'Ce matin 08:30',
    reporter: 'Marc V.',
    assignedTech: 'Marc V.',
    impactMinutes: 0,
    financialImpact: 'Prévu en arrêt révision'
  },
  {
    id: 'INC-2024-082',
    equipmentId: 'EQ-06',
    equipmentName: 'Culbuteur de Wagons CW-01',
    category: 'Ferroviaire',
    title: 'Fin de course verrouillage pince hydraulique défaillant',
    description: 'Détecteur inductif encrassé par poussière de manganèse. Signal intermittent lors du cycle de retournement.',
    priority: 'P1',
    status: 'Aiguë',
    reportedAt: 'Il y a 15 min',
    reporter: 'Opérateur Salle Contrôle',
    assignedTech: 'Équipe Astreinte',
    impactMinutes: 15,
    financialImpact: 'Blocage déchargement rame'
  }
];

export const techniciansList: Technician[] = [
  {
    id: 'TECH-01',
    name: 'Marc V.',
    role: 'Chef d’Équipe Mécanique Traction',
    specialty: 'Mécanique',
    shift: 'Matin (06h-14h)',
    status: 'En intervention',
    activeWO: '#WO-4180',
    contact: '+241 07 45 88 12',
    certifications: ['Diesel Lourd EMD', 'Hydraulique Voith', 'Habilitation Électrique H0B0']
  },
  {
    id: 'TECH-02',
    name: 'Alain M.',
    role: 'Spécialiste Engins de Levage & Quai',
    specialty: 'Hydraulique',
    shift: 'Astreinte Quai',
    status: 'En astreinte',
    activeWO: '#WO-4182',
    contact: '+241 06 22 14 90',
    certifications: ['Câbles & Treuils Magnéto', 'CACES R482', 'Travaux Grande Hauteur']
  },
  {
    id: 'TECH-03',
    name: 'Didier K.',
    role: 'Technicien Bandes & Convoyeurs',
    specialty: 'Chaudronnerie',
    shift: 'Matin (06h-14h)',
    status: 'En intervention',
    activeWO: '#WO-4177',
    contact: '+241 07 19 33 05',
    certifications: ['Jonctionnement bandes EP800', 'Vibrations ISO 18436', 'Soudure TIG']
  },
  {
    id: 'TECH-04',
    name: 'Stéphane B.',
    role: 'Électromécanicien Utilités & Air',
    specialty: 'Électrique',
    shift: 'Après-midi (14h-22h)',
    status: 'Disponible',
    activeWO: '#WO-4169',
    contact: '+241 06 88 41 22',
    certifications: ['Compresseurs Atlas Copco', 'Fluides frigorigènes', 'Haute Tension H2V']
  },
  {
    id: 'TECH-05',
    name: 'Patrick N.',
    role: 'Contrôleur Non-Destructif (CND)',
    specialty: 'Automatisme & Télémétrie',
    shift: 'Matin (06h-14h)',
    status: 'Disponible',
    activeWO: '#WO-4184',
    contact: '+241 07 90 12 77',
    certifications: ['Magnétographie COFREND 2', 'Ultrasons', 'Thermographie FLIR']
  }
];

export const sparePartsList: SparePart[] = [
  {
    ref: 'DON-GAZ-900',
    name: 'Kit Filtres Donaldson Gazole Haute Filtration',
    category: 'Filtration',
    stock: 24,
    minStock: 8,
    unit: 'Kits',
    location: 'Magasin A - Travée 03 - Étagère B',
    compatibleMachines: ['Pelle mécanique PM-01', 'Dumper DP-02', 'Chargeuse CH-01', 'Bulldozer BL-01'],
    priceEst: '420 €'
  },
  {
    ref: 'SKF-23230-CC',
    name: 'Roulement à rotule sur rouleaux SKF 23230 CC/W33',
    category: 'Mécanique & Roulements',
    stock: 4,
    minStock: 2,
    unit: 'Unités',
    location: 'Magasin Central B - Rayon Paliers Lourds',
    compatibleMachines: ['Portique PQ-01', 'Portique PQ-02', 'Portique PQ-03'],
    priceEst: '2 850 €'
  },
  {
    ref: 'RLX-133-500',
    name: 'Rouleau amortisseur renforcé Diam. 133 x 500mm',
    category: 'Convoyage',
    stock: 38,
    minStock: 15,
    unit: 'Pièces',
    location: 'Parc Extérieur Sud - Rack Convoyeurs',
    compatibleMachines: ['Convoyeur CV-102', 'Convoyeur CV-105'],
    priceEst: '115 €'
  },
  {
    ref: 'AC-KIT-8000H',
    name: 'Kit Service 8 000h Compresseur Atlas Copco GA55',
    category: 'Maintenance Utilités',
    stock: 8,
    minStock: 3,
    unit: 'Kits',
    location: 'Magasin A - Casier Spécifique Compresseurs',
    compatibleMachines: ['Compresseur GA55 (Sud)', 'Compresseur GA75 (Nord)'],
    priceEst: '1 450 €'
  },
  {
    ref: 'CBL-TREUIL-48',
    name: 'Bobine Câble de levage antigiratoire D48mm - 300m',
    category: 'Levage Lourd',
    stock: 2,
    minStock: 1,
    unit: 'Touret',
    location: 'Hangar Câblerie Quai',
    compatibleMachines: ['Portiques PQ-01, 02, 03'],
    priceEst: '18 400 €'
  }
];
