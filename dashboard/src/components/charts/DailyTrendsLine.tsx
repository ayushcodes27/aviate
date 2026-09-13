'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';

export default function DailyTrendsLine({ data }: { data: any[] }) {
  const chartData = [...data].reverse().map(row => ({
    ...row,
    date: row.flight_date,
    delay_rate: row.total_flights > 0 ? (row.total_delayed_flights / row.total_flights) * 100 : 0,
    cancel_rate: row.total_flights > 0 ? (row.total_cancelled_flights / row.total_flights) * 100 : 0,
  }));

  // Determine if Mar 15, 2020 is in the dataset (or just March 2020)
  const covidDate = chartData.find(d => d.date && d.date.startsWith('2020-03'))?.date;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
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
          contentStyle={{ borderRadius: '4px', border: '1px solid var(--border-hairline)', boxShadow: 'none' }}
          formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name === 'delay_rate' ? 'Delay Rate' : 'Cancellation Rate']}
        />
        {covidDate && (
          <ReferenceLine 
            x={covidDate} 
            stroke="var(--text-muted)" 
            strokeDasharray="3 3"
            label={{ value: "COVID-19", position: 'insideTopLeft', fill: 'var(--text-muted)', fontSize: 11, offset: 10 }}
          />
        )}
        <Legend wrapperStyle={{ paddingTop: '10px' }} />
        <Line type="monotone" dataKey="delay_rate" name="Delay Rate" stroke="var(--accent-amber)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        <Line type="monotone" dataKey="cancel_rate" name="Cancellation Rate" stroke="var(--accent-red)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
