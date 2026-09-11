import React, { useState, useRef, useEffect } from 'react';
import { Bell, Moon, Sun, PanelLeftClose, PanelLeftOpen, AlertTriangle, ShieldAlert, Inbox } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Topbar({
  activeTab,
  notifications = [],
  onSelectNotification,
  isSidebarCollapsed = false,
  onToggleSidebar
}) {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, isAdmin, profile } = useAuth();
  const initials = (profile?.username || user?.email || '??').slice(0, 2).toUpperCase();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getBreadcrumbTitle = (tab) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard Principal';
      case 'bilan_global': return 'Bilan Global KPIs (Dashboard 2)';
      case 'pannes': return 'Gestion des Pannes';
      case 'work_orders': return 'Work Orders';
      case 'equipements': return 'Parc Matériel & Équipements';
      case 'pieces': return 'Stock & Magasin';
      case 'techniciens': return 'Ressources Humaines - Techniciens';
      case 'preventive_plan': return 'Plan de Maintenance Préventive';
      case 'historique': return 'Traçabilité & Historique';
      case 'calcul_kpis': return 'Guide & Calcul des KPI (Normes AFNOR)';
      case 'utilisateurs': return 'Utilisateurs & Rôles';
      case 'parametres': return 'Paramètres & Configuration Supabase';
      default: return 'Supervision';
    }
  };

  return (
    <header className={`topbar ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`} id="app-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {onToggleSidebar && (
          <button
            type="button"
            className="notification-btn"
            onClick={onToggleSidebar}
            title={isSidebarCollapsed ? "Agrandir le menu latéral" : "Réduire le menu latéral pour maximiser l'espace d'affichage"}
            id="btn-topbar-sidebar-toggle"
            style={{ color: 'var(--text)' }}
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        )}

        <div className="breadcrumb">
          <span>OMP</span>
          <span>/</span>
          <span>Maintenance</span>
          <span>/</span>
          <span className="breadcrumb-active">{getBreadcrumbTitle(activeTab)}</span>
        </div>
      </div>

      <div className="topbar-right">
        <button
          type="button"
          className="notification-btn"
          onClick={toggleDarkMode}
          title={isDarkMode ? "Passer en mode clair" : "Passer en mode bleu nuit"}
          id="topbar-theme-toggle"
        >
          {isDarkMode ? <Sun size={18} color="#f58220" /> : <Moon size={18} color="#071d36" />}
        </button>

        {/* Notifications : bouton + panneau déroulant */}
        <div style={{ position: 'relative' }} ref={panelRef}>
          <button
            type="button"
            className="notification-btn"
            onClick={() => setIsOpen((v) => !v)}
            id="topbar-notifications"
            title="Notifications"
          >
            <Bell size={19} />
            {notifications.length > 0 && (
              <span className="notification-badge">{notifications.length}</span>
            )}
          </button>

          {isOpen && (
            <div
              id="notifications-panel"
              style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '360px', maxHeight: '440px',
                overflowY: 'auto', background: 'var(--card-bg)', border: '1px solid var(--border)',
                borderRadius: '10px', boxShadow: 'var(--shadow-lg)', zIndex: 1000
              }}
            >
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '13px', color: 'var(--text)' }}>
                Notifications ({notifications.length})
              </div>

              {notifications.length === 0 ? (
                <div style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>
                  <Inbox size={22} style={{ margin: '0 auto 8px', display: 'block' }} />
                  Aucune notification pour le moment.
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => { setIsOpen(false); onSelectNotification && onSelectNotification(n); }}
                    style={{
                      display: 'flex', gap: '10px', width: '100%', textAlign: 'left', padding: '12px 16px',
                      border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent', cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hover-bg)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    {n.type === 'incoherence'
                      ? <AlertTriangle size={16} color="var(--orange)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      : <ShieldAlert size={16} color="var(--red)" style={{ flexShrink: 0, marginTop: '2px' }} />}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)' }}>{n.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.summary}</div>
                      <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>{new Date(n.createdAt).toLocaleString('fr-FR')}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Profil de l'utilisateur connecté (réel) */}
        <div className="profile" id="user-profile" title={user?.email || ''}>
          <div className="profile-avatar">{initials}</div>
          <div className="profile-info">
            <div className="profile-name">{profile?.username || user?.email || 'Utilisateur'}</div>
            <div className="profile-role">{isAdmin ? 'Administrateur' : 'Utilisateur'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
