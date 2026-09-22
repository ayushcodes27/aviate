import { supabase } from '@/lib/supabase';
import DailyTrendsLine from '@/components/charts/DailyTrendsLine';
import DelayCausesStackedArea from '@/components/charts/DelayCausesStackedArea';
import TrendsTable from './TrendsTable';

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
        q = q.gte('flight_month', `${range}-01-01`).lte('flight_month', `${range}-12-31`);
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
      <p style={{ marginBottom: '1rem' }}>Summary of delayed and cancelled flights across the selected time period.</p>
      
      <div className="panel" style={{ marginBottom: '1rem' }}>
        <h2>Daily Delays & Cancellations</h2>
        <DailyTrendsLine data={trends} />
      </div>

      <div className="panel" style={{ marginBottom: '1rem' }}>
        <h2>Delay Cause Breakdown</h2>
        <DelayCausesStackedArea data={causes} />
      </div>
      
      <TrendsTable data={trends} />
    </div>
  );
}
