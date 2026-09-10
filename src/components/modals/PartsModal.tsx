import React from 'react';
import { X, Package, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { SparePart } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface PartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  parts: SparePart[];
  filterMachineName?: string;
}

export const PartsModal: React.FC<PartsModalProps> = ({
  isOpen,
  onClose,
  parts,
  filterMachineName
}) => {
  const { isDarkMode } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className={`w-full max-w-2xl rounded-xl border shadow-2xl overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-150 ${
          isDarkMode ? 'bg-[#0a1526] border-[#1d3962] text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#071d36] text-white flex items-center justify-between border-b border-[#142e4e]">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold font-space text-base">Magasin Portuaire & Pièces de Rechange</h3>
              {filterMachineName && (
                <p className="text-[11px] text-slate-300">Affectation : {filterMachineName}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-xs max-h-[70vh] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${
                isDarkMode ? 'bg-[#081526] text-slate-400 border-[#142c4d]' : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}>
                <th className="py-2.5 px-3">Référence</th>
                <th className="py-2.5 px-3">Désignation</th>
                <th className="py-2.5 px-3">Emplacement</th>
                <th className="py-2.5 px-3 text-center">En Stock</th>
                <th className="py-2.5 px-3 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#142c4d]">
              {parts.map((part) => (
                <tr key={part.ref} className={isDarkMode ? 'hover:bg-[#0e213d]' : 'hover:bg-slate-50'}>
                  <td className="py-2.5 px-3 font-mono-num font-bold text-slate-900 dark:text-white">
                    {part.ref}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{part.name}</div>
                    <div className="text-[10px] text-slate-400">{part.category}</div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                    {part.location}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono-num font-bold text-slate-900 dark:text-white">
                    {part.stock} {part.unit}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      part.stock > part.minStock
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                    }`}>
                      {part.stock > part.minStock ? 'OK' : 'Réappro'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#071526] border-t border-slate-200 dark:border-[#1d3962] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#071d36] hover:bg-[#0c2a4d] dark:bg-[#16355e] text-white font-bold"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
