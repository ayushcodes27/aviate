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
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1>Airport Operations</h1>
            {airport && (
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
                {airport} <span style={{ color: 'var(--text-muted)' }}>&times;</span>
              </Link>
            )}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
            Departure and arrival volume and average delay offsets across US airports.
          </p>
        </div>
      </div>

      {/* Visual Analytics Sections - Full Width Stacking */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>

        {/* Full-Width Hero Scatter Plot */}
        <div className="panel" style={{ width: '100%', padding: '1.25rem 1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Departure vs arrival delay</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
              Operational matrix highlighting airport efficiency, delay accumulation, and en-route recovery.
            </p>
          </div>
          <AirportDelayScatter data={airports} />
        </div>

        {/* Full-Width Volume Bar Chart */}
        <div className="panel" style={{ width: '100%', padding: '1.25rem 1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Busiest airports by volume</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
              Total flight departures and arrivals across primary hubs.
            </p>
          </div>
          <BusiestAirportsBar data={airports} />
        </div>

      </div>

      {/* Detailed Data Table */}
      <AirportsTable data={airports} />
    </div>
  );
}