'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function DelayCausesStackedArea({ data }: { data: any[] }) {
  // Aggregate causes by month
  const monthlyMap = new Map();

  data.forEach(row => {
    if (!row.flight_month) return;
    const month = row.flight_month.substring(0, 7); // YYYY-MM
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
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" vertical={false} />
        <XAxis
          dataKey="month"
          stroke="var(--text-muted)"
          tick={{ fill: 'var(--text-muted)', fontSize: 11, angle: -45, textAnchor: 'end' }}
          tickMargin={12}
          minTickGap={20}
          tickFormatter={(val) => {
            if (!val || typeof val !== 'string') return val;
            const parts = val.split('-');
            if (parts.length >= 2) {
              const year = parts[0].slice(2);
              const monthIndex = parseInt(parts[1], 10) - 1;
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              return `${months[monthIndex] || parts[1]} '${year}`;
            }
            return val;
          }}
        />
        <YAxis
          stroke="var(--text-muted)"
          tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(value)}
        />
        <Tooltip
          contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-hairline)', borderRadius: '4px', color: 'var(--text-ink)', boxShadow: 'none' }}
          labelFormatter={(label) => {
            if (!label || typeof label !== 'string') return label;
            const parts = label.split('-');
            if (parts.length >= 2) {
              const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
              const monthIndex = parseInt(parts[1], 10) - 1;
              return `${months[monthIndex] || parts[1]} ${parts[0]}`;
            }
            return label;
          }}
          formatter={(value: any) => [`${new Intl.NumberFormat('en-US').format(Number(value || 0))} min`]}
        />
        <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }} />
        <Area type="monotone" dataKey="late_aircraft" stackId="1" name="Late aircraft" stroke="#7C5AC2" fill="#7C5AC2" fillOpacity={0.8} />
        <Area type="monotone" dataKey="nas" stackId="1" name="NAS" stroke="var(--status-delayed)" fill="var(--status-delayed)" fillOpacity={0.8} />
        <Area type="monotone" dataKey="carrier" stackId="1" name="Carrier" stroke="var(--data-primary)" fill="var(--data-primary)" fillOpacity={0.8} />
        <Area type="monotone" dataKey="weather" stackId="1" name="Weather" stroke="#2E7D9E" fill="#2E7D9E" fillOpacity={0.8} />
        <Area type="monotone" dataKey="security" stackId="1" name="Security" stroke="var(--status-cancelled)" fill="var(--status-cancelled)" fillOpacity={0.8} />
      </AreaChart>
    </ResponsiveContainer>
  );
}