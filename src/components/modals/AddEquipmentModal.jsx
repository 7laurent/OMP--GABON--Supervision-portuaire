import React, { useState } from 'react';
import { X, Plus, Wrench } from 'lucide-react';
import ValidationBanner from './ValidationBanner.jsx';
import { validateEquipmentForm } from '../../utils/dataValidation.js';

export default function AddEquipmentModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'Manutention Lourde',
    location: '',
    status: 'Opérationnel',
    criticality: 'Moyenne',
    operatingHours: 0,
    downtimeHours: 0,
    notes: ''
  });
  const [issues, setIssues] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const foundIssues = validateEquipmentForm(formData);
    if (foundIssues.length > 0) { setIssues(foundIssues); return; }
    onSave({
      ...formData,
      id: Date.now(),
      operatingHours: Number(formData.operatingHours) || 0,
      downtimeHours: Number(formData.downtimeHours) || 0
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wrench size={20} color="var(--orange)" />
            <div className="modal-title">Ajouter un Nouvel Équipement</div>
          </div>
          <button type="button" className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <ValidationBanner issues={issues} />
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Code Équipement *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: GPM-03, CV-102"
                  className="form-control"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nom de la Machine *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Grue Gottwald HMK 6407"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Catégorie</label>
                <select
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Manutention Lourde">Manutention Lourde</option>
                  <option value="Convoyage">Convoyage</option>
                  <option value="Parc Conteneurs">Parc Conteneurs</option>
                  <option value="Chargement Maritime">Chargement Maritime</option>
                  <option value="Engins Mobiles">Engins Mobiles</option>
                  <option value="Barge">Barge</option>
                  <option value="Énergie & Fluides">Énergie & Fluides</option>
                  <option value="Environnement">Environnement</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Localisation Portuaire</label>
                <input
                  type="text"
                  placeholder="ex: Quai Minéralier, Silo"
                  className="form-control"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">État Initial</label>
                <select
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Opérationnel">Opérationnel</option>
                  <option value="En maintenance">En maintenance</option>
                  <option value="À l'arrêt">À l'arrêt</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Criticité</label>
                <select
                  className="form-control"
                  value={formData.criticality}
                  onChange={(e) => setFormData({ ...formData, criticality: e.target.value })}
                >
                  <option value="Faible">Faible</option>
                  <option value="Moyenne">Moyenne</option>
                  <option value="Élevée">Élevée</option>
                  <option value="Critique">Critique</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Heures de Marche Initiales</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.operatingHours}
                  onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Heures d'Arrêt Initiales</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.downtimeHours}
                  onChange={(e) => setFormData({ ...formData, downtimeHours: e.target.value })}
                />
              </div>

              <div className="form-group full">
                <label className="form-label">Notes Techniques & Spécifications</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Spécifications constructeur, maintenance requise..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-primary">
              <Plus size={16} /> Enregistrer l'Équipement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
