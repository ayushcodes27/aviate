'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const STATUS_COLORS = [
  'var(--status-ontime)',
  'var(--status-delayed)',
  'var(--status-cancelled)',
  'var(--status-diverted)'
];

export default function FlightStatusDonut({ data }: { data: any[] }) {
  // Aggregate data
  let total = 0, delayed = 0, cancelled = 0, diverted = 0;
  data.forEach(row => {
    total += Number(row.total_flights || 0);
    delayed += Number(row.delayed_flights || 0);
    cancelled += Number(row.cancelled_flights || 0);
    diverted += Number(row.diverted_flights || 0);
  });

  const onTime = total - (delayed + cancelled + diverted);

  const chartData = [
    { name: 'On-time', value: onTime },
    { name: 'Delayed', value: delayed },
    { name: 'Cancelled', value: cancelled },
    { name: 'Diverted', value: diverted },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
        <Pie
          data={chartData}
          cx="50%"
          cy="44%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
          dataKey="value"
          stroke="var(--bg-panel)"
          strokeWidth={2}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: any) => [
            `${new Intl.NumberFormat('en-US').format(Number(value || 0))} (${total > 0 ? ((Number(value || 0) / total) * 100).toFixed(1) : 0}%)`
          ]}
          contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-hairline)', borderRadius: '4px', color: 'var(--text-ink)', boxShadow: 'none' }}
        />
        <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '8px', fontSize: '12px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}