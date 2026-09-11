import React, { useState, useMemo } from 'react';
import { History, Search, FileText, Download, Calendar, Filter } from 'lucide-react';
import WeeklyStatsDiagram from '../components/WeeklyStatsDiagram.jsx';
import { buildHistoriqueFromData } from '../data/mappers.js';

export default function HistoriquePage({ workOrders = [], pannes = [] }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Journal d'événements dérivé en temps réel des pannes et Work Orders réels
  const logs = useMemo(() => buildHistoriqueFromData(pannes, workOrders), [pannes, workOrders]);

  const filteredLogs = logs.filter(l => {
    const matchesSearch = l.equipment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          l.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          l.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="content" id="historique-page-content">
      {/* En-tête Dossier 1 */}
      <div className="section-heading" style={{ marginBottom: '28px' }}>
        <div>
          <div className="section-label">TRAÇABILITÉ & AUDIT</div>
          <div className="section-title" style={{ fontSize: '28px', marginTop: '4px' }}>
            Historique & Journal des Événements
          </div>
          <p style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '4px' }}>
            Traçabilité complète des interventions, changements d'état et mouvements sur les 7 familles d'engins portuaires.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="btn-secondary" id="btn-export-logs">
            <Download size={16} /> Exporter le registre (CSV / PDF)
          </button>
        </div>
      </div>

      {/* SCHÉMAS STATISTIQUES HISTORIQUES MULTI-PÉRIODES */}
      <WeeklyStatsDiagram
        pageTitle="Chronologie & Tendances Statistiques Multi-Périodes"
        subtitle="Historique réel des événements et interventions sur la flotte de maintenance"
        context="historique"
        pannes={pannes}
        workOrders={workOrders}
      />

      {/* Journal des Événements */}
      <section className="section">
        <div className="section-heading">
          <div>
            <div className="section-label">JOURNAL DE BORD</div>
            <div className="section-title">Événements Techniques Enregistrés</div>
          </div>
        </div>

        {/* Filtre de recherche */}
        <div className="filters-bar" style={{ background: 'var(--card-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '20px' }}>
          <div className="search-box" style={{ maxWidth: '400px' }}>
            <Search className="search-icon" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher par équipement, événement ou auteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              id="search-history-input"
            />
          </div>
        </div>

        <div className="table-responsive" style={{ background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Code Événement</th>
                <th>Date & Heure</th>
                <th>Équipement Concerne</th>
                <th>Description de l'Événement</th>
                <th>Opérateur / Technicien</th>
                <th>Type</th>
                <th>Impact Opérationnel</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontWeight: 700, color: 'var(--orange)' }}>{log.id}</td>
                  <td style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>{log.date}</td>
                  <td style={{ fontWeight: 600 }}>{log.equipment}</td>
                  <td>{log.event}</td>
                  <td style={{ fontSize: '13px', color: 'var(--muted)' }}>{log.author}</td>
                  <td>
                    <span className="badge badge-subtle">{log.type}</span>
                  </td>
                  <td style={{ fontSize: '13px', fontWeight: 600, color: 'var(--green)' }}>
                    {log.impact}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
