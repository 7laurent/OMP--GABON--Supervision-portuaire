import React, { useState } from 'react';
import { X, Package, Plus } from 'lucide-react';

export default function AddPartModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    reference: '',
    name: '',
    category: 'Mécanique & Roulements',
    stock: 5,
    minStock: 2,
    location: 'Rayon A-01',
    supplier: 'Fournisseur Agréé Eramet',
    unitPrice: 150.00,
    compatibilities: 'Grues GPM'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.reference || !formData.name) return;
    onSave({
      ...formData,
      id: Date.now(),
      stock: Number(formData.stock) || 0,
      minStock: Number(formData.minStock) || 0,
      unitPrice: Number(formData.unitPrice) || 0
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Package size={20} color="var(--orange)" />
            <div className="modal-title">Ajouter une Pièce de Rechange</div>
          </div>
          <button type="button" className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Référence Pièce *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: RLMT-22220-EK"
                  className="form-control"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Désignation / Nom *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Roulement à rotule"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Catégorie Magasin</label>
                <select
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Mécanique & Roulements">Mécanique & Roulements</option>
                  <option value="Hydraulique & Filtration">Hydraulique & Filtration</option>
                  <option value="Hydraulique & Étanchéité">Hydraulique & Étanchéité</option>
                  <option value="Levage & Câblerie">Levage & Câblerie</option>
                  <option value="Électricité & Automatisme">Électricité & Automatisme</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Emplacement Casier</label>
                <input
                  type="text"
                  placeholder="ex: Rayon B-04 / Casier 12"
                  className="form-control"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Quantité en Stock</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Stock Minimum d'Alerte</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Prix Unitaire (€)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fournisseur</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-primary">
              <Plus size={16} /> Enregistrer la Pièce
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
