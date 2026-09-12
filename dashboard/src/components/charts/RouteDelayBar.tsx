'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function RouteDelayBar({ data }: { data: any[] }) {
  // Sort by delay rate and take top 10
  const chartData = [...data]
    .sort((a, b) => (Number(b.delay_rate) || 0) - (Number(a.delay_rate) || 0))
    .slice(0, 10)
    .map(d => ({
      name: `${d.origin}→${d.dest}`,
      carrier: d.carrier,
      rate: Number(d.delay_rate).toFixed(1)
    }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={true} vertical={false} />
        <XAxis type="number" domain={[0, 'dataMax + 10']} hide />
        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
        <Tooltip 
          cursor={{ fill: 'var(--surface-hover)' }}
          contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }}
          formatter={(value: any) => [`${value}%`, 'Delay Rate']}
          labelFormatter={(label, payload) => `${label} (${payload?.[0]?.payload?.carrier || 'Unknown'})`}
        />
        <Bar dataKey="rate" radius={[0, 4, 4, 0]} barSize={20}>
          {chartData.map((entry, index) => {
            const colors = ['#7f1d1d', '#991b1b', '#b91c1c', '#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fdba74', '#fb923c', '#f59e0b'];
            return <Cell key={`cell-${index}`} fill={colors[index] || 'var(--warning)'} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
