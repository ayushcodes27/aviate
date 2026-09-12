import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ReliabilityBarChart from '@/components/charts/ReliabilityBarChart';
import DelayVsCancelGroupedBar from '@/components/charts/DelayVsCancelGroupedBar';

export default async function Airlines({ searchParams }: { searchParams: { range?: string } }) {
  const range = (await searchParams)?.range || 'all';
  let airlines: any[] = [];
  try {
    let query = supabase.from('mart_airline_performance').select('*');
    if (range !== 'all') {
      query = query.gte('flight_month', `${range}-01-01`).lte('flight_month', `${range}-12-31`);
    }
    const { data } = await query;
    if (data) {
      // Aggregate by carrier
      const agg = new Map<string, any>();
      data.forEach(row => {
        if (!agg.has(row.carrier)) {
          agg.set(row.carrier, {
            carrier: row.carrier,
            total_flights: 0,
            delayed_flights: 0,
            cancelled_flights: 0,
            diverted_flights: 0,
            avg_delay_minutes: 0,
          });
        }
        const curr = agg.get(row.carrier);
        curr.total_flights += Number(row.total_flights || 0);
        curr.delayed_flights += Number(row.delayed_flights || 0);
        curr.cancelled_flights += Number(row.cancelled_flights || 0);
        curr.diverted_flights += Number(row.diverted_flights || 0);
        curr.avg_delay_minutes += Number(row.avg_delay_minutes || 0) * Number(row.delayed_flights || 0);
      });
      airlines = Array.from(agg.values()).map(row => {
        row.avg_delay_minutes = row.delayed_flights > 0 ? row.avg_delay_minutes / row.delayed_flights : 0;
        row.reliability_score = row.total_flights > 0 ? ((row.total_flights - row.delayed_flights - row.cancelled_flights) / row.total_flights) * 100 : 0;
        return row;
      }).sort((a, b) => b.reliability_score - a.reliability_score);
    }
  } catch (err) {
    console.error("Supabase fetch error:", err);
  }

  const getScoreColor = (score: number) => {
    if (score >= 84.5) return 'var(--success)';
    if (score >= 82) return '#84cc16'; // lime/yellow-green
    if (score >= 80) return 'var(--warning)';
    return 'var(--error)';
  };

  return (
    <div className="container animate-fade-in">
      <h1>Airline Performance</h1>
      <p style={{ marginBottom: '2rem' }}>Leaderboard of airlines sorted by operational reliability.</p>
      
      <div className="grid grid-cols-2" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h2>Reliability Scores</h2>
          <ReliabilityBarChart data={airlines} />
        </div>
        <div className="card">
          <h2>Delay vs Cancellations</h2>
          <DelayVsCancelGroupedBar data={airlines} />
        </div>
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Carrier</th>
              <th>Total Flights</th>
              <th>Delayed</th>
              <th>Cancelled</th>
              <th title="Negative values indicate early arrivals">Avg Arrival Offset (m)</th>
              <th>Reliability Score</th>
            </tr>
          </thead>
          <tbody>
            {airlines?.map((airline: any) => (
              <tr key={airline.carrier}>
                <td>
                  <strong>
                    <Link 
                      href={`/routes?carrier=${encodeURIComponent(airline.carrier)}`} 
                      style={{ color: 'var(--primary)', textDecoration: 'underline', textUnderlineOffset: '4px' }}
                    >
                      {airline.carrier}
                    </Link>
                  </strong>
                </td>
                <td>{airline.total_flights?.toLocaleString()}</td>
                <td>{airline.delayed_flights?.toLocaleString()}</td>
                <td>{airline.cancelled_flights?.toLocaleString()}</td>
                <td>{airline.avg_delay_minutes ? airline.avg_delay_minutes.toFixed(1) : '-'}</td>
                <td style={{ color: getScoreColor(airline.reliability_score), fontWeight: 'bold' }}>
                  {airline.reliability_score ? `${airline.reliability_score.toFixed(1)}%` : '-'}
                </td>
              </tr>
            ))}
            {!airlines?.length && (
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
