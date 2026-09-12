import React, { useMemo, useState } from 'react';
import { Coins, PackageSearch, ArrowUpDown, Info } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { calculatePartsAnalysis } from '../utils/kpiCalculations.js';

const COLUMNS = [
  { key: 'stock', label: 'Stock' },
  { key: 'unitPrice', label: 'Prix Unitaire' },
  { key: 'stockValue', label: 'Valeur Totale' }
];

/**
 * Analyse réelle des pièces : coût unitaire, valeur totale de stock et santé du
 * stock (rupture/faible/ok). Le schéma réel n'ayant aucune table de consommation
 * ou d'achat liée aux Work Orders, "la pièce la plus utilisée/achetée" ne peut pas
 * être calculée honnêtement — un bandeau l'explique plutôt que d'inventer un chiffre.
 */
export default function PartsCostAnalysis({ parts = [] }) {
  const { isDarkMode } = useTheme();
  const [sortKey, setSortKey] = useState('stockValue');
  const [sortDir, setSortDir] = useState('desc');

  const analyzed = useMemo(() => calculatePartsAnalysis(parts), [parts]);

  const mostExpensive = useMemo(() => {
    if (!analyzed.length) return null;
    return [...analyzed].sort((a, b) => b.unitPrice - a.unitPrice)[0];
  }, [analyzed]);

  const highestStockValue = useMemo(() => {
    if (!analyzed.length) return null;
    return [...analyzed].sort((a, b) => b.stockValue - a.stockValue)[0];
  }, [analyzed]);

  const totalStockValue = useMemo(() => Number(analyzed.reduce((s, p) => s + p.stockValue, 0).toFixed(2)), [analyzed]);

  const sorted = useMemo(() => {
    const copy = [...analyzed];
    copy.sort((a, b) => (sortDir === 'desc' ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey]));
    return copy;
  }, [analyzed, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  return (
    <div className="performance-card" style={{ padding: '20px', background: isDarkMode ? '#07182e' : '#fff', border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '20px' }} id="parts-cost-analysis">
      <strong style={{ fontSize: '14px', color: 'var(--text)' }}>Analyse des Coûts & de la Valeur du Stock</strong>

      <div style={{
        marginTop: '12px', marginBottom: '16px', padding: '10px 14px', borderRadius: '8px',
        border: '1px solid var(--border)', borderLeft: '4px solid var(--blue)', background: isDarkMode ? '#0a1930' : '#eff6ff',
        display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '12px', color: 'var(--muted)'
      }}>
        <Info size={14} style={{ marginTop: '2px', flexShrink: 0, color: 'var(--blue)' }} />
        <span>
          La base ne relie pas encore les pièces aux Work Orders (pas de journal de consommation ni d'historique d'achat) :
          impossible de calculer honnêtement "la pièce la plus utilisée" ou "la plus achetée" sans inventer des chiffres.
          Ce qui suit est basé uniquement sur le <strong>stock et le prix</strong> réellement enregistrés.
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '18px' }}>
        <div style={{ padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--border)', borderLeft: '4px solid var(--orange)', background: isDarkMode ? '#1a1206' : '#fff7ed' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--orange)', textTransform: 'uppercase' }}>
            <Coins size={14} /> Pièce la plus chère (unitaire)
          </div>
          {mostExpensive ? (
            <>
              <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }}>{mostExpensive.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{mostExpensive.reference} · {Number(mostExpensive.unitPrice).toLocaleString()} €/unité</div>
            </>
          ) : <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>Aucune pièce enregistrée.</div>}
        </div>

        <div style={{ padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--border)', borderLeft: '4px solid var(--green)', background: isDarkMode ? '#0c1f16' : '#ecfdf5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase' }}>
            <PackageSearch size={14} /> Plus grande valeur de stock
          </div>
          {highestStockValue ? (
            <>
              <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }}>{highestStockValue.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{highestStockValue.stock} unités × {Number(highestStockValue.unitPrice).toLocaleString()} € = {highestStockValue.stockValue.toLocaleString()} €</div>
            </>
          ) : <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>Aucune pièce enregistrée.</div>}
        </div>

        <div style={{ padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--border)', borderLeft: '4px solid var(--blue)', background: isDarkMode ? '#0a1930' : '#eff6ff' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase' }}>Valeur Totale du Stock</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }}>{totalStockValue.toLocaleString()} €</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{analyzed.length} référence(s) valorisée(s)</div>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Référence</th>
              <th>Désignation</th>
              <th>Catégorie</th>
              {COLUMNS.map((c) => (
                <th key={c.key} style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort(c.key)}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {c.label} <ArrowUpDown size={11} style={{ opacity: sortKey === c.key ? 1 : 0.35 }} />
                  </span>
                </th>
              ))}
              <th>Statut Stock</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: '20px' }}>Aucune pièce enregistrée.</td></tr>
            ) : sorted.map((p) => (
              <tr key={p.id}>
                <td style={{ fontWeight: 700, color: 'var(--orange)' }}>{p.reference}</td>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td>{p.category}</td>
                <td>{p.stock}</td>
                <td>{Number(p.unitPrice).toLocaleString()} €</td>
                <td style={{ fontWeight: 700 }}>{p.stockValue.toLocaleString()} €</td>
                <td>
                  <span className={`status-badge ${p.stockStatus === 'Rupture' ? 'status-late' : p.stockStatus === 'Stock faible' ? 'status-progress' : 'status-done'}`}>
                    {p.stockStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
