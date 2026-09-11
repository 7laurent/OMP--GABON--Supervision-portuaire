import React, { useState } from 'react';
import { X, AlertTriangle, Plus } from 'lucide-react';
import ValidationBanner from './ValidationBanner.jsx';
import { validatePanneForm } from '../../utils/dataValidation.js';

export default function AddPanneModal({ equipments = [], onClose, onSave }) {
  const [issues, setIssues] = useState([]);
  const [formData, setFormData] = useState({
    equipment: equipments[0]?.name || '',
    equipmentCode: equipments[0]?.code || '',
    type: 'Défaillance Hydraulique',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    severity: 'Élevée',
    priority: 'Haute (P2)',
    reportedBy: '',
    status: 'En cours',
    durationHours: 3.5,
    symptoms: '',
    cause: '',
    actionRequired: '',
    securityNote: 'Consignation requise'
  });

  const handleEquipmentChange = (e) => {
    const selectedName = e.target.value;
    const found = equipments.find(eq => eq.name === selectedName);
    setFormData({
      ...formData,
      equipment: selectedName,
      equipmentCode: found ? found.code : ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const foundIssues = validatePanneForm(formData);
    if (foundIssues.length > 0) { setIssues(foundIssues); return; }
    onSave({
      ...formData,
      id: `PAN-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      durationHours: Number(formData.durationHours) || 2
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={20} color="var(--red)" />
            <div className="modal-title">Déclarer une Nouvelle Panne</div>
          </div>
          <button type="button" className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <ValidationBanner issues={issues} />
            {equipments.length === 0 && (
              <div style={{ padding: '10px 14px', marginBottom: '16px', background: 'rgba(239,71,111,0.12)', border: '1px solid var(--red)', borderRadius: '8px', color: 'var(--red)', fontSize: '12px' }}>
                Aucun équipement enregistré. Ajoutez d'abord un équipement avant de déclarer une panne.
              </div>
            )}
            <div className="form-grid">
              <div className="form-group full">
                <label className="form-label">Équipement Concerné *</label>
                <select
                  className="form-control"
                  value={formData.equipment}
                  onChange={handleEquipmentChange}
                  disabled={equipments.length === 0}
                >
                  {equipments.map(eq => (
                    <option key={eq.id} value={eq.name}>
                      [{eq.code}] {eq.name} — {eq.location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Type d'Incident / Panne</label>
                <select
                  className="form-control"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="Défaillance Hydraulique">Défaillance Hydraulique</option>
                  <option value="Échauffement Palier / Mécanique">Échauffement Palier / Mécanique</option>
                  <option value="Défaut Électrique / Automate">Défaut Électrique / Automate</option>
                  <option value="Rupture Câble / Levage">Rupture Câble / Levage</option>
                  <option value="Capteur / Instrument">Capteur / Instrument</option>
                  <option value="Moteur Thermique Diesel">Moteur Thermique Diesel</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Gravité AFNOR</label>
                <select
                  className="form-control"
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                >
                  <option value="Faible">Faible (P4)</option>
                  <option value="Moyenne">Moyenne (P3)</option>
                  <option value="Élevée">Élevée (P2)</option>
                  <option value="Critique">Critique (P1)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date & Heure Détection</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                  <input
                    type="time"
                    className="form-control"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Déclarée Par</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.reportedBy}
                  onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
                />
              </div>

              <div className="form-group full">
                <label className="form-label">Symptômes Constatés</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Bruits suspects, vibrations, chute de pression, code erreur..."
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                />
              </div>

              <div className="form-group full">
                <label className="form-label">Action Immédiate Requise</label>
                <input
                  type="text"
                  placeholder="ex: Remplacement palier, purge hydraulique..."
                  className="form-control"
                  value={formData.actionRequired}
                  onChange={(e) => setFormData({ ...formData, actionRequired: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-primary" style={{ background: 'var(--red)', borderColor: 'var(--red)' }}>
              <Plus size={16} /> Déclarer la Défaillance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
