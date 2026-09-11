import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, Database, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const CATEGORY_LABELS = {
  equipements: 'Équipements',
  techniciens: 'Techniciens',
  pieces: 'Pièces',
  workorders: 'Work Orders',
  pannes: 'Pannes'
};

const CATEGORY_TAB = {
  equipements: 'equipements',
  techniciens: 'techniciens',
  pieces: 'pieces',
  workorders: 'work_orders',
  pannes: 'pannes'
};

/** Retrouve la ligne actuellement en base correspondant à l'identifiant de la ligne importée */
function findCurrentRow(notif, data) {
  if (!notif || notif.type !== 'incoherence') return null;
  const { category, row } = notif;
  if (category === 'equipements') return (data.equipments || []).find((e) => e.code === row) || null;
  if (category === 'techniciens') return (data.technicians || []).find((t) => t.name === row) || null;
  if (category === 'pieces') return (data.parts || []).find((p) => p.reference === row) || null;
  if (category === 'workorders') return (data.workOrders || []).find((w) => w.id === row) || null;
  if (category === 'pannes') return (data.pannes || []).find((p) => p.id === row) || null;
  return null;
}

/** Identifiant technique (numérique, côté base) de la ligne actuelle pour lever son drapeau "à valider" */
function getReviewId(category, row) {
  if (!row) return null;
  if (category === 'workorders') return row._id ?? null;
  if (category === 'pannes') return row._failureId ?? null;
  return row.id ?? null;
}

export default function NotificationDetailModal({ notification, data, onClose, onNavigate, onMarkReviewed }) {
  const { isAdmin } = useAuth();
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState(null);

  if (!notification) return null;

  const isIncoherence = notification.type === 'incoherence';
  const currentRow = isIncoherence ? findCurrentRow(notification, data) : null;
  const categoryLabel = notification.category ? CATEGORY_LABELS[notification.category] : null;
  const reviewId = getReviewId(notification.category, currentRow);
  const needsConfirmation = isIncoherence && currentRow && currentRow.needsReview && reviewId != null;

  const handleConfirm = async () => {
    if (!onMarkReviewed || reviewId == null) return;
    setIsConfirming(true);
    setConfirmError(null);
    try {
      await onMarkReviewed(notification.category, reviewId);
    } catch (err) {
      setConfirmError(err.message || 'Erreur lors de la confirmation.');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="notification-detail-modal">
      <div className="modal-box large" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '760px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="kpi-icon" style={{ background: isIncoherence ? 'var(--orange)' : 'var(--red)', color: '#fff' }}>
              {isIncoherence ? <AlertTriangle size={20} /> : <ShieldAlert size={20} />}
            </div>
            <div>
              <div className="modal-title">{notification.title}</div>
              <div className="modal-subtitle">
                {new Date(notification.createdAt).toLocaleString('fr-FR')}
                {categoryLabel && ` · ${categoryLabel}`}
              </div>
            </div>
          </div>
          <button type="button" className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text)', margin: 0 }}>{notification.summary}</p>

          {isIncoherence && (
            <>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Détail de l'incohérence détectée dans le fichier importé
                </div>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Champ</th>
                        <th>Valeur trouvée dans le fichier</th>
                        <th>Valeur attendue / retenue par le calcul</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notification.issues.map((issue, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600 }}>{issue.field}</td>
                          <td style={{ color: 'var(--red)' }}>{String(issue.found)}</td>
                          <td style={{ color: 'var(--green)' }}>{String(issue.expected)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{
                padding: '14px 16px', borderRadius: '8px', background: 'var(--hover-bg)',
                border: '1px solid var(--border)', display: 'flex', gap: '10px', alignItems: 'flex-start'
              }}>
                <Database size={16} color="var(--orange)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div style={{ fontSize: '12px', color: 'var(--text)' }}>
                  <strong>Comparaison avec la base de données actuelle : </strong>
                  {currentRow ? (
                    <>
                      La ligne <strong>{notification.row}</strong> a bien été enregistrée. Valeur retenue au final :{' '}
                      {notification.issues.map((issue, i) => (
                        <span key={i}>
                          {i > 0 && ', '}
                          <strong>{issue.field}</strong> = {String(currentRow[issue.field] ?? '—')}
                        </span>
                      ))}.
                    </>
                  ) : (
                    <>Aucune ligne correspondant à <strong>{notification.row}</strong> n'a été retrouvée dans les données actuelles (ligne rejetée, supprimée depuis, ou identifiant non conservé lors de l'import).</>
                  )}
                </div>
              </div>

              {currentRow && !currentRow.needsReview && (
                <div style={{ fontSize: '12px', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} /> Données confirmées — incluses dans les calculs de KPI (MTBF/MTTR/Disponibilité/TRC/ratios).
                </div>
              )}

              {needsConfirmation && (
                isAdmin ? (
                  <div>
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ background: 'var(--green)' }}
                      onClick={handleConfirm}
                      disabled={isConfirming}
                    >
                      <CheckCircle2 size={15} /> {isConfirming ? 'Confirmation...' : 'Confirmer les données (inclure dans les calculs)'}
                    </button>
                    <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '6px' }}>
                      Tant que cette ligne n'est pas confirmée, elle est exclue des moyennes/ratios (MTBF, MTTR, Disponibilité, TRC...) pour ne pas fausser les résultats — elle reste visible dans les listes avec le badge « À valider ».
                    </p>
                    {confirmError && <p style={{ fontSize: '11px', color: 'var(--red)', marginTop: '4px' }}>{confirmError}</p>}
                  </div>
                ) : (
                  <p style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    Cette ligne est exclue des calculs de KPI jusqu'à ce qu'un administrateur confirme la donnée.
                  </p>
                )
              )}
            </>
          )}

          {!isIncoherence && notification.panne && (
            <div className="table-wrapper">
              <table>
                <tbody>
                  <tr><td style={{ fontWeight: 600 }}>Équipement</td><td>{notification.panne.equipment}</td></tr>
                  <tr><td style={{ fontWeight: 600 }}>Type</td><td>{notification.panne.type}</td></tr>
                  <tr><td style={{ fontWeight: 600 }}>Gravité</td><td>{notification.panne.severity}</td></tr>
                  <tr><td style={{ fontWeight: 600 }}>Déclarée le</td><td>{notification.panne.date} à {notification.panne.time}</td></tr>
                  <tr><td style={{ fontWeight: 600 }}>Statut</td><td>{notification.panne.status}</td></tr>
                </tbody>
              </table>
            </div>
          )}

          {notification.category && onNavigate && (
            <button
              type="button"
              className="btn-secondary"
              style={{ alignSelf: 'flex-start' }}
              onClick={() => {
                onNavigate(CATEGORY_TAB[notification.category] || 'bilan_global');
                onClose();
              }}
            >
              <BarChart3 size={15} /> Voir dans {categoryLabel} &amp; les graphiques <ArrowRight size={14} />
            </button>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}
