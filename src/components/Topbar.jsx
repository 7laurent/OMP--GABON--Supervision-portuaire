import React from 'react';
import { Bell, Moon, Sun, PanelLeftClose, PanelLeftOpen, Menu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Topbar({ 
  activeTab, 
  notificationsCount = 3, 
  onOpenNotifications,
  isSidebarCollapsed = false,
  onToggleSidebar
}) {
  const { isDarkMode, toggleDarkMode } = useTheme();

  const getBreadcrumbTitle = (tab) => {
    switch (tab) {
      case 'accueil': return 'Portail Accueil & Présentation';
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
        {/* Toggle Mode Sombre Bleu Nuit */}
        <button 
          type="button"
          className="notification-btn"
          onClick={toggleDarkMode}
          title={isDarkMode ? "Passer en mode clair" : "Passer en mode bleu nuit"}
          id="topbar-theme-toggle"
        >
          {isDarkMode ? <Sun size={18} color="#f58220" /> : <Moon size={18} color="#071d36" />}
        </button>

        {/* Notifications */}
        <button 
          type="button"
          className="notification-btn" 
          onClick={onOpenNotifications}
          id="topbar-notifications"
          title="Notifications de maintenance"
        >
          <Bell size={19} />
          {notificationsCount > 0 && (
            <span className="notification-badge">{notificationsCount}</span>
          )}
        </button>

        {/* Profil Administrateur */}
        <div className="profile" id="user-profile">
          <div className="profile-avatar">AD</div>
          <div className="profile-info">
            <div className="profile-name">Administrateur OMP</div>
            <div className="profile-role">Responsable Maintenance</div>
          </div>
        </div>
      </div>
    </header>
  );
}
