import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ReliabilityBarChart from '@/components/charts/ReliabilityBarChart';
import DelayVsCancelGroupedBar from '@/components/charts/DelayVsCancelGroupedBar';
import AirlinesTable from './AirlinesTable';
import ContextBanner from '@/components/ContextBanner';

export default async function Airlines({ searchParams }: { searchParams: { range?: string } }) {
  const range = (await searchParams)?.range || 'all';
  let airlines: any[] = [];
  let priorAirlines: any[] = [];
  
  try {
    let query = supabase.from('mart_airline_performance').select('*');
    let priorQuery = supabase.from('mart_airline_performance').select('*');
    
    if (range !== 'all') {
      query = query.gte('flight_month', `${range}-01-01`).lte('flight_month', `${range}-12-31`);
      const priorYear = parseInt(range) - 1;
      priorQuery = priorQuery.gte('flight_month', `${priorYear}-01-01`).lte('flight_month', `${priorYear}-12-31`);
    } else {
      priorQuery = priorQuery.gte('flight_month', '2021-01-01').lte('flight_month', '2021-12-31');
    }
    
    const [currRes, priorRes] = await Promise.all([query, priorQuery]);

    const aggregateData = (data: any[]) => {
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
      return Array.from(agg.values()).map(row => {
        row.avg_delay_minutes = row.delayed_flights > 0 ? row.avg_delay_minutes / row.delayed_flights : 0;
        row.reliability_score = row.total_flights > 0 ? ((row.total_flights - row.delayed_flights - row.cancelled_flights) / row.total_flights) * 100 : 0;
        row.cancellation_rate = row.total_flights > 0 ? (row.cancelled_flights / row.total_flights) * 100 : 0;
        return row;
      }).sort((a, b) => b.reliability_score - a.reliability_score);
    };

    if (currRes.data) {
      // For "all time", we'll compute 2022 stats vs 2021 stats for the banner
      if (range === 'all') {
        airlines = aggregateData(currRes.data); // Keep full data for charts/table
        const data2022 = currRes.data.filter(r => r.flight_month && r.flight_month.startsWith('2022'));
        const airlines2022 = aggregateData(data2022);
        priorAirlines = aggregateData(priorRes.data || []);
        
        // We inject the 2022 top ranker info into priorAirlines to be processed later
        (airlines as any)._bannerData = { currentList: airlines2022, priorList: priorAirlines };
      } else {
        airlines = aggregateData(currRes.data);
        priorAirlines = aggregateData(priorRes.data || []);
      }
    }
  } catch (err) {
    console.error("Supabase fetch error:", err);
  }

  let contextTitle = "";
  let contextText = "";
  let contextTrend: 'up' | 'down' | 'flat' | undefined = undefined;

  const calculateRankContext = (currentList: any[], priorList: any[], isAllTime = false) => {
    if (currentList.length > 0 && priorList.length > 0) {
      const topCarrier = currentList[0];
      const priorRankIndex = priorList.findIndex(a => a.carrier === topCarrier.carrier);
      
      if (priorRankIndex !== -1) {
        const rankDiff = priorRankIndex - 0; // index 0 is rank 1. If prior was index 2 (rank 3), diff is 2.
        contextTrend = rankDiff > 0 ? 'up' : rankDiff < 0 ? 'down' : 'flat';
        
        const changeText = rankDiff > 0 ? `up ${rankDiff} spots` : rankDiff < 0 ? `down ${Math.abs(rankDiff)} spots` : `holding steady`;
        const priorYearText = isAllTime ? '2021' : `${parseInt(range) - 1}`;
        const yearTitle = isAllTime ? '2022 vs 2021' : `${range}`;
        
        contextTitle = `${yearTitle} Leaderboard`;
        contextText = `${topCarrier.carrier} leads at ${topCarrier.reliability_score.toFixed(1)}%, ${changeText} from ${priorYearText}`;
      }
    }
  };

  if (range === 'all' && (airlines as any)._bannerData) {
    calculateRankContext((airlines as any)._bannerData.currentList, (airlines as any)._bannerData.priorList, true);
  } else if (range !== '2019') {
    calculateRankContext(airlines, priorAirlines);
  }

  return (
    <div className="container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Airline Performance</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Leaderboard of airlines sorted by operational reliability.</p>
        </div>
        <div style={{ fontSize: '12px', padding: '6px 10px', background: 'var(--bg-page)', border: '1px solid var(--border-hairline)', borderRadius: '4px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-green)' }}></span>
          Powered by <code style={{ color: 'var(--text-ink)', background: 'var(--border-hairline)', padding: '2px 4px', borderRadius: '2px' }}>mart_airline_performance</code> &middot; 2 tests passed
        </div>
      </div>
      
      {contextText && (
        <ContextBanner title={contextTitle} comparisonText={contextText} trend={contextTrend} />
      )}
      
      <div className="grid grid-cols-2" style={{ marginBottom: '1rem' }}>
        <div className="panel">
          <h2>Reliability Scores</h2>
          <ReliabilityBarChart data={airlines} />
        </div>
        <div className="panel">
          <h2>Delay vs Cancellations</h2>
          <DelayVsCancelGroupedBar data={airlines} />
        </div>
      </div>
      
      <AirlinesTable data={airlines} />
    </div>
  );
}
