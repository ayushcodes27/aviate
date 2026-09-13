import React from 'react';

type MetricProps = {
  label: string;
  value: string | number;
  subtext?: string;
  color?: string;
};

export default function MetricStrip({ metrics }: { metrics: MetricProps[] }) {
  return (
    <div 
      style={{ 
        display: 'flex', 
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-hairline)',
        borderRadius: '6px',
        marginBottom: '1rem', // tighten gap to next section
        overflow: 'hidden'
      }}
    >
      {metrics.map((m, idx) => (
        <div 
          key={idx} 
          style={{
            flex: 1,
            padding: '16px 20px',
            borderRight: idx < metrics.length - 1 ? '1px solid var(--border-hairline)' : 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <h2 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            {m.label}
          </h2>
          <div style={{ 
            fontFamily: 'var(--font-plex-mono), monospace', 
            fontSize: '2rem', 
            fontWeight: 500, 
            color: m.color || 'var(--text-ink)',
            lineHeight: 1.2
          }}>
            {m.value}
          </div>
          {m.subtext && (
            <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {m.subtext}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
