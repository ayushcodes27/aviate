'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';

export default function DailyTrendsLine({ data }: { data: any[] }) {
  const chartData = [...data].reverse().map(row => ({
    ...row,
    date: row.flight_date,
    delay_rate: row.total_flights > 0 ? (row.total_delayed_flights / row.total_flights) * 100 : 0,
    cancel_rate: row.total_flights > 0 ? (row.total_cancelled_flights / row.total_flights) * 100 : 0,
  }));

  const covidDate = chartData.find(d => d.date && d.date.startsWith('2020-03-15'))?.date || chartData.find(d => d.date && d.date.startsWith('2020-03'))?.date;
  const stormDate = chartData.find(d => d.date && d.date.startsWith('2022-12-23'))?.date;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" vertical={false} />
        <XAxis 
          dataKey="date" 
          stroke="var(--text-muted)"
          tick={{ fill: 'var(--text-muted)', fontSize: 11, angle: -45, textAnchor: 'end' }} 
          tickMargin={12}
          minTickGap={25}
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
          contentStyle={{ borderRadius: '4px', border: '1px solid var(--border-hairline)', backgroundColor: 'var(--bg-panel)', boxShadow: 'none' }}
          formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name === 'delay_rate' ? 'Delay rate' : 'Cancellation rate']}
        />
        {covidDate && (
          <ReferenceLine 
            x={covidDate} 
            stroke="rgba(26, 34, 51, 0.75)" 
            strokeWidth={1.5}
            strokeDasharray="4 4"
            label={{ value: "Mar '20: COVID-19", position: 'insideTopLeft', fill: 'var(--text-ink)', fontSize: 11, fontWeight: 500, offset: 8 }}
          />
        )}
        {stormDate && (
          <ReferenceLine 
            x={stormDate} 
            stroke="rgba(26, 34, 51, 0.75)" 
            strokeWidth={1.5}
            strokeDasharray="4 4"
            label={{ value: "Dec '22: Storm Elliott", position: 'insideTopLeft', fill: 'var(--text-ink)', fontSize: 11, fontWeight: 500, offset: 8 }}
          />
        )}
        <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '8px', fontSize: '12px' }} />
        <Line type="monotone" dataKey="delay_rate" name="Delay rate" stroke="var(--status-delayed)" strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} />
        <Line type="monotone" dataKey="cancel_rate" name="Cancellation rate" stroke="var(--status-cancelled)" strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
