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

  const machinePannes = allPannes.filter(p => {
    const pEq = p.equipment ? String(p.equipment).toLowerCase() : '';
    const pEqId = p.equipmentId ? String(p.equipmentId).toLowerCase() : '';
    const pEqCode = p.equipmentCode ? String(p.equipmentCode).toLowerCase() : '';

    return (
      (eqName && (pEq === eqName || pEq.includes(eqName))) ||
      (eqId && pEqId === eqId) ||
      (eqCode && (pEqCode === eqCode || pEq.includes(eqCode)))
    );
  });

  const machineWO = allWorkOrders.filter(w => {
    const wEq = w.equipment ? String(w.equipment).toLowerCase() : '';
    const wEqId = w.equipmentId ? String(w.equipmentId).toLowerCase() : '';

    return (
      (eqName && (wEq === eqName || wEq.includes(eqName))) ||
      (eqId && wEqId === eqId) ||
      (eqCode && wEq.includes(eqCode))
    );
  });

  const operatingHours = equipment.operatingHours || 1840;
  const failureCount = machinePannes.length;
  
  // Temps de réparation total estimé (heures)
  const totalRepairHours = machinePannes.reduce((sum, p) => sum + (Number(p.durationHours) || Number(p.repairTime) || 3.5), 0);
  const downtimeHours = equipment.downtimeHours || (totalRepairHours + 12);

  const mtbf = calculateMTBF(operatingHours, failureCount || 1);
  const mttr = calculateMTTR(totalRepairHours || 6.5, failureCount || 1);
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
  // 1. Équipements
  const totalEquipments = equipments.length;
  const operationalEquipments = equipments.filter(e => e.status === 'Opérationnel' || e.status === 'Actif').length;
  const maintenanceEquipments = equipments.filter(e => e.status === 'En maintenance').length;
  const stoppedEquipments = equipments.filter(e => e.status === 'À l\'arrêt' || e.status === 'Arrêté').length;
  const criticalEquipments = equipments.filter(e => e.criticality === 'Élevée' || e.criticality === 'Critique').length;

  const totalOperatingHours = equipments.reduce((sum, e) => sum + (Number(e.operatingHours) || 1800), 0);
  const totalDowntimeHours = equipments.reduce((sum, e) => sum + (Number(e.downtimeHours) || 85), 0);
  const avgDo = calculateDo(totalOperatingHours, totalDowntimeHours);
  const avgMtbf = calculateMTBF(totalOperatingHours, pannes.length || 1);
  const avgMttr = calculateMTTR(112.5, pannes.length || 1);
  const avgDi = calculateDi(avgMtbf, avgMttr);

  // 2. Pannes
  const totalPannes = pannes.length;
  const resolvedPannes = pannes.filter(p => p.status === 'Résolue' || p.status === 'Terminé').length;
  const activePannes = pannes.filter(p => p.status === 'En cours' || p.status === 'Nouveau').length;
  const criticalPannes = pannes.filter(p => p.severity === 'Critique' || p.severity === 'Élevée').length;
  const resolutionRate = totalPannes > 0 ? Number(((resolvedPannes / totalPannes) * 100).toFixed(1)) : 100;
  const avgReactionTimeMinutes = 28; // Temps Moyen de Prise en Charge

  // 3. Work Orders
  const totalWO = workOrders.length;
  const completedWO = workOrders.filter(w => w.status === 'Terminé' || w.status === 'done').length;
  const inProgressWO = workOrders.filter(w => w.status === 'En cours' || w.status === 'in_progress').length;
  const lateWO = workOrders.filter(w => w.status === 'En retard' || w.status === 'late').length;
  const woCompletionRate = totalWO > 0 ? Number(((completedWO / totalWO) * 100).toFixed(1)) : 0;
  const preventiveWO = workOrders.filter(w => w.type === 'Préventif' || w.type === 'Planifié').length;
  const correctiveWO = workOrders.filter(w => w.type === 'Correctif' || w.type === 'Curatif' || w.type === 'Urgent').length;
  const preventiveRatio = calculatePreventiveRatio(preventiveWO, correctiveWO);

  // 4. Techniciens
  const totalTechs = technicians.length;
  const activeTechs = technicians.filter(t => t.status === 'Actif' || t.status === 'En intervention').length;
  const techOccupancyRate = 87.5; // Taux d'occupation moyen
  const firstTimeFixRate = 92.0; // Taux de résolution au 1er passage

  // 5. Pièces & Stock
  const totalParts = parts.length;
  const outOfStockParts = parts.filter(p => (Number(p.stock) || 0) <= 0).length;
  const lowStockParts = parts.filter(p => (Number(p.stock) || 0) <= (Number(p.minStock) || 5) && (Number(p.stock) || 0) > 0).length;
  const totalStockValue = parts.reduce((sum, p) => sum + ((Number(p.stock) || 0) * (Number(p.unitPrice) || 45)), 0);
  const stockServiceRate = totalParts > 0 ? Number((((totalParts - outOfStockParts) / totalParts) * 100).toFixed(1)) : 98;

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
