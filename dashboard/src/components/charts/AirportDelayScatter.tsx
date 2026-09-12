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
      <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
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
          contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }}
          formatter={(value: number, name: string) => [
            name === 'Volume' ? new Intl.NumberFormat('en-US').format(value) : `${value.toFixed(1)} mins`, 
            name
          ]}
        />
        {/* y=x reference line */}
        <ReferenceLine 
          segment={[{ x: -10, y: -10 }, { x: 60, y: 60 }]} 
          stroke="var(--text-muted)" 
          strokeDasharray="3 3" 
          label={{ position: 'top', value: 'Dep = Arr Delay', fill: 'var(--text-muted)', fontSize: 12 }} 
        />
        <Scatter 
          name="Airports" 
          data={chartData} 
          fill="var(--secondary)" 
          fillOpacity={0.8}
          activeShape={{ fill: 'var(--primary)', stroke: 'var(--surface)', strokeWidth: 2 }}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
