import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';

// Pages / Vues
import AccueilPage from './pages/AccueilPage.jsx';
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

// Modals
import AddEquipmentModal from './components/modals/AddEquipmentModal.jsx';
import AddPanneModal from './components/modals/AddPanneModal.jsx';
import AddWorkOrderModal from './components/modals/AddWorkOrderModal.jsx';
import AddPartModal from './components/modals/AddPartModal.jsx';
import AddTechnicianModal from './components/modals/AddTechnicianModal.jsx';
import DocumentModal from './components/modals/DocumentModal.jsx';
import ZoomModal from './components/modals/ZoomModal.jsx';

// Données initiales et Client Supabase
import { 
  INITIAL_EQUIPMENTS, 
  INITIAL_PANNES, 
  INITIAL_WORK_ORDERS, 
  INITIAL_PARTS, 
  INITIAL_TECHNICIANS 
} from './data/initialData.js';
import { 
  fetchTableData, 
  insertTableItem, 
  updateTableItem, 
  isSupabaseConfigured 
} from './supabase/supabaseClient.js';
import { CheckCircle2, Info } from 'lucide-react';

function AppContent() {
  const { isDarkMode } = useTheme();

  // Onglet Actif
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Données de l'application
  const [equipments, setEquipments] = useState(INITIAL_EQUIPMENTS);
  const [pannes, setPannes] = useState(INITIAL_PANNES);
  const [workOrders, setWorkOrders] = useState(INITIAL_WORK_ORDERS);
  const [parts, setParts] = useState(INITIAL_PARTS);
  const [technicians, setTechnicians] = useState(INITIAL_TECHNICIANS);

  // Modals d'action
  const [isAddEquipmentOpen, setIsAddEquipmentOpen] = useState(false);
  const [isAddPanneOpen, setIsAddPanneOpen] = useState(false);
  const [isAddWorkOrderOpen, setIsAddWorkOrderOpen] = useState(false);
  const [isAddPartOpen, setIsAddPartOpen] = useState(false);
  const [isAddTechnicianOpen, setIsAddTechnicianOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Chargement / Rechargement depuis Supabase (avec fallback local automatique)
  const loadAllData = async () => {
    try {
      const [eqData, panData, woData, ptsData, techData] = await Promise.all([
        fetchTableData('equipements', INITIAL_EQUIPMENTS),
        fetchTableData('pannes', INITIAL_PANNES),
        fetchTableData('work_orders', INITIAL_WORK_ORDERS),
        fetchTableData('pieces', INITIAL_PARTS),
        fetchTableData('techniciens', INITIAL_TECHNICIANS)
      ]);

      if (eqData && eqData.length) setEquipments(eqData);
      if (panData && panData.length) setPannes(panData);
      if (woData && woData.length) setWorkOrders(woData);
      if (ptsData && ptsData.length) setParts(ptsData);
      if (techData && techData.length) setTechnicians(techData);
      return true;
    } catch (err) {
      console.warn('Erreur synchronisation données initiales:', err);
      return false;
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Gestionnaires d'ajout et de persistance
  const handleAddEquipment = async (newEq) => {
    const updated = [newEq, ...equipments];
    setEquipments(updated);
    localStorage.setItem('omp_equipements', JSON.stringify(updated));
    await insertTableItem('equipements', newEq);
    showToast(`Équipement ${newEq.code} (${newEq.name}) ajouté avec succès.`);
  };

  const handleAddPanne = async (newPanne) => {
    const updated = [newPanne, ...pannes];
    setPannes(updated);
    localStorage.setItem('omp_pannes', JSON.stringify(updated));
    await insertTableItem('pannes', newPanne);
    showToast(`Défaillance ${newPanne.id} déclarée pour ${newPanne.equipment}.`);
  };

  const handleResolvePanne = async (panneId) => {
    const updated = pannes.map(p => p.id === panneId ? { ...p, status: 'Résolue' } : p);
    setPannes(updated);
    localStorage.setItem('omp_pannes', JSON.stringify(updated));
    await updateTableItem('pannes', panneId, { status: 'Résolue' });
    showToast(`Panne ${panneId} marquée comme résolue.`);
  };

  const handleAddWorkOrder = async (newWo) => {
    const updated = [newWo, ...workOrders];
    setWorkOrders(updated);
    localStorage.setItem('omp_work_orders', JSON.stringify(updated));
    await insertTableItem('work_orders', newWo);
    showToast(`Work Order ${newWo.id} émis et affecté à ${newWo.technician}.`);
  };

  const handleCompleteWorkOrder = async (woId) => {
    const updated = workOrders.map(w => w.id === woId ? { ...w, status: 'Terminé' } : w);
    setWorkOrders(updated);
    localStorage.setItem('omp_work_orders', JSON.stringify(updated));
    await updateTableItem('work_orders', woId, { status: 'Terminé' });
    showToast(`Work Order ${woId} clôturé.`);
  };

  const handleAddPart = async (newPart) => {
    const updated = [newPart, ...parts];
    setParts(updated);
    localStorage.setItem('omp_pieces', JSON.stringify(updated));
    await insertTableItem('pieces', newPart);
    showToast(`Pièce ${newPart.reference} enregistrée en magasin.`);
  };

  const handleAddTechnician = async (newTech) => {
    const updated = [newTech, ...technicians];
    setTechnicians(updated);
    localStorage.setItem('omp_techniciens', JSON.stringify(updated));
    await insertTableItem('techniciens', newTech);
    showToast(`Technicien ${newTech.name} enregistré.`);
  };

  const handleResetData = () => {
    localStorage.removeItem('omp_equipements');
    localStorage.removeItem('omp_pannes');
    localStorage.removeItem('omp_work_orders');
    localStorage.removeItem('omp_pieces');
    localStorage.removeItem('omp_techniciens');
    setEquipments(INITIAL_EQUIPMENTS);
    setPannes(INITIAL_PANNES);
    setWorkOrders(INITIAL_WORK_ORDERS);
    setParts(INITIAL_PARTS);
    setTechnicians(INITIAL_TECHNICIANS);
    showToast('Données d\'usine réinitialisées avec succès.');
  };

  const isSupabaseActive = isSupabaseConfigured();

  return (
    <div className="layout" id="omp-main-layout">
      {/* Toast Notification Flottant */}
      {toastMessage && (
        <div 
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: 'var(--dark-blue)',
            color: '#ffffff',
            border: '1px solid var(--orange)',
            borderRadius: '8px',
            padding: '12px 18px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            fontWeight: 600,
            animation: 'fadeIn 0.25s ease-out'
          }}
        >
          <CheckCircle2 size={18} color="var(--green)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        pannesCount={pannes.filter(p => p.status === 'En cours').length}
        workOrdersCount={workOrders.filter(w => w.status === 'En cours').length}
        isSupabaseActive={isSupabaseActive}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Zone Principale */}
      <main className={`main main-wrapper ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Topbar 
          activeTab={activeTab}
          notificationsCount={pannes.filter(p => p.severity === 'Critique').length}
          onOpenNotifications={() => setActiveTab('pannes')}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Routage des vues */}
        {activeTab === 'accueil' && (
          <AccueilPage
            onNavigate={setActiveTab}
            equipmentsCount={equipments.length}
            pannesCount={pannes.filter(p => p.status === 'En cours').length}
            workOrdersCount={workOrders.filter(w => w.status === 'En cours').length}
            techniciansCount={technicians.length}
            mtbf={152.4}
            mttr={2.45}
            availability={96.8}
          />
        )}

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
            onOpenAddModal={() => setIsAddEquipmentOpen(true)}
          />
        )}

        {activeTab === 'pannes' && (
          <PannesPage
            pannes={pannes}
            onOpenAddModal={() => setIsAddPanneOpen(true)}
            onResolvePanne={handleResolvePanne}
          />
        )}

        {activeTab === 'work_orders' && (
          <WorkOrdersPage
            workOrders={workOrders}
            onOpenAddModal={() => setIsAddWorkOrderOpen(true)}
            onNavigate={setActiveTab}
            onCompleteWorkOrder={handleCompleteWorkOrder}
          />
        )}

        {activeTab === 'pieces' && (
          <PiecesPage
            parts={parts}
            onOpenAddModal={() => setIsAddPartOpen(true)}
          />
        )}

        {activeTab === 'techniciens' && (
          <TechniciensPage
            technicians={technicians}
            onOpenAddModal={() => setIsAddTechnicianOpen(true)}
          />
        )}

        {activeTab === 'preventive_plan' && (
          <PreventivePlanPage
            equipments={equipments}
          />
        )}

        {activeTab === 'historique' && (
          <HistoriquePage
            workOrders={workOrders}
            pannes={pannes}
          />
        )}

        {activeTab === 'calcul_kpis' && (
          <CalculKpisPage />
        )}

        {activeTab === 'parametres' && (
          <ParametresPage
            onResetData={handleResetData}
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
      </main>

      {/* Modals de l'application */}
      {isAddEquipmentOpen && (
        <AddEquipmentModal
          onClose={() => setIsAddEquipmentOpen(false)}
          onSave={handleAddEquipment}
        />
      )}

      {isAddPanneOpen && (
        <AddPanneModal
          equipments={equipments}
          onClose={() => setIsAddPanneOpen(false)}
          onSave={handleAddPanne}
        />
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
        <AddPartModal
          onClose={() => setIsAddPartOpen(false)}
          onSave={handleAddPart}
        />
      )}

      {isAddTechnicianOpen && (
        <AddTechnicianModal
          onClose={() => setIsAddTechnicianOpen(false)}
          onSave={handleAddTechnician}
        />
      )}

      {isDocumentModalOpen && (
        <DocumentModal
          onClose={() => setIsDocumentModalOpen(false)}
          onAddDocument={(doc) => showToast(`Document "${doc.name}" indexé avec succès.`)}
        />
      )}

      {isZoomModalOpen && (
        <ZoomModal
          onClose={() => setIsZoomModalOpen(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
