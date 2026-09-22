'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAirportName } from '@/lib/airports';

const CustomBarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const fullName = getAirportName(data.code);

    return (
      <div style={{
        backgroundColor: 'var(--bg-panel, #ffffff)',
        border: '1px solid var(--border-hairline, #e2e8f0)',
        padding: '0.625rem 0.875rem',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        fontSize: '0.8125rem',
        lineHeight: '1.4'
      }}>
        <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-ink, #0f172a)' }}>
          {data.code}
          {fullName !== data.code && (
            <span style={{ fontWeight: 400, color: 'var(--text-muted, #64748b)', marginLeft: '0.375rem', fontSize: '0.8125rem' }}>
              ({fullName})
            </span>
          )}
        </div>
        <div style={{ color: 'var(--text-muted, #64748b)', marginTop: '0.25rem' }}>
          <strong>Total flights:</strong> {data.volume?.toLocaleString()}
        </div>
      </div>
    );
  }
  return null;
};

export default function BusiestAirportsBar({ data }: { data: any[] }) {
  const chartData = [...data]
    .map(d => ({
      code: d.airport_code,
      volume: Number(d.total_departures || 0) + Number(d.total_arrivals || 0)
    }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 10);

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" vertical={false} />
        <XAxis 
          dataKey="code" 
          stroke="var(--text-muted)" 
          tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 500 }} 
        />
        <YAxis 
          stroke="var(--text-muted)" 
          tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(value)}
        />
        <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'var(--bg-subtle)' }} />
        <Bar dataKey="volume" fill="var(--data-primary)" radius={[2, 2, 0, 0]} barSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}
