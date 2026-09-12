import React, { useState } from 'react';
import { Package, Plus, Search, CheckCircle2, AlertTriangle, AlertCircle, Trash2 } from 'lucide-react';
import WeeklyStatsDiagram from '../components/WeeklyStatsDiagram.jsx';
import PartsCostAnalysis from '../components/PartsCostAnalysis.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function PiecesPage({ parts = [], onOpenAddModal, onDeletePart }) {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedPart, setSelectedPart] = useState(null);

  const total = parts.length;
  const available = parts.filter(p => p.stock > p.minStock).length;
  const low = parts.filter(p => p.stock <= p.minStock && p.stock > 0).length;
  const outOfStock = parts.filter(p => p.stock <= 0).length;

  const filteredParts = parts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="content" id="pieces-page-content">
      {/* En-tête Dossier 1 */}
      <div className="section-heading" style={{ marginBottom: '28px' }}>
        <div>
          <div className="section-label">STOCK & MAGASIN</div>
          <div className="section-title" style={{ fontSize: '28px', marginTop: '4px' }}>
            Gestion des pièces
          </div>
          <p style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '4px' }}>
            Suivez les stocks, les consommations et anticipez les réapprovisionnements pour éviter les ruptures.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={onOpenAddModal}
          id="btn-add-part"
        >
          <Plus size={16} /> + Ajouter une pièce
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: '30px' }}>
        <div className="kpi-card border-accent">
          <div className="kpi-top">
            <span className="kpi-title">Total Pièces</span>
            <div className="kpi-icon"><Package size={18} /></div>
          </div>
          <div className="kpi-number">{total}</div>
          <span className="kpi-caption">Références cataloguées</span>
        </div>

        <div className="kpi-card border-accent">
          <div className="kpi-top">
            <span className="kpi-title">Stock Disponible</span>
            <div className="kpi-icon"><CheckCircle2 size={18} color="var(--green)" /></div>
          </div>
          <div className="kpi-number" style={{ color: 'var(--green)' }}>{available}</div>
          <span className="kpi-caption">Au-dessus du seuil d'alerte</span>
        </div>

        <div className="kpi-card border-accent">
          <div className="kpi-top">
            <span className="kpi-title">Stock Faible</span>
            <div className="kpi-icon"><AlertTriangle size={18} color="var(--orange)" /></div>
          </div>
          <div className="kpi-number" style={{ color: 'var(--orange)' }}>{low}</div>
          <span className="kpi-caption">Seuil mini atteint</span>
        </div>

        <div className="kpi-card border-accent">
          <div className="kpi-top">
            <span className="kpi-title">Ruptures</span>
            <div className="kpi-icon"><AlertCircle size={18} color="var(--red)" /></div>
          </div>
          <div className="kpi-number" style={{ color: 'var(--red)' }}>{outOfStock}</div>
          <span className="kpi-caption">Commandes urgentes requises</span>
        </div>
      </div>

      {/* SCHÉMAS STATISTIQUES DES PIÈCES & CONSOMMABLES */}
      <WeeklyStatsDiagram 
        pageTitle="Statistiques Multi-Périodes des Stocks & Pièces Détachées"
        subtitle="Consommations hebdomadaires, taux de rotation des pièces et approvisionnements"
        context="pieces"
      />

      {/* COÛTS & VALEUR DU STOCK */}
      <PartsCostAnalysis parts={parts} />

      {/* Inventaire des Pièces */}
      <section className="section">
        <div className="section-heading">
          <div>
            <div className="section-label">INVENTAIRE DU MAGASIN CENTRAL</div>
            <div className="section-title">Liste des Références & Pièces de Rechange</div>
          </div>
        </div>

        <div className="filters-bar" style={{ background: 'var(--card-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div className="search-box">
            <Search className="search-icon" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher par référence, nom ou emplacement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-selects">
            <select 
              className="filter-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">Toutes les catégories</option>
              <option value="Mécanique & Roulements">Mécanique & Roulements</option>
              <option value="Hydraulique & Filtration">Hydraulique & Filtration</option>
              <option value="Hydraulique & Étanchéité">Hydraulique & Étanchéité</option>
              <option value="Levage & Câblerie">Levage & Câblerie</option>
              <option value="Électricité & Automatisme">Électricité & Automatisme</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper" style={{ marginTop: '16px' }}>
          <table>
            <thead>
              <tr>
                <th>Référence</th>
                <th>Désignation</th>
                <th>Catégorie</th>
                <th>Stock</th>
                <th>Stock Min.</th>
                <th>Emplacement</th>
                <th>Fournisseur</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredParts.map((part) => (
                <tr key={part.id}>
                  <td style={{ fontWeight: 700, color: 'var(--orange)' }}>{part.reference}</td>
                  <td style={{ fontWeight: 600 }}>
                    {part.name}
                    {part.needsReview && (
                      <span className="status-badge status-late" style={{ marginLeft: '6px' }} title="Incohérence détectée à l'import — exclue des calculs de KPI jusqu'à confirmation">
                        À valider
                      </span>
                    )}
                  </td>
                  <td>{part.category}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: part.stock <= 0 ? 'var(--red)' : part.stock <= part.minStock ? 'var(--orange)' : 'var(--green)' }}>
                      {part.stock} unités
                    </span>
                  </td>
                  <td>{part.minStock}</td>
                  <td>{part.location}</td>
                  <td>{part.supplier}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="action-btn-sm"
                        onClick={() => setSelectedPart(part)}
                      >
                        Détails
                      </button>
                      {onDeletePart && isAdmin && (
                        <button
                          type="button"
                          className="action-btn-sm"
                          style={{ color: 'var(--red)', borderColor: 'rgba(239,71,111,0.4)' }}
                          onClick={() => onDeletePart(part.id, part.name)}
                          title="Supprimer cette pièce"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Détails Pièce */}
      {selectedPart && (
        <div className="modal-overlay" onClick={() => setSelectedPart(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Fiche Pièce · {selectedPart.reference}</div>
              <button type="button" className="modal-close" onClick={() => setSelectedPart(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', fontSize: '13px' }}>
                <div><strong>Désignation :</strong> {selectedPart.name}</div>
                <div><strong>Catégorie :</strong> {selectedPart.category}</div>
                <div><strong>Quantité en stock :</strong> {selectedPart.stock}</div>
                <div><strong>Stock minimum :</strong> {selectedPart.minStock}</div>
                <div><strong>Emplacement :</strong> {selectedPart.location}</div>
                <div><strong>Fournisseur :</strong> {selectedPart.supplier}</div>
                <div><strong>Prix unitaire :</strong> {selectedPart.unitPrice} €</div>
                <div><strong>Valeur totale :</strong> {((selectedPart.stock || 0) * (selectedPart.unitPrice || 0)).toLocaleString()} €</div>
              </div>

              <div style={{ marginTop: '12px' }}>
                <strong>Compatibilités machines :</strong>
                <p style={{ color: 'var(--muted)', marginTop: '4px', fontSize: '13px' }}>
                  {selectedPart.compatibilities || 'Toutes machines standard.'}
                </p>
              </div>
            </div>
            <div className="modal-footer">
              {onDeletePart && isAdmin && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ color: 'var(--red)', borderColor: 'rgba(239,71,111,0.4)' }}
                  onClick={() => {
                    onDeletePart(selectedPart.id, selectedPart.name);
                    setSelectedPart(null);
                  }}
                >
                  <Trash2 size={15} /> Supprimer
                </button>
              )}
              <button type="button" className="btn-secondary" onClick={() => setSelectedPart(null)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
