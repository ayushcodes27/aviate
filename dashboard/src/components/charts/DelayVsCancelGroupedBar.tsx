'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function DelayVsCancelGroupedBar({ data }: { data: any[] }) {
  // Sort by total flights (volume) and take top 10
  const chartData = [...data]
    .sort((a, b) => (Number(b.total_flights) || 0) - (Number(a.total_flights) || 0))
    .slice(0, 10)
    .map(d => ({
      name: d.carrier.split(' ')[0], // Shorten name for X-axis
      fullName: d.carrier,
      delayed: Number(d.delayed_flights),
      cancelled: Number(d.cancelled_flights)
    }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
        <YAxis 
          stroke="var(--text-muted)" 
          tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(value)}
        />
        <Tooltip 
          cursor={{ fill: 'var(--surface-hover)' }}
          contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }}
          labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
          formatter={(value: number) => new Intl.NumberFormat('en-US').format(value)}
        />
        <Legend wrapperStyle={{ paddingTop: '10px' }} />
        <Bar dataKey="delayed" name="Delayed" fill="var(--warning)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="cancelled" name="Cancelled" fill="var(--error)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
