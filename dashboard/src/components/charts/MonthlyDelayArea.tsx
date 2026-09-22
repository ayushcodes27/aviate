'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';

export default function MonthlyDelayArea({ data }: { data: any[] }) {
  // Aggregate daily to monthly
  const monthlyMap = new Map();
  
  data.forEach(row => {
    if (!row.flight_date) return;
    const month = row.flight_date.substring(0, 7); // YYYY-MM
    if (!monthlyMap.has(month)) {
      monthlyMap.set(month, { month, delayed: 0, cancelled: 0 });
    }
    monthlyMap.get(month).delayed += Number(row.total_delayed_flights || 0);
    monthlyMap.get(month).cancelled += Number(row.total_cancelled_flights || 0);
  });

  const chartData = Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));

  const hasCovid = chartData.some(d => d.month === '2020-03');
  const hasAtc = chartData.some(d => d.month === '2022-07');
  const hasStorm = chartData.some(d => d.month === '2022-12');

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
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
          contentStyle={{ backgroundColor: 'var(--bg-panel)', borderRadius: '4px', border: '1px solid var(--border-hairline)', boxShadow: 'none', color: 'var(--text-ink)' }}
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
          formatter={(value: number) => new Intl.NumberFormat('en-US').format(value)}
        />
        {hasCovid && (
          <ReferenceLine 
            x="2020-03" 
            stroke="rgba(26, 34, 51, 0.75)" 
            strokeWidth={1.5}
            strokeDasharray="4 4"
            label={{ value: "Mar '20: COVID-19", position: 'insideTopLeft', fill: 'var(--text-ink)', fontSize: 10, fontWeight: 500, offset: 6 }}
          />
        )}
        {hasAtc && (
          <ReferenceLine 
            x="2022-07" 
            stroke="rgba(26, 34, 51, 0.75)" 
            strokeWidth={1.5}
            strokeDasharray="4 4"
            label={{ value: "Jul '22: ATC staffing", position: 'insideTopLeft', fill: 'var(--text-ink)', fontSize: 10, fontWeight: 500, offset: 6 }}
          />
        )}
        {hasStorm && (
          <ReferenceLine 
            x="2022-12" 
            stroke="rgba(26, 34, 51, 0.75)" 
            strokeWidth={1.5}
            strokeDasharray="4 4"
            label={{ value: "Dec '22: Storm Elliott", position: 'insideTopLeft', fill: 'var(--text-ink)', fontSize: 10, fontWeight: 500, offset: 6 }}
          />
        )}
        <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '8px', fontSize: '12px' }} />
        <Area type="monotone" dataKey="delayed" name="Delayed" stroke="var(--status-delayed)" fill="transparent" strokeWidth={2} />
        <Area type="monotone" dataKey="cancelled" name="Cancelled" stroke="var(--status-cancelled)" fill="transparent" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
