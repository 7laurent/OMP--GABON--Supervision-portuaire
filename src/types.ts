export type ActiveTab = 
  | 'dashboard'
  | 'pannes'
  | 'work-orders'
  | 'equipements'
  | 'pieces'
  | 'techniciens'
  | 'historique'
  | 'preventif'
  | 'afnor'
  | 'parametres';

export interface KpiSummary {
  equipementsTotal: number;
  equipementsEvolution: string;
  pannesActives: number;
  pannesP1: number;
  pannesEvolution: string;
  workOrdersTotal: number;
  workOrdersPreventif: number;
  workOrdersCuratif: number;
  workOrdersEvolution: string;
  techniciensTerrain: number;
  techniciensShift: string;
  techniciensBrigade: string;
  disponibiliteUsine: number;
  disponibiliteNorme: string;
  disponibiliteCible: string;
  mtbfGlobal: number;
  mttrGlobal: number;
  ratioGlobal: number;
}

export type PriorityLevel = 'P1' | 'P2' | 'P3' | 'P4';
export type WorkOrderStatus = 'Nouveau' | 'En cours' | 'En attente pièces' | 'Contrôle qualité' | 'Terminé';
export type EquipmentStatus = 'optimal' | 'revision' | 'surveillance' | 'arret' | 'chargement';

export interface WorkOrder {
  id: string;
  category: 'Pelle mécanique' | 'Chargeuse' | 'Dumper' | 'Bulldozer / Bull' | 'Tracteur' | 'Camion' | 'Tractopelle' | 'Levage Lourd' | 'Convoyage' | 'Énergie' | string;
  equipment: string;
  equipmentSn: string;
  technician: string;
  type: string;
  priority: PriorityLevel;
  priorityLabel: string;
  deadline: string;
  progress: number;
  status: WorkOrderStatus;
  description: string;
  estimatedHours: number;
  spentHours: number;
  partsUsed?: string[];
  steps?: { title: string; done: boolean }[];
}

export interface Equipment {
  id: string;
  name: string;
  code: string;
  power?: string;
  category: 'A' | 'B' | 'C' | 'D';
  categoryLabel: string;
  subCategory: string;
  sn: string;
  location: string;
  status: EquipmentStatus;
  statusBadge: string;
  statusColor: 'green' | 'blue' | 'amber' | 'red';
  mtbf: number;
  mttr: string;
  dispo: number;
  fuelOrLoad?: string;
  criticality: 'Critique' | 'Majeur' | 'Standard';
  specs: { [key: string]: string };
  telemetry: { [key: string]: string };
  description?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
}

export interface PanneIncident {
  id: string;
  equipmentId: string;
  equipmentName: string;
  category: string;
  title: string;
  description: string;
  priority: PriorityLevel;
  status: 'Aiguë' | 'En astreinte' | 'Diagnostiqué' | 'En réparation' | 'Clôturé';
  reportedAt: string;
  reporter: string;
  assignedTech?: string;
  impactMinutes: number;
  financialImpact: string;
}

export interface Technician {
  id: string;
  name: string;
  role: string;
  specialty: 'Mécanique' | 'Électrique' | 'Automatisme & Télémétrie' | 'Hydraulique' | 'Chaudronnerie';
  shift: 'Matin (06h-14h)' | 'Après-midi (14h-22h)' | 'Nuit (22h-06h)' | 'Astreinte Quai';
  status: 'En intervention' | 'Disponible' | 'En astreinte' | 'En pause';
  activeWO?: string;
  contact: string;
  certifications: string[];
}

export interface SparePart {
  ref: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
  location: string;
  compatibleMachines: string[];
  priceEst: string;
}
