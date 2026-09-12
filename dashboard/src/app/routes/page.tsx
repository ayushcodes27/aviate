import { supabase } from '@/lib/supabase';
import RouteDelayBar from '@/components/charts/RouteDelayBar';

export default async function Routes({ searchParams }: { searchParams: { range?: string, carrier?: string } }) {
  const range = (await searchParams)?.range || 'all';
  const carrier = (await searchParams)?.carrier;
  let routes: any[] = [];
  try {
    let query = supabase.from('mart_route_reliability').select('*');
    if (range !== 'all') {
      query = query.gte('flight_month', `${range}-01-01`).lte('flight_month', `${range}-12-31`);
    }
    if (carrier) {
      query = query.eq('carrier', carrier);
    }
    const { data } = await query;
    if (data) {
      const agg = new Map<string, any>();
      data.forEach(row => {
        const key = `${row.origin}-${row.dest}`;
        if (!agg.has(key)) {
          agg.set(key, {
            origin: row.origin,
            dest: row.dest,
            route_flights: 0,
            delay_rate: 0,
            cancellation_rate: 0,
            avg_route_delay: 0
          });
        }
        const curr = agg.get(key);
        const flights = Number(row.route_flights || 0);
        
        curr.delay_rate += Number(row.delay_rate || 0) * flights;
        curr.cancellation_rate += Number(row.cancellation_rate || 0) * flights;
        curr.avg_route_delay += Number(row.avg_route_delay || 0) * flights;
        curr.route_flights += flights;
      });
      routes = Array.from(agg.values())
        .filter(row => row.route_flights >= 100)
        .map(row => {
          row.delay_rate = row.route_flights > 0 ? row.delay_rate / row.route_flights : 0;
          row.cancellation_rate = row.route_flights > 0 ? row.cancellation_rate / row.route_flights : 0;
          row.avg_route_delay = row.route_flights > 0 ? row.avg_route_delay / row.route_flights : 0;
          return row;
        })
        .sort((a, b) => b.delay_rate - a.delay_rate);
    }
  } catch (err) {
    console.error("Supabase fetch error:", err);
  }

  return (
    <div className="container animate-fade-in">
      <h1>Route Performance</h1>
      <p style={{ marginBottom: '2rem' }}>Analysis of flight routes, highlighting the worst offenders by delay rate (minimum 100 flights).</p>
      
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>Worst Routes by Delay Rate</h2>
        <RouteDelayBar data={routes} />
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Origin</th>
              <th>Destination</th>
              <th>Carrier</th>
              <th>Total Flights</th>
              <th>Delay Rate</th>
              <th>Cancel Rate</th>
              <th>Avg Route Delay (m)</th>
            </tr>
          </thead>
          <tbody>
            {routes?.map((route: any, index: number) => (
              <tr key={`${route.origin}-${route.dest}-${route.carrier}-${index}`}>
                <td><strong>{route.origin}</strong></td>
                <td><strong>{route.dest}</strong></td>
                <td>{route.carrier}</td>
                <td>{route.route_flights?.toLocaleString()}</td>
                <td style={{ color: route.delay_rate > 20 ? 'var(--error)' : 'inherit' }}>
                  {route.delay_rate ? `${route.delay_rate.toFixed(1)}%` : '-'}
                </td>
                <td style={{ color: route.cancellation_rate > 5 ? 'var(--error)' : 'inherit' }}>
                  {route.cancellation_rate ? `${route.cancellation_rate.toFixed(1)}%` : '-'}
                </td>
                <td>{route.avg_route_delay ? route.avg_route_delay.toFixed(1) : '-'}</td>
              </tr>
            ))}
            {!routes?.length && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>No data available. Please sync from Airflow.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
