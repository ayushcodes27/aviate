'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function DelayVsCancelGroupedBar({ data }: { data: any[] }) {
  // Sort by total flights (volume) and take top 10
  const chartData = [...data]
    .sort((a, b) => (Number(b.total_flights) || 0) - (Number(a.total_flights) || 0))
    .slice(0, 10)
    .map(d => ({
      carrier: d.carrier,
      delayed: Number(d.delayed_flights),
      cancelled: Number(d.cancelled_flights)
    }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData} margin={{ top: 20, right: 25, left: 15, bottom: 45 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" vertical={false} />
        <XAxis
          dataKey="carrier"
          stroke="var(--text-muted)"
          tick={{ fill: 'var(--text-muted)', fontSize: 11, angle: -35, textAnchor: 'end' }}
          tickMargin={10}
          interval={0}
        />
        <YAxis
          stroke="var(--text-muted)"
          tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
          tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(value)}
        />
        <Tooltip
          cursor={{ fill: 'var(--bg-subtle)' }}
          contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-hairline)', borderRadius: '4px', boxShadow: 'none' }}
          formatter={(value: number) => [new Intl.NumberFormat('en-US').format(value)]}
        />
        <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '8px', fontSize: '12px' }} />
        <Bar dataKey="delayed" name="Delayed" fill="var(--status-delayed)" radius={[2, 2, 0, 0]} />
        <Bar dataKey="cancelled" name="Cancelled" fill="var(--status-cancelled)" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}