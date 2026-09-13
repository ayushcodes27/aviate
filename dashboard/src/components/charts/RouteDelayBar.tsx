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
          cursor={{ fill: 'rgba(0,0,0,0.05)' }}
          contentStyle={{ borderRadius: '4px', border: '1px solid var(--border-hairline)', boxShadow: 'none' }}
          formatter={(val: any) => [`${Number(val).toFixed(1)}%`, 'Delay Rate']}
          labelFormatter={(label, payload) => `${label} (${payload?.[0]?.payload?.carrier || 'Unknown'})`}
        />
        <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => {
            const rateVal = Number(entry.rate) || 0;
            let color = 'var(--accent-amber)';
            if (rateVal >= 35) color = '#8C2E27'; // darkest red
            else if (rateVal >= 30) color = 'var(--accent-red)';
            else if (rateVal >= 25) color = '#C0562E'; // red-amber transition
            
            return <Cell key={`cell-${index}`} fill={color} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
