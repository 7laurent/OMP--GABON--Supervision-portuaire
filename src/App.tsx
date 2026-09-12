import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import LoginPage from './pages/LoginPage.jsx';

// Pages / Vues
import DashboardPage from './pages/DashboardPage.jsx';
import GlobalKpiDashboardPage from './pages/GlobalKpiDashboardPage.jsx';
import EquipementsPage from './pages/EquipementsPage.jsx';
import PannesPage from './pages/PannesPage.jsx';
import WorkOrdersPage from './pages/WorkOrdersPage.jsx';
import PiecesPage from './pages/PiecesPage.jsx';
import TechniciensPage from './pages/TechniciensPage.jsx';
import PreventivePlanPage from './pages/PreventivePlanPage.jsx';
import HistoriquePage from './pages/HistoriquePage.jsx';
import CalculKpisPage from './pages/CalculKpisPage.jsx';
import ParametresPage from './pages/ParametresPage.jsx';
import UsersPage from './pages/UsersPage.jsx';

// Modals
import AddEquipmentModal from './components/modals/AddEquipmentModal.jsx';
import AddPanneModal from './components/modals/AddPanneModal.jsx';
import AddWorkOrderModal from './components/modals/AddWorkOrderModal.jsx';
import AddPartModal from './components/modals/AddPartModal.jsx';
import AddTechnicianModal from './components/modals/AddTechnicianModal.jsx';
import DocumentModal from './components/modals/DocumentModal.jsx';
import ZoomModal from './components/modals/ZoomModal.jsx';
import NotificationDetailModal from './components/modals/NotificationDetailModal.jsx';

// Client Supabase réel
import {
  fetchAllData,
  createEquipment,
  deleteEquipment,
  createPanne,
  resolvePanne,
  deletePanne,
  createWorkOrder,
  completeWorkOrder,
  deleteWorkOrder,
  createSparePart,
  deleteSparePart,
  createTechnician,
  deleteTechnician,
  deletePreventivePlan,
  resetAllData,
  isSupabaseConfigured,
  subscribeToRealtimeChanges,
  fetchUsers,
  updateUserRole,
  updateUserActive,
  markRowReviewed
} from './supabase/supabaseClient.js';
import { CheckCircle2, Info } from 'lucide-react';

const REALTIME_TABLES = ['equipment', 'work_order', 'wo_technician', 'failure', 'technician', 'spare_part', 'preventive_plan'];

function AppContent() {
  const { isDarkMode } = useTheme();
  const { isAuthenticated, loading: authLoading, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Données de l'application (chargées depuis Supabase, aucune donnée fictive)
  const [equipments, setEquipments] = useState([]);
  const [pannes, setPannes] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [parts, setParts] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [preventivePlans, setPreventivePlans] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Modals d'action
  const [isAddEquipmentOpen, setIsAddEquipmentOpen] = useState(false);
  const [isAddPanneOpen, setIsAddPanneOpen] = useState(false);
  const [isAddWorkOrderOpen, setIsAddWorkOrderOpen] = useState(false);
  const [isAddPartOpen, setIsAddPartOpen] = useState(false);
  const [isAddTechnicianOpen, setIsAddTechnicianOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  // Notifications (incohérences d'import persistées + pannes critiques dérivées en direct)
  const [importNotifications, setImportNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAllData = useCallback(async () => {
    try {
      const data = await fetchAllData();
      setEquipments(data.equipments);
      setTechnicians(data.technicians);
      setWorkOrders(data.workOrders);
      setPannes(data.pannes);
      setParts(data.spareParts);
      setPreventivePlans(data.preventivePlans);
      return true;
    } catch (err) {
      console.warn('Erreur synchronisation des données Supabase:', err);
      return false;
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    setIsLoadingData(true);
    loadAllData();

    // Synchronisation en temps réel : tout changement distant recharge l'état local
    const unsubscribe = subscribeToRealtimeChanges(REALTIME_TABLES, () => {
      loadAllData();
    });
    return unsubscribe;
  }, [isAuthenticated, loadAllData]);

  const loadUsers = useCallback(async () => {
    const data = await fetchUsers();
    setUsers(data);
  }, []);

  useEffect(() => {
    if (isAuthenticated && isAdmin) loadUsers();
  }, [isAuthenticated, isAdmin, loadUsers]);

  const handleUpdateUserRole = async (userId, role) => {
    try {
      await updateUserRole(userId, role);
      await loadUsers();
      showToast(`Rôle mis à jour : ${role}.`);
    } catch (err) {
      showToast(`Erreur : ${err.message}`);
    }
  };

  const handleUpdateUserActive = async (userId, active) => {
    try {
      await updateUserActive(userId, active);
      await loadUsers();
    } catch (err) {
      showToast(`Erreur : ${err.message}`);
    }
  };

  // Gestionnaires d'ajout et de persistance (écrivent réellement dans Supabase)
  const handleAddEquipment = async (newEq) => {
    try {
      await createEquipment(newEq);
      await loadAllData();
      showToast(`Équipement ${newEq.code} (${newEq.name}) ajouté avec succès.`);
    } catch (err) {
      showToast(`Erreur lors de l'ajout : ${err.message}`);
    }
  };

  const handleDeleteEquipment = async (equipmentId, label) => {
    if (!window.confirm(`Supprimer définitivement l'équipement "${label}" et toutes ses données liées ?`)) return;
    try {
      await deleteEquipment(equipmentId);
      await loadAllData();
      showToast(`Équipement "${label}" supprimé.`);
    } catch (err) {
      showToast(`Suppression impossible : ${err.message}`);
    }
  };

  const handleAddPanne = async (newPanne) => {
    try {
      const eq = equipments.find((e) => e.name === newPanne.equipment);
      await createPanne(newPanne, eq ? eq.id : null);
      await loadAllData();
      showToast(`Défaillance déclarée pour ${newPanne.equipment}.`);
    } catch (err) {
      showToast(`Erreur lors de la déclaration : ${err.message}`);
    }
  };

  const handleResolvePanne = async (panneId) => {
    const panne = pannes.find((p) => p.id === panneId);
    if (!panne) return;
    try {
      await resolvePanne(panne._workOrderId);
      await loadAllData();
      showToast(`Panne ${panneId} marquée comme résolue.`);
    } catch (err) {
      showToast(`Erreur : ${err.message}`);
    }
  };

  const handleDeletePanne = async (panneId) => {
    const panne = pannes.find((p) => p.id === panneId);
    if (!panne) return;
    if (!window.confirm(`Supprimer définitivement la panne ${panneId} ?`)) return;
    try {
      await deletePanne(panne._failureId);
      await loadAllData();
      showToast(`Panne ${panneId} supprimée.`);
    } catch (err) {
      showToast(`Suppression impossible : ${err.message}`);
    }
  };

  const handleAddWorkOrder = async (newWo) => {
    try {
      const eq = equipments.find((e) => e.name === newWo.equipment);
      const tech = technicians.find((t) => t.name === newWo.technician);
      await createWorkOrder(newWo, eq ? eq.id : null, tech ? tech.id : null);
      await loadAllData();
      showToast(`Work Order émis et affecté à ${newWo.technician}.`);
    } catch (err) {
      showToast(`Erreur lors de l'émission : ${err.message}`);
    }
  };

  const handleCompleteWorkOrder = async (woId) => {
    const wo = workOrders.find((w) => w.id === woId);
    if (!wo) return;
    try {
      await completeWorkOrder(wo._id);
      await loadAllData();
      showToast(`Work Order ${woId} clôturé.`);
    } catch (err) {
      showToast(`Erreur : ${err.message}`);
    }
  };

  const handleDeleteWorkOrder = async (woId) => {
    const wo = workOrders.find((w) => w.id === woId);
    if (!wo) return;
    if (!window.confirm(`Supprimer définitivement le Work Order ${woId} ?`)) return;
    try {
      await deleteWorkOrder(wo._id);
      await loadAllData();
      showToast(`Work Order ${woId} supprimé.`);
    } catch (err) {
      showToast(`Suppression impossible : ${err.message}`);
    }
  };

  const handleAddPart = async (newPart) => {
    try {
      await createSparePart(newPart);
      await loadAllData();
      showToast(`Pièce ${newPart.reference} enregistrée en magasin.`);
    } catch (err) {
      showToast(`Erreur lors de l'ajout : ${err.message}`);
    }
  };

  const handleDeletePart = async (partId, label) => {
    if (!window.confirm(`Supprimer définitivement la pièce "${label}" ?`)) return;
    try {
      await deleteSparePart(partId);
      await loadAllData();
      showToast(`Pièce "${label}" supprimée.`);
    } catch (err) {
      showToast(`Suppression impossible : ${err.message}`);
    }
  };

  const handleAddTechnician = async (newTech) => {
    try {
      await createTechnician(newTech);
      await loadAllData();
      showToast(`Technicien ${newTech.name} enregistré.`);
    } catch (err) {
      showToast(`Erreur lors de l'ajout : ${err.message}`);
    }
  };

  const handleDeleteTechnician = async (technicianId, label) => {
    if (!window.confirm(`Supprimer définitivement le technicien "${label}" ?`)) return;
    try {
      await deleteTechnician(technicianId);
      await loadAllData();
      showToast(`Technicien "${label}" supprimé.`);
    } catch (err) {
      showToast(`Suppression impossible : ${err.message}`);
    }
  };

  const handleDeletePreventivePlan = async (planId, label) => {
    if (!window.confirm(`Supprimer définitivement le plan "${label}" ?`)) return;
    try {
      await deletePreventivePlan(planId);
      await loadAllData();
      showToast(`Plan "${label}" supprimé.`);
    } catch (err) {
      showToast(`Suppression impossible : ${err.message}`);
    }
  };

  const handleResetAllData = async () => {
    const res = await resetAllData();
    if (res.success) {
      await loadAllData();
      showToast('Toutes les données Supabase ont été supprimées.');
    } else {
      showToast(`Échec de la réinitialisation : ${res.message}`);
    }
    return res;
  };

  const handleMarkReviewed = async (category, id) => {
    await markRowReviewed(category, id);
    await loadAllData();
    showToast('Donnée confirmée — incluse dans les calculs de KPI.');
  };

  const isSupabaseActive = isSupabaseConfigured();

  // Notifications affichées dans la cloche : pannes critiques en cours (dérivées en direct)
  // + incohérences d'import détectées durant cette session, les plus récentes en premier.
  const criticalPanneNotifications = pannes
    .filter((p) => p.severity === 'Critique' && p.status !== 'Résolue')
    .map((p) => ({
      id: `panne-${p.id}`,
      type: 'panne_critique',
      category: 'pannes',
      row: p.id,
      panne: p,
      title: `Panne critique — ${p.equipment}`,
      summary: p.symptoms || p.type,
      createdAt: `${p.date || ''}T${p.time || '00:00'}:00`
    }));
  const notifications = [...importNotifications, ...criticalPanneNotifications]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#071d36', color: '#93a5c4' }}>
        Chargement de la session…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="layout" id="omp-main-layout">
      {toastMessage && (
        <div
          style={{
            position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
            backgroundColor: 'var(--dark-blue)', color: '#ffffff', border: '1px solid var(--orange)',
            borderRadius: '8px', padding: '12px 18px', boxShadow: 'var(--shadow-lg)',
            display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 600,
            animation: 'fadeIn 0.25s ease-out', maxWidth: '420px'
          }}
        >
          <CheckCircle2 size={18} color="var(--green)" />
          <span>{toastMessage}</span>
        </div>
      )}

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pannesCount={pannes.filter((p) => p.status === 'En cours').length}
        workOrdersCount={workOrders.filter((w) => w.status === 'En cours').length}
        isSupabaseActive={isSupabaseActive}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      <main className={`main main-wrapper ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Topbar
          activeTab={activeTab}
          notifications={notifications}
          onSelectNotification={(n) => setSelectedNotification(n)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {activeTab === 'dashboard' && (
          <DashboardPage
            equipments={equipments}
            pannes={pannes}
            workOrders={workOrders}
            technicians={technicians}
            onNavigate={setActiveTab}
            onOpenDocumentModal={() => setIsDocumentModalOpen(true)}
            onOpenZoomModal={() => setIsZoomModalOpen(true)}
          />
        )}

        {activeTab === 'bilan_global' && (
          <GlobalKpiDashboardPage
            equipments={equipments}
            pannes={pannes}
            workOrders={workOrders}
            technicians={technicians}
            parts={parts}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'equipements' && (
          <EquipementsPage
            equipments={equipments}
            pannes={pannes}
            workOrders={workOrders}
            onAddEquipment={handleAddEquipment}
            onDeleteEquipment={handleDeleteEquipment}
            onOpenAddModal={() => setIsAddEquipmentOpen(true)}
          />
        )}

        {activeTab === 'pannes' && (
          <PannesPage
            pannes={pannes}
            equipments={equipments}
            workOrders={workOrders}
            onOpenAddModal={() => setIsAddPanneOpen(true)}
            onResolvePanne={handleResolvePanne}
            onDeletePanne={handleDeletePanne}
          />
        )}

        {activeTab === 'work_orders' && (
          <WorkOrdersPage
            workOrders={workOrders}
            onOpenAddModal={() => setIsAddWorkOrderOpen(true)}
            onNavigate={setActiveTab}
            onCompleteWorkOrder={handleCompleteWorkOrder}
            onDeleteWorkOrder={handleDeleteWorkOrder}
          />
        )}

        {activeTab === 'pieces' && (
          <PiecesPage
            parts={parts}
            onOpenAddModal={() => setIsAddPartOpen(true)}
            onDeletePart={handleDeletePart}
          />
        )}

        {activeTab === 'techniciens' && (
          <TechniciensPage
            technicians={technicians}
            onOpenAddModal={() => setIsAddTechnicianOpen(true)}
            onDeleteTechnician={handleDeleteTechnician}
          />
        )}

        {activeTab === 'preventive_plan' && (
          <PreventivePlanPage
            equipments={equipments}
            workOrders={workOrders}
          />
        )}

        {activeTab === 'historique' && (
          <HistoriquePage
            workOrders={workOrders}
            pannes={pannes}
          />
        )}

        {activeTab === 'calcul_kpis' && (
          <CalculKpisPage
            equipments={equipments}
            pannes={pannes}
            workOrders={workOrders}
          />
        )}

        {activeTab === 'parametres' && (
          <ParametresPage
            onResetAllData={handleResetAllData}
            onReloadData={async () => {
              const ok = await loadAllData();
              if (ok) showToast('Données rafraîchies depuis Supabase.');
            }}
            equipments={equipments}
            pannes={pannes}
            workOrders={workOrders}
            parts={parts}
            technicians={technicians}
            showToast={showToast}
          />
        )}

        {activeTab === 'utilisateurs' && (
          <UsersPage
            users={users}
            onUpdateRole={handleUpdateUserRole}
            onUpdateActive={handleUpdateUserActive}
            onReloadUsers={loadUsers}
          />
        )}
      </main>

      {isAddEquipmentOpen && (
        <AddEquipmentModal onClose={() => setIsAddEquipmentOpen(false)} onSave={handleAddEquipment} />
      )}

      {isAddPanneOpen && (
        <AddPanneModal equipments={equipments} onClose={() => setIsAddPanneOpen(false)} onSave={handleAddPanne} />
      )}

      {isAddWorkOrderOpen && (
        <AddWorkOrderModal
          equipments={equipments}
          technicians={technicians}
          onClose={() => setIsAddWorkOrderOpen(false)}
          onSave={handleAddWorkOrder}
        />
      )}

      {isAddPartOpen && (
        <AddPartModal onClose={() => setIsAddPartOpen(false)} onSave={handleAddPart} />
      )}

      {isAddTechnicianOpen && (
        <AddTechnicianModal onClose={() => setIsAddTechnicianOpen(false)} onSave={handleAddTechnician} />
      )}

      {isDocumentModalOpen && (
        <DocumentModal
          onClose={() => setIsDocumentModalOpen(false)}
          equipments={equipments}
          technicians={technicians}
          parts={parts}
          onImportComplete={async (report) => {
            await loadAllData();
            const categories = ['equipements', 'techniciens', 'pieces', 'workorders', 'pannes'];
            const stats = categories.map((cat) => report[cat]).filter(Boolean);
            const totalCreated = stats.reduce((s, v) => s + v.created, 0);
            const totalWarnings = stats.reduce((s, v) => s + (v.warnings ? v.warnings.length : 0), 0);

            const newNotifications = [];
            categories.forEach((cat) => {
              (report[cat]?.warnings || []).forEach((w) => {
                newNotifications.push({
                  id: `import-${cat}-${w.row}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                  type: 'incoherence',
                  category: cat,
                  row: w.row,
                  issues: w.issues,
                  title: `Incohérence import — ${w.row}`,
                  summary: w.issues.map((i) => (typeof i === 'string' ? i : i.message)).join(' ; '),
                  createdAt: new Date().toISOString()
                });
              });
            });
            if (newNotifications.length) {
              setImportNotifications((prev) => [...newNotifications, ...prev].slice(0, 100));
            }

            showToast(
              totalWarnings > 0
                ? `Import terminé : ${totalCreated} enregistrement(s) créé(s), ${totalWarnings} incohérence(s) détectée(s) (voir la cloche de notifications).`
                : `Import terminé : ${totalCreated} nouvel(le)s enregistrement(s) créé(s).`
            );
          }}
        />
      )}

      {isZoomModalOpen && (
        <ZoomModal onClose={() => setIsZoomModalOpen(false)} />
      )}

      {selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          data={{ equipments, technicians, parts, workOrders, pannes }}
          onNavigate={setActiveTab}
          onMarkReviewed={handleMarkReviewed}
          onClose={() => setSelectedNotification(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
