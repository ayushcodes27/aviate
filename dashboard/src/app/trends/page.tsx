import { supabase } from '@/lib/supabase';
import DailyTrendsLine from '@/components/charts/DailyTrendsLine';
import DelayCausesStackedArea from '@/components/charts/DelayCausesStackedArea';

export const revalidate = 3600;

export default async function Trends({ searchParams }: { searchParams: { range?: string } }) {
  const range = (await searchParams)?.range || 'all';
  let trends: any[] = [];
  let causes: any[] = [];
  try {
    let trendQuery = supabase.from('mart_delay_trends').select('*').order('flight_date', { ascending: false });
    if (range !== 'all') {
      trendQuery = trendQuery.gte('flight_date', `${range}-01-01`).lte('flight_date', `${range}-12-31`);
    }
    const trendRes = await trendQuery;
    if (trendRes.data) trends = trendRes.data;

    // Fetch causes with pagination to bypass the 1000 row limit
    let allCauses: any[] = [];
    let offset = 0;
    while (true) {
      let q = supabase.from('mart_delay_causes').select('*').range(offset, offset + 999);
      if (range !== 'all') {
        q = q.gte('flight_date', `${range}-01-01`).lte('flight_date', `${range}-12-31`);
      }
      const { data, error } = await q;
      if (error || !data || data.length === 0) break;
      allCauses.push(...data);
      offset += 1000;
      if (offset >= 20000) break; // Hard limit for safety
    }
    causes = allCauses;
  } catch (err) {
    console.error("Supabase fetch error:", err);
  }

  return (
    <div className="container animate-fade-in">
      <h1>Delay Trends</h1>
      <p style={{ marginBottom: '2rem' }}>Summary of delayed and cancelled flights across the selected time period.</p>
      
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>Daily Delays & Cancellations</h2>
        <DailyTrendsLine data={trends} />
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>Delay Cause Breakdown</h2>
        <DelayCausesStackedArea data={causes} />
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Total Delayed</th>
              <th>Total Cancelled</th>
              <th>Avg Daily Delay (m)</th>
            </tr>
          </thead>
          <tbody>
            {trends?.map((trend: any) => (
              <tr key={trend.flight_date}>
                <td><strong>{trend.flight_date}</strong></td>
                <td>{trend.total_delayed_flights?.toLocaleString()}</td>
                <td>{trend.total_cancelled_flights?.toLocaleString()}</td>
                <td>{trend.avg_daily_delay ? trend.avg_daily_delay.toFixed(1) : '-'}</td>
              </tr>
            ))}
            {!trends?.length && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>No data available. Please sync from Airflow.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
