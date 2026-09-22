'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RouteDelayBar({ data }: { data: any[] }) {
  // Sort by delay rate and take top 10
  const chartData = [...data]
    .sort((a, b) => (Number(b.delay_rate) || 0) - (Number(a.delay_rate) || 0))
    .slice(0, 10)
    .map(d => ({
      name: `${d.origin} → ${d.dest}`,
      carrier: d.carrier,
      rate: Number(d.delay_rate).toFixed(1),
      flights: Number(d.route_flights || 0)
    }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" horizontal={false} vertical={true} />
        <XAxis 
          type="number" 
          domain={[0, 'dataMax + 5']} 
          tickFormatter={(v) => `${v}%`} 
          stroke="var(--text-muted)" 
          tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
        />
        <YAxis 
          dataKey="name" 
          type="category" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: 'var(--text-ink)', fontSize: 12, fontWeight: 500 }} 
          width={100}
        />
        <Tooltip 
          cursor={{ fill: 'var(--bg-subtle)' }}
          contentStyle={{ borderRadius: '4px', border: '1px solid var(--border-hairline)', backgroundColor: 'var(--bg-panel)', boxShadow: 'none' }}
          formatter={(val: any) => [`${Number(val).toFixed(1)}%`, 'Delay rate']}
          labelFormatter={(label, payload) => {
            const item = payload?.[0]?.payload;
            return `${label}${item?.carrier ? ` (${item.carrier})` : ''} · ${item?.flights?.toLocaleString()} flights`;
          }}
        />
        <Bar dataKey="rate" fill="var(--status-delayed)" radius={[0, 2, 2, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}
