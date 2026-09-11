/**
 * OMP GABON - Configuration & Client Supabase
 * Connexion réelle au projet Supabase de l'utilisateur (equipment, technician,
 * work_order, wo_technician, failure, spare_part, preventive_plan, users).
 * Aucun fallback fictif : en l'absence de connexion, les listes restent vides.
 */
import { createClient } from '@supabase/supabase-js';
import {
  equipmentRowToApp,
  appToEquipmentInsert,
  appToEquipmentUpdate,
  enrichEquipmentsWithStats,
  technicianRowToApp,
  appToTechnicianInsert,
  workOrderRowToApp,
  appToWorkOrderInsert,
  panneRowToApp,
  appToPanneInserts,
  sparePartRowToApp,
  appToSparePartInsert,
  preventivePlanRowToApp
} from '../data/mappers.js';

// Identifiants réels du projet Supabase OMP (toujours surchargeables via .env ou Paramètres)
const DEFAULT_SUPABASE_URL = 'https://nwaycavjdxuabfsvfyrk.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53YXljYXZqZHh1YWJmc3ZmeXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4MDM5MzQsImV4cCI6MjEwMzM3OTkzNH0.hvlNq9h5dLRqfZ15dP9Y7Htn7TfTDqpKt6c-6_Rdwqs';

const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  let storedConfig = null;
  try {
    const raw = localStorage.getItem('omp_supabase_config');
    if (raw) storedConfig = JSON.parse(raw);
  } catch (e) {
    console.warn('Erreur lecture config supabase stockée', e);
  }

  const url = storedConfig?.url || envUrl || DEFAULT_SUPABASE_URL;
  const key = storedConfig?.key || envKey || DEFAULT_SUPABASE_ANON_KEY;

  return { url, key, isConfigured: Boolean(url && key && url.startsWith('http')) };
};

let supabaseInstance = null;

export const getSupabaseClient = () => {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: { persistSession: true, autoRefreshToken: true },
        realtime: { params: { eventsPerSecond: 10 } }
      });
    } catch (err) {
      console.error('Erreur initialisation Supabase client:', err);
      return null;
    }
  }
  return supabaseInstance;
};

export const isSupabaseConfigured = () => getSupabaseConfig().isConfigured;

export const saveSupabaseConfig = (url, key) => {
  localStorage.setItem('omp_supabase_config', JSON.stringify({ url, key }));
  supabaseInstance = null;
  return getSupabaseConfig().isConfigured;
};

export const testCustomSupabaseConnection = async (testUrl, testKey) => {
  if (!testUrl || !testKey) {
    return { success: false, message: 'Veuillez renseigner à la fois l’URL du projet et la Clé Anon.' };
  }

  const cleanUrl = String(testUrl).trim();
  const cleanKey = String(testKey).trim();

  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    return { success: false, message: 'L’URL Supabase doit débuter par https:// (ex: https://xyz.supabase.co)' };
  }

  try {
    const tempClient = createClient(cleanUrl, cleanKey, { auth: { persistSession: false } });
    const { error } = await tempClient.from('equipment').select('equipment_id').limit(1);

    if (error && error.code !== 'PGRST116') {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: true,
          tableMissing: true,
          message: 'Connexion au serveur Supabase réussie ! Note : la table "equipment" n’existe pas encore (appliquez le script SQL).'
        };
      }
      return { success: false, message: `Réponse Supabase : ${error.message} (Code : ${error.code || 'Inconnu'})` };
    }

    return { success: true, tableMissing: false, message: 'Connexion Supabase établie et table "equipment" accessible avec succès !' };
  } catch (err) {
    return { success: false, message: `Échec de connexion : ${err.message}` };
  }
};

export const testSupabaseConnection = async () => {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    return { success: false, message: 'Identifiants Supabase non configurés (URL ou Clé manquante).' };
  }
  return testCustomSupabaseConnection(url, key);
};

export const getStoredSupabaseConfig = () => getSupabaseConfig();

export const clearSupabaseConfig = () => {
  localStorage.removeItem('omp_supabase_config');
  supabaseInstance = null;
  return true;
};

// ---------------------------------------------------------------------------
// Abonnements Realtime
// ---------------------------------------------------------------------------

/** S'abonne aux changements Postgres d'une liste de tables. Retourne une fonction de désinscription. */
export function subscribeToRealtimeChanges(tables, onChange) {
  const client = getSupabaseClient();
  if (!client) return () => {};

  const channel = client.channel(`omp-realtime-${Date.now()}`);
  tables.forEach((table) => {
    channel.on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => onChange(table, payload));
  });
  channel.subscribe();

  return () => {
    try { client.removeChannel(channel); } catch (e) { /* noop */ }
  };
}

// ---------------------------------------------------------------------------
// Lecture consolidée (équipements, techniciens, work orders, pannes, pièces, plans)
// ---------------------------------------------------------------------------

async function fetchWorkOrdersRaw() {
  const client = getSupabaseClient();
  if (!client) return [];

  const [{ data: workOrders, error: woErr }, { data: links, error: linkErr }] = await Promise.all([
    client.from('work_order').select('*, equipment(*)').order('work_order_id', { ascending: false }),
    client.from('wo_technician').select('*, technician(*)')
  ]);

  if (woErr) { console.error('Erreur lecture work_order:', woErr); return []; }
  if (linkErr) console.warn('Erreur lecture wo_technician:', linkErr);

  const linksByWo = {};
  (links || []).forEach((l) => {
    if (!linksByWo[l.work_order_id]) linksByWo[l.work_order_id] = [];
    linksByWo[l.work_order_id].push(l);
  });

  return (workOrders || []).map((wo) => ({ ...wo, _technicians: linksByWo[wo.work_order_id] || [] }));
}

export async function fetchWorkOrders() {
  const raw = await fetchWorkOrdersRaw();
  return raw.map(workOrderRowToApp);
}

export async function fetchPannes() {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client
    .from('failure')
    .select('*, work_order(*, equipment(*))')
    .order('failure_id', { ascending: false });
  if (error) { console.error('Erreur lecture failure:', error); return []; }
  return (data || []).map(panneRowToApp);
}

export async function fetchTechnicians(workOrdersApp) {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client.from('technician').select('*').order('technician_id', { ascending: true });
  if (error) { console.error('Erreur lecture technician:', error); return []; }
  const wo = workOrdersApp || (await fetchWorkOrders());
  return (data || []).map((row) => technicianRowToApp(row, wo));
}

export async function fetchSpareParts() {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client.from('spare_part').select('*').order('part_id', { ascending: true });
  if (error) { console.error('Erreur lecture spare_part:', error); return []; }
  return (data || []).map(sparePartRowToApp);
}

export async function fetchPreventivePlans() {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client.from('preventive_plan').select('*, equipment(*)').order('plan_id', { ascending: true });
  if (error) { console.error('Erreur lecture preventive_plan:', error); return []; }
  return (data || []).map(preventivePlanRowToApp);
}

export async function fetchEquipments(workOrdersApp, preventivePlansApp) {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client.from('equipment').select('*').order('equipment_id', { ascending: true });
  if (error) { console.error('Erreur lecture equipment:', error); return []; }
  const mapped = (data || []).map(equipmentRowToApp);
  const wo = workOrdersApp || (await fetchWorkOrders());
  const plans = preventivePlansApp || (await fetchPreventivePlans());
  return enrichEquipmentsWithStats(mapped, wo, plans);
}

/** Charge l'intégralité des données métier en un seul aller, dans le bon ordre de dépendance. */
export async function fetchAllData() {
  const [workOrders, pannes, spareParts, preventivePlans] = await Promise.all([
    fetchWorkOrders(),
    fetchPannes(),
    fetchSpareParts(),
    fetchPreventivePlans()
  ]);
  const [equipments, technicians] = await Promise.all([
    fetchEquipments(workOrders, preventivePlans),
    fetchTechnicians(workOrders)
  ]);
  return { equipments, technicians, workOrders, pannes, spareParts, preventivePlans };
}

// ---------------------------------------------------------------------------
// Écritures : Équipements
// ---------------------------------------------------------------------------

/** equipment.equipment_id n'est pas auto-incrémenté côté base : on calcule le prochain id nous-mêmes. */
async function nextId(client, table, pkColumn) {
  const { data } = await client.from(table).select(pkColumn).order(pkColumn, { ascending: false }).limit(1);
  return (data && data[0] ? data[0][pkColumn] : 0) + 1;
}

export async function createEquipment(form) {
  const client = getSupabaseClient();
  if (!client) return null;
  const equipment_id = await nextId(client, 'equipment', 'equipment_id');
  const { data, error } = await client.from('equipment').insert([{ equipment_id, ...appToEquipmentInsert(form) }]).select('*').single();
  if (error) { console.error('Erreur création equipment:', error); throw error; }
  return equipmentRowToApp(data);
}

export async function updateEquipmentFields(equipmentId, fields) {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from('equipment').update(appToEquipmentUpdate(fields)).eq('equipment_id', equipmentId);
  if (error) console.error('Erreur mise à jour equipment:', error);
}

export async function deleteEquipment(equipmentId) {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from('equipment').delete().eq('equipment_id', equipmentId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Écritures : Pannes (failure + work_order parent)
// ---------------------------------------------------------------------------

/** Logique d'insertion partagée (formulaire manuel ET import Excel) */
async function insertPanneRows(workOrderPayload, failurePayloadBase) {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data: wo, error: woErr } = await client.from('work_order').insert([workOrderPayload]).select('*').single();
  if (woErr) { console.error('Erreur création work_order (panne):', woErr); throw woErr; }

  const { data: failure, error: failErr } = await client
    .from('failure')
    .insert([{ ...failurePayloadBase, work_order_id: wo.work_order_id }])
    .select('*, work_order(*, equipment(*))')
    .single();
  if (failErr) { console.error('Erreur création failure:', failErr); throw failErr; }

  return panneRowToApp(failure);
}

export async function createPanne(form, equipmentId) {
  const { workOrderPayload, failurePayloadBase } = appToPanneInserts(form, equipmentId);
  return insertPanneRows(workOrderPayload, failurePayloadBase);
}

/** Variante pour l'import en masse : payloads déjà au format base (contourne le formulaire manuel) */
export async function createPanneFromPayload(workOrderPayload, failurePayloadBase) {
  return insertPanneRows(workOrderPayload, failurePayloadBase);
}

export async function resolvePanne(workOrderId) {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client
    .from('work_order')
    .update({ status: 'COMPLETED', problem_resolved: true, actual_end: new Date().toISOString() })
    .eq('work_order_id', workOrderId);
  if (error) console.error('Erreur résolution panne:', error);
}

export async function deletePanne(failureId) {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from('failure').delete().eq('failure_id', failureId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Écritures : Work Orders
// ---------------------------------------------------------------------------

/** Logique d'insertion partagée (formulaire manuel ET import Excel) */
async function insertWorkOrderRow(payload, technicianId) {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data: wo, error: woErr } = await client.from('work_order').insert([payload]).select('*, equipment(*)').single();
  if (woErr) { console.error('Erreur création work_order:', woErr); throw woErr; }

  if (technicianId) {
    const { error: linkErr } = await client.from('wo_technician').insert([{
      work_order_id: wo.work_order_id,
      technician_id: technicianId,
      role: 'Lead Technician',
      participation_start: payload.planned_start
    }]);
    if (linkErr) console.warn('Erreur affectation technicien:', linkErr);
  }

  return workOrderRowToApp({ ...wo, _technicians: [] });
}

export async function createWorkOrder(form, equipmentId, technicianId) {
  const payload = appToWorkOrderInsert({ ...form, _equipmentId: equipmentId });
  return insertWorkOrderRow(payload, technicianId);
}

/** Variante pour l'import en masse : payload déjà au format base de données */
export async function createWorkOrderFromPayload(payload, technicianId) {
  return insertWorkOrderRow(payload, technicianId);
}

export async function completeWorkOrder(workOrderId) {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client
    .from('work_order')
    .update({ status: 'COMPLETED', actual_end: new Date().toISOString() })
    .eq('work_order_id', workOrderId);
  if (error) console.error('Erreur clôture work order:', error);
}

export async function deleteWorkOrder(workOrderId) {
  const client = getSupabaseClient();
  if (!client) return;
  await client.from('wo_technician').delete().eq('work_order_id', workOrderId);
  await client.from('failure').delete().eq('work_order_id', workOrderId);
  const { error } = await client.from('work_order').delete().eq('work_order_id', workOrderId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Écritures : Pièces de rechange
// ---------------------------------------------------------------------------

export async function createSparePart(form) {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client.from('spare_part').insert([appToSparePartInsert(form)]).select('*').single();
  if (error) { console.error('Erreur création spare_part:', error); throw error; }
  return sparePartRowToApp(data);
}

export async function deleteSparePart(partId) {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from('spare_part').delete().eq('part_id', partId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Écritures : Techniciens
// ---------------------------------------------------------------------------

export async function createTechnician(form) {
  const client = getSupabaseClient();
  if (!client) return null;
  const technician_id = await nextId(client, 'technician', 'technician_id');
  const { data, error } = await client.from('technician').insert([{ technician_id, ...appToTechnicianInsert(form) }]).select('*').single();
  if (error) { console.error('Erreur création technician:', error); throw error; }
  return technicianRowToApp(data, []);
}

export async function deleteTechnician(technicianId) {
  const client = getSupabaseClient();
  if (!client) return;
  await client.from('wo_technician').delete().eq('technician_id', technicianId);
  const { error } = await client.from('technician').delete().eq('technician_id', technicianId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Écritures : Plans préventifs
// ---------------------------------------------------------------------------

export async function deletePreventivePlan(planId) {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from('preventive_plan').delete().eq('plan_id', planId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Levée d'incohérence (bouton "Confirmer les données" de la notification)
// ---------------------------------------------------------------------------

const REVIEW_TABLE_CONFIG = {
  equipements: { table: 'equipment', pkColumn: 'equipment_id' },
  techniciens: { table: 'technician', pkColumn: 'technician_id' },
  pieces: { table: 'spare_part', pkColumn: 'part_id' },
  workorders: { table: 'work_order', pkColumn: 'work_order_id' },
  pannes: { table: 'failure', pkColumn: 'failure_id' }
};

/** Lève le drapeau "à valider" d'une ligne une fois l'incohérence vérifiée/corrigée par un admin. */
export async function markRowReviewed(category, id) {
  const client = getSupabaseClient();
  if (!client) return;
  const config = REVIEW_TABLE_CONFIG[category];
  if (!config) return;
  const { error } = await client.from(config.table).update({ needs_review: false }).eq(config.pkColumn, id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Réinitialisation complète (bouton Paramètres)
// ---------------------------------------------------------------------------

/** Supprime réellement toutes les données métier de Supabase, dans l'ordre des dépendances. */
export async function resetAllData() {
  const client = getSupabaseClient();
  if (!client) return { success: false, message: 'Client Supabase non initialisé.' };

  try {
    await client.from('wo_technician').delete().neq('work_order_id', -1);
    await client.from('failure').delete().neq('failure_id', -1);
    await client.from('work_order').delete().neq('work_order_id', -1);
    await client.from('preventive_plan').delete().neq('plan_id', -1);
    await client.from('spare_part').delete().neq('part_id', -1);
    await client.from('technician').delete().neq('technician_id', -1);
    await client.from('equipment').delete().neq('equipment_id', -1);
    return { success: true, message: 'Toutes les données ont été supprimées de Supabase.' };
  } catch (err) {
    return { success: false, message: `Erreur lors de la réinitialisation : ${err.message}` };
  }
}

// ---------------------------------------------------------------------------
// Gestion des utilisateurs & rôles (réservé aux ADMIN — page Utilisateurs)
// ---------------------------------------------------------------------------

export async function fetchUsers() {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client.from('users').select('*').order('user_id', { ascending: true });
  if (error) { console.error('Erreur lecture users:', error); return []; }
  return data || [];
}

/** Change le rôle d'un utilisateur (ADMIN ↔ USER). Rejeté côté serveur si l'appelant n'est pas ADMIN. */
export async function updateUserRole(userId, role) {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from('users').update({ role }).eq('user_id', userId);
  if (error) throw error;
}

/** Active ou désactive un compte (n'empêche pas la connexion Supabase Auth, mais peut servir de marqueur RH) */
export async function updateUserActive(userId, active) {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from('users').update({ active }).eq('user_id', userId);
  if (error) throw error;
}
