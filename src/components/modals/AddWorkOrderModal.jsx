import React, { useState } from 'react';
import { X, ClipboardList, Plus } from 'lucide-react';

export default function AddWorkOrderModal({ equipments = [], technicians = [], onClose, onSave }) {
  const [formData, setFormData] = useState({
    equipment: equipments[0]?.name || 'Grue Portuaire Mobile 01 (GPM-01)',
    equipmentCode: equipments[0]?.code || 'GPM-01',
    type: 'Préventif',
    technician: technicians[0]?.name || 'Koumba Jean-Pierre',
    priority: 'Normale',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    status: 'En cours',
    estimatedHours: 4,
    description: '',
    actionList: []
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
    onSave({
      ...formData,
      id: `WO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      spentHours: 0,
      costEstimated: (Number(formData.estimatedHours) || 4) * 85
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ClipboardList size={20} color="var(--orange)" />
            <div className="modal-title">Créer un Nouveau Work Order</div>
          </div>
          <button type="button" className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group full">
                <label className="form-label">Équipement *</label>
                <select
                  className="form-control"
                  value={formData.equipment}
                  onChange={handleEquipmentChange}
                >
                  {equipments.map(eq => (
                    <option key={eq.id} value={eq.name}>
                      [{eq.code}] {eq.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Type d'Ordre de Travail</label>
                <select
                  className="form-control"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="Préventif">Préventif (Planifié)</option>
                  <option value="Correctif">Correctif (Curatif)</option>
                  <option value="Amélioratif">Amélioratif</option>
                  <option value="Réglementaire">Contrôle Réglementaire</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Technicien Responsable</label>
                <select
                  className="form-control"
                  value={formData.technician}
                  onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                >
                  {technicians.map(tech => (
                    <option key={tech.id} value={tech.name}>
                      {tech.name} — {tech.specialty}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priorité d'Exécution</label>
                <select
                  className="form-control"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="Basse">Basse</option>
                  <option value="Normale">Normale</option>
                  <option value="Élevée">Élevée</option>
                  <option value="Critique">Critique</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date Échéance (Deadline)</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Heures Estimées d'Intervention</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-control"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                />
              </div>

              <div className="form-group full">
                <label className="form-label">Description des Travaux à Réaliser</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Détail des opérations techniques, pièces nécessaires, consignes de sécurité..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-primary">
              <Plus size={16} /> Émettre le Work Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
