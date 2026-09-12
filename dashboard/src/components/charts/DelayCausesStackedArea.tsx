'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function DelayCausesStackedArea({ data }: { data: any[] }) {
  // Aggregate causes by month
  const monthlyMap = new Map();
  
  data.forEach(row => {
    if (!row.flight_date) return;
    const month = row.flight_date.substring(0, 7); // YYYY-MM
    if (!monthlyMap.has(month)) {
      monthlyMap.set(month, { 
        month, 
        carrier: 0,
        weather: 0,
        nas: 0,
        security: 0,
        late_aircraft: 0
      });
    }
    const entry = monthlyMap.get(month);
    entry.carrier += Number(row.carrier_delay || 0);
    entry.weather += Number(row.weather_delay || 0);
    entry.nas += Number(row.nas_delay || 0);
    entry.security += Number(row.security_delay || 0);
    entry.late_aircraft += Number(row.late_aircraft_delay || 0);
  });

  const chartData = Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
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
          formatter={(value: number) => new Intl.NumberFormat('en-US').format(value)}
        />
        <Legend wrapperStyle={{ paddingTop: '10px' }} />
        <Area type="monotone" dataKey="late_aircraft" stackId="1" name="Late Aircraft" stroke="#8b5cf6" fill="#8b5cf6" />
        <Area type="monotone" dataKey="nas" stackId="1" name="NAS" stroke="#f59e0b" fill="#f59e0b" />
        <Area type="monotone" dataKey="carrier" stackId="1" name="Carrier" stroke="#3b82f6" fill="#3b82f6" />
        <Area type="monotone" dataKey="weather" stackId="1" name="Weather" stroke="#06b6d4" fill="#06b6d4" />
        <Area type="monotone" dataKey="security" stackId="1" name="Security" stroke="#ef4444" fill="#ef4444" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
