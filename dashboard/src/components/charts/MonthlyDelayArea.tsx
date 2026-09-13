'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function MonthlyDelayArea({ data }: { data: any[] }) {
  // Aggregate daily to monthly
  const monthlyMap = new Map();
  
  data.forEach(row => {
    // flight_date is YYYY-MM-DD
    if (!row.flight_date) return;
    const month = row.flight_date.substring(0, 7); // YYYY-MM
    if (!monthlyMap.has(month)) {
      monthlyMap.set(month, { month, delayed: 0, cancelled: 0 });
    }
    monthlyMap.get(month).delayed += Number(row.total_delayed_flights || 0);
    monthlyMap.get(month).cancelled += Number(row.total_cancelled_flights || 0);
  });

  const chartData = Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));

  // Determine if Mar 2020 is in the dataset
  const hasCovidEvent = chartData.some(d => d.month === '2020-03');

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis 
          dataKey="month" 
          stroke="var(--text-muted)" 
          tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
          tickMargin={10}
        />
        <YAxis 
          stroke="var(--text-muted)" 
          tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
          tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(value)}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '4px', border: '1px solid var(--border-hairline)', boxShadow: 'none', color: 'var(--text-primary)' }}
          labelFormatter={(label) => {
            const d = new Date(label);
            return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          }}
          formatter={(value: number) => new Intl.NumberFormat('en-US').format(value)}
        />
        {hasCovidEvent && (
          <ReferenceLine 
            x="2020-03" 
            stroke="var(--text-muted)" 
            strokeDasharray="3 3"
            label={{ value: "Mar 2020: COVID-19 travel restrictions begin", position: 'insideTopLeft', fill: 'var(--text-muted)', fontSize: 11, offset: 10 }}
          />
        )}
        <Area type="monotone" dataKey="delayed" name="Delayed Flights" stroke="var(--accent-amber)" fill="transparent" fillOpacity={0} strokeWidth={2} />
        <Area type="monotone" dataKey="cancelled" name="Cancelled Flights" stroke="var(--accent-red)" fill="transparent" fillOpacity={0} strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
