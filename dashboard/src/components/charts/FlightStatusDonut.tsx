'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, Label } from 'recharts';

const COLORS = ['var(--success)', 'var(--warning)', 'var(--error)', 'var(--text-muted)'];

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
  const onTimeRate = total > 0 ? ((onTime / total) * 100).toFixed(1) : "0.0";

  const chartData = [
    { name: 'On-Time', value: onTime },
    { name: 'Delayed', value: delayed },
    { name: 'Cancelled', value: cancelled },
    { name: 'Diverted', value: diverted },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={110}
          paddingAngle={5}
          dataKey="value"
          stroke="none"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
          <Label 
            value={`${onTimeRate}%`} 
            position="center" 
            dy={-10} 
            style={{ fontSize: '24px', fontWeight: 'bold', fill: 'var(--text-primary)' }} 
          />
          <Label 
            value="On-Time" 
            position="center" 
            dy={15} 
            style={{ fontSize: '14px', fill: 'var(--text-secondary)' }} 
          />
        </Pie>
        <Tooltip 
          formatter={(value: number) => new Intl.NumberFormat('en-US').format(value)}
          contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }}
          itemStyle={{ color: 'var(--text-primary)' }}
        />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
