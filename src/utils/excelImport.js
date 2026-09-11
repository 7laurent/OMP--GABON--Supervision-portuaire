/**
 * OMP GABON - Import Excel Multi-Catégories
 * Lit un classeur .xlsx et répartit chaque feuille vers la bonne table réelle
 * Supabase (equipment, technician, work_order, failure, spare_part) selon son
 * nom, avec une normalisation tolérante (accents/majuscules/espaces).
 */
import * as XLSX from 'xlsx';
import {
  appToEquipmentInsert,
  appToTechnicianInsert,
  appToSparePartInsert
} from '../data/mappers.js';
import {
  createEquipment,
  createTechnician,
  createSparePart,
  createWorkOrderFromPayload,
  createPanneFromPayload
} from '../supabase/supabaseClient.js';
import {
  validateEquipmentForm,
  validateTechnicianForm,
  validateSparePartForm
} from './dataValidation.js';

function stripAccents(str) {
  return String(str ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** Clé de correspondance tolérante : minuscules, sans accents, sans ponctuation/espaces */
function normKey(str) {
  return stripAccents(str).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function lookup(map, value, fallback = null) {
  const key = normKey(value);
  return key && map[key] !== undefined ? map[key] : fallback;
}

const SHEET_CATEGORY_KEYS = {
  equipements: ['equipements', 'equipement', 'equipment', 'equipments'],
  techniciens: ['techniciens', 'technicien', 'technician', 'technicians'],
  pieces: ['pieces', 'piece', 'sparepart', 'spareparts', 'partsderechange'],
  workorders: ['workorders', 'workorder', 'ordresdetravail', 'ordredetrail', 'wo'],
  pannes: ['pannes', 'panne', 'failure', 'failures', 'defaillances']
};

export function classifySheet(sheetName) {
  const key = normKey(sheetName);
  for (const [category, aliases] of Object.entries(SHEET_CATEGORY_KEYS)) {
    if (aliases.includes(key)) return category;
  }
  return null;
}

/** Lit un fichier .xlsx (File du navigateur) et retourne {sheetName: rows[]} */
export async function readWorkbookFile(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheets = {};
  workbook.SheetNames.forEach((name) => {
    sheets[name] = XLSX.utils.sheet_to_json(workbook.Sheets[name], { defval: null, raw: false });
  });
  return sheets;
}

/** Construit un aperçu {category, sheetName, count}[] + feuilles non reconnues, sans rien écrire */
export function previewWorkbook(sheets) {
  const recognized = [];
  const unrecognized = [];
  Object.entries(sheets).forEach(([sheetName, rows]) => {
    const category = classifySheet(sheetName);
    if (category) recognized.push({ category, sheetName, count: rows.length });
    else unrecognized.push({ sheetName, count: rows.length });
  });
  return { recognized, unrecognized };
}

function getField(row, ...normalizedNames) {
  for (const key of Object.keys(row)) {
    if (normalizedNames.includes(normKey(key))) return row[key];
  }
  return null;
}

function toIsoDateTime(dateVal, timeVal) {
  if (!dateVal) return null;
  if (dateVal instanceof Date) {
    if (timeVal && typeof timeVal === 'string') {
      const d = new Date(dateVal);
      const [h, m] = timeVal.split(':');
      d.setHours(Number(h) || 0, Number(m) || 0, 0, 0);
      return d.toISOString();
    }
    return dateVal.toISOString();
  }
  const str = String(dateVal).trim();
  if (timeVal) return `${str.split(' ')[0]}T${String(timeVal).trim()}:00`;
  if (str.includes(' ')) return str.replace(' ', 'T') + (str.length <= 16 ? ':00' : '');
  if (str.includes('T')) return str;
  return `${str}T00:00:00`;
}

const STATUS_EQ_MAP = { operationnel: 'Opérationnel', enmaintenance: 'En maintenance', alarret: "À l'arrêt", arrete: "À l'arrêt" };
const CRITICALITY_MAP = { critique: 'Critique', elevee: 'Élevée', moyenne: 'Moyenne', faible: 'Faible', standard: 'Standard' };
const SEVERITY_MAP = { critique: 'Critique', elevee: 'Élevée', moyenne: 'Moyenne', faible: 'Faible' };
const PRIORITY_MAP = { basse: 'Basse', faible: 'Basse', normale: 'Normale', moyenne: 'Normale', elevee: 'Élevée', critique: 'Critique' };
const MTYPE_MAP = { preventif: 'Préventif', correctif: 'Correctif', ameliorativ: 'Amélioratif', reglementaire: 'Réglementaire' };
const BOOL_MAP = { oui: true, yes: true, true: true, 1: true, non: false, no: false, false: false, 0: false };

const emptyStat = () => ({ totalInFile: 0, created: 0, reused: 0, failed: 0, errors: [], warnings: [] });

/**
 * Exécute l'import complet : Équipements → Techniciens → Pièces → Work Orders → Pannes
 * (ordre respectant les dépendances). Retourne un rapport détaillé par catégorie.
 */
export async function runExcelImport(sheets, { equipments = [], technicians = [], spareParts = [] } = {}) {
  const report = {
    equipements: emptyStat(),
    techniciens: emptyStat(),
    pieces: emptyStat(),
    workorders: emptyStat(),
    pannes: emptyStat(),
    unrecognizedSheets: []
  };

  const equipmentByCode = {};
  equipments.forEach((e) => { if (e.code) equipmentByCode[normKey(e.code)] = e.id; });
  const technicianByName = {};
  technicians.forEach((t) => { if (t.name) technicianByName[normKey(t.name)] = t.id; });
  const partByReference = {};
  spareParts.forEach((p) => { if (p.reference) partByReference[normKey(p.reference)] = p.id; });

  // Catégories déjà connues (pour rattacher automatiquement une variante à une catégorie existante
  // plutôt que de fragmenter en doublons proches : accents/casse, ou nom partiellement contenu)
  const categoryByKey = {};
  equipments.forEach((e) => { if (e.category) categoryByKey[normKey(e.category)] = e.category; });
  const resolveCategory = (raw) => {
    if (!raw) return 'Non catégorisé';
    const key = normKey(raw);
    if (categoryByKey[key]) return categoryByKey[key];
    const partial = Object.entries(categoryByKey).find(([k]) => key.includes(k) || k.includes(key));
    if (partial) return partial[1];
    categoryByKey[key] = String(raw); // nouvelle catégorie : le système la crée telle quelle
    return String(raw);
  };

  const sheetsByCategory = {};
  Object.entries(sheets).forEach(([sheetName, rows]) => {
    const category = classifySheet(sheetName);
    if (category) sheetsByCategory[category] = { sheetName, rows };
    else report.unrecognizedSheets.push({ sheetName, count: rows.length });
  });

  // 1. Équipements
  if (sheetsByCategory.equipements) {
    const { rows } = sheetsByCategory.equipements;
    report.equipements.totalInFile = rows.length;
    for (const row of rows) {
      const code = getField(row, 'code', 'codeequipement');
      if (!code) { report.equipements.failed++; report.equipements.errors.push({ row, message: 'Code équipement manquant' }); continue; }
      if (equipmentByCode[normKey(code)]) { report.equipements.reused++; continue; }
      const marque = getField(row, 'marque', 'brand') || '';
      const modele = getField(row, 'modele', 'model') || '';
      const form = {
        code: String(code),
        name: `${marque} ${modele}`.trim() || String(code),
        category: resolveCategory(getField(row, 'categorie', 'category')),
        location: getField(row, 'localisation', 'location') || '',
        status: lookup(STATUS_EQ_MAP, getField(row, 'statut', 'status'), 'Opérationnel'),
        criticality: lookup(CRITICALITY_MAP, getField(row, 'criticite', 'criticality'), 'Standard')
      };
      const rowIssues = validateEquipmentForm(form);
      if (!marque && !modele) {
        rowIssues.push({
          field: 'marque/modele',
          message: 'Marque et modèle non renseignés — nom générique utilisé à la place.',
          found: '(vide)',
          expected: `Une marque et un modèle (nom retenu par défaut : "${form.name}")`
        });
      }
      if (rowIssues.length) report.equipements.warnings.push({ row: code, issues: rowIssues });
      form.needsReview = rowIssues.length > 0;
      try {
        const created = await createEquipment(form);
        equipmentByCode[normKey(code)] = created.id;
        report.equipements.created++;
      } catch (err) {
        report.equipements.failed++;
        report.equipements.errors.push({ row, message: err.message });
      }
    }
  }

  // 2. Techniciens
  if (sheetsByCategory.techniciens) {
    const { rows } = sheetsByCategory.techniciens;
    report.techniciens.totalInFile = rows.length;
    for (const row of rows) {
      const name = getField(row, 'nomcomplet', 'name', 'nom');
      if (!name) { report.techniciens.failed++; report.techniciens.errors.push({ row, message: 'Nom manquant' }); continue; }
      if (technicianByName[normKey(name)]) { report.techniciens.reused++; continue; }
      const form = {
        matricule: getField(row, 'matricule') || `TC-${Date.now()}`,
        name: String(name),
        specialty: getField(row, 'specialite', 'specialty') || '—',
        team: getField(row, 'equipe', 'team') || '—',
        status: 'Actif',
        experienceYears: getField(row, 'experience', 'experienceyears') || null,
        phone: getField(row, 'telephone', 'phone') || null,
        email: getField(row, 'email') || null
      };
      const rowIssues = validateTechnicianForm(form);
      if (rowIssues.length) report.techniciens.warnings.push({ row: name, issues: rowIssues });
      form.needsReview = rowIssues.length > 0;
      try {
        const created = await createTechnician(form);
        technicianByName[normKey(name)] = created.id;
        report.techniciens.created++;
      } catch (err) {
        report.techniciens.failed++;
        report.techniciens.errors.push({ row, message: err.message });
      }
    }
  }

  // 3. Pièces
  if (sheetsByCategory.pieces) {
    const { rows } = sheetsByCategory.pieces;
    report.pieces.totalInFile = rows.length;
    for (const row of rows) {
      const reference = getField(row, 'reference');
      const name = getField(row, 'designation', 'name');
      if (!reference || !name) { report.pieces.failed++; report.pieces.errors.push({ row, message: 'Référence ou désignation manquante' }); continue; }
      if (partByReference[normKey(reference)]) { report.pieces.reused++; continue; }
      const form = {
        reference: String(reference),
        name: String(name),
        category: getField(row, 'categorie', 'category') || null,
        stock: getField(row, 'stock') || 0,
        minStock: getField(row, 'stockminimum', 'minstock') || 0,
        location: getField(row, 'emplacement', 'location') || null,
        supplier: getField(row, 'fournisseur', 'supplier') || null,
        unitPrice: getField(row, 'prixunitaireeur', 'prixunitaire', 'unitprice') || 0
      };
      const rowIssues = validateSparePartForm(form);
      if (rowIssues.length) report.pieces.warnings.push({ row: reference, issues: rowIssues });
      form.needsReview = rowIssues.length > 0;
      try {
        const created = await createSparePart(form);
        partByReference[normKey(reference)] = created.id;
        report.pieces.created++;
      } catch (err) {
        report.pieces.failed++;
        report.pieces.errors.push({ row, message: err.message });
      }
    }
  }

  // 4. Work Orders (nécessite les équipements résolus ci-dessus)
  if (sheetsByCategory.workorders) {
    const { rows } = sheetsByCategory.workorders;
    report.workorders.totalInFile = rows.length;
    for (const row of rows) {
      const codeEq = getField(row, 'codeequipement');
      const equipmentId = equipmentByCode[normKey(codeEq)];
      if (!equipmentId) { report.workorders.failed++; report.workorders.errors.push({ row, message: `Équipement "${codeEq}" introuvable` }); continue; }

      const plannedStart = toIsoDateTime(getField(row, 'debutplanifie'));
      const plannedEnd = toIsoDateTime(getField(row, 'finplanifiee'));
      const statutRaw = normKey(getField(row, 'statut', 'status'));
      const dbStatus = statutRaw === 'termine' ? 'COMPLETED' : statutRaw === 'encours' ? 'IN_PROGRESS' : 'PLANNED';
      const payload = {
        work_order_code: `WO-IMP-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        equipment_id: equipmentId,
        maintenance_type: (MTYPE_MAP[normKey(getField(row, 'typedemaintenance', 'type'))] === 'Préventif') ? 'Preventive Maintenance' : 'Corrective Maintenance',
        priority: Object.entries(PRIORITY_MAP).find(([k, v]) => normKey(getField(row, 'priorite', 'priority')) === k)
          ? { basse: 'LOW', faible: 'LOW', normale: 'MEDIUM', moyenne: 'MEDIUM', elevee: 'HIGH', critique: 'CRITICAL' }[normKey(getField(row, 'priorite', 'priority'))]
          : 'MEDIUM',
        planned_start: plannedStart || new Date().toISOString(),
        planned_end: plannedEnd,
        actual_start: dbStatus !== 'PLANNED' ? plannedStart : null,
        actual_end: dbStatus === 'COMPLETED' ? (plannedEnd || plannedStart) : null,
        status: dbStatus,
        problem_resolved: dbStatus === 'COMPLETED',
        rework: false,
        comments: getField(row, 'description') || null
      };
      const techName = getField(row, 'technicienprincipal', 'technicien');
      const technicianId = technicianByName[normKey(techName)] || null;

      const rowIssues = [];
      if (plannedEnd && plannedStart && new Date(plannedEnd) < new Date(plannedStart)) {
        rowIssues.push({
          field: 'finplanifiee',
          message: 'La fin planifiée est antérieure au début planifié.',
          found: plannedEnd,
          expected: `Une date ≥ ${plannedStart}`
        });
      }
      if (techName && !technicianId) {
        rowIssues.push({
          field: 'technicienprincipal',
          message: 'Technicien introuvable — Work Order non assigné.',
          found: techName,
          expected: 'Un nom de technicien déjà connu (voir feuille Techniciens)'
        });
      }
      if (rowIssues.length) report.workorders.warnings.push({ row: getField(row, 'codewo', 'code') || codeEq, issues: rowIssues });
      payload.needs_review = rowIssues.length > 0;

      try {
        await createWorkOrderFromPayload(payload, technicianId);
        report.workorders.created++;
      } catch (err) {
        report.workorders.failed++;
        report.workorders.errors.push({ row, message: err.message });
      }
    }
  }

  // 5. Pannes (nécessite les équipements résolus ci-dessus)
  if (sheetsByCategory.pannes) {
    const { rows } = sheetsByCategory.pannes;
    report.pannes.totalInFile = rows.length;
    for (const row of rows) {
      const codeEq = getField(row, 'codeequipement');
      const equipmentId = equipmentByCode[normKey(codeEq)];
      if (!equipmentId) { report.pannes.failed++; report.pannes.errors.push({ row, message: `Équipement "${codeEq}" introuvable` }); continue; }

      const datetime = toIsoDateTime(getField(row, 'date'), getField(row, 'heure'));
      const severity = lookup(SEVERITY_MAP, getField(row, 'gravite', 'severity'), 'Moyenne');
      const severityDb = { Critique: 'CRITICAL', Élevée: 'HIGH', Moyenne: 'MEDIUM', Faible: 'LOW' }[severity];
      const statutRaw = normKey(getField(row, 'statut', 'status'));
      const isResolved = statutRaw === 'resolue' || statutRaw === 'terminee' || statutRaw === 'cloturee';

      const workOrderPayload = {
        work_order_code: `WO-PAN-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        equipment_id: equipmentId,
        maintenance_type: 'Corrective Maintenance',
        priority: severityDb,
        planned_start: datetime || new Date().toISOString(),
        planned_end: null,
        actual_start: datetime || new Date().toISOString(),
        status: isResolved ? 'COMPLETED' : 'IN_PROGRESS',
        problem_resolved: isResolved,
        actual_end: isResolved ? datetime : null,
        rework: false,
        comments: null
      };
      const failurePayloadBase = {
        failure_datetime: datetime || new Date().toISOString(),
        failure_description: getField(row, 'symptomes') || null,
        failure_type: getField(row, 'typedepanne', 'type') || 'Défaillance',
        component: getField(row, 'composant') || null,
        root_cause: getField(row, 'causeprobable', 'cause') || null,
        detected_during_preventive: lookup(BOOL_MAP, getField(row, 'detecteeenpreventif'), false)
      };

      const rowIssues = [];
      if (datetime && new Date(datetime).getTime() > Date.now() + 5 * 60000) {
        rowIssues.push({
          field: 'date/heure',
          message: 'La date/heure de la panne est dans le futur.',
          found: datetime,
          expected: `Une date ≤ ${new Date().toISOString()}`
        });
      }
      if (!getField(row, 'gravite', 'severity')) {
        rowIssues.push({
          field: 'gravite',
          message: 'Gravité non renseignée.',
          found: '(vide)',
          expected: '"Moyenne" appliquée par défaut'
        });
      }
      if (rowIssues.length) report.pannes.warnings.push({ row: getField(row, 'idpanne', 'id') || codeEq, issues: rowIssues });
      failurePayloadBase.needs_review = rowIssues.length > 0;

      try {
        await createPanneFromPayload(workOrderPayload, failurePayloadBase);
        report.pannes.created++;
      } catch (err) {
        report.pannes.failed++;
        report.pannes.errors.push({ row, message: err.message });
      }
    }
  }

  return report;
}
