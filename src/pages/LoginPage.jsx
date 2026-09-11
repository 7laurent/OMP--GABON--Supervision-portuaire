import React, { useState } from 'react';
import { LogIn, UserPlus, Mail, Lock, ShieldCheck, AlertCircle, CheckCircle2, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { getStoredSupabaseConfig } from '../supabase/supabaseClient.js';

export default function LoginPage() {
  const { signIn, signUp, supabaseConfigured } = useAuth();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const { url } = getStoredSupabaseConfig();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    setFeedback(null);

    const result = mode === 'signin' ? await signIn(email, password) : await signUp(email, password);

    if (!result.success) {
      setFeedback({ type: 'error', message: result.message });
    } else if (result.needsConfirmation) {
      setFeedback({ type: 'info', message: result.message });
    }
    setIsSubmitting(false);
  };

  return (
    <div
      id="login-page-container"
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #071d36 0%, #0c2b4c 55%, #173256 100%)',
        padding: '24px'
      }}
    >
      <div
        className="industrial-card"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '36px 32px',
          background: '#0b1b33',
          border: '1px solid #1a3a66',
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <div className="omp-logo-badge" style={{ width: '56px', height: '56px', fontSize: '18px', marginBottom: '14px' }}>
            OMP
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', textAlign: 'center' }}>
            OMP Maintenance Gabon
          </div>
          <div style={{ fontSize: '12px', color: '#93a5c4', marginTop: '4px', textAlign: 'center' }}>
            Connexion sécurisée à la base de supervision portuaire
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            background: '#0d223f',
            border: '1px solid #1a3a66',
            borderRadius: '8px',
            padding: '4px',
            marginBottom: '22px'
          }}
        >
          {[
            { id: 'signin', label: 'Se connecter', icon: LogIn },
            { id: 'signup', label: 'Créer un compte', icon: UserPlus }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = mode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                id={`login-tab-${tab.id}`}
                onClick={() => { setMode(tab.id); setFeedback(null); }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: active ? 'var(--orange)' : 'transparent',
                  color: active ? '#ffffff' : '#93a5c4'
                }}
              >
                <Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>

        {!supabaseConfigured && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px',
            background: 'rgba(239,71,111,0.12)', border: '1px solid var(--red)', borderRadius: '8px',
            color: 'var(--red)', fontSize: '12px', marginBottom: '18px'
          }}>
            <AlertCircle size={16} />
            Supabase n'est pas configuré. Renseignez l'URL et la clé dans Paramètres.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={13} color="var(--orange)" /> Adresse email
            </label>
            <input
              type="email"
              required
              className="form-control"
              placeholder="vous@omp.ga"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="login-email-input"
              autoComplete="email"
            />
          </div>

          <div className="form-group" style={{ marginTop: '14px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={13} color="var(--orange)" /> Mot de passe
            </label>
            <input
              type="password"
              required
              minLength={6}
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="login-password-input"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </div>

          {feedback && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 14px', borderRadius: '8px',
              marginTop: '16px', fontSize: '12px', lineHeight: 1.5,
              background: feedback.type === 'error' ? 'rgba(239,71,111,0.12)' : 'rgba(66,189,103,0.12)',
              border: `1px solid ${feedback.type === 'error' ? 'var(--red)' : 'var(--green)'}`,
              color: feedback.type === 'error' ? 'var(--red)' : 'var(--green)'
            }}>
              {feedback.type === 'error' ? <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} /> : <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: '1px' }} />}
              <span>{feedback.message}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting || !supabaseConfigured}
            id="btn-login-submit"
            style={{ width: '100%', justifyContent: 'center', marginTop: '20px', padding: '12px' }}
          >
            {mode === 'signin' ? <LogIn size={16} /> : <UserPlus size={16} />}
            {isSubmitting ? 'Connexion en cours...' : mode === 'signin' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>

        <div style={{
          marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #1a3a66',
          display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', color: '#6f83a8'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={13} /> Authentification Supabase Auth (session chiffrée)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Database size={13} /> Projet : <code style={{ color: '#93a5c4' }}>{url || 'non configuré'}</code>
          </div>
        </div>
      </div>
    </div>
  );
}
