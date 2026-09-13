import { supabase } from '@/lib/supabase';
import RouteDelayBar from '@/components/charts/RouteDelayBar';
import RoutesTable from './RoutesTable';
import Link from 'next/link';

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

  const clearFilterHref = range !== 'all' ? `?range=${range}` : `?`;

  return (
    <div className="container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
            <h1 style={{ marginBottom: 0 }}>Route Performance</h1>
            {carrier && (
              <Link 
                href={clearFilterHref}
                style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.25rem 0.5rem',
                  border: '1px solid var(--border-hairline)',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  color: 'var(--text-ink)',
                  backgroundColor: 'var(--bg-panel)'
                }}
              >
                {carrier} <span style={{ color: 'var(--text-muted)' }}>×</span>
              </Link>
            )}
          </div>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Analysis of flight routes, highlighting the worst offenders by delay rate.</p>
        </div>
        <div style={{ fontSize: '12px', padding: '6px 10px', background: 'var(--bg-page)', border: '1px solid var(--border-hairline)', borderRadius: '4px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-green)' }}></span>
          Powered by <code style={{ color: 'var(--text-ink)', background: 'var(--border-hairline)', padding: '2px 4px', borderRadius: '2px' }}>mart_route_reliability</code>
        </div>
      </div>
      
      <div className="panel" style={{ marginBottom: '1rem' }}>
        <h2>Worst Routes by Delay Rate</h2>
        <RouteDelayBar data={routes} />
      </div>
      
      <RoutesTable data={routes} />
    </div>
  );
}
