/**
 * OMP Gabon - Configuration & Client Supabase
 * Gère la persistance réelle dans Supabase avec fallback réactif local
 */
import { createClient } from '@supabase/supabase-js';

// Lecture des clés depuis l'environnement ou les paramètres sauvegardés
const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  // Paramètres personnalisés sauvegardés via la page Paramètres
  let storedConfig = null;
  try {
    const raw = localStorage.getItem('omp_supabase_config');
    if (raw) storedConfig = JSON.parse(raw);
  } catch (e) {
    console.warn('Erreur lecture config supabase stockée', e);
  }

  const url = storedConfig?.url || envUrl || '';
  const key = storedConfig?.key || envKey || '';

  return { url, key, isConfigured: Boolean(url && key && url.startsWith('http')) };
};

let supabaseInstance = null;

export const getSupabaseClient = () => {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: { persistSession: true },
        realtime: { params: { eventsPerSecond: 10 } }
      });
    } catch (err) {
      console.error('Erreur initialisation Supabase client:', err);
      return null;
    }
  }
  return supabaseInstance;
};

/**
 * Vérifie si Supabase est configuré
 */
export const isSupabaseConfigured = () => {
  return getSupabaseConfig().isConfigured;
};

/**
 * Sauvegarde la configuration Supabase saisie par l'utilisateur
 */
export const saveSupabaseConfig = (url, key) => {
  localStorage.setItem('omp_supabase_config', JSON.stringify({ url, key }));
  supabaseInstance = null; // Réinitialiser l'instance
  return getSupabaseConfig().isConfigured;
};

/**
 * Teste la connexion à Supabase avec des identifiants spécifiques
 */
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
    const tempClient = createClient(cleanUrl, cleanKey, {
      auth: { persistSession: false }
    });

    const { data, error } = await tempClient.from('equipements').select('id').limit(1);

    if (error && error.code !== 'PGRST116') {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return { 
          success: true, 
          tableMissing: true, 
          message: 'Connexion au serveur Supabase réussie ! Note : la table "equipements" n’existe pas encore (appliquez le script SQL).' 
        };
      }
      return { success: false, message: `Réponse Supabase : ${error.message} (Code : ${error.code || 'Inconnu'})` };
    }

    return { 
      success: true, 
      tableMissing: false, 
      message: 'Connexion Supabase établie et table "equipements" accessible avec succès !' 
    };
  } catch (err) {
    return { success: false, message: `Échec de connexion : ${err.message}` };
  }
};

/**
 * Teste la connexion à Supabase
 */
export const testSupabaseConnection = async () => {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    return { success: false, message: 'Identifiants Supabase non configurés (URL ou Clé manquante).' };
  }
  return testCustomSupabaseConnection(url, key);
};

/**
 * Récupère les données d'une table avec fallback local persistant
 */
export const fetchTableData = async (tableName, fallbackData) => {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from(tableName).select('*').order('id', { ascending: true });
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn(`Lecture Supabase ${tableName} ignorée, utilisation du cache local.`, e);
    }
  }

  // Fallback localStorage
  try {
    const local = localStorage.getItem(`omp_${tableName}`);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn(`Erreur localStorage ${tableName}:`, e);
  }

  // Enregistrer le fallback par défaut dans localStorage
  if (fallbackData) {
    localStorage.setItem(`omp_${tableName}`, JSON.stringify(fallbackData));
  }
  return fallbackData;
};

/**
 * Sauvegarde/Insère un élément
 */
export const insertTableItem = async (tableName, item) => {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from(tableName).insert([item]).select();
      if (!error && data) return data[0];
    } catch (e) {
      console.error(`Erreur insertion Supabase sur ${tableName}:`, e);
    }
  }
  return item;
};

/**
 * Met à jour un élément
 */
export const updateTableItem = async (tableName, id, updates) => {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from(tableName).update(updates).eq('id', id);
    } catch (e) {
      console.error(`Erreur mise à jour Supabase sur ${tableName}:`, e);
    }
  }
};

/**
 * Récupère la configuration stockée
 */
export const getStoredSupabaseConfig = () => {
  return getSupabaseConfig();
};

/**
 * Supprime la configuration Supabase locale
 */
export const clearSupabaseConfig = () => {
  localStorage.removeItem('omp_supabase_config');
  supabaseInstance = null;
  return true;
};

/**
 * Initialise / Injecte les données d'essai portuaires dans Supabase
 */
export const seedSupabaseInitialData = async ({ equipments = [], pannes = [], workOrders = [], parts = [], technicians = [] }) => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Client Supabase non initialisé. Veuillez configurer URL et clé.' };
  }

  const results = { equipements: 0, pannes: 0, work_orders: 0, pieces: 0, techniciens: 0 };
  const errors = [];

  try {
    // 1. Équipements
    if (equipments.length > 0) {
      const { data: existing } = await client.from('equipements').select('id').limit(1);
      if (!existing || existing.length === 0) {
        const payload = equipments.map(eq => ({
          code: eq.code,
          name: eq.name,
          category: eq.category,
          location: eq.location,
          status: eq.status,
          criticality: eq.criticality,
          commissionDate: eq.commissionDate || null,
          operatingHours: eq.operatingHours || 0,
          downtimeHours: eq.downtimeHours || 0,
          lastMaintenance: eq.lastMaintenance || null,
          nextMaintenance: eq.nextMaintenance || null,
          serialNumber: eq.serialNumber || null,
          manufacturer: eq.manufacturer || null,
          notes: eq.notes || null
        }));
        const { error } = await client.from('equipements').insert(payload);
        if (error) errors.push(`equipements: ${error.message}`);
        else results.equipements = payload.length;
      }
    }

    // 2. Pannes
    if (pannes.length > 0) {
      const { data: existing } = await client.from('pannes').select('id').limit(1);
      if (!existing || existing.length === 0) {
        const payload = pannes.map(p => ({
          id: String(p.id),
          equipment: p.equipment,
          equipmentCode: p.equipmentCode || null,
          type: p.type,
          date: p.date,
          time: p.time,
          severity: p.severity,
          priority: p.priority,
          reportedBy: p.reportedBy,
          status: p.status,
          durationHours: p.durationHours || 0,
          symptoms: p.symptoms || null,
          cause: p.cause || null,
          actionRequired: p.actionRequired || null,
          securityNote: p.securityNote || null
        }));
        const { error } = await client.from('pannes').insert(payload);
        if (error) errors.push(`pannes: ${error.message}`);
        else results.pannes = payload.length;
      }
    }

    // 3. Work Orders
    if (workOrders.length > 0) {
      const { data: existing } = await client.from('work_orders').select('id').limit(1);
      if (!existing || existing.length === 0) {
        const payload = workOrders.map(wo => ({
          id: String(wo.id),
          title: wo.title || wo.description || 'Intervention',
          equipment: wo.equipment,
          equipmentCode: wo.equipmentCode || null,
          technician: wo.technician,
          type: wo.type,
          priority: wo.priority,
          deadline: wo.deadline,
          status: wo.status,
          description: wo.description || null,
          estimatedHours: wo.estimatedHours || 0,
          spentHours: wo.spentHours || 0,
          partsRequired: wo.partsUsed || wo.partsRequired || [],
          actionList: wo.steps || wo.actionList || []
        }));
        const { error } = await client.from('work_orders').insert(payload);
        if (error) errors.push(`work_orders: ${error.message}`);
        else results.work_orders = payload.length;
      }
    }

    // 4. Pièces
    if (parts.length > 0) {
      const { data: existing } = await client.from('pieces').select('id').limit(1);
      if (!existing || existing.length === 0) {
        const payload = parts.map(pt => ({
          ref: pt.ref,
          name: pt.name,
          category: pt.category,
          stock: pt.stock || 0,
          minStock: pt.minStock || 0,
          unit: pt.unit || 'Unités',
          location: pt.location || null,
          compatibleMachines: pt.compatibleMachines || []
        }));
        const { error } = await client.from('pieces').insert(payload);
        if (error) errors.push(`pieces: ${error.message}`);
        else results.pieces = payload.length;
      }
    }

    // 5. Techniciens
    if (technicians.length > 0) {
      const { data: existing } = await client.from('techniciens').select('id').limit(1);
      if (!existing || existing.length === 0) {
        const payload = technicians.map(t => ({
          matricule: t.matricule,
          name: t.name,
          role: t.role,
          specialty: t.specialty,
          status: t.status,
          activeOrders: t.activeOrders || 0,
          completedOrders: t.completedOrders || 0,
          rating: t.rating || 4.5,
          phone: t.phone || null,
          shift: t.shift || null
        }));
        const { error } = await client.from('techniciens').insert(payload);
        if (error) errors.push(`techniciens: ${error.message}`);
        else results.techniciens = payload.length;
      }
    }

    if (errors.length > 0) {
      return { 
        success: false, 
        message: `Erreurs lors de l'injection : ${errors.join(', ')}. Vérifiez que les tables ont été créées via le script SQL.`,
        results 
      };
    }

    const totalInserted = Object.values(results).reduce((a, b) => a + b, 0);
    return {
      success: true,
      message: totalInserted > 0 
        ? `Données initiales injectées avec succès (${totalInserted} enregistrements insérés dans Supabase) !`
        : `Les tables Supabase contiennent déjà des données. Aucune écrasement nécessaire.`,
      results
    };
  } catch (err) {
    return { success: false, message: `Erreur inattendue : ${err.message}` };
  }
};

