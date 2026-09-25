'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReliabilityBarChart({ data }: { data: any[] }) {
  // Sort data descending by reliability_score and take top 10
  const chartData = [...data]
    .sort((a, b) => b.reliability_score - a.reliability_score)
    .slice(0, 10)
    .map((d, index) => ({
      ...d,
      rank: index + 1,
      displayName: index === 0 ? `${d.carrier} ★` : d.carrier
    }));

  const minScore = chartData.length > 0 ? Math.min(...chartData.map(d => d.reliability_score)) : 0;
  const maxScore = chartData.length > 0 ? Math.max(...chartData.map(d => d.reliability_score)) : 100;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" horizontal={false} vertical={true} />
        <XAxis 
          type="number" 
          domain={[Math.max(0, Math.floor(minScore - 2)), Math.min(100, Math.ceil(maxScore + 1))]} 
          tickFormatter={(value) => `${value}%`} 
          stroke="var(--text-muted)" 
          tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
        />
        <YAxis 
          type="category" 
          dataKey="displayName" 
          stroke="var(--text-muted)" 
          tick={{ fill: 'var(--text-ink)', fontSize: 12, fontWeight: 500 }} 
          width={150}
        />
        <Tooltip 
          cursor={{ fill: 'var(--bg-subtle)' }}
          contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-hairline)', borderRadius: '4px', boxShadow: 'none' }}
          formatter={(value: any) => [`${Number(value || 0).toFixed(1)}%`, 'Reliability score']}
          labelFormatter={(_, payload) => {
            const item = payload?.[0]?.payload;
            return item ? `${item.carrier} (Rank #${item.rank})` : '';
          }}
        />
        <Bar 
          dataKey="reliability_score" 
          fill="var(--data-primary)" 
          radius={[0, 2, 2, 0]} 
          barSize={16}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
