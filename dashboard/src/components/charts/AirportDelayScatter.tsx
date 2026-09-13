'use client';

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, ReferenceLine } from 'recharts';

export default function AirportDelayScatter({ data }: { data: any[] }) {
  const chartData = data
    .filter(d => d.avg_departure_delay !== null && d.avg_arrival_delay !== null)
    .map(d => ({
      name: d.airport_code,
      depDelay: Number(d.avg_departure_delay),
      arrDelay: Number(d.avg_arrival_delay),
      volume: Number(d.total_departures || 0) + Number(d.total_arrivals || 0)
    }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" />
        <XAxis 
          type="number" 
          dataKey="depDelay" 
          name="Departure Delay" 
          unit="m" 
          stroke="var(--text-muted)" 
          tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          label={{ value: 'Avg Departure Delay (min)', position: 'bottom', fill: 'var(--text-secondary)' }}
        />
        <YAxis 
          type="number" 
          dataKey="arrDelay" 
          name="Arrival Delay" 
          unit="m" 
          stroke="var(--text-muted)" 
          tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          label={{ value: 'Avg Arrival Delay (min)', angle: -90, position: 'insideLeft', fill: 'var(--text-secondary)' }}
        />
        <ZAxis type="number" dataKey="volume" range={[200, 1000]} name="Volume" />
        <Tooltip 
          cursor={{ strokeDasharray: '3 3' }} 
          contentStyle={{ borderRadius: '4px', border: '1px solid var(--border-hairline)', boxShadow: 'none' }}
          formatter={(value: number, name: string) => [value.toFixed(1), name === 'x' ? 'Avg Dep Delay (m)' : 'Avg Arr Delay (m)']}
        />
        <Scatter name="Airports" data={chartData} fill="var(--text-ink)" />
        <ReferenceLine 
          segment={[{ x: -20, y: -20 }, { x: 60, y: 60 }]} 
          stroke="var(--border-hairline)" 
          strokeDasharray="3 3"
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
