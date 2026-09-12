'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function DailyTrendsLine({ data }: { data: any[] }) {
  const chartData = [...data].reverse().map(row => ({
    ...row,
    date: row.flight_date,
    delay_rate: row.total_flights > 0 ? (row.total_delayed_flights / row.total_flights) * 100 : 0,
    cancel_rate: row.total_flights > 0 ? (row.total_cancelled_flights / row.total_flights) * 100 : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis 
          dataKey="date" 
          stroke="var(--text-muted)"
          tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
          tickMargin={10}
          tickFormatter={(val) => {
            if (!val || typeof val !== 'string') return val;
            const parts = val.split('-');
            if (parts.length >= 2) {
               const year = parts[0].slice(2);
               const monthIndex = parseInt(parts[1], 10) - 1;
               const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
               return `${months[monthIndex] || ''} '${year}`;
            }
            return val;
          }}
        />
        <YAxis 
          stroke="var(--text-muted)" 
          tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
          tickFormatter={(value) => `${value.toFixed(0)}%`}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }}
          formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name === 'delay_rate' ? 'Delay Rate' : 'Cancellation Rate']}
        />
        <Legend wrapperStyle={{ paddingTop: '10px' }} />
        <Line type="monotone" dataKey="delay_rate" name="Delay Rate" stroke="var(--warning)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
        <Line type="monotone" dataKey="cancel_rate" name="Cancellation Rate" stroke="var(--error)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
