import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '../supabase/supabaseClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  /**
   * Charge le profil public.users lié à ce compte Auth, et le CRÉE s'il n'existe pas
   * encore (auto-réparation : couvre la connexion, l'inscription, la confirmation
   * d'email et le rafraîchissement de session — tous les chemins qui établissent une
   * session valide). Le tout premier compte du projet devient automatiquement ADMIN ;
   * tous les suivants sont USER par défaut (promotion possible ensuite par un ADMIN).
   */
  const loadProfile = useCallback(async (authUser) => {
    const client = getSupabaseClient();
    if (!client || !authUser) { setProfile(null); return; }
    setProfileLoading(true);
    try {
      let { data } = await client
        .from('users')
        .select('user_id, role, username, email, auth_uid')
        .eq('auth_uid', authUser.id)
        .maybeSingle();

      if (!data) {
        // Ligne existante non encore liée (ex: créée manuellement par email) ?
        const { data: byEmail } = await client
          .from('users')
          .select('user_id, role, username, email, auth_uid')
          .eq('email', authUser.email)
          .is('auth_uid', null)
          .maybeSingle();

        if (byEmail) {
          await client.from('users').update({
            auth_uid: authUser.id,
            last_login: new Date().toISOString()
          }).eq('user_id', byEmail.user_id);
          data = byEmail;
        } else {
          // Aucune auto-promotion : tout nouveau compte est TECHNICIAN par défaut.
          // Le premier ADMIN est désigné manuellement depuis Supabase (SQL/Table Editor) ;
          // les ADMIN suivants sont ensuite choisis depuis l'app par un ADMIN existant
          // (page "Utilisateurs & Rôles"). Rôles valides : ADMIN, TECHNICIAN, VIEWER.
          const { data: created } = await client
            .from('users')
            .insert([{
              username: authUser.email.split('@')[0],
              email: authUser.email,
              auth_uid: authUser.id,
              role: 'TECHNICIAN',
              active: true,
              last_login: new Date().toISOString()
            }])
            .select('user_id, role, username, email, auth_uid')
            .single();
          data = created;
        }
      } else {
        await client.from('users').update({ last_login: new Date().toISOString() }).eq('user_id', data.user_id);
      }

      setProfile(data || null);
    } catch (e) {
      console.warn('Synchronisation du profil utilisateur impossible :', e.message);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) {
      setLoading(false);
      return;
    }

    client.auth.getSession().then(({ data }) => {
      setSession(data.session || null);
      if (data.session?.user) loadProfile(data.session.user);
      setLoading(false);
    });

    const { data: listener } = client.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) loadProfile(newSession.user);
      else setProfile(null);
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = async (email, password) => {
    const client = getSupabaseClient();
    if (!client) return { success: false, message: 'Supabase non configuré.' };
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) return { success: false, message: error.message };
    await loadProfile(data.user);
    return { success: true };
  };

  const signUp = async (email, password) => {
    const client = getSupabaseClient();
    if (!client) return { success: false, message: 'Supabase non configuré.' };
    const { data, error } = await client.auth.signUp({ email, password });
    if (error) return { success: false, message: error.message };
    if (data.session && data.user) await loadProfile(data.user);
    if (!data.session) {
      return { success: true, needsConfirmation: true, message: 'Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse avant de vous connecter.' };
    }
    return { success: true };
  };

  const signOut = async () => {
    const client = getSupabaseClient();
    if (!client) return;
    await client.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  const isAdmin = profile?.role === 'ADMIN';

  const value = {
    session,
    user: session?.user || null,
    isAuthenticated: !!session,
    loading,
    profile,
    profileLoading,
    role: profile?.role || null,
    isAdmin,
    supabaseConfigured: isSupabaseConfigured(),
    signIn,
    signUp,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé à l’intérieur de <AuthProvider>');
  return ctx;
}
