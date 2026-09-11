import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, User, Mail, Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function UsersPage({ users = [], onUpdateRole, onUpdateActive, onReloadUsers }) {
  const { user: currentAuthUser, isAdmin } = useAuth();
  const [busyId, setBusyId] = useState(null);

  if (!isAdmin) {
    return (
      <div className="content" id="users-page-content">
        <div className="industrial-card" style={{ textAlign: 'center', padding: '40px' }}>
          <ShieldAlert size={32} color="var(--red)" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>Accès réservé aux administrateurs</div>
        </div>
      </div>
    );
  }

  const handleRoleToggle = async (u) => {
    const newRole = u.role === 'ADMIN' ? 'TECHNICIAN' : 'ADMIN';
    if (!window.confirm(`Passer ${u.email} en rôle "${newRole}" ?`)) return;
    setBusyId(u.user_id);
    try {
      await onUpdateRole(u.user_id, newRole);
    } finally {
      setBusyId(null);
    }
  };

  const admins = users.filter((u) => u.role === 'ADMIN').length;

  return (
    <div className="content" id="users-page-content">
      <div className="section-heading" style={{ marginBottom: '28px' }}>
        <div>
          <div className="section-label">SÉCURITÉ & ACCÈS</div>
          <div className="section-title" style={{ fontSize: '28px', marginTop: '4px' }}>
            Utilisateurs & Rôles
          </div>
          <p style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '4px' }}>
            Seuls les administrateurs peuvent créer, importer ou supprimer des données. Gérez ici qui a ce droit.
          </p>
        </div>
        <button type="button" className="btn-secondary" onClick={onReloadUsers} id="btn-reload-users">
          <RefreshCw size={15} /> Rafraîchir
        </button>
      </div>

      <div className="kpi-grid" style={{ marginBottom: '30px' }}>
        <div className="kpi-card border-accent">
          <div className="kpi-top">
            <span className="kpi-title">Comptes Enregistrés</span>
            <div className="kpi-icon"><User size={18} /></div>
          </div>
          <div className="kpi-number">{users.length}</div>
        </div>
        <div className="kpi-card border-accent">
          <div className="kpi-top">
            <span className="kpi-title">Administrateurs</span>
            <div className="kpi-icon"><ShieldCheck size={18} color="var(--green)" /></div>
          </div>
          <div className="kpi-number" style={{ color: 'var(--green)' }}>{admins}</div>
        </div>
      </div>

      <section className="section">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Dernière connexion</th>
                <th>Rôle</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = currentAuthUser && u.auth_uid === currentAuthUser.id;
                return (
                  <tr key={u.user_id}>
                    <td style={{ fontWeight: 600 }}>{u.username || '—'}</td>
                    <td style={{ fontSize: '13px', color: 'var(--muted)' }}>
                      <Mail size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />{u.email}
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      <Clock size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      {u.last_login ? new Date(u.last_login).toLocaleString('fr-FR') : '—'}
                    </td>
                    <td>
                      <span className={`status-badge ${u.role === 'ADMIN' ? 'status-done' : 'status-info'}`}>
                        {u.role === 'ADMIN' ? <ShieldCheck size={12} style={{ marginRight: '4px' }} /> : null}
                        {u.role}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="action-btn-sm"
                        disabled={busyId === u.user_id || isSelf}
                        title={isSelf ? 'Vous ne pouvez pas changer votre propre rôle ici' : undefined}
                        onClick={() => handleRoleToggle(u)}
                      >
                        {busyId === u.user_id
                          ? 'Mise à jour...'
                          : u.role === 'ADMIN' ? 'Rétrograder en Technicien' : 'Promouvoir en ADMIN'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px' }}>
                    Aucun utilisateur enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
