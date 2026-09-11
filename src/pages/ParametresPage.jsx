import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Database, 
  Moon, 
  Sun, 
  ShieldCheck, 
  Bell, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  Globe,
  Key,
  Code2,
  Trash2,
  Server
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  isSupabaseConfigured,
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  testCustomSupabaseConnection
} from '../supabase/supabaseClient.js';

const SUPABASE_SCHEMA_SQL = `-- ====================================================================
-- OMP GABON - SCRIPT DE MISE À NIVEAU DU SCHÉMA RÉEL (SUPABASE)
-- À exécuter UNE FOIS dans : Supabase Dashboard > SQL Editor > New Query > Run
-- Ce script est additif et ré-exécutable sans danger (IF NOT EXISTS partout).
-- Il complète votre schéma existant (equipment, technician, work_order,
-- wo_technician, failure, spare_part, preventive_plan, users) avec les
-- colonnes utilisées par l'application et active le Temps Réel + les droits.
-- ====================================================================

-- 1. Colonnes complémentaires (aucune donnée existante n'est modifiée)
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS criticality TEXT DEFAULT 'Standard';
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT false;

ALTER TABLE public.spare_part ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.spare_part ADD COLUMN IF NOT EXISTS stock INT DEFAULT 0;
ALTER TABLE public.spare_part ADD COLUMN IF NOT EXISTS min_stock INT DEFAULT 0;
ALTER TABLE public.spare_part ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.spare_part ADD COLUMN IF NOT EXISTS supplier TEXT;
ALTER TABLE public.spare_part ADD COLUMN IF NOT EXISTS unit_price NUMERIC DEFAULT 0;
ALTER TABLE public.spare_part ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT false;

ALTER TABLE public.technician ADD COLUMN IF NOT EXISTS experience_years INT;
ALTER TABLE public.technician ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.technician ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.technician ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT false;

ALTER TABLE public.work_order ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT false;
ALTER TABLE public.failure ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT false;

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_uid UUID UNIQUE;

-- 2. Fonction utilitaire : l'utilisateur connecté est-il ADMIN ?
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE auth_uid = auth.uid() AND role = 'ADMIN');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 3. Row Level Security : lecture ouverte à tous les connectés,
--    création/modification/suppression réservées aux ADMIN
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wo_technician ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.failure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spare_part ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preventive_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['equipment','technician','work_order','wo_technician','failure','spare_part','preventive_plan']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "omp_auth_full_access" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "omp_read_all" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "omp_write_admin" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "omp_update_admin" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "omp_delete_admin" ON public.%I', t);
    EXECUTE format('CREATE POLICY "omp_read_all" ON public.%I FOR SELECT TO authenticated USING (true)', t);
    EXECUTE format('CREATE POLICY "omp_write_admin" ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_admin())', t);
    EXECUTE format('CREATE POLICY "omp_update_admin" ON public.%I FOR UPDATE TO authenticated USING (public.is_admin())', t);
    EXECUTE format('CREATE POLICY "omp_delete_admin" ON public.%I FOR DELETE TO authenticated USING (public.is_admin())', t);
  END LOOP;
END $$;

-- La table users a ses propres règles : chacun peut lire, créer et mettre à jour SON PROFIL,
-- un ADMIN peut tout gérer. Le déclencheur ci-dessous empêche qu'un non-admin s'auto-promeuve.
DROP POLICY IF EXISTS "omp_auth_full_access" ON public.users;
DROP POLICY IF EXISTS "omp_users_read" ON public.users;
DROP POLICY IF EXISTS "omp_users_insert_own" ON public.users;
DROP POLICY IF EXISTS "omp_users_update" ON public.users;
DROP POLICY IF EXISTS "omp_users_delete_admin" ON public.users;

CREATE POLICY "omp_users_read" ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "omp_users_insert_own" ON public.users FOR INSERT TO authenticated
  WITH CHECK (auth_uid = auth.uid());
CREATE POLICY "omp_users_update" ON public.users FOR UPDATE TO authenticated
  USING (auth_uid = auth.uid() OR public.is_admin());
CREATE POLICY "omp_users_delete_admin" ON public.users FOR DELETE TO authenticated
  USING (public.is_admin());

-- Filet de sécurité : même si une politique laisse passer une mise à jour,
-- un utilisateur non-admin ne peut jamais changer son propre rôle.
CREATE OR REPLACE FUNCTION public.prevent_self_role_escalation() RETURNS trigger AS $$
BEGIN
  IF NOT public.is_admin() AND NEW.role IS DISTINCT FROM OLD.role THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.users;
CREATE TRIGGER trg_prevent_role_escalation BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.prevent_self_role_escalation();

-- 4. Activation du Temps Réel (Realtime) sur les tables métier
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE
    public.equipment, public.technician, public.work_order,
    public.wo_technician, public.failure, public.spare_part, public.preventive_plan;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
`;

export default function ParametresPage({
  onResetAllData,
  onReloadData,
  equipments = [],
  pannes = [],
  workOrders = [],
  parts = [],
  technicians = [],
  showToast
}) {
  const { isDarkMode, toggleTheme } = useTheme();
  const { isAdmin } = useAuth();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [criticalThreshold, setCriticalThreshold] = useState(90);
  const [emailAlerts, setEmailAlerts] = useState('maintenance-direction@omp.ga');

  // Configuration Supabase
  const currentConfig = getStoredSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url || '');
  const [supabaseKey, setSupabaseKey] = useState(currentConfig.key || '');
  const [showKey, setShowKey] = useState(false);
  const [isConfigured, setIsConfigured] = useState(isSupabaseConfigured());

  // Tests et synchronisations
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');

  // Script SQL
  const [showSqlBlock, setShowSqlBlock] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  const handleGeneralSave = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Tester la connexion Supabase
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testCustomSupabaseConnection(supabaseUrl, supabaseKey);
      setTestResult(res);
    } catch (err) {
      setTestResult({ success: false, message: `Erreur : ${err.message}` });
    } finally {
      setIsTesting(false);
    }
  };

  // Enregistrer la configuration Supabase
  const handleSaveSupabase = async () => {
    if (!supabaseUrl || !supabaseKey) {
      alert('Veuillez remplir l\'URL et la Clé Publique (Anon) avant d\'enregistrer.');
      return;
    }

    setIsSaving(true);
    try {
      const configured = saveSupabaseConfig(supabaseUrl.trim(), supabaseKey.trim());
      setIsConfigured(configured);
      
      // Test de vérification
      const test = await testCustomSupabaseConnection(supabaseUrl.trim(), supabaseKey.trim());
      setTestResult(test);

      if (onReloadData) {
        await onReloadData();
      }

      if (showToast) {
        showToast('Configuration Supabase enregistrée avec succès !');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  // Déconnecter / Supprimer la configuration Supabase
  const handleDisconnectSupabase = () => {
    if (window.confirm('Voulez-vous déconnecter Supabase et repasser en mode de stockage local (LocalStorage) ?')) {
      clearSupabaseConfig();
      setSupabaseUrl('');
      setSupabaseKey('');
      setIsConfigured(false);
      setTestResult(null);
      if (showToast) {
        showToast('Supabase déconnecté. Mode LocalStorage réactivé.');
      }
    }
  };

  // Réinitialisation totale : supprime réellement toutes les données Supabase
  const handleResetAll = async () => {
    if (resetConfirmText.trim().toUpperCase() !== 'SUPPRIMER') return;
    if (!window.confirm('Dernière confirmation : TOUTES les données (équipements, pannes, work orders, pièces, techniciens, plans) seront supprimées définitivement de Supabase. Continuer ?')) {
      return;
    }
    setIsResetting(true);
    try {
      if (onResetAllData) {
        await onResetAllData();
      }
      setResetConfirmText('');
    } finally {
      setIsResetting(false);
    }
  };

  // Copier le script SQL
  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2500);
  };

  return (
    <div className="content" id="parametres-page-content">
      {/* En-tête de la page */}
      <div className="section-heading" style={{ marginBottom: '28px' }}>
        <div>
          <div className="section-label">CONFIGURATION SYSTÈME &amp; PERSISTANCE</div>
          <div className="section-title" style={{ fontSize: '28px', marginTop: '4px' }}>
            Paramètres &amp; Connexion Supabase
          </div>
          <p style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '4px' }}>
            Gérez la connexion à votre base distante Supabase, les seuils critiques AFNOR et l'affichage de la supervision portuaire.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div style={{
          padding: '14px 20px',
          background: 'rgba(66,189,103,0.15)',
          border: '1px solid var(--green)',
          borderRadius: '8px',
          color: 'var(--green)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '20px',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} />
          Paramètres enregistrés avec succès !
        </div>
      )}

      {/* BLOC PRINCIPAL: CONNEXION SUPABASE EN DIRECT (PLEINE LARGEUR) */}
      <div className="industrial-card" style={{ marginBottom: '28px' }} id="supabase-config-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(235,94,40,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(235,94,40,0.3)'
            }}>
              <Database size={22} color="var(--orange)" />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>
                Connexion Base de Données Supabase
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                Synchronisation en temps réel de la flotte, des ordres de travail et du registre des pannes
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isConfigured ? (
              <span className="status-badge status-done" style={{ padding: '6px 12px', fontSize: '12px' }}>
                <CheckCircle2 size={14} style={{ marginRight: '6px' }} />
                Supabase Connecté &amp; Actif
              </span>
            ) : (
              <span className="status-badge status-info" style={{ padding: '6px 12px', fontSize: '12px' }}>
                <Server size={14} style={{ marginRight: '6px' }} />
                Mode Local Actif (LocalStorage Fallback)
              </span>
            )}
          </div>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '20px', lineHeight: '1.6' }}>
          Renseignez votre <strong>URL de Projet</strong> et votre <strong>Clé Publique Anon</strong> ci-dessous pour connecter l'application à votre instance Supabase. 
          En l'absence de clés ou en cas de perte de réseau, l'application fonctionne sans interruption grâce au cache local persistant.
        </p>

        {/* Formulaire Supabase */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px', marginBottom: '20px' }}>
          {/* Champ URL */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={14} color="var(--orange)" />
              <span>URL du Projet Supabase</span>
            </label>
            <input 
              type="url"
              className="form-control"
              placeholder="https://votre-projet.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              id="input-supabase-url"
              style={{ fontFamily: 'monospace', fontSize: '13px' }}
            />
            <span style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', display: 'block' }}>
              Trouvable dans : <em>Supabase Dashboard &gt; Project Settings &gt; API &gt; Project URL</em>
            </span>
          </div>

          {/* Champ Clé Anon */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Key size={14} color="var(--orange)" />
              <span>Clé API Publique (Anon Key)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showKey ? 'text' : 'password'}
                className="form-control"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                id="input-supabase-key"
                style={{ fontFamily: 'monospace', fontSize: '13px', paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                title={showKey ? 'Masquer la clé' : 'Afficher la clé'}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', display: 'block' }}>
              Trouvable dans : <em>Supabase Dashboard &gt; Project Settings &gt; API &gt; Project API keys (anon / public)</em>
            </span>
          </div>
        </div>

        {/* Message de résultat du test de connexion */}
        {testResult && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            background: testResult.success ? 'rgba(66,189,103,0.12)' : 'rgba(239,71,111,0.12)',
            border: `1px solid ${testResult.success ? 'var(--green)' : 'var(--red)'}`,
            color: testResult.success ? 'var(--green)' : 'var(--red)'
          }}>
            {testResult.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <div style={{ flex: 1 }}>{testResult.message}</div>
          </div>
        )}

        {/* Barre des boutons d'actions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSaveSupabase}
            disabled={isSaving}
            id="btn-save-supabase"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <CheckCircle2 size={16} />
            {isSaving ? 'Enregistrement...' : 'Enregistrer & Connecter'}
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleTestConnection}
            disabled={isTesting || !supabaseUrl || !supabaseKey}
            id="btn-test-supabase"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={15} className={isTesting ? 'animate-spin' : ''} />
            {isTesting ? 'Vérification...' : 'Tester la connexion'}
          </button>

          {isConfigured && (
            <button
              type="button"
              className="btn-secondary"
              onClick={handleDisconnectSupabase}
              id="btn-disconnect-supabase"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--red)', borderColor: 'rgba(239,71,111,0.4)' }}
            >
              <Trash2 size={15} />
              Déconnecter Supabase
            </button>
          )}

          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowSqlBlock(!showSqlBlock)}
            id="btn-toggle-sql"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}
          >
            <Code2 size={16} />
            {showSqlBlock ? 'Masquer le script SQL' : 'Voir le script SQL des 5 tables'}
          </button>
        </div>

        {/* Accordéon Script SQL */}
        {showSqlBlock && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Script SQL à exécuter une fois dans Supabase (colonnes, droits RLS &amp; Temps Réel)
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  Copiez ce code et collez-le dans le <strong>SQL Editor</strong> de votre projet pour compléter les tables existantes <code>equipment</code>, <code>technician</code>, <code>work_order</code>, <code>failure</code>, <code>spare_part</code>, <code>preventive_plan</code> et activer la synchronisation temps réel.
                </div>
              </div>

              <button
                type="button"
                className="btn-primary"
                onClick={handleCopySql}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px' }}
              >
                {sqlCopied ? <Check size={14} /> : <Copy size={14} />}
                {sqlCopied ? 'Script copié !' : 'Copier le script SQL'}
              </button>
            </div>

            <pre style={{
              margin: 0,
              padding: '14px',
              background: 'rgba(0,0,0,0.25)',
              borderRadius: '6px',
              fontSize: '12px',
              fontFamily: 'Consolas, Monaco, monospace',
              color: 'var(--text)',
              maxHeight: '260px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              border: '1px solid var(--border)'
            }}>
              {SUPABASE_SCHEMA_SQL}
            </pre>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
        {/* CARTE 1: THÈME VISUEL & APPARENCE (Bleu Nuit) */}
        <div className="industrial-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Moon size={20} color="var(--orange)" />
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>
              Apparence &amp; Thème Visuel
            </div>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px', lineHeight: '1.5' }}>
            Basculez entre le thème standard Haute Luminosité et le mode <strong>Sombre Bleu Nuit</strong> (#051326 / #0b1e38) adapté aux salles de contrôle portuaires 24/7.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: 'var(--hover-bg)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isDarkMode ? <Moon size={18} color="var(--orange)" /> : <Sun size={18} color="var(--orange)" />}
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  {isDarkMode ? 'Mode Sombre (Bleu Nuit Actif)' : 'Mode Clair (Standard)'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  {isDarkMode ? 'Palette #051326 contrastée pour la nuit' : 'Palette blanche industrielle standard'}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={toggleTheme}
              id="btn-toggle-theme-page"
            >
              {isDarkMode ? 'Basculer en Blanc' : 'Basculer en Bleu Nuit'}
            </button>
          </div>
        </div>

        {/* CARTE 3: SEUILS D'ALERTE AFNOR */}
        <div className="industrial-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Bell size={20} color="var(--orange)" />
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>
              Alertes &amp; Tolérances Critiques
            </div>
          </div>

          <form onSubmit={handleGeneralSave}>
            <div className="form-group">
              <label className="form-label">Seuil Minimal de Disponibilité (Do %)</label>
              <input 
                type="number"
                className="form-control"
                value={criticalThreshold}
                onChange={(e) => setCriticalThreshold(Number(e.target.value))}
              />
              <span style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                Déclenche une alerte rouge si le parc descend sous ce pourcentage.
              </span>
            </div>

            <div className="form-group" style={{ marginTop: '12px' }}>
              <label className="form-label">Email Notification Astreinte 24/7</label>
              <input 
                type="email"
                className="form-control"
                value={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '16px' }}>
              Enregistrer les Seuils
            </button>
          </form>
        </div>

        {/* CARTE 4: RÉINITIALISATION TOTALE DE LA BASE (destructif, irréversible) */}
        <div className="industrial-card" style={{ gridColumn: '1 / -1', borderTop: '3px solid var(--red)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <RotateCcw size={20} color="var(--red)" />
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>
              Réinitialisation Totale des Données
            </div>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--red)', marginBottom: '16px', lineHeight: '1.5', fontWeight: 600 }}>
            ⚠ Action irréversible : supprime définitivement TOUTES les données réelles de Supabase
            (équipements, techniciens, pannes, work orders, pièces, plans préventifs). Aucune sauvegarde automatique.
          </p>

          {!isAdmin ? (
            <div style={{ padding: '10px 14px', background: 'rgba(148,163,184,0.12)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--muted)', fontSize: '12px' }}>
              Réservé aux administrateurs.
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
              <input
                type="text"
                className="form-control"
                placeholder='Tapez "SUPPRIMER" pour confirmer'
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                style={{ maxWidth: '260px' }}
                id="input-reset-confirm"
              />
              <button
                type="button"
                className="btn-secondary"
                style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
                disabled={resetConfirmText.trim().toUpperCase() !== 'SUPPRIMER' || isResetting}
                onClick={handleResetAll}
                id="btn-reset-all-data"
              >
                <RotateCcw size={14} /> {isResetting ? 'Suppression en cours...' : 'Supprimer toutes les données'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
