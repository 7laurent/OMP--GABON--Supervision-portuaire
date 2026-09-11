/**
 * OMP GABON - Contrôles de cohérence des données
 * Utilisés à la fois par les formulaires manuels (Add*Modal) et par l'import Excel,
 * pour détecter les incohérences avant écriture en base et notifier l'utilisateur.
 * Chaque incohérence est un objet {field, message, found, expected} : "found" est la
 * valeur trouvée dans la source, "expected" décrit la valeur retenue/attendue.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEquipmentForm(form) {
  const issues = [];
  if (!form.code || !String(form.code).trim()) {
    issues.push({ field: 'code', message: 'Code équipement manquant.', found: '(vide)', expected: 'Un code non vide' });
  }
  if (!form.name || !String(form.name).trim()) {
    issues.push({ field: 'name', message: 'Nom de la machine manquant.', found: '(vide)', expected: 'Un nom non vide' });
  }
  if (form.operatingHours !== undefined && Number(form.operatingHours) < 0) {
    issues.push({ field: 'operatingHours', message: 'Heures de marche négatives.', found: form.operatingHours, expected: '≥ 0' });
  }
  if (form.downtimeHours !== undefined && Number(form.downtimeHours) < 0) {
    issues.push({ field: 'downtimeHours', message: "Heures d'arrêt négatives.", found: form.downtimeHours, expected: '≥ 0' });
  }
  return issues;
}

export function validatePanneForm(form) {
  const issues = [];
  if (!form.equipment) {
    issues.push({ field: 'equipment', message: 'Équipement non sélectionné.', found: '(vide)', expected: 'Un équipement existant' });
  }
  if (form.date) {
    const d = new Date(`${form.date}T${form.time || '00:00'}`);
    if (!isNaN(d.getTime()) && d.getTime() > Date.now() + 5 * 60000) {
      issues.push({ field: 'date', message: 'La date/heure de la panne est dans le futur.', found: `${form.date} ${form.time || ''}`.trim(), expected: 'Une date passée ou présente' });
    }
  }
  if (form.durationHours !== undefined && Number(form.durationHours) < 0) {
    issues.push({ field: 'durationHours', message: "La durée d'arrêt ne peut pas être négative.", found: form.durationHours, expected: '≥ 0' });
  }
  return issues;
}

export function validateWorkOrderForm(form) {
  const issues = [];
  if (!form.equipment) {
    issues.push({ field: 'equipment', message: 'Équipement non sélectionné.', found: '(vide)', expected: 'Un équipement existant' });
  }
  if (form.date && form.dueDate) {
    const start = new Date(form.date);
    const end = new Date(form.dueDate);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end < start) {
      issues.push({ field: 'dueDate', message: "La date d'échéance est antérieure à la date de création.", found: form.dueDate, expected: `Une date ≥ ${form.date}` });
    }
  }
  if (form.estimatedHours !== undefined && Number(form.estimatedHours) < 0) {
    issues.push({ field: 'estimatedHours', message: 'Les heures estimées ne peuvent pas être négatives.', found: form.estimatedHours, expected: '≥ 0' });
  }
  return issues;
}

export function validateSparePartForm(form) {
  const issues = [];
  if (!form.reference || !String(form.reference).trim()) {
    issues.push({ field: 'reference', message: 'Référence manquante.', found: '(vide)', expected: 'Une référence non vide' });
  }
  if (!form.name || !String(form.name).trim()) {
    issues.push({ field: 'name', message: 'Désignation manquante.', found: '(vide)', expected: 'Une désignation non vide' });
  }
  if (form.stock !== undefined && Number(form.stock) < 0) {
    issues.push({ field: 'stock', message: 'Le stock ne peut pas être négatif.', found: form.stock, expected: '≥ 0' });
  }
  if (form.minStock !== undefined && Number(form.minStock) < 0) {
    issues.push({ field: 'minStock', message: 'Le stock minimum ne peut pas être négatif.', found: form.minStock, expected: '≥ 0' });
  }
  if (form.unitPrice !== undefined && Number(form.unitPrice) < 0) {
    issues.push({ field: 'unitPrice', message: 'Le prix unitaire ne peut pas être négatif.', found: form.unitPrice, expected: '≥ 0' });
  }
  return issues;
}

export function validateTechnicianForm(form) {
  const issues = [];
  if (!form.name || !String(form.name).trim()) {
    issues.push({ field: 'name', message: 'Nom complet manquant.', found: '(vide)', expected: 'Un nom non vide' });
  }
  if (form.experienceYears !== undefined && form.experienceYears !== null && Number(form.experienceYears) < 0) {
    issues.push({ field: 'experienceYears', message: "Les années d'expérience ne peuvent pas être négatives.", found: form.experienceYears, expected: '≥ 0' });
  }
  if (form.email && !EMAIL_RE.test(form.email)) {
    issues.push({ field: 'email', message: "Format d'email invalide.", found: form.email, expected: 'adresse@domaine.ext' });
  }
  return issues;
}
