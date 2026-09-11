import React, { useState } from 'react';
import { X, Users, Plus } from 'lucide-react';
import ValidationBanner from './ValidationBanner.jsx';
import { validateTechnicianForm } from '../../utils/dataValidation.js';

export default function AddTechnicianModal({ onClose, onSave }) {
  const [issues, setIssues] = useState([]);
  const [formData, setFormData] = useState({
    matricule: `TECH-${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    specialty: 'Hydraulique & Mécanique',
    team: 'Équipe A - Quai Minéralier',
    status: 'Actif',
    experienceYears: 5,
    phone: '+241 07 00 00 00',
    email: '',
    activeWO: 'Aucun'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const foundIssues = validateTechnicianForm(formData);
    if (foundIssues.length > 0) { setIssues(foundIssues); return; }
    onSave({
      ...formData,
      id: Date.now(),
      experienceYears: Number(formData.experienceYears) || 1
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={20} color="var(--orange)" />
            <div className="modal-title">Ajouter un Technicien</div>
          </div>
          <button type="button" className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <ValidationBanner issues={issues} />
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Matricule *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={formData.matricule}
                  onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nom Complet *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Jean-Paul Ondo"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Spécialité Technique</label>
                <select
                  className="form-control"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                >
                  <option value="Hydraulique & Mécanique Lourde">Hydraulique & Mécanique Lourde</option>
                  <option value="Convoyage & Chaudronnerie">Convoyage & Chaudronnerie</option>
                  <option value="Électricité & Automates Industriels">Électricité & Automates Industriels</option>
                  <option value="Maintenance Portique RTG & Grues">Maintenance Portique RTG & Grues</option>
                  <option value="Moteurs Thermiques & Fluides">Moteurs Thermiques & Fluides</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Équipe d'Affectation</label>
                <select
                  className="form-control"
                  value={formData.team}
                  onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                >
                  <option value="Équipe A - Quai Minéralier">Équipe A - Quai Minéralier</option>
                  <option value="Équipe B - Énergie & Systèmes">Équipe B - Énergie & Systèmes</option>
                  <option value="Équipe C - Terminal Conteneurs">Équipe C - Terminal Conteneurs</option>
                  <option value="Atelier Central de Révision">Atelier Central de Révision</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Années d'Expérience</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Téléphone Pro</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-primary">
              <Plus size={16} /> Enregistrer le Technicien
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
