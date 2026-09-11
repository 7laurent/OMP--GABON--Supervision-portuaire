import React from 'react';
import { X, FileText, Printer, Download, CheckCircle2, ShieldAlert, Award } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface BilanDirectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BilanDirectionModal: React.FC<BilanDirectionModalProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className={`w-full max-w-3xl rounded-xl border shadow-2xl overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-150 ${
          isDarkMode ? 'bg-[#0a1526] border-[#1d3962] text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#071d36] text-white flex items-center justify-between border-b border-[#142e4e]">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold font-space text-base">Bilan Direction Technique & Exploitation</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-[#142c4d]"
              title="Imprimer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="text-white/80 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Document Content */}
        <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto print:max-h-none print:overflow-visible">
          {/* Document Title Header */}
          <div className="border-b border-slate-200 dark:border-[#1d3962] pb-4 flex items-start justify-between">
            <div>
              <div className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
                Groupe Eramet · Terminal Minéralier d'Owendo
              </div>
              <h2 className="text-xl font-bold font-space text-slate-900 dark:text-white mt-1">
                Rapport Mensuel de Performance & Supervision Industrielle
              </h2>
              <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                Période d'audit : Mois en cours · Référentiel NF EN 13306 & NF X 60-015
              </div>
            </div>
            <div className="text-right">
              <div className="px-3 py-1 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-xs inline-block">
                CONFORME OBJECTIFS
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Généré le {new Date().toLocaleDateString('fr-FR')}</div>
            </div>
          </div>

          {/* Key Executive Highlights */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0e213d] border border-slate-200 dark:border-[#1e4274]">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Disponibilité Usine</div>
              <div className="text-2xl font-extrabold font-space text-emerald-600 dark:text-emerald-400 mt-1">94.2%</div>
              <div className="text-[10px] text-slate-500">Cible &gt; 90% (Respectée)</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0e213d] border border-slate-200 dark:border-[#1e4274]">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Ratio Préventif</div>
              <div className="text-2xl font-extrabold font-space text-sky-600 dark:text-sky-400 mt-1">74.8%</div>
              <div className="text-[10px] text-slate-500">Cible &gt; 70% (Proactif)</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0e213d] border border-slate-200 dark:border-[#1e4274]">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Taux Respect Astreinte</div>
              <div className="text-2xl font-extrabold font-space text-slate-900 dark:text-white mt-1">98.5%</div>
              <div className="text-[10px] text-slate-500">Intervention &lt; 45min</div>
            </div>
          </div>

          {/* Detailed Paragraphs */}
          <div className="space-y-3 leading-relaxed text-slate-700 dark:text-slate-300">
            <h4 className="font-bold font-space text-slate-900 dark:text-white text-sm">
              1. Synthèse Opérationnelle & Cadence d'Évacuation
            </h4>
            <p>
              Le terminal minéralier d'Owendo a maintenu un niveau de service continu lors des opérations de chargement du navire <em>MV OGOOUE CAPE</em> sur le quai 3. Les cadences nominales de convoyage (3 200 T/h) ont été assurées sans interruption critique majeure.
            </p>

            <h4 className="font-bold font-space text-slate-900 dark:text-white text-sm">
              2. Actions Prioritaires sous Surveillance
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Convoyeur CV-102 :</strong> Patinage sous contrôle (12%), intervention programmée sur rouleaux de tête à la fin de la marée basse.</li>
              <li><strong>Dumper Komatsu HD785-7 (DP-02) :</strong> Révision périodique des 5 000 heures achevée à 65%, validation des injecteurs et vérins en cours par l'équipe de Marc V.</li>
              <li><strong>Centrale Compresseur GA55 :</strong> Remplacement du kit d'huile Roto-Glide prévu dans 14 jours (180h de potentiel restant).</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#071526] border-t border-slate-200 dark:border-[#1d3962] flex items-center justify-between">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Signature : <strong>Direction Technique OMP Gabon</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#071d36] hover:bg-[#0c2a4d] dark:bg-[#16355e] dark:hover:bg-[#1c4377] text-white font-bold"
          >
            Fermer le Bilan
          </button>
        </div>
      </div>
    </div>
  );
};
