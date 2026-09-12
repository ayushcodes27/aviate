import { supabase } from '@/lib/supabase';
import FlightStatusDonut from '@/components/charts/FlightStatusDonut';
import MonthlyDelayArea from '@/components/charts/MonthlyDelayArea';

export const revalidate = 3600; // revalidate every hour

export default async function Home({ searchParams }: { searchParams: { range?: string } }) {
  const range = (await searchParams)?.range || 'all';
  let trendData: any[] = [];
  let airlineData: any[] = [];
  
  try {
    let trendQuery = supabase.from('mart_delay_trends').select('*').order('flight_date', { ascending: true });
    let airlineQuery = supabase.from('mart_airline_performance').select('*');

    if (range !== 'all') {
      trendQuery = trendQuery.gte('flight_date', `${range}-01-01`).lte('flight_date', `${range}-12-31`);
      airlineQuery = airlineQuery.gte('flight_month', `${range}-01-01`).lte('flight_month', `${range}-12-31`);
    }

    const [trendRes, airlineRes] = await Promise.all([
      trendQuery,
      airlineQuery
    ]);
    
    if (trendRes.data) trendData = trendRes.data;
    if (airlineRes.data) airlineData = airlineRes.data;
  } catch (err) {
    console.error("Supabase fetch error:", err);
  }

  // Calculate KPIs
  let totalFlights = 0;
  let totalDelayed = 0;
  let totalCancelled = 0;
  let totalDelayMins = 0;

  airlineData.forEach(row => {
    totalFlights += Number(row.total_flights || 0);
    totalDelayed += Number(row.delayed_flights || 0);
    totalCancelled += Number(row.cancelled_flights || 0);
    totalDelayMins += Number(row.avg_delay_minutes || 0) * Number(row.delayed_flights || 0); // rough approximation
  });

  const onTimeRate = totalFlights > 0 ? ((totalFlights - totalDelayed - totalCancelled) / totalFlights * 100).toFixed(1) : "0.0";
  const cancelRate = totalFlights > 0 ? (totalCancelled / totalFlights * 100).toFixed(1) : "0.0";
  const avgDelay = totalDelayed > 0 ? (totalDelayMins / totalDelayed).toFixed(0) : "0";

  return (
    <div className="container animate-fade-in">
      <h1>Flight Operations Overview</h1>
      <p style={{ marginBottom: '2rem' }}>High-level KPI summary of recent flight performance.</p>
      
      <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
        <div className="card hero-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2>On-Time Performance</h2>
          <p style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--success)', lineHeight: 1 }}>{onTimeRate}%</p>
          <p style={{ marginTop: '0.5rem' }}>System-wide average</p>
        </div>
        <div className="card">
          <h2>Total Cancellations</h2>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--error)' }}>{cancelRate}%</p>
          <p>System-wide rate</p>
        </div>
        <div className="card">
          <h2>Avg Delay</h2>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning)' }}>{avgDelay} mins</p>
          <p>Per delayed flight</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h2>Flight Status Breakdown</h2>
          <FlightStatusDonut data={airlineData} />
        </div>
        <div className="card">
          <h2>Monthly Delay Trend</h2>
          <MonthlyDelayArea data={trendData} />
        </div>
      </div>
    </div>
  );
}
