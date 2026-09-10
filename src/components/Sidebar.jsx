import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  AlertTriangle, 
  ClipboardList, 
  Settings, 
  Wrench, 
  Package, 
  Users, 
  Calendar, 
  History, 
  Calculator, 
  Moon, 
  Sun,
  Home,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  pannesCount, 
  workOrdersCount, 
  isSupabaseActive,
  isCollapsed = false,
  setIsCollapsed
}) {
  const { isDarkMode, toggleDarkMode } = useTheme();

  const menuItems = [
    { id: 'accueil', label: 'Accueil', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bilan_global', label: 'Bilan Global KPIs', icon: BarChart3, badge: 'Nouveau' },
    { id: 'pannes', label: 'Pannes', icon: AlertTriangle, count: pannesCount },
    { id: 'work_orders', label: 'Work Orders', icon: ClipboardList, count: workOrdersCount },
    { id: 'equipements', label: 'Équipements', icon: Wrench },
    { id: 'pieces', label: 'Pièces', icon: Package },
    { id: 'techniciens', label: 'Techniciens', icon: Users },
    { id: 'preventive_plan', label: 'Preventive plan', icon: Calendar },
    { id: 'historique', label: 'Historique', icon: History },
    { id: 'calcul_kpis', label: 'Calcul des KPI', icon: Calculator },
    { id: 'parametres', label: 'Paramètres', icon: Settings },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} id="main-sidebar">
      <div>
        <div className="sidebar-header" style={{ position: 'relative' }}>
          <div className="logo-container" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
            <div className="omp-logo-badge">OMP</div>
            {!isCollapsed && (
              <div className="logo-text">
                <div className="logo-title">OMP</div>
                <div className="logo-subtitle">MAINTENANCE GABON</div>
              </div>
            )}
          </div>

          {/* Bouton de repliement rapide */}
          {setIsCollapsed && (
            <button
              type="button"
              id="btn-sidebar-collapse-toggle"
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? "Déplier la barre latérale" : "Réduire la barre latérale pour libérer de l'espace"}
              style={{
                position: isCollapsed ? 'static' : 'absolute',
                right: '12px',
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: '#ffffff',
                borderRadius: '6px',
                width: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s',
                marginTop: isCollapsed ? '8px' : '0'
              }}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}
        </div>

        <ul className="sidebar-menu">
          {!isCollapsed && <div className="sidebar-section-title">Navigation Principale</div>}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  id={`nav-${item.id}`}
                  className={isActive ? 'active' : ''}
                  onClick={() => setActiveTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon size={18} />
                  {!isCollapsed && <span className="menu-text">{item.label}</span>}
                  {!isCollapsed && item.badge && <span className="menu-badge">{item.badge}</span>}
                  {!isCollapsed && item.count !== undefined && item.count > 0 && (
                    <span className="menu-badge">{item.count}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="sidebar-bottom">
        {/* Bouton Mode Sombre Bleu Nuit */}
        <button 
          type="button" 
          id="btn-toggle-dark-mode" 
          className="theme-toggle-btn"
          onClick={toggleDarkMode}
          title={isDarkMode ? "Basculer en Mode Clair" : "Basculer en Mode Bleu Nuit"}
        >
          {isDarkMode ? (
            <>
              <Sun size={16} color="#f58220" />
              {!isCollapsed && <span>Mode Clair</span>}
            </>
          ) : (
            <>
              <Moon size={16} color="#60a5fa" />
              {!isCollapsed && <span>Mode Bleu Nuit</span>}
            </>
          )}
        </button>

        {/* État Système & Supabase */}
        {!isCollapsed && (
          <div className="system-status">
            <div className="status-indicator">
              <div className="status-dot" style={{ backgroundColor: isSupabaseActive ? '#42bd67' : '#f58220' }} />
              <span>{isSupabaseActive ? 'Supabase Connecté' : 'Système Opérationnel'}</span>
            </div>
            <div className="status-text">
              {isSupabaseActive ? 'Sync base temps réel active' : 'Mode Local Persistant'}
            </div>
          </div>
        )}

        <button 
          type="button" 
          className="back-home"
          onClick={() => setActiveTab('accueil')}
          id="btn-back-home"
          title={isCollapsed ? "Retour à l'accueil" : undefined}
        >
          <Home size={14} />
          {!isCollapsed && <span>← Retour à l'accueil</span>}
        </button>
      </div>
    </aside>
  );
}
