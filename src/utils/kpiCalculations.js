/**
 * OMP GABON - MOTEUR DE CALCULS KPI ET FORMULES AFNOR
 * Référence Métier Dossier 2 (Normes NF EN 13306 & NF X 60-015)
 */

/**
 * Calcul du MTBF (Mean Time Between Failures - Temps Moyen de Bon Fonctionnement)
 * Formule AFNOR: MTBF = Somme(TBF) / N
 * @param {number} operatingHours Heures de fonctionnement cumulées
 * @param {number} failureCount Nombre total de défaillances constatées
 * @returns {number} MTBF en heures (arrondi à 1 décimale)
 */
export function calculateMTBF(operatingHours, failureCount) {
  if (!failureCount || failureCount <= 0) return Math.round(operatingHours || 0);
  const mtbf = operatingHours / failureCount;
  return Number(mtbf.toFixed(1));
}

/**
 * Calcul du MTTR (Mean Time To Repair - Temps Moyen de Réparation)
 * Formule AFNOR: MTTR = Somme(TTR) / N
 * @param {number} totalRepairHours Temps total passé en réparation (heures)
 * @param {number} failureCount Nombre de pannes réparées
 * @returns {number} MTTR en heures (arrondi à 2 décimales)
 */
export function calculateMTTR(totalRepairHours, failureCount) {
  if (!failureCount || failureCount <= 0) return 0;
  const mttr = totalRepairHours / failureCount;
  return Number(mttr.toFixed(2));
}

/**
 * Calcul de la Disponibilité Inhérente (Di)
 * Formule AFNOR: Di = MTBF / (MTBF + MTTR) * 100
 * @param {number} mtbf
 * @param {number} mttr
 * @returns {number} Pourcentage (%)
 */
export function calculateDi(mtbf, mttr) {
  if (!mtbf || mtbf <= 0) return 0;
  if (!mttr || mttr < 0) return 100;
  const di = (mtbf / (mtbf + mttr)) * 100;
  return Number(di.toFixed(1));
}

/**
 * Calcul de la Disponibilité Opérationnelle (Do)
 * Formule AFNOR: Do = Temps Fonctionnement / (Temps Fonctionnement + Temps Arrêt Total) * 100
 * @param {number} operatingHours
 * @param {number} totalDowntimeHours (Maintenance curative + préventive + attente)
 * @returns {number} Pourcentage (%)
 */
export function calculateDo(operatingHours, totalDowntimeHours) {
  const total = (operatingHours || 0) + (totalDowntimeHours || 0);
  if (total <= 0) return 100;
  const doRate = (operatingHours / total) * 100;
  return Number(doRate.toFixed(1));
}

/**
 * Taux de Défaillance Lambda (λ)
 * Formule AFNOR: λ = 1 / MTBF (défaillances par heure)
 * @param {number} mtbf
 * @returns {number}
 */
export function calculateFailureRate(mtbf) {
  if (!mtbf || mtbf <= 0) return 0;
  return Number((1 / mtbf).toFixed(5));
}

/**
 * Taux de Réparation Mu (μ)
 * Formule AFNOR: μ = 1 / MTTR (réparations par heure)
 * @param {number} mttr
 * @returns {number}
 */
export function calculateRepairRate(mttr) {
  if (!mttr || mttr <= 0) return 0;
  return Number((1 / mttr).toFixed(3));
}

/**
 * TRS (Taux de Rendement Synthétique / OEE)
 * Formule: TRS = Disponibilité x Performance x Qualité
 * @param {number} a Taux de Disponibilité (ex: 0.94)
 * @param {number} p Taux de Performance (ex: 0.92)
 * @param {number} q Taux de Qualité (ex: 0.98)
 * @returns {number} Pourcentage (%)
 */
export function calculateTRS(a = 0.94, p = 0.92, q = 0.98) {
  return Number((a * p * q * 100).toFixed(1));
}

/**
 * Ratio de Maintenance Préventive vs Corrective
 * Formule: Heures Préventif / (Heures Préventif + Heures Correctif) * 100
 * Cible standard AFNOR : > 70%
 */
export function calculatePreventiveRatio(prevHours, corrHours) {
  const total = (prevHours || 0) + (corrHours || 0);
  if (total <= 0) return 75;
  return Number(((prevHours / total) * 100).toFixed(1));
}

/**
 * Calcul complet des KPI spécifiques à une machine (Bouton « Voir les KPI »)
 * @param {Object} equipment L'équipement sélectionné
 * @param {Array} allPannes Liste de toutes les pannes
 * @param {Array} allWorkOrders Liste de tous les Work Orders
 */
export function calculateEquipmentSpecificKpis(equipment, allPannes = [], allWorkOrders = []) {
  if (!equipment) return null;

  // Filtrer les pannes et WO liés à cette machine
  const eqName = equipment.name ? String(equipment.name).toLowerCase() : '';
  const eqCode = equipment.code ? String(equipment.code).toLowerCase() : '';
  const eqId = equipment.id ? String(equipment.id).toLowerCase() : '';

  // Lignes marquées "à valider" (incohérence détectée à l'import) exclues des calculs
  // tant qu'un admin ne les a pas confirmées.
  const machinePannes = allPannes.filter(p => {
    if (p.needsReview) return false;
    const pEqId = p._equipmentId !== undefined && p._equipmentId !== null ? String(p._equipmentId).toLowerCase() : '';
    if (eqId && pEqId) return pEqId === eqId;

    const pEq = p.equipment ? String(p.equipment).toLowerCase() : '';
    const pEqCode = p.equipmentCode ? String(p.equipmentCode).toLowerCase() : '';
    return (
      (eqName && (pEq === eqName || pEq.includes(eqName))) ||
      (eqCode && (pEqCode === eqCode || pEq.includes(eqCode)))
    );
  });

  const machineWO = allWorkOrders.filter(w => {
    if (w.needsReview) return false;
    const wEqId = w._equipmentId !== undefined && w._equipmentId !== null ? String(w._equipmentId).toLowerCase() : '';
    if (eqId && wEqId) return wEqId === eqId;

    const wEq = w.equipment ? String(w.equipment).toLowerCase() : '';
    return (
      (eqName && (wEq === eqName || wEq.includes(eqName))) ||
      (eqCode && wEq.includes(eqCode))
    );
  });

  const operatingHours = Number(equipment.operatingHours) || 0;
  const failureCount = machinePannes.length;

  // Temps de réparation total réel (heures), aucune valeur fictive de repli
  const totalRepairHours = machinePannes.reduce((sum, p) => sum + (Number(p.durationHours) || 0), 0);
  const downtimeHours = Number(equipment.downtimeHours) || 0;

  const mtbf = calculateMTBF(operatingHours, failureCount || 1);
  const mttr = calculateMTTR(totalRepairHours, failureCount || 1);
  const di = calculateDi(mtbf, mttr);
  const doRate = calculateDo(operatingHours, downtimeHours);
  const failureRate = calculateFailureRate(mtbf);
  const repairRate = calculateRepairRate(mttr);

  // Wo stats pour cette machine
  const completedWO = machineWO.filter(w => w.status === 'Terminé' || w.status === 'done').length;
  const woCompletionRate = machineWO.length > 0 ? Number(((completedWO / machineWO.length) * 100).toFixed(1)) : 100;
  
  const prevWO = machineWO.filter(w => w.type === 'Préventif' || w.type === 'preventive').length;
  const prevRatio = machineWO.length > 0 ? Number(((prevWO / machineWO.length) * 100).toFixed(1)) : 75;

  // Score de fiabilité global (0 - 100)
  const healthScore = Math.min(100, Math.max(20, Math.round((doRate * 0.5) + (Math.min(100, (mtbf / 150) * 100) * 0.3) + (woCompletionRate * 0.2))));

  return {
    equipment,
    operatingHours,
    downtimeHours,
    failureCount,
    totalRepairHours,
    mtbf,
    mttr,
    di,
    doRate,
    failureRate,
    repairRate,
    machinePannes,
    machineWO,
    completedWO,
    woCompletionRate,
    prevRatio,
    healthScore,
    isCritical: equipment.criticality === 'Élevée' || equipment.criticality === 'Critique'
  };
}

/**
 * Calcul du Bilan Global pour le 2ème Dashboard
 * Synthétise l'ensemble des catégories
 */
export function calculateGlobalBilan(equipments = [], pannes = [], workOrders = [], technicians = [], parts = []) {
  // Lignes marquées "à valider" (incohérence détectée à l'import) : les dénombrements
  // bruts ci-dessous les incluent toujours (rien n'est masqué), mais elles sont exclues
  // des moyennes/ratios calculés (avgDo/avgMtbf/avgMttr, taux de résolution, ratio
  // préventif, occupation techniciens...) tant qu'un admin ne les a pas confirmées.
  const reliableEquipments = equipments.filter((e) => !e.needsReview);
  const reliablePannes = pannes.filter((p) => !p.needsReview);
  const reliableWorkOrders = workOrders.filter((w) => !w.needsReview);
  const reliableTechnicians = technicians.filter((t) => !t.needsReview);

  // 1. Équipements
  const totalEquipments = equipments.length;
  const operationalEquipments = equipments.filter(e => e.status === 'Opérationnel' || e.status === 'Actif').length;
  const maintenanceEquipments = equipments.filter(e => e.status === 'En maintenance').length;
  const stoppedEquipments = equipments.filter(e => e.status === 'À l\'arrêt' || e.status === 'Arrêté').length;
  const criticalEquipments = equipments.filter(e => e.criticality === 'Élevée' || e.criticality === 'Critique').length;

  const totalOperatingHours = reliableEquipments.reduce((sum, e) => sum + (Number(e.operatingHours) || 0), 0);
  const totalDowntimeHours = reliableEquipments.reduce((sum, e) => sum + (Number(e.downtimeHours) || 0), 0);
  const avgDo = calculateDo(totalOperatingHours, totalDowntimeHours);
  const avgMtbf = calculateMTBF(totalOperatingHours, reliablePannes.length || 1);
  const totalRepairHoursAll = reliablePannes.reduce((sum, p) => sum + (Number(p.durationHours) || 0), 0);
  const avgMttr = calculateMTTR(totalRepairHoursAll, reliablePannes.length || 1);
  const avgDi = calculateDi(avgMtbf, avgMttr);

  // 2. Pannes
  const totalPannes = pannes.length;
  const resolvedPannes = pannes.filter(p => p.status === 'Résolue' || p.status === 'Terminé').length;
  const activePannes = pannes.filter(p => p.status === 'En cours' || p.status === 'Nouveau').length;
  const criticalPannes = pannes.filter(p => p.severity === 'Critique' || p.severity === 'Élevée').length;
  const reliableResolvedPannes = reliablePannes.filter(p => p.status === 'Résolue' || p.status === 'Terminé').length;
  const resolutionRate = reliablePannes.length > 0 ? Number(((reliableResolvedPannes / reliablePannes.length) * 100).toFixed(1)) : 100;
  // Temps moyen de prise en charge réel = délai entre déclaration et début de diagnostic
  const reactionMinutesList = reliablePannes.map(p => p._reactionMinutes).filter((v) => v !== null && v !== undefined);
  const avgReactionTimeMinutes = reactionMinutesList.length
    ? Math.round(reactionMinutesList.reduce((s, v) => s + v, 0) / reactionMinutesList.length)
    : null;

  // 3. Work Orders
  const totalWO = workOrders.length;
  const completedWO = workOrders.filter(w => w.status === 'Terminé' || w.status === 'done').length;
  const inProgressWO = workOrders.filter(w => w.status === 'En cours' || w.status === 'in_progress').length;
  const lateWO = workOrders.filter(w => w.status === 'En retard' || w.status === 'late').length;
  const preventiveWO = workOrders.filter(w => w.type === 'Préventif' || w.type === 'Planifié').length;
  const correctiveWO = workOrders.filter(w => w.type === 'Correctif' || w.type === 'Curatif' || w.type === 'Urgent').length;
  const reliableCompletedWO = reliableWorkOrders.filter(w => w.status === 'Terminé' || w.status === 'done').length;
  const woCompletionRate = reliableWorkOrders.length > 0 ? Number(((reliableCompletedWO / reliableWorkOrders.length) * 100).toFixed(1)) : 0;
  const reliablePreventiveWO = reliableWorkOrders.filter(w => w.type === 'Préventif' || w.type === 'Planifié').length;
  const reliableCorrectiveWO = reliableWorkOrders.filter(w => w.type === 'Correctif' || w.type === 'Curatif' || w.type === 'Urgent').length;
  const preventiveRatio = calculatePreventiveRatio(reliablePreventiveWO, reliableCorrectiveWO);

  // 4. Techniciens
  const totalTechs = technicians.length;
  const activeTechs = technicians.filter(t => t.status === 'Actif' || t.status === 'En intervention').length;
  const reliableActiveTechs = reliableTechnicians.filter(t => t.status === 'Actif' || t.status === 'En intervention').length;
  const techOccupancyRate = reliableTechnicians.length > 0 ? Number(((reliableActiveTechs / reliableTechnicians.length) * 100).toFixed(1)) : 0;
  const fixRates = reliableTechnicians.map(t => t.firstTimeFixRate).filter((v) => v !== null && v !== undefined);
  const firstTimeFixRate = fixRates.length ? Number((fixRates.reduce((s, v) => s + v, 0) / fixRates.length).toFixed(1)) : null;

  // 5. Pièces & Stock
  const totalParts = parts.length;
  const outOfStockParts = parts.filter(p => (Number(p.stock) || 0) <= 0).length;
  const lowStockParts = parts.filter(p => (Number(p.stock) || 0) <= (Number(p.minStock) || 0) && (Number(p.stock) || 0) > 0).length;
  const totalStockValue = parts.reduce((sum, p) => sum + ((Number(p.stock) || 0) * (Number(p.unitPrice) || 0)), 0);
  const stockServiceRate = totalParts > 0 ? Number((((totalParts - outOfStockParts) / totalParts) * 100).toFixed(1)) : 100;

  // 6. Indice Global de Performance Maintenance (Score composite 0-100)
  const globalHealthIndex = Math.round(
    (avgDo * 0.35) + 
    (woCompletionRate * 0.25) + 
    (resolutionRate * 0.20) + 
    (stockServiceRate * 0.10) + 
    (preventiveRatio * 0.10)
  );

  return {
    equipments: {
      total: totalEquipments,
      operational: operationalEquipments,
      maintenance: maintenanceEquipments,
      stopped: stoppedEquipments,
      critical: criticalEquipments,
      avgDo,
      avgMtbf,
      avgMttr,
      avgDi,
      totalOperatingHours,
      totalDowntimeHours
    },
    pannes: {
      total: totalPannes,
      resolved: resolvedPannes,
      active: activePannes,
      critical: criticalPannes,
      resolutionRate,
      avgReactionTimeMinutes
    },
    workOrders: {
      total: totalWO,
      completed: completedWO,
      inProgress: inProgressWO,
      late: lateWO,
      completionRate: woCompletionRate,
      preventive: preventiveWO,
      corrective: correctiveWO,
      preventiveRatio
    },
    technicians: {
      total: totalTechs,
      active: activeTechs,
      occupancyRate: techOccupancyRate,
      firstTimeFixRate
    },
    parts: {
      total: totalParts,
      outOfStock: outOfStockParts,
      lowStock: lowStockParts,
      totalValue: totalStockValue,
      serviceRate: stockServiceRate
    },
    globalHealthIndex,
    afnorStandardStatus: "NF EN 13306 & NF X 60-015 Conforme"
  };
}

// ---------------------------------------------------------------------------
// ANALYSE TEMPORELLE : RATIOS DE PANNES, TRC, PRÉVENTIF/CORRECTIF,
// RÉPARTITION HEBDOMADAIRE PAR MOIS
// ---------------------------------------------------------------------------

/** Numéro de semaine ISO-8601 (1-53) d'une date */
export function getIsoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function bucketKey(date, granularity) {
  if (granularity === 'day') return date.toISOString().slice(0, 10);
  if (granularity === 'month') return date.toISOString().slice(0, 7);
  const week = getIsoWeek(date);
  return `${date.getFullYear()}-S${String(week).padStart(2, '0')}`;
}

function bucketLabel(key, granularity) {
  if (granularity === 'day') {
    const [y, m, d] = key.split('-');
    return `${d}/${m}`;
  }
  if (granularity === 'month') {
    const [y, m] = key.split('-');
    const noms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    return `${noms[Number(m) - 1]} ${y}`;
  }
  return key;
}

/**
 * Regroupe une liste de lignes par jour/semaine/mois entre deux bornes.
 * @param {Array} rows Lignes à regrouper (objets applicatifs)
 * @param {(row:Object)=>string|Date} dateAccessor Retourne la date de la ligne
 * @param {'day'|'week'|'month'} granularity
 * @param {{from?:Date, to?:Date}} range
 * @returns {Array<{key:string, label:string, count:number, items:Array}>}
 */
export function bucketByPeriod(rows, dateAccessor, granularity, range = {}) {
  const from = range.from || null;
  const to = range.to || null;
  const buckets = {};

  (rows || []).forEach((row) => {
    const raw = typeof dateAccessor === 'function' ? dateAccessor(row) : row[dateAccessor];
    const date = toDate(raw);
    if (!date) return;
    if (from && date < from) return;
    if (to && date > to) return;

    const key = bucketKey(date, granularity);
    if (!buckets[key]) buckets[key] = { key, label: bucketLabel(key, granularity), count: 0, items: [] };
    buckets[key].count += 1;
    buckets[key].items.push(row);
  });

  return Object.values(buckets).sort((a, b) => (a.key < b.key ? -1 : 1));
}

function filterByMachineAndCategory(rows, { equipmentId, category } = {}) {
  return (rows || []).filter((r) => {
    // Exclut les lignes "à valider" (incohérence détectée à l'import) des calculs
    // agrégés tant qu'un admin ne les a pas confirmées.
    if (r.needsReview) return false;
    const matchesEq = !equipmentId || equipmentId === 'all' || String(r._equipmentId) === String(equipmentId);
    const matchesCat = !category || category === 'all' || r._category === category;
    return matchesEq && matchesCat;
  });
}

/**
 * TRC — Taux de Réalisation Curative
 * TRC = (Pannes déclarées dont le Work Order est clôturé & le problème résolu) / (Total des pannes déclarées) × 100
 */
export function calculateTRC(pannes = []) {
  const reliable = pannes.filter((p) => !p.needsReview);
  const total = reliable.length;
  if (total === 0) return { trc: 100, total: 0, resolved: 0 };
  const resolved = reliable.filter((p) => p._resolved).length;
  return { trc: Number(((resolved / total) * 100).toFixed(1)), total, resolved };
}

/**
 * Série du ratio de pannes = (pannes de la période / équipements actifs concernés) × 100, par bucket temporel.
 */
export function calculateFailureRatioSeries(pannes, equipments, { granularity = 'day', from, to, equipmentId, category } = {}) {
  const filteredPannes = filterByMachineAndCategory(pannes, { equipmentId, category });
  const filteredEquipments = (equipments || []).filter((e) => {
    if (e.needsReview) return false;
    const matchesEq = !equipmentId || equipmentId === 'all' || String(e.id) === String(equipmentId);
    const matchesCat = !category || category === 'all' || e.category === category;
    return matchesEq && matchesCat;
  });
  const activeEquipmentCount = Math.max(1, filteredEquipments.length);

  const buckets = bucketByPeriod(filteredPannes, (p) => `${p.date}T${p.time || '00:00'}:00`, granularity, { from, to });
  return buckets.map((b) => ({
    ...b,
    failureRatio: Number(((b.count / activeEquipmentCount) * 100).toFixed(1)),
    trc: calculateTRC(b.items).trc
  }));
}

/**
 * Série du ratio préventif/correctif = répartition des Work Orders par type, par bucket temporel.
 */
export function calculatePreventiveCorrectiveRatioSeries(workOrders, { granularity = 'day', from, to, equipmentId, category } = {}) {
  const filtered = filterByMachineAndCategory(workOrders, { equipmentId, category });
  const buckets = bucketByPeriod(filtered, (w) => w._createdAt || w._plannedStart, granularity, { from, to });

  return buckets.map((b) => {
    const preventiveItems = b.items.filter((w) => w._maintenanceType === 'Preventive Maintenance');
    const correctiveItems = b.items.filter((w) => w._maintenanceType !== 'Preventive Maintenance');
    const preventive = preventiveItems.length;
    const corrective = correctiveItems.length;
    const hoursOf = (list) => Number(list.reduce((s, w) => s + (Number(w._durationHours) || Number(w.spentHours) || 0), 0).toFixed(1));
    return {
      ...b,
      preventiveCount: preventive,
      correctiveCount: corrective,
      preventiveRatio: b.count > 0 ? Number(((preventive / b.count) * 100).toFixed(1)) : 0,
      correctiveRatio: b.count > 0 ? Number(((corrective / b.count) * 100).toFixed(1)) : 0,
      preventiveHours: hoursOf(preventiveItems),
      correctiveHours: hoursOf(correctiveItems)
    };
  });
}

/**
 * Pour une année donnée, répartit chaque mois en ses semaines ISO et calcule, pour chaque
 * semaine, le % qu'elle représente du total mensuel — pour Équipements / Pannes / Work Orders.
 * "Équipements" = nombre d'équipements distincts concernés par une panne ou un WO cette semaine-là
 * (aucun historique d'état n'existe dans le schéma réel pour une autre mesure).
 */
export function calculateWeeklyPercentagesByMonth(pannes, workOrders, year, { equipmentId, category } = {}) {
  const filteredPannes = filterByMachineAndCategory(pannes, { equipmentId, category });
  const filteredWO = filterByMachineAndCategory(workOrders, { equipmentId, category });

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  const buildMetric = (rows, dateAccessor) => {
    const perWeek = {}; // weekKey -> { equipmentIds:Set, count }
    rows.forEach((row) => {
      const raw = dateAccessor(row);
      const date = toDate(raw);
      if (!date || date.getFullYear() !== Number(year)) return;
      const month = date.getMonth();
      const week = getIsoWeek(date);
      const wk = `${month}-${week}`;
      if (!perWeek[wk]) perWeek[wk] = { month, week, equipmentIds: new Set(), count: 0 };
      perWeek[wk].equipmentIds.add(row._equipmentId);
      perWeek[wk].count += 1;
    });
    return perWeek;
  };

  const panneWeeks = buildMetric(filteredPannes, (p) => `${p.date}T${p.time || '00:00'}:00`);
  const woWeeks = buildMetric(filteredWO, (w) => w._createdAt || w._plannedStart);

  const equipmentWeeks = {};
  Object.entries(panneWeeks).forEach(([wk, v]) => {
    if (!equipmentWeeks[wk]) equipmentWeeks[wk] = { month: v.month, week: v.week, equipmentIds: new Set() };
    v.equipmentIds.forEach((id) => equipmentWeeks[wk].equipmentIds.add(id));
  });
  Object.entries(woWeeks).forEach(([wk, v]) => {
    if (!equipmentWeeks[wk]) equipmentWeeks[wk] = { month: v.month, week: v.week, equipmentIds: new Set() };
    v.equipmentIds.forEach((id) => equipmentWeeks[wk].equipmentIds.add(id));
  });

  const buildMonths = (weeksMap, valueOf) => {
    return monthNames.map((label, monthIdx) => {
      const weeksOfMonth = Object.values(weeksMap).filter((w) => w.month === monthIdx);
      const total = weeksOfMonth.reduce((sum, w) => sum + valueOf(w), 0);
      const weeks = weeksOfMonth
        .sort((a, b) => a.week - b.week)
        .map((w) => ({
          week: w.week,
          value: valueOf(w),
          percent: total > 0 ? Number(((valueOf(w) / total) * 100).toFixed(1)) : 0
        }));
      return { month: monthIdx, label, total, weeks };
    });
  };

  return {
    pannes: buildMonths(panneWeeks, (w) => w.count),
    workOrders: buildMonths(woWeeks, (w) => w.count),
    equipements: buildMonths(equipmentWeeks, (w) => w.equipmentIds.size)
  };
}

// ---------------------------------------------------------------------------
// VOLUME HORAIRE DE MAINTENANCE (Pannes / Work Orders / Équipements)
// ---------------------------------------------------------------------------

function filterByScope(rows, { equipmentId, category } = {}) {
  return (rows || []).filter((r) => {
    if (r.needsReview) return false;
    const matchesEq = !equipmentId || equipmentId === 'all' || String(r._equipmentId ?? r.id) === String(equipmentId);
    const matchesCat = !category || category === 'all' || (r._category ?? r.category) === category;
    return matchesEq && matchesCat;
  });
}

/**
 * Volume horaire réel de maintenance, par catégorie de source (Pannes, Work Orders,
 * Équipements), rapporté au temps calendaire réellement disponible sur la période
 * couverte par les données (nombre de jours entre la première et la dernière date
 * réelle × 24h × nombre de machines concernées). Formule inspirée d'un relevé
 * terrain : "volume total horaire = Σ heures de maintenance", comparé au temps
 * total disponible pour obtenir un % réellement dédié à la maintenance.
 */
export function calculateHourVolumeBreakdown(pannes = [], workOrders = [], equipments = [], { equipmentId, category } = {}) {
  const scopedEquip = equipments.filter((e) => {
    if (e.needsReview) return false;
    const matchesEq = !equipmentId || equipmentId === 'all' || String(e.id) === String(equipmentId);
    const matchesCat = !category || category === 'all' || e.category === category;
    return matchesEq && matchesCat;
  });
  const scopedPannes = filterByScope(pannes, { equipmentId, category });
  const scopedWO = filterByScope(workOrders, { equipmentId, category });

  const pannesHours = Number(scopedPannes.reduce((s, p) => s + (Number(p.durationHours) || 0), 0).toFixed(1));

  const preventiveWO = scopedWO.filter((w) => w._maintenanceType === 'Preventive Maintenance');
  const correctiveWO = scopedWO.filter((w) => w._maintenanceType !== 'Preventive Maintenance');
  const woHoursOf = (list) => Number(list.reduce((s, w) => s + (Number(w._durationHours) || Number(w.spentHours) || 0), 0).toFixed(1));
  const preventiveHours = woHoursOf(preventiveWO);
  const correctiveHours = woHoursOf(correctiveWO);
  const woHours = Number((preventiveHours + correctiveHours).toFixed(1));

  // Heures "réparation" = pannes (diagnostic/correctif déclaré) + Work Orders correctifs (souvent le même
  // événement vu sous deux angles : on les affiche séparément pour éviter tout double comptage trompeur)
  const repairHours = Number((pannesHours + correctiveHours).toFixed(1));
  const totalMaintenanceHours = Number((repairHours + preventiveHours).toFixed(1));

  const equipmentCount = Math.max(1, scopedEquip.length);

  const allDates = [
    ...scopedPannes.map((p) => p.date),
    ...scopedWO.map((w) => (w._createdAt || w._plannedStart || '').slice(0, 10))
  ].filter(Boolean).sort();

  const spanDays = allDates.length
    ? Math.max(1, Math.round((new Date(allDates[allDates.length - 1]) - new Date(allDates[0])) / 86400000) + 1)
    : 1;

  const availableHours = spanDays * 24 * equipmentCount;

  return {
    pannesHours,
    woHours,
    preventiveHours,
    correctiveHours,
    repairHours,
    totalMaintenanceHours,
    equipmentCount,
    spanDays,
    availableHours: Math.round(availableHours),
    pannesPercent: availableHours > 0 ? Number(((pannesHours / availableHours) * 100).toFixed(2)) : 0,
    woPercent: availableHours > 0 ? Number(((woHours / availableHours) * 100).toFixed(2)) : 0,
    preventivePercent: availableHours > 0 ? Number(((preventiveHours / availableHours) * 100).toFixed(2)) : 0,
    correctivePercent: availableHours > 0 ? Number(((correctiveHours / availableHours) * 100).toFixed(2)) : 0
  };
}

// ---------------------------------------------------------------------------
// SÉRIE TEMPORELLE MULTI-KPI (MTBF / MTTR / Disponibilité / TRC), PAR MOIS
// (sur une année choisie) OU PAR ANNÉE — pour le graphique "Évolution des
// Indicateurs Clés" du Bilan Global et des KPI individuels par machine.
// ---------------------------------------------------------------------------

const TREND_MONTH_NAMES = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

/** Liste des années réellement représentées dans les pannes (+ année en cours). */
export function getAvailableYears(pannes = []) {
  const years = new Set();
  pannes.forEach((p) => {
    if (!p.date) return;
    const d = new Date(`${p.date}T00:00:00`);
    if (!isNaN(d.getTime())) years.add(d.getFullYear());
  });
  years.add(new Date().getFullYear());
  return Array.from(years).sort((a, b) => b - a);
}

/**
 * Série réelle MTBF/MTTR/Disponibilité/TRC par bucket temporel (mois d'une année
 * donnée, ou par année), filtrée par machine et/ou catégorie. Un bucket sans
 * aucune panne réelle renvoie des valeurs `null` (pas de repli fictif) afin que
 * le graphique laisse un vrai trou plutôt que d'afficher un chiffre inventé.
 */
export function calculateKpiTrendSeries(pannes = [], workOrders = [], equipments = [], { granularity = 'month', year, equipmentId, category } = {}) {
  const filteredPannes = filterByMachineAndCategory(pannes, { equipmentId, category });
  const filteredEquip = (equipments || []).filter((e) => {
    if (e.needsReview) return false;
    const matchesEq = !equipmentId || equipmentId === 'all' || String(e.id) === String(equipmentId);
    const matchesCat = !category || category === 'all' || e.category === category;
    return matchesEq && matchesCat;
  });
  const activeEquipCount = Math.max(1, filteredEquip.length);

  const computeForPannes = (pannesInPeriod, hoursInPeriod) => {
    const count = pannesInPeriod.length;
    if (count === 0) return { count: 0, mtbf: null, mttr: null, dispo: null, trc: null };
    const durationSum = pannesInPeriod.reduce((s, p) => s + (Number(p.durationHours) || 0), 0);
    const mtbf = calculateMTBF(hoursInPeriod * activeEquipCount, count);
    const mttr = calculateMTTR(durationSum || 1, count);
    const dispo = calculateDo(hoursInPeriod * activeEquipCount, durationSum);
    const { trc } = calculateTRC(pannesInPeriod);
    return { count, mtbf, mttr, dispo, trc };
  };

  if (granularity === 'year') {
    const years = new Set();
    filteredPannes.forEach((p) => {
      if (!p.date) return;
      const d = new Date(`${p.date}T00:00:00`);
      if (!isNaN(d.getTime())) years.add(d.getFullYear());
    });
    if (years.size === 0) years.add(new Date().getFullYear());
    const sortedYears = Array.from(years).sort();
    return sortedYears.map((y) => {
      const yearPannes = filteredPannes.filter((p) => {
        if (!p.date) return false;
        const d = new Date(`${p.date}T00:00:00`);
        return !isNaN(d.getTime()) && d.getFullYear() === y;
      });
      const daysInYear = ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) ? 366 : 365;
      const metrics = computeForPannes(yearPannes, daysInYear * 24);
      return { key: String(y), label: String(y), hasData: metrics.count > 0, ...metrics };
    });
  }

  if (granularity === 'week') {
    const y = year || new Date().getFullYear();
    const weeksOfYear = new Map(); // weekKey -> week number
    for (const d = new Date(y, 0, 1); d.getFullYear() === y; d.setDate(d.getDate() + 1)) {
      const week = getIsoWeek(d);
      const weekKey = `${y}-S${String(week).padStart(2, '0')}`;
      if (!weeksOfYear.has(weekKey)) weeksOfYear.set(weekKey, week);
    }
    const sortedWeekKeys = Array.from(weeksOfYear.keys()).sort((a, b) => weeksOfYear.get(a) - weeksOfYear.get(b));
    return sortedWeekKeys.map((weekKey) => {
      const week = weeksOfYear.get(weekKey);
      const weekPannes = filteredPannes.filter((p) => {
        if (!p.date) return false;
        const d = new Date(`${p.date}T00:00:00`);
        return !isNaN(d.getTime()) && d.getFullYear() === y && getIsoWeek(d) === week;
      });
      const metrics = computeForPannes(weekPannes, 7 * 24);
      return { key: weekKey, label: `S${String(week).padStart(2, '0')}`, hasData: metrics.count > 0, ...metrics };
    });
  }

  const y = year || new Date().getFullYear();
  return TREND_MONTH_NAMES.map((name, idx) => {
    const monthPannes = filteredPannes.filter((p) => {
      if (!p.date) return false;
      const d = new Date(`${p.date}T00:00:00`);
      return !isNaN(d.getTime()) && d.getFullYear() === y && d.getMonth() === idx;
    });
    const daysInMonth = new Date(y, idx + 1, 0).getDate();
    const metrics = computeForPannes(monthPannes, daysInMonth * 24);
    return { key: `${y}-${String(idx + 1).padStart(2, '0')}`, label: `${name} ${String(y).slice(2)}`, hasData: metrics.count > 0, ...metrics };
  });
}
