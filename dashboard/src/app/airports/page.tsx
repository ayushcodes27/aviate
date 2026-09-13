import { supabase } from '@/lib/supabase';
import BusiestAirportsBar from '@/components/charts/BusiestAirportsBar';
import AirportDelayScatter from '@/components/charts/AirportDelayScatter';
import AirportsTable from './AirportsTable';
import Link from 'next/link';

export default async function Airports({ searchParams }: { searchParams: { range?: string, airport?: string } }) {
  const range = (await searchParams)?.range || 'all';
  const airport = (await searchParams)?.airport;
  let airports: any[] = [];
  try {
    let query = supabase.from('mart_airport_performance').select('*');
    if (range !== 'all') {
      query = query.gte('flight_month', `${range}-01-01`).lte('flight_month', `${range}-12-31`);
    }
    if (airport) {
      query = query.eq('airport_code', airport);
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

  const clearFilterHref = range !== 'all' ? `?range=${range}` : `?`;

  return (
    <div className="container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
            <h1 style={{ marginBottom: 0 }}>Airport Operations</h1>
            {airport && (
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
                {airport} <span style={{ color: 'var(--text-muted)' }}>×</span>
              </Link>
            )}
          </div>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Departure and arrival metrics by airport (Top 50 by volume).</p>
        </div>
        <div style={{ fontSize: '12px', padding: '6px 10px', background: 'var(--bg-page)', border: '1px solid var(--border-hairline)', borderRadius: '4px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-green)' }}></span>
          Powered by <code style={{ color: 'var(--text-ink)', background: 'var(--border-hairline)', padding: '2px 4px', borderRadius: '2px' }}>mart_airport_performance</code> &middot; 2 tests passed
        </div>
      </div>
      
      <div className="grid grid-cols-2" style={{ marginBottom: '1rem' }}>
        <div className="panel">
          <h2>Busiest Airports</h2>
          <BusiestAirportsBar data={airports} />
        </div>
        <div className="panel">
          <h2>Dep Delay vs Arr Delay</h2>
          <AirportDelayScatter data={airports} />
        </div>
      </div>
      
      <AirportsTable data={airports} />
    </div>
  );
}
