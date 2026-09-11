import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { readWorkbookFile, previewWorkbook, runExcelImport } from '../../utils/excelImport.js';

const CATEGORY_LABELS = {
  equipements: 'Équipements',
  techniciens: 'Techniciens',
  pieces: 'Pièces',
  workorders: 'Work Orders',
  pannes: 'Pannes'
};

const IMPORT_HISTORY_KEY = 'omp_import_history';

async function hashFileBuffer(buffer) {
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function getImportHistory() {
  try {
    return JSON.parse(localStorage.getItem(IMPORT_HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function recordImportHistory(entry) {
  const history = getImportHistory();
  history.unshift(entry);
  try {
    localStorage.setItem(IMPORT_HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
  } catch {
    /* stockage plein ou indisponible : sans conséquence, juste pas d'historique */
  }
}

export default function DocumentModal({ onClose, onImportComplete, equipments = [], technicians = [], parts = [] }) {
  const [file, setFile] = useState(null);
  const [fileHash, setFileHash] = useState(null);
  const [sheets, setSheets] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [report, setReport] = useState(null);
  const [expandedErrors, setExpandedErrors] = useState({});
  const [parseError, setParseError] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [duplicateConfirmed, setDuplicateConfirmed] = useState(false);

  const resetFileInput = () => {
    const input = document.getElementById('file-input-excel');
    if (input) input.value = '';
  };

  const handleFileChange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setReport(null);
    setParseError(null);
    setDuplicateWarning(null);
    setDuplicateConfirmed(false);
    setIsParsing(true);
    try {
      const buffer = await f.arrayBuffer();
      const hash = await hashFileBuffer(buffer);
      setFileHash(hash);
      const parsedSheets = await readWorkbookFile(f);
      setSheets(parsedSheets);
      setPreview(previewWorkbook(parsedSheets));
      const prior = getImportHistory().find((h) => h.hash === hash);
      if (prior) setDuplicateWarning(prior);
    } catch (err) {
      setParseError(`Impossible de lire ce fichier : ${err.message}`);
      setSheets(null);
      setPreview(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleCancelDuplicate = () => {
    setFile(null);
    setFileHash(null);
    setSheets(null);
    setPreview(null);
    setDuplicateWarning(null);
    setDuplicateConfirmed(false);
    resetFileInput();
  };

  const handleOverwriteDuplicate = () => setDuplicateConfirmed(true);

  const handleImport = async () => {
    if (!sheets) return;
    setIsImporting(true);
    try {
      const result = await runExcelImport(sheets, { equipments, technicians, spareParts: parts });
      setReport(result);
      if (fileHash) {
        recordImportHistory({ hash: fileHash, fileName: file?.name || 'fichier.xlsx', importedAt: new Date().toISOString() });
      }
      if (onImportComplete) await onImportComplete(result);
    } catch (err) {
      setParseError(`Erreur pendant l'import : ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const isBlockedByDuplicate = Boolean(duplicateWarning) && !duplicateConfirmed;

  const totalRecognizedRows = preview ? preview.recognized.reduce((s, r) => s + r.count, 0) : 0;

  return (
    <div className="modal-overlay" onClick={onClose} id="excel-import-modal">
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileSpreadsheet size={20} color="var(--orange)" />
            <div className="modal-title">Importer un Fichier Excel Multi-Catégories</div>
          </div>
          <button type="button" className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          {!report && (
            <>
              <div
                style={{
                  border: '2px dashed var(--border)', borderRadius: '10px', padding: '30px 20px',
                  textAlign: 'center', background: 'var(--hover-bg)', cursor: 'pointer'
                }}
                onClick={() => document.getElementById('file-input-excel').click()}
              >
                <Upload size={36} color="var(--muted)" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  {file ? file.name : 'Cliquez ou glissez-déposez votre fichier .xlsx ici'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                  Feuilles reconnues : Equipements, Pannes, WorkOrders, Techniciens, Pieces
                </div>
                <input
                  id="file-input-excel"
                  type="file"
                  accept=".xlsx,.xls"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>

              {isParsing && (
                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--muted)' }}>
                  <Loader2 size={16} className="animate-spin" /> Lecture du fichier...
                </div>
              )}

              {parseError && (
                <div style={{ marginTop: '16px', padding: '10px 14px', background: 'rgba(239,71,111,0.12)', border: '1px solid var(--red)', borderRadius: '8px', color: 'var(--red)', fontSize: '12px' }}>
                  <AlertCircle size={14} style={{ marginRight: '6px' }} />{parseError}
                </div>
              )}

              {isBlockedByDuplicate && (
                <div style={{ marginTop: '16px', padding: '14px 16px', background: 'rgba(245,130,32,0.1)', border: '1px solid var(--orange)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <AlertCircle size={16} color="var(--orange)" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div style={{ fontSize: '12px', color: 'var(--text)' }}>
                      <strong>Ce fichier a déjà été importé</strong> le {new Date(duplicateWarning.importedAt).toLocaleString('fr-FR')}
                      {duplicateWarning.fileName ? <> (sous le nom « {duplicateWarning.fileName} »)</> : null}.
                      Voulez-vous l'importer quand même (les lignes seront retraitées) ou annuler ?
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '12px', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn-secondary" onClick={handleCancelDuplicate}>Annuler</button>
                    <button type="button" className="btn-primary" style={{ background: 'var(--orange)' }} onClick={handleOverwriteDuplicate}>
                      Écraser (importer quand même)
                    </button>
                  </div>
                </div>
              )}

              {preview && !isBlockedByDuplicate && (
                <div style={{ marginTop: '18px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
                    Aperçu de la répartition détectée ({totalRecognizedRows} ligne(s) au total)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {Object.keys(CATEGORY_LABELS).map((cat) => {
                      const found = preview.recognized.find((r) => r.category === cat);
                      return (
                        <div key={cat} style={{ padding: '10px 12px', background: 'var(--hover-bg)', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text)' }}>{CATEGORY_LABELS[cat]}</span>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: found ? 'var(--green)' : 'var(--muted)' }}>
                            {found ? found.count : 0}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {preview.unrecognized.length > 0 && (
                    <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--orange)' }}>
                      Feuille(s) non reconnue(s) et ignorée(s) : {preview.unrecognized.map((u) => `${u.sheetName} (${u.count})`).join(', ')}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {isImporting && (
            <div style={{ padding: '30px 0', textAlign: 'center' }}>
              <Loader2 size={32} className="animate-spin" color="var(--orange)" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Import en cours dans Supabase...</div>
            </div>
          )}

          {report && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <CheckCircle2 size={20} color="var(--green)" />
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>Import terminé</span>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Catégorie</th>
                      <th>Dans le fichier</th>
                      <th>Créés</th>
                      <th>Déjà existants</th>
                      <th>Échecs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(CATEGORY_LABELS).map((cat) => {
                      const stat = report[cat];
                      return (
                        <tr key={cat}>
                          <td style={{ fontWeight: 600 }}>{CATEGORY_LABELS[cat]}</td>
                          <td>{stat.totalInFile}</td>
                          <td style={{ color: 'var(--green)', fontWeight: 700 }}>{stat.created}</td>
                          <td>{stat.reused}</td>
                          <td style={{ color: stat.failed > 0 ? 'var(--red)' : 'var(--muted)', fontWeight: stat.failed > 0 ? 700 : 400 }}>
                            {stat.failed}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {Object.keys(CATEGORY_LABELS).map((cat) => {
                const stat = report[cat];
                if (!stat.errors.length) return null;
                const isOpen = expandedErrors[cat];
                return (
                  <div key={cat} style={{ marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setExpandedErrors((p) => ({ ...p, [cat]: !p[cat] }))}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', fontSize: '12px', fontWeight: 700, padding: 0 }}
                    >
                      {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      {CATEGORY_LABELS[cat]} — {stat.errors.length} ligne(s) en erreur
                    </button>
                    {isOpen && (
                      <ul style={{ marginTop: '6px', paddingLeft: '20px', fontSize: '11px', color: 'var(--muted)' }}>
                        {stat.errors.slice(0, 15).map((e, i) => (
                          <li key={i}>{e.message}</li>
                        ))}
                        {stat.errors.length > 15 && <li>... et {stat.errors.length - 15} autre(s)</li>}
                      </ul>
                    )}
                  </div>
                );
              })}

              {Object.keys(CATEGORY_LABELS).map((cat) => {
                const stat = report[cat];
                if (!stat.warnings || !stat.warnings.length) return null;
                const key = `warn-${cat}`;
                const isOpen = expandedErrors[key];
                return (
                  <div key={key} style={{ marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setExpandedErrors((p) => ({ ...p, [key]: !p[key] }))}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--orange)', fontSize: '12px', fontWeight: 700, padding: 0 }}
                    >
                      {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      {CATEGORY_LABELS[cat]} — {stat.warnings.length} incohérence(s) détectée(s) (importée(s) quand même)
                    </button>
                    {isOpen && (
                      <div style={{ marginTop: '6px', overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ textAlign: 'left', color: 'var(--muted)' }}>
                              <th style={{ padding: '4px 8px' }}>Ligne</th>
                              <th style={{ padding: '4px 8px' }}>Champ</th>
                              <th style={{ padding: '4px 8px' }}>Valeur trouvée</th>
                              <th style={{ padding: '4px 8px' }}>Valeur attendue / retenue</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stat.warnings.slice(0, 20).flatMap((w, i) =>
                              w.issues.map((issue, j) => (
                                <tr key={`${i}-${j}`} style={{ borderTop: '1px solid var(--border)' }}>
                                  <td style={{ padding: '4px 8px', fontWeight: 700 }}>{String(w.row)}</td>
                                  {typeof issue === 'string' ? (
                                    <td colSpan={3} style={{ padding: '4px 8px', color: 'var(--muted)' }}>{issue}</td>
                                  ) : (
                                    <>
                                      <td style={{ padding: '4px 8px' }}>{issue.field}</td>
                                      <td style={{ padding: '4px 8px', color: 'var(--red)' }}>{String(issue.found)}</td>
                                      <td style={{ padding: '4px 8px', color: 'var(--green)' }}>{String(issue.expected)}</td>
                                    </>
                                  )}
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                        {stat.warnings.length > 20 && (
                          <div style={{ padding: '6px 8px', color: 'var(--muted)' }}>... et {stat.warnings.length - 20} autre(s) ligne(s)</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            {report ? 'Fermer' : 'Annuler'}
          </button>
          {!report && !isBlockedByDuplicate && (
            <button
              type="submit"
              className="btn-primary"
              disabled={!preview || isImporting || totalRecognizedRows === 0}
              onClick={handleImport}
            >
              <Upload size={16} /> {isImporting ? 'Import en cours...' : `Importer ${totalRecognizedRows} ligne(s)`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
