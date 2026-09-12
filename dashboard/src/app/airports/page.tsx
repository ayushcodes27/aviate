import { supabase } from '@/lib/supabase';
import BusiestAirportsBar from '@/components/charts/BusiestAirportsBar';
import AirportDelayScatter from '@/components/charts/AirportDelayScatter';

export default async function Airports({ searchParams }: { searchParams: { range?: string } }) {
  const range = (await searchParams)?.range || 'all';
  let airports: any[] = [];
  try {
    let query = supabase.from('mart_airport_performance').select('*');
    if (range !== 'all') {
      query = query.gte('flight_month', `${range}-01-01`).lte('flight_month', `${range}-12-31`);
    }
    const { data } = await query;
    if (data) {
      const agg = new Map<string, any>();
      data.forEach(row => {
        if (!agg.has(row.airport_code)) {
          agg.set(row.airport_code, {
            airport_code: row.airport_code,
            total_departures: 0,
            total_arrivals: 0,
            avg_departure_delay: 0,
            avg_arrival_delay: 0,
            total_cancellations: 0
          });
        }
        const curr = agg.get(row.airport_code);
        const total_dep = Number(row.total_departures || 0);
        const total_arr = Number(row.total_arrivals || 0);
        
        curr.avg_departure_delay += Number(row.avg_departure_delay || 0) * total_dep;
        curr.avg_arrival_delay += Number(row.avg_arrival_delay || 0) * total_arr;
        curr.total_departures += total_dep;
        curr.total_arrivals += total_arr;
        curr.total_cancellations += Number(row.total_cancellations || 0);
      });
      airports = Array.from(agg.values()).map(row => {
        row.avg_departure_delay = row.total_departures > 0 ? row.avg_departure_delay / row.total_departures : 0;
        row.avg_arrival_delay = row.total_arrivals > 0 ? row.avg_arrival_delay / row.total_arrivals : 0;
        row.total_flights = row.total_departures + row.total_arrivals;
        return row;
      }).sort((a, b) => b.total_flights - a.total_flights);
    }
  } catch (err) {
    console.error("Supabase fetch error:", err);
  }

  return (
    <div className="container animate-fade-in">
      <h1>Airport Operations</h1>
      <p style={{ marginBottom: '2rem' }}>Departure and arrival metrics by airport (Top 50 by volume).</p>
      
      <div className="grid grid-cols-2" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h2>Busiest Airports</h2>
          <BusiestAirportsBar data={airports} />
        </div>
        <div className="card">
          <h2>Dep Delay vs Arr Delay</h2>
          <AirportDelayScatter data={airports} />
        </div>
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Airport Code</th>
              <th>Departures</th>
              <th>Arrivals</th>
              <th>Avg Dep Delay (m)</th>
              <th>Avg Arr Delay (m)</th>
              <th>Total Cancellations</th>
            </tr>
          </thead>
          <tbody>
            {airports?.map((airport: any) => (
              <tr key={airport.airport_code}>
                <td><strong>{airport.airport_code}</strong></td>
                <td>{airport.total_departures?.toLocaleString()}</td>
                <td>{airport.total_arrivals?.toLocaleString()}</td>
                <td>{airport.avg_departure_delay ? airport.avg_departure_delay.toFixed(1) : '-'}</td>
                <td>{airport.avg_arrival_delay ? airport.avg_arrival_delay.toFixed(1) : '-'}</td>
                <td>{airport.total_cancellations?.toLocaleString()}</td>
              </tr>
            ))}
            {!airports?.length && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No data available. Please sync from Airflow.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
