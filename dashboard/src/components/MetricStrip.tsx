import React from 'react';

type MetricProps = {
  label: string;
  value: string | number;
  subtext?: string;
  color?: string;
};

export default function MetricStrip({ metrics }: { metrics: MetricProps[] }) {
  return (
    <div className="hero-kpi-strip">
      {metrics.map((m, idx) => (
        <div key={idx} className="hero-kpi-item">
          <span className="hero-kpi-label">{m.label}</span>
          <div 
            className="hero-kpi-value" 
            style={{ color: m.color || 'var(--text-ink)' }}
          >
            {m.value}
          </div>
          {m.subtext && (
            <span className="hero-kpi-subtext">{m.subtext}</span>
          )}
        </div>
      ))}
    </div>
  );
}
