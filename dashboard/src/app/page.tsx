import { supabase } from '@/lib/supabase';
import FlightStatusDonut from '@/components/charts/FlightStatusDonut';
import MonthlyDelayArea from '@/components/charts/MonthlyDelayArea';
import ContextBanner from '@/components/ContextBanner';
import MetricStrip from '@/components/MetricStrip';

export const revalidate = 3600; // revalidate every hour

export default async function Home({ searchParams }: { searchParams: { range?: string } }) {
  const range = (await searchParams)?.range || 'all';
  let trendData: any[] = [];
  let airlineData: any[] = [];
  let priorAirlineData: any[] = [];
  
  try {
    let trendQuery = supabase.from('mart_delay_trends').select('*').order('flight_date', { ascending: true });
    let airlineQuery = supabase.from('mart_airline_performance').select('*');
    let priorAirlineQuery = supabase.from('mart_airline_performance').select('*');

    if (range !== 'all') {
      trendQuery = trendQuery.gte('flight_date', `${range}-01-01`).lte('flight_date', `${range}-12-31`);
      airlineQuery = airlineQuery.gte('flight_month', `${range}-01-01`).lte('flight_month', `${range}-12-31`);
      const priorYear = parseInt(range) - 1;
      priorAirlineQuery = priorAirlineQuery.gte('flight_month', `${priorYear}-01-01`).lte('flight_month', `${priorYear}-12-31`);
    } else {
      // For all time, compare most recent full year (2022) to prior year (2021)
      priorAirlineQuery = priorAirlineQuery.gte('flight_month', '2021-01-01').lte('flight_month', '2021-12-31');
      // and we need to fetch 2022 data as the 'current' for the diff
      // we'll filter airlineData in memory for 2022
    }

    const [trendRes, airlineRes, priorAirlineRes] = await Promise.all([
      trendQuery,
      airlineQuery,
      priorAirlineQuery
    ]);
    
    if (trendRes.data) trendData = trendRes.data;
    if (airlineRes.data) airlineData = airlineRes.data;
    if (priorAirlineRes.data) priorAirlineData = priorAirlineRes.data;
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
    totalDelayMins += Number(row.avg_delay_minutes || 0) * Number(row.delayed_flights || 0);
  });

  const onTimeRate = totalFlights > 0 ? ((totalFlights - totalDelayed - totalCancelled) / totalFlights * 100).toFixed(1) : "0.0";
  const cancelRate = totalFlights > 0 ? (totalCancelled / totalFlights * 100).toFixed(1) : "0.0";
  const avgDelay = totalDelayed > 0 ? (totalDelayMins / totalDelayed).toFixed(0) : "0";

  // Calculate Context
  let contextTitle = "";
  let contextText = "";
  let contextTrend: 'up' | 'down' | 'flat' | undefined = undefined;

  const getOnTimeRate = (data: any[]) => {
    let f = 0, d = 0, c = 0;
    data.forEach(r => { f += Number(r.total_flights||0); d += Number(r.delayed_flights||0); c += Number(r.cancelled_flights||0); });
    return f > 0 ? ((f - d - c) / f * 100) : null;
  };

  const priorRate = getOnTimeRate(priorAirlineData);
  
  if (range === 'all') {
    const data2022 = airlineData.filter(r => r.flight_month && r.flight_month.startsWith('2022'));
    const rate2022 = getOnTimeRate(data2022);
    if (rate2022 !== null && priorRate !== null) {
      const diff = rate2022 - priorRate;
      contextTrend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat';
      const diffText = Math.abs(diff).toFixed(1) + "pts";
      contextTitle = "2022 vs 2021 Performance";
      contextText = `${rate2022.toFixed(1)}% on-time in 2022 — ${diff > 0 ? 'up' : 'down'} ${diffText} from 2021 (${priorRate.toFixed(1)}%)`;
    }
  } else if (range !== '2019' && priorRate !== null) {
    const currRateNum = parseFloat(onTimeRate);
    const diff = currRateNum - priorRate;
    contextTrend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat';
    const priorYear = parseInt(range) - 1;
    contextTitle = `${range} Performance`;
    contextText = `${onTimeRate}% on-time — ${diff > 0 ? 'up' : 'down'} ${Math.abs(diff).toFixed(1)}pts from ${priorYear} (${priorRate.toFixed(1)}%)`;
  }

  const metrics = [
    { label: "On-Time Performance", value: `${onTimeRate}%`, subtext: "System-wide average", color: "var(--accent-green)" },
    { label: "Total Cancellations", value: `${cancelRate}%`, subtext: "System-wide rate", color: "var(--accent-red)" },
    { label: "Avg Delay", value: `${avgDelay} mins`, subtext: "Per delayed flight", color: "var(--accent-amber)" }
  ];

  return (
    <div className="container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Flight Operations Overview</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>High-level KPI summary of recent flight performance.</p>
        </div>
        
        {/* Scale Callout */}
        <div 
          className="panel" 
          style={{ 
            padding: '12px 16px', 
            margin: 0, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-end',
            backgroundColor: 'var(--bg-page)'
          }}
        >
          <div style={{ fontSize: '13px', color: 'var(--text-ink)', fontWeight: 500 }}>
            6.4M flights processed &middot; 58 airlines &middot; 350+ airports
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font-plex-mono), monospace' }}>
            PySpark: 3 executors &middot; 4m 12s &middot; 2.1 GB input
          </div>
        </div>
      </div>
      
      {contextText && (
        <ContextBanner title={contextTitle} comparisonText={contextText} trend={contextTrend} />
      )}
      
      <MetricStrip metrics={metrics} />
      
      <div className="grid grid-cols-2" style={{ marginBottom: '1rem' }}>
        <div className="panel">
          <h2>Flight Status Breakdown</h2>
          <FlightStatusDonut data={airlineData} />
        </div>
        <div className="panel">
          <h2>Monthly Delay Trend</h2>
          <MonthlyDelayArea data={trendData} />
        </div>
      </div>
    </div>
  );
}
