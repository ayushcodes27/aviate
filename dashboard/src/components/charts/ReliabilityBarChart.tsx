'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ReliabilityBarChart({ data }: { data: any[] }) {
  // Sort data descending by reliability_score and take top 10
  const chartData = [...data]
    .sort((a, b) => b.reliability_score - a.reliability_score)
    .slice(0, 10);

  const getScoreColor = (score: number) => {
    if (score >= 84.5) return 'var(--success)';
    if (score >= 82) return '#84cc16'; // lime/yellow-green
    if (score >= 80) return 'var(--warning)';
    return 'var(--error)';
  };

  const minScore = chartData.length > 0 ? Math.min(...chartData.map(d => d.reliability_score)) : 0;
  const maxScore = chartData.length > 0 ? Math.max(...chartData.map(d => d.reliability_score)) : 100;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={true} vertical={false} />
        <XAxis 
          type="number" 
          domain={[Math.max(0, Math.floor(minScore - 2)), Math.min(100, Math.ceil(maxScore + 2))]} 
          tickFormatter={(value) => `${value}%`} 
          stroke="var(--text-muted)" 
          tick={{ fill: 'var(--text-muted)' }} 
        />
        <YAxis 
          type="category" 
          dataKey="carrier" 
          stroke="var(--text-muted)" 
          tick={{ fill: 'var(--text-secondary)', fontWeight: 500 }} 
        />
        <Tooltip 
          cursor={{ fill: 'var(--surface-hover)' }}
          contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px' }}
          formatter={(value: number) => [`${value.toFixed(1)}%`, 'Reliability']}
        />
        <Bar dataKey="reliability_score" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getScoreColor(entry.reliability_score)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
