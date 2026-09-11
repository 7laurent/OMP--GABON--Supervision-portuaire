import React from 'react';
import { X, Cpu, Calendar } from 'lucide-react';
import { calculateEquipmentSpecificKpis } from '../../utils/kpiCalculations.js';
import CoreKpiTrio from '../CoreKpiTrio.jsx';
import KpiTrendChart from '../KpiTrendChart.jsx';
import TemporalAnalyticsSection from '../TemporalAnalyticsSection.jsx';

export default function EquipmentKpiModal({ equipment, pannes = [], workOrders = [], onClose }) {
  if (!equipment) return null;

  const baseKpis = calculateEquipmentSpecificKpis(equipment, pannes, workOrders);
  if (!baseKpis) return null;

  return (
    <div className="modal-overlay" onClick={onClose} id="equipment-kpi-modal">
      <div className="modal-box large" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '980px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="kpi-icon" style={{ background: 'var(--orange)', color: '#ffffff' }}>
              <Cpu size={20} />
            </div>
            <div>
              <div className="modal-title">
                KPIs Détaillés &amp; Schéma Statistique · {equipment.name} ({equipment.code})
              </div>
              <div className="modal-subtitle">
                Type : <strong>{equipment.category}</strong> — {equipment.location} | Norme AFNOR NF EN 13306 &amp; NF X 60-015
              </div>
            </div>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            background: 'var(--hover-bg)', borderRadius: '10px', padding: '10px 18px', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--muted)'
          }}>
            <Calendar size={13} /> Machine mise en service : <strong>{equipment.commissionDate || 'N/A'}</strong>
          </div>

          {/* LES 4 KPI MAJEURS AU MÊME ENDROIT QUE PARTOUT AILLEURS DANS L'APP (MTBF, MTTR, Dispo, TRC) */}
          <CoreKpiTrio
            equipments={[equipment]}
            pannes={baseKpis.machinePannes}
            workOrders={baseKpis.machineWO}
          />

          {/* ÉVOLUTION DISPONIBILITÉ / MTBF / MTTR / TRC PROPRE À CETTE MACHINE, PAR MOIS OU PAR ANNÉE */}
          <KpiTrendChart
            pannes={pannes}
            workOrders={workOrders}
            equipments={[equipment]}
            equipmentId={equipment.id}
            mode="single"
          />

          {/* RATIO DE PANNES, TRC ET PRÉVENTIF/CORRECTIF PROPRES À CETTE MACHINE */}
          <TemporalAnalyticsSection
            equipments={[equipment]}
            pannes={pannes}
            workOrders={workOrders}
            fixedEquipmentId={equipment.id}
            showFilters={false}
            title={`Ratios & TRC — ${equipment.name}`}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            <div style={{ background: 'var(--hover-bg)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>Taux de Défaillance (λ)</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', margin: '4px 0' }}>
                {baseKpis.failureRate} <span style={{ fontSize: '11px', fontWeight: 400 }}>pannes/h</span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Formule : λ = 1 / MTBF</div>
            </div>

            <div style={{ background: 'var(--hover-bg)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>Taux de Réparation (μ)</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', margin: '4px 0' }}>
                {baseKpis.repairRate} <span style={{ fontSize: '11px', fontWeight: 400 }}>rép./h</span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Formule : μ = 1 / MTTR</div>
            </div>

            <div style={{ background: 'var(--hover-bg)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>Disponibilité Inhérente (Di)</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--green)', margin: '4px 0' }}>
                {baseKpis.di}%
              </div>
              <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Di = MTBF / (MTBF + MTTR)</div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
