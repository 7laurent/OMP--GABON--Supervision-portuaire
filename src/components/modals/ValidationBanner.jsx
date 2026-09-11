import React from 'react';
import { AlertTriangle } from 'lucide-react';

/** Bannière de notification affichant les incohérences détectées avant enregistrement */
export default function ValidationBanner({ issues }) {
  if (!issues || issues.length === 0) return null;
  return (
    <div style={{
      padding: '10px 14px', marginBottom: '16px', background: 'rgba(239,71,111,0.12)',
      border: '1px solid var(--red)', borderRadius: '8px', color: 'var(--red)', fontSize: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '4px' }}>
        <AlertTriangle size={14} /> Incohérence(s) détectée(s) — corrigez avant d'enregistrer :
      </div>
      <ul style={{ margin: 0, paddingLeft: '20px' }}>
        {issues.map((issue, i) => (
          <li key={i}>
            {typeof issue === 'string' ? issue : (
              <>
                {issue.message}
                {issue.found !== undefined && (
                  <span style={{ opacity: 0.85 }}> (trouvé : <strong>{String(issue.found)}</strong> — attendu : <strong>{String(issue.expected)}</strong>)</span>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
