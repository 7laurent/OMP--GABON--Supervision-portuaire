import React, { useState } from 'react';
import { 
  Filter, 
  FileSpreadsheet, 
  Eye, 
  History, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  Clock,
  CheckCircle2,
  Search
} from 'lucide-react';
import { WorkOrder } from '../types';
import { useTheme } from '../context/ThemeContext';

interface WorkOrdersTableProps {
  workOrders: WorkOrder[];
  onSelectWorkOrder: (wo: WorkOrder) => void;
  onRefreshWo?: (woId: string) => void;
}

export const WorkOrdersTable: React.FC<WorkOrdersTableProps> = ({
  workOrders,
  onSelectWorkOrder,
  onRefreshWo
}) => {
  const { isDarkMode } = useTheme();
  const [statusFilter, setStatusFilter] = useState<string>('Tous statuts');
  const [categoryFilter, setCategoryFilter] = useState<string>('Toutes catégories');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredOrders = workOrders.filter(wo => {
    const matchesSearch = wo.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          wo.equipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          wo.technician.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'Toutes catégories' || wo.category === categoryFilter;
    const matchesStatus = statusFilter === 'Tous statuts' || wo.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const pageSize = 4;
  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExportExcel = () => {
    // Generate CSV export
    const headers = ['ID WO', 'Catégorie', 'Équipement', 'Technicien', 'Type', 'Priorité', 'Échéance', 'Avancement', 'Statut'];
    const rows = workOrders.map(wo => [
      wo.id,
      wo.category,
      `"${wo.equipment}"`,
      wo.technician,
      wo.type,
      wo.priority,
      wo.deadline,
      `${wo.progress}%`,
      wo.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `OMP_WorkOrders_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage('Export Excel généré avec succès.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div 
      id="registre-work-orders-block"
      className={`rounded-xl border overflow-hidden transition-all shadow-sm mb-8 ${
        isDarkMode ? 'bg-[#0b1b33] border-[#1a3a66]' : 'bg-white border-slate-200'
      }`}
    >
      {/* Table Header with Filters & Actions */}
      <div className="p-4 border-b border-slate-100 dark:border-[#163359] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold font-space text-slate-900 dark:text-white">
            Registre des Work Orders & Pannes Actives
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Suivi en direct des {workOrders.length} interventions ordonnancées sur le port
          </p>
        </div>

        {/* Filter Controls Row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter Dropdown */}
          <div className="relative">
            <select
              id="filter-wo-status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer appearance-none pr-7 ${
                isDarkMode 
                  ? 'bg-[#0f2342] border-[#1f4171] text-sky-200 hover:bg-[#152e54]' 
                  : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <option value="Tous statuts">Tous statuts (46)</option>
              <option value="En cours">En cours</option>
              <option value="En attente pièces">En attente pièces</option>
              <option value="Terminé">Terminé</option>
              <option value="Nouveau">Nouveau</option>
            </select>
            <Filter className="w-3.5 h-3.5 absolute right-2 top-2.5 pointer-events-none text-slate-400" />
          </div>

          {/* Category Filter Dropdown */}
          <div className="relative">
            <select
              id="filter-wo-category"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer appearance-none pr-7 ${
                isDarkMode 
                  ? 'bg-[#0f2342] border-[#1f4171] text-sky-200 hover:bg-[#152e54]' 
                  : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <option value="Toutes catégories">Toutes catégories</option>
              <option value="Ferroviaire">Ferroviaire</option>
              <option value="Levage Lourd">Levage Lourd</option>
              <option value="Convoyage">Convoyage</option>
              <option value="Énergie">Énergie</option>
            </select>
            <Filter className="w-3.5 h-3.5 absolute right-2 top-2.5 pointer-events-none text-slate-400" />
          </div>

          {/* Export Excel */}
          <button
            id="btn-export-excel-wo"
            onClick={handleExportExcel}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isDarkMode 
                ? 'bg-[#0f2342] border-[#1f4171] text-emerald-400 hover:bg-[#16335a]' 
                : 'bg-white border-slate-300 text-emerald-700 hover:bg-slate-50'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white text-xs px-4 py-2 font-medium flex items-center justify-between">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="font-bold">×</button>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${
              isDarkMode ? 'bg-[#081528] text-slate-400 border-[#163359]' : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}>
              <th className="py-3 px-4">ID WO</th>
              <th className="py-3 px-3">Catégorie</th>
              <th className="py-3 px-3">Équipement / S/N</th>
              <th className="py-3 px-3">Technicien</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">Priorité</th>
              <th className="py-3 px-3">Échéance</th>
              <th className="py-3 px-4">Avancement</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#163359]">
            {paginatedOrders.map((wo) => {
              const isUrgent = wo.priority === 'P1';
              return (
                <tr 
                  key={wo.id}
                  onClick={() => onSelectWorkOrder(wo)}
                  className={`cursor-pointer transition-colors ${
                    isDarkMode ? 'hover:bg-[#0f2445]' : 'hover:bg-slate-50'
                  }`}
                >
                  {/* ID */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`font-mono-num font-bold ${
                      isUrgent 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-slate-900 dark:text-white'
                    }`}>
                      {wo.id}
                    </span>
                  </td>

                  {/* Catégorie */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-[#142c4d] text-slate-700 dark:text-slate-300">
                      {wo.category}
                    </span>
                  </td>

                  {/* Équipement */}
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {wo.equipment}
                    </div>
                  </td>

                  {/* Technicien */}
                  <td className="py-3 px-3 whitespace-nowrap text-slate-700 dark:text-slate-300">
                    {wo.technician}
                  </td>

                  {/* Type */}
                  <td className="py-3 px-3 whitespace-nowrap text-slate-600 dark:text-slate-400">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-50 dark:bg-[#10233e] border border-slate-200 dark:border-[#1a3861]">
                      {wo.type}
                    </span>
                  </td>

                  {/* Priorité */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      wo.priority === 'P1'
                        ? 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300'
                        : wo.priority === 'P2'
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/80 dark:text-orange-300'
                        : 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300'
                    }`}>
                      {wo.priorityLabel}
                    </span>
                  </td>

                  {/* Échéance */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={isUrgent ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                      {wo.deadline}
                    </span>
                  </td>

                  {/* Avancement */}
                  <td className="py-3 px-4 whitespace-nowrap min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-slate-100 dark:bg-[#152e52] rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            isUrgent ? 'bg-red-500' : wo.progress >= 80 ? 'bg-emerald-500' : 'bg-[#0f4066] dark:bg-sky-500'
                          }`} 
                          style={{ width: `${wo.progress}%` }}
                        ></div>
                      </div>
                      <span className="font-mono-num font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                        {wo.progress}%
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5 text-slate-400" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => onSelectWorkOrder(wo)}
                        title="Consulter les détails"
                        className="p-1 hover:text-slate-700 dark:hover:text-white rounded"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => onSelectWorkOrder(wo)}
                        title="Historique des étapes"
                        className="p-1 hover:text-slate-700 dark:hover:text-white rounded"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => onRefreshWo?.(wo.id)}
                        title="Actualiser le statut"
                        className="p-1 hover:text-slate-700 dark:hover:text-white rounded"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination & Status Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-[#163359] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div>
          Affichage {paginatedOrders.length} interventions sur <strong>{filteredOrders.length}</strong> Work Orders actifs
        </div>

        <div className="flex items-center gap-1">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="px-2.5 py-1 rounded border border-slate-200 dark:border-[#1e3e6b] text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-[#163359]"
          >
            Précédent
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                currentPage === pageNum
                  ? 'bg-slate-900 text-white dark:bg-[#1a3d6d] dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#163359]'
              }`}
            >
              {pageNum}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="px-2.5 py-1 rounded border border-slate-200 dark:border-[#1e3e6b] text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-[#163359]"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
};
