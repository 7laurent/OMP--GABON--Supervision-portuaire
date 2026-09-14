import React from 'react';

/**
 * Anneau de progression circulaire (style "watch dashboard") pour un KPI en %.
 * Purement présentationnel — la valeur est déjà calculée en amont depuis les
 * données réelles (Disponibilité, TRC, etc.).
 */
export default function RingProgress({ value = 0, size = 76, strokeWidth = 7, color = 'var(--orange)', trackColor, label }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor || 'var(--border)'} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <span style={{ fontSize: size * 0.24, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{clamped}%</span>
        {label && <span style={{ fontSize: Math.max(8, size * 0.1), color: 'var(--muted)', marginTop: 2, textAlign: 'center' }}>{label}</span>}
      </div>
    </div>
  );
}
