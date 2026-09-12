'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MonthlyDelayArea({ data }: { data: any[] }) {
  // Aggregate daily to monthly
  const monthlyMap = new Map();
  
  data.forEach(row => {
    // flight_date is YYYY-MM-DD
    if (!row.flight_date) return;
    const month = row.flight_date.substring(0, 7); // YYYY-MM
    if (!monthlyMap.has(month)) {
      monthlyMap.set(month, { month, delayed: 0 });
    }
    monthlyMap.get(month).delayed += Number(row.total_delayed_flights || 0);
  });

  const chartData = Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorDelay" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
          </linearGradient>
        </defs>
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
          contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }}
          itemStyle={{ color: 'var(--primary)' }}
          formatter={(value: number) => new Intl.NumberFormat('en-US').format(value)}
        />
        <Area type="monotone" dataKey="delayed" name="Delayed Flights" stroke="var(--primary)" fillOpacity={1} fill="url(#colorDelay)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
