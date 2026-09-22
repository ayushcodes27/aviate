import { supabase } from '@/lib/supabase';
import RouteDelayBar from '@/components/charts/RouteDelayBar';
import RoutesTable from './RoutesTable';
import Link from 'next/link';

export default async function Routes({ searchParams }: { searchParams: { range?: string, carrier?: string } }) {
  const range = (await searchParams)?.range || 'all';
  const carrier = (await searchParams)?.carrier;
  let routes: any[] = [];
  try {
    let query = supabase.from('mart_route_reliability')
      .select('*')
      .order('route_flights', { ascending: false })
      .limit(3000);

    if (range !== 'all') {
      query = query.gte('flight_month', `${range}-01-01`).lte('flight_month', `${range}-12-31`);
    }
    if (carrier) {
      query = query.eq('carrier', carrier);
    }
    const { data, error } = await query;
    if (error) {
      console.error("Supabase route error:", error);
    }
    if (data && data.length > 0) {
      const agg = new Map<string, any>();
      data.forEach(row => {
        const key = `${row.origin}-${row.dest}`;
        if (!agg.has(key)) {
          agg.set(key, {
            origin: row.origin,
            dest: row.dest,
            carrier: row.carrier,
            route_flights: 0,
            delay_rate: 0,
            cancellation_rate: 0,
            avg_route_delay: 0
          });
        }
        const curr = agg.get(key);
        const flights = Number(row.route_flights || row.total_flights || 0);

        curr.delay_rate += Number(row.delay_rate || 0) * flights;
        curr.cancellation_rate += Number(row.cancellation_rate || 0) * flights;
        curr.avg_route_delay += Number(row.avg_route_delay || 0) * flights;
        curr.route_flights += flights;
      });
      routes = Array.from(agg.values())
        .filter(row => row.route_flights > 0)
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

  const clearFilterHref = range !== 'all' ? `?range=${range}` : `?`;

  return (
    <div className="container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1>Route Performance</h1>
            {carrier && (
              <Link 
                href={clearFilterHref}
                style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.2rem 0.5rem',
                  border: '1px solid var(--border-hairline)',
                  borderRadius: '3px',
                  fontSize: '0.8125rem',
                  color: 'var(--text-ink)',
                  backgroundColor: 'var(--bg-panel)'
                }}
              >
                {carrier} <span style={{ color: 'var(--text-muted)' }}>&times;</span>
              </Link>
            )}
          </div>
          <p>Origin-to-destination flight corridor reliability and delay rankings.</p>
        </div>
      </div>
      
      <div className="panel" style={{ marginBottom: '1.5rem' }}>
        <h2>Worst routes by delay rate</h2>
        <RouteDelayBar data={routes} />
      </div>
      
      <RoutesTable data={routes} />
    </div>
  );
}