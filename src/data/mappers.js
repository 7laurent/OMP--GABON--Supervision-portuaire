/**
 * OMP GABON - Couche de mapping entre le schéma réel Supabase
 * (equipment, technician, work_order, wo_technician, failure, spare_part, preventive_plan)
 * et le modèle "applicatif" (français) déjà consommé par les pages existantes.
 * Aucune donnée fictive : les champs sans équivalent réel restent vides/0.
 */

// ---------------------------------------------------------------------------
// Équipements
// ---------------------------------------------------------------------------

const STATUS_DB_TO_APP = {
  Operational: 'Opérationnel',
  Maintenance: 'En maintenance',
  Stopped: "À l'arrêt",
  Down: "À l'arrêt",
  'Out of Service': "À l'arrêt",
  Retired: "À l'arrêt"
};
const STATUS_APP_TO_DB = {
  'Opérationnel': 'Operational',
  'En maintenance': 'Maintenance',
  "À l'arrêt": 'Stopped'
};

export function equipmentRowToApp(row) {
  const name = [row.brand, row.model].filter(Boolean).join(' ').trim() || row.equipment_code;
  return {
    id: row.equipment_id,
    code: row.equipment_code,
    name,
    category: row.equipment_type || 'Non catégorisé',
    location: row.location || '—',
    status: STATUS_DB_TO_APP[row.current_status] || row.current_status || 'Opérationnel',
    criticality: row.criticality || 'Standard',
    commissionDate: row.commissioning_date || null,
    operatingHours: 0,
    downtimeHours: 0,
    lastMaintenance: null,
    nextMaintenance: null,
    serialNumber: row.serial_number || null,
    manufacturer: row.brand || null,
    notes: row.notes || null,
    active: row.active !== 0 && row.active !== false,
    needsReview: !!row.needs_review
  };
}

export function appToEquipmentInsert(form) {
  return {
    equipment_code: form.code,
    equipment_type: form.category,
    brand: null,
    model: form.name,
    current_status: STATUS_APP_TO_DB[form.status] || 'Operational',
    criticality: form.criticality || 'Standard',
    location: form.location || null,
    commissioning_date: new Date().toISOString().slice(0, 10),
    active: 1, // colonne entière (0/1) côté base, pas un booléen
    needs_review: !!form.needsReview
  };
}

export function appToEquipmentUpdate(fields) {
  const out = {};
  if (fields.status !== undefined) out.current_status = STATUS_APP_TO_DB[fields.status] || fields.status;
  if (fields.criticality !== undefined) out.criticality = fields.criticality;
  if (fields.location !== undefined) out.location = fields.location;
  if (fields.category !== undefined) out.equipment_type = fields.category;
  return out;
}

/** Enrichit les équipements mappés avec des stats réelles dérivées des Work Orders / Plans préventifs */
export function enrichEquipmentsWithStats(equipmentsApp, workOrdersApp, preventivePlansApp) {
  const now = Date.now();
  return equipmentsApp.map((eq) => {
    const eqWO = workOrdersApp.filter((w) => w._equipmentId === eq.id);
    const downtimeHours = eqWO
      .filter((w) => w._maintenanceType === 'Corrective Maintenance')
      .reduce((sum, w) => sum + (w._durationHours || 0), 0);

    const commissionMs = eq.commissionDate ? new Date(eq.commissionDate).getTime() : null;
    const calendarHours = commissionMs ? Math.max(0, (now - commissionMs) / 3600000) : 0;
    const operatingHours = Math.max(0, Math.round(calendarHours - downtimeHours));

    const completedDates = eqWO
      .filter((w) => w._actualEnd)
      .map((w) => new Date(w._actualEnd).getTime());
    const lastMaintenance = completedDates.length ? new Date(Math.max(...completedDates)).toISOString().slice(0, 10) : null;

    const plansForEq = (preventivePlansApp || []).filter((p) => p._equipmentId === eq.id && p.active !== false);
    const nextDates = plansForEq.map((p) => p.nextDate).filter(Boolean).sort();
    const nextMaintenance = nextDates.length ? nextDates[0] : null;

    return {
      ...eq,
      operatingHours,
      downtimeHours: Math.round(downtimeHours),
      lastMaintenance,
      nextMaintenance
    };
  });
}

// ---------------------------------------------------------------------------
// Techniciens
// ---------------------------------------------------------------------------

export function technicianRowToApp(row, workOrdersApp = []) {
  const ledWO = workOrdersApp.filter((w) => w._leadTechnicianId === row.technician_id);
  const activeWO = ledWO.find((w) => w.status === 'En cours' || w.status === 'Nouveau');
  const completed = ledWO.filter((w) => w.status === 'Terminé');
  const firstTimeFixRate = completed.length
    ? Number(((completed.filter((w) => !w._rework).length / completed.length) * 100).toFixed(1))
    : null;

  return {
    id: row.technician_id,
    matricule: row.employee_number,
    name: row.full_name,
    specialty: row.specialty || '—',
    team: row.team || '—',
    status: row.active === false || row.active === 0 ? 'Inactif' : 'Actif',
    experienceYears: row.experience_years ?? null,
    activeWO: activeWO ? activeWO.id : null,
    phone: row.phone || null,
    email: row.email || null,
    firstTimeFixRate,
    needsReview: !!row.needs_review
  };
}

export function appToTechnicianInsert(form) {
  return {
    employee_number: form.matricule,
    full_name: form.name,
    specialty: form.specialty,
    team: form.team,
    active: form.status === 'Actif' ? 1 : 0, // colonne entière (0/1) côté base, pas un booléen
    experience_years: Number(form.experienceYears) || null,
    phone: form.phone || null,
    email: form.email || null,
    needs_review: !!form.needsReview
  };
}

// ---------------------------------------------------------------------------
// Work Orders
// ---------------------------------------------------------------------------

const PRIORITY_DB_TO_APP = { LOW: 'Basse', MEDIUM: 'Normale', HIGH: 'Élevée', CRITICAL: 'Critique' };
const PRIORITY_APP_TO_DB = { Basse: 'LOW', Normale: 'MEDIUM', Élevée: 'HIGH', Critique: 'CRITICAL' };

const MTYPE_APP_TO_DB = {
  'Préventif': 'Preventive Maintenance',
  'Correctif': 'Corrective Maintenance',
  'Amélioratif': 'Improvement Maintenance',
  'Réglementaire': 'Regulatory Maintenance'
};

function hoursBetween(a, b) {
  if (!a || !b) return 0;
  const diff = (new Date(b).getTime() - new Date(a).getTime()) / 3600000;
  return diff > 0 ? Number(diff.toFixed(2)) : 0;
}

export function workOrderRowToApp(row) {
  const equipment = row.equipment || {};
  const equipmentName = [equipment.brand, equipment.model].filter(Boolean).join(' ').trim() || equipment.equipment_code || '—';
  const leadLink = (row._technicians || []).find((t) => (t.role || '').toLowerCase().includes('lead')) || (row._technicians || [])[0];
  const isCompleted = row.status === 'COMPLETED';
  const isCancelled = row.status === 'CANCELLED';
  const isLate = !isCompleted && !isCancelled && row.planned_end && new Date(row.planned_end).getTime() < Date.now();

  let status = 'Nouveau';
  if (isCompleted) status = 'Terminé';
  else if (isCancelled) status = 'Annulé';
  else if (isLate) status = 'En retard';
  else if (row.status === 'IN_PROGRESS') status = 'En cours';
  else status = 'Nouveau';

  return {
    id: row.work_order_code,
    equipment: equipmentName,
    equipmentCode: equipment.equipment_code || null,
    technician: leadLink?.technician?.full_name || 'Non assigné',
    type: row.maintenance_type === 'Preventive Maintenance' ? 'Préventif'
      : row.maintenance_type === 'Corrective Maintenance' ? 'Correctif'
      : row.maintenance_type || 'Correctif',
    priority: PRIORITY_DB_TO_APP[row.priority] || 'Normale',
    date: row.created_at ? row.created_at.slice(0, 10) : (row.planned_start || '').slice(0, 10),
    dueDate: (row.planned_end || '').slice(0, 10) || null,
    deadline: row.planned_end || null,
    status,
    estimatedHours: hoursBetween(row.planned_start, row.planned_end),
    spentHours: hoursBetween(row.actual_start, row.actual_end),
    description: row.comments || '',
    actionList: [],
    partsRequired: [],
    // Champs internes utilisés par le mapping / les calculs KPI
    _id: row.work_order_id,
    _equipmentId: row.equipment_id,
    _category: equipment.equipment_type || 'Non catégorisé',
    _maintenanceType: row.maintenance_type,
    _status: row.status,
    _problemResolved: !!row.problem_resolved,
    _rework: !!row.rework,
    _plannedStart: row.planned_start,
    _plannedEnd: row.planned_end,
    _actualStart: row.actual_start,
    _actualEnd: row.actual_end,
    _durationHours: hoursBetween(row.actual_start, row.actual_end),
    _leadTechnicianId: leadLink?.technician_id || null,
    _createdAt: row.created_at,
    needsReview: !!row.needs_review
  };
}

export function appToWorkOrderInsert(form) {
  const plannedStart = form.date ? `${form.date}T08:00:00` : new Date().toISOString();
  const plannedEnd = form.dueDate ? `${form.dueDate}T17:00:00` : null;
  return {
    work_order_code: `WO-${Date.now()}`,
    equipment_id: form._equipmentId,
    maintenance_type: MTYPE_APP_TO_DB[form.type] || 'Corrective Maintenance',
    priority: PRIORITY_APP_TO_DB[form.priority] || 'MEDIUM',
    planned_start: plannedStart,
    planned_end: plannedEnd,
    status: form.status === 'Terminé' ? 'COMPLETED' : form.status === 'En cours' ? 'IN_PROGRESS' : 'PLANNED',
    problem_resolved: false,
    rework: false,
    comments: form.description || null
  };
}

// ---------------------------------------------------------------------------
// Pannes (= failure + work_order parent)
// ---------------------------------------------------------------------------

const SEVERITY_DB_TO_APP = { CRITICAL: 'Critique', HIGH: 'Élevée', MEDIUM: 'Moyenne', LOW: 'Faible' };
const SEVERITY_APP_TO_DB = { Critique: 'CRITICAL', Élevée: 'HIGH', Moyenne: 'MEDIUM', Faible: 'LOW' };
const SEVERITY_P_CODE = { Critique: 'P1', Élevée: 'P2', Moyenne: 'P3', Faible: 'P4' };

export function panneRowToApp(failureRow) {
  const wo = failureRow.work_order || {};
  const equipment = wo.equipment || {};
  const equipmentName = [equipment.brand, equipment.model].filter(Boolean).join(' ').trim() || equipment.equipment_code || '—';
  const severity = SEVERITY_DB_TO_APP[wo.priority] || 'Moyenne';
  const resolved = wo.status === 'COMPLETED' && wo.problem_resolved;

  const reportedByMatch = /^Déclaré par ([^.]+)\./.exec(wo.comments || '');

  return {
    id: `PAN-${failureRow.failure_id}`,
    equipment: equipmentName,
    equipmentCode: equipment.equipment_code || null,
    type: failureRow.failure_type || 'Défaillance',
    date: (failureRow.failure_datetime || '').slice(0, 10),
    time: (failureRow.failure_datetime || '').slice(11, 16),
    resolvedDate: resolved && wo.actual_end ? wo.actual_end.slice(0, 10) : null,
    resolvedTime: resolved && wo.actual_end ? wo.actual_end.slice(11, 16) : null,
    severity,
    priority: `${severity} (${SEVERITY_P_CODE[severity] || 'P3'})`,
    reportedBy: reportedByMatch ? reportedByMatch[1] : '—',
    status: resolved ? 'Résolue' : 'En cours',
    durationHours: hoursBetween(failureRow.diagnosis_start, failureRow.diagnosis_end) || hoursBetween(wo.actual_start, wo.actual_end),
    symptoms: failureRow.failure_description || '',
    cause: failureRow.root_cause || '',
    actionRequired: (wo.comments || '').replace(/^Déclaré par [^.]+\.\s*/, ''),
    securityNote: null,
    // Champs internes
    _failureId: failureRow.failure_id,
    _workOrderId: wo.work_order_id,
    _equipmentId: wo.equipment_id,
    _category: equipment.equipment_type || 'Non catégorisé',
    _detectedDuringPreventive: !!failureRow.detected_during_preventive,
    _resolved: resolved,
    _reactionMinutes: failureRow.diagnosis_start
      ? Math.max(0, Math.round((new Date(failureRow.diagnosis_start).getTime() - new Date(failureRow.failure_datetime).getTime()) / 60000))
      : null,
    needsReview: !!failureRow.needs_review || !!wo.needs_review
  };
}

/** Construit les 2 payloads d'insertion (work_order puis failure) pour déclarer une panne */
export function appToPanneInserts(form, equipmentId) {
  const datetime = form.date ? `${form.date}T${form.time || '08:00'}:00` : new Date().toISOString();
  const comments = [
    form.reportedBy ? `Déclaré par ${form.reportedBy}.` : null,
    form.securityNote || null,
    form.actionRequired || null
  ].filter(Boolean).join(' ');

  const workOrderPayload = {
    work_order_code: `WO-${Date.now()}`,
    equipment_id: equipmentId,
    maintenance_type: 'Corrective Maintenance',
    priority: SEVERITY_APP_TO_DB[form.severity] || 'MEDIUM',
    planned_start: datetime,
    planned_end: null,
    actual_start: datetime, // dès la déclaration, pour permettre un calcul de durée réel une fois résolue
    status: 'IN_PROGRESS',
    problem_resolved: false,
    rework: false,
    comments: comments || null
  };

  const failurePayloadBase = {
    failure_datetime: datetime,
    failure_description: form.symptoms || null,
    failure_type: form.type || 'Défaillance',
    root_cause: form.cause || null,
    detected_during_preventive: false
  };

  return { workOrderPayload, failurePayloadBase };
}

// ---------------------------------------------------------------------------
// Pièces de rechange
// ---------------------------------------------------------------------------

export function sparePartRowToApp(row) {
  return {
    id: row.part_id,
    reference: row.part_number,
    name: row.part_name,
    category: row.category || 'Général',
    stock: row.stock ?? 0,
    minStock: row.min_stock ?? 0,
    unit: row.unit || 'Unités',
    location: row.location || '—',
    supplier: row.supplier || '—',
    unitPrice: row.unit_price ?? 0,
    compatibilities: null,
    compatibleMachines: [],
    needsReview: !!row.needs_review
  };
}

export function appToSparePartInsert(form) {
  return {
    part_number: form.reference,
    part_name: form.name,
    category: form.category || null,
    stock: Number(form.stock) || 0,
    min_stock: Number(form.minStock) || 0,
    location: form.location || null,
    supplier: form.supplier || null,
    unit_price: Number(form.unitPrice) || 0,
    unit: 'Unités',
    criticality: 'Standard',
    active: true,
    needs_review: !!form.needsReview
  };
}

// ---------------------------------------------------------------------------
// Plans préventifs
// ---------------------------------------------------------------------------

export function preventivePlanRowToApp(row) {
  const equipment = row.equipment || {};
  const equipmentName = [equipment.brand, equipment.model].filter(Boolean).join(' ').trim() || equipment.equipment_code || '—';
  const today = new Date();
  const due = row.next_due_date ? new Date(row.next_due_date) : null;
  let status = 'Planifié';
  if (row.active === false) status = 'Inactif';
  else if (due && due.getTime() < today.getTime()) status = 'Urgent';
  else if (due && (due.getTime() - today.getTime()) < 7 * 86400000) status = 'À venir';

  return {
    id: `PLN-${row.plan_id}`,
    title: row.maintenance_name,
    equipment: `${equipmentName} (${equipment.equipment_code || ''})`,
    periodicity: `${row.interval_value ?? '—'} ${row.interval_unit ?? ''}`.trim(),
    nextDate: row.next_due_date || null,
    durationHours: row.standard_duration_h ?? null,
    assignedTeam: '—',
    status,
    _planId: row.plan_id,
    _equipmentId: row.equipment_id
  };
}

// ---------------------------------------------------------------------------
// Historique (dérivé des pannes + work orders, aucune table dédiée)
// ---------------------------------------------------------------------------

export function buildHistoriqueFromData(pannesApp = [], workOrdersApp = []) {
  const events = [];

  pannesApp.forEach((p) => {
    events.push({
      id: `EVT-PAN-${p._failureId}`,
      date: `${p.date || ''} ${p.time || ''}`.trim(),
      equipment: p.equipment,
      event: `Panne déclarée : ${p.type}${p.symptoms ? ` — ${p.symptoms}` : ''}`,
      author: p.reportedBy || '—',
      type: p.status === 'Résolue' ? 'Panne Résolue' : 'Panne Déclarée',
      impact: p.status === 'Résolue' ? 'Remise en service' : 'Intervention en cours'
    });
  });

  workOrdersApp.forEach((w) => {
    events.push({
      id: `EVT-WO-${w._id}`,
      date: w._actualEnd ? w._actualEnd.replace('T', ' ').slice(0, 16) : `${w.date || ''} 00:00`,
      equipment: w.equipment,
      event: w.status === 'Terminé' ? `Clôture Work Order ${w.id}` : `Work Order ${w.id} créé (${w.type})`,
      author: w.technician,
      type: w.type,
      impact: w.status
    });
  });

  return events
    .filter((e) => e.date && e.date.trim())
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
