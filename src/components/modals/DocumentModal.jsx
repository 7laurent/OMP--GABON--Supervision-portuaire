import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2 } from 'lucide-react';

export default function DocumentModal({ onClose, onAddDocument }) {
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('Rapport d\'Intervention');
  const [equipmentCode, setEquipmentCode] = useState('GPM-01');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleUpload = (e) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      if (onAddDocument) {
        onAddDocument({
          id: `DOC-${Date.now()}`,
          name: file ? file.name : 'Rapport_Technique_OMP.pdf',
          docType,
          equipmentCode,
          date: new Date().toISOString().split('T')[0]
        });
      }
      onClose();
    }, 900);
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="document-upload-modal">
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={20} color="var(--orange)" />
            <div className="modal-title">Ajouter un Document de Maintenance</div>
          </div>
          <button type="button" className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        {isSuccess ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <CheckCircle2 size={48} color="var(--green)" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>
              Document importé et centralisé avec succès !
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '6px' }}>
              Indexé dans l'historique et rattaché à l'équipement {equipmentCode}.
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpload}>
            <div className="modal-body">
              {/* Zone de glisser-déposer */}
              <div
                style={{
                  border: '2px dashed var(--border)',
                  borderRadius: '10px',
                  padding: '30px 20px',
                  textAlign: 'center',
                  background: 'var(--hover-bg)',
                  cursor: 'pointer'
                }}
                onClick={() => document.getElementById('file-input-upload').click()}
              >
                <Upload size={36} color="var(--muted)" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  {file ? file.name : 'Cliquez ou glissez-déposez votre document ici'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                  Formats acceptés : PDF, DOCX, XLSX, Schémas techniques DWG (Max 25 Mo)
                </div>
                <input
                  id="file-input-upload"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Type de Document</label>
                  <select
                    className="form-control"
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                  >
                    <option value="Rapport d'Intervention">Rapport d'Intervention</option>
                    <option value="Fiche de Vie Machine">Fiche de Vie Machine</option>
                    <option value="Certificat de Contrôle Apave">Certificat de Contrôle Apave</option>
                    <option value="Schéma Hydraulique / Électrique">Schéma Hydraulique / Électrique</option>
                    <option value="Bon de Sortie Pièce Magasin">Bon de Sortie Pièce Magasin</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Équipement Rattaché</label>
                  <input
                    type="text"
                    className="form-control"
                    value={equipmentCode}
                    onChange={(e) => setEquipmentCode(e.target.value)}
                    placeholder="ex: GPM-01, CV-101"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
              <button type="submit" className="btn-primary">
                <Upload size={16} /> Importer & Analyser
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
