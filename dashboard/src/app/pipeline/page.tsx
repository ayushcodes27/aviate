import React from 'react';
import Link from 'next/link';
import { Database, Server, Cog, DatabaseZap, Workflow, Activity, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Pipeline Architecture - Aviate',
};

export default function Pipeline() {
  const nodes = [
    {
      id: 'source',
      title: 'Raw Data',
      icon: <Database size={22} color="var(--text-muted)" />,
      description: 'Bureau of Transportation Statistics',
      stats: ['2019-2023 CSVs', 'Monthly partitions'],
      color: 'var(--border-hairline)'
    },
    {
      id: 'airflow',
      title: 'Airflow',
      icon: <Workflow size={22} color="var(--data-primary)" />,
      description: 'daily_flight_sync DAG',
      stats: ['Schedule: @daily', 'Avg runtime: 4m 12s'],
      color: 'var(--data-primary)'
    },
    {
      id: 'pyspark',
      title: 'PySpark',
      icon: <Cog size={22} color="var(--status-delayed)" />,
      description: 'Data cleaning & validation',
      stats: ['3 Executors', '6.4M rows processed', 'Parquet staging'],
      details: 'Validates schema, drops duplicate flight IDs, casts delay codes, and handles nulls.',
      color: 'var(--status-delayed)'
    },
    {
      id: 'postgres',
      title: 'PostgreSQL',
      icon: <DatabaseZap size={22} color="var(--data-primary)" />,
      description: 'Data warehouse',
      stats: ['Fast COPY ingestion', '2.1 GB raw storage'],
      color: 'var(--data-primary)'
    },
    {
      id: 'dbt',
      title: 'dbt Core',
      icon: <Activity size={22} color="var(--status-delayed)" />,
      description: 'Mart transformations',
      stats: ['5 Mart models', '8/8 Tests passed'],
      details: 'Builds analytical views. Tests for uniqueness and null constraints on carriers, airports, and flights.',
      color: 'var(--status-delayed)'
    },
    {
      id: 'supabase',
      title: 'Supabase API',
      icon: <Server size={22} color="var(--status-ontime)" />,
      description: 'Cloud data layer',
      stats: ['PostgREST API', 'Row level security'],
      color: 'var(--status-ontime)'
    }
  ];

  return (
    <div className="container animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1>Pipeline Architecture</h1>
        <p>End-to-end data pipeline orchestrating raw BTS flights through PySpark, dbt, and Supabase.</p>
      </div>

      {/* Architecture Flowchart */}
      <div className="panel" style={{ padding: '1.5rem', marginBottom: '2rem', overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', minWidth: '950px' }}>
          {nodes.map((node, index) => (
            <React.Fragment key={node.id}>
              {/* Node Card */}
              <div style={{ 
                flex: '1', 
                minWidth: '200px',
                border: '1px solid var(--border-hairline)',
                borderRadius: '4px',
                padding: '1rem',
                backgroundColor: 'var(--bg-page)',
                position: 'relative'
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: node.color, borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}></div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem', marginTop: '0.25rem' }}>
                  {node.icon}
                  <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600 }}>{node.title}</h3>
                </div>
                
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-ink)', fontWeight: 500, marginBottom: '0.375rem' }}>
                  {node.description}
                </div>
                
                {node.details && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                    {node.details}
                  </p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {node.stats.map((stat, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <CheckCircle2 size={12} color="var(--status-ontime)" />
                      <span style={{ fontFamily: stat.includes('M') || stat.match(/\d/) ? 'var(--font-plex-mono), monospace' : 'inherit' }}>
                        {stat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Arrow Connection */}
              {index < nodes.length - 1 && (
                <div style={{ display: 'flex', alignItems: 'center', height: '100px' }}>
                  <div style={{ width: '1.5rem', height: '1px', backgroundColor: 'var(--border-hairline)', position: 'relative' }}>
                    <div style={{ 
                      position: 'absolute', 
                      right: '-3px', 
                      top: '-3px', 
                      width: 0, 
                      height: 0, 
                      borderTop: '4px solid transparent',
                      borderBottom: '4px solid transparent',
                      borderLeft: '4px solid var(--border-hairline)'
                    }}></div>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Marts Lineage Section */}
      <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Data marts & lineage</h2>
      <div className="grid grid-cols-3" style={{ gap: '1.5rem' }}>
        
        {/* Airlines Mart */}
        <div className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-plex-mono), monospace', fontSize: '0.8125rem', fontWeight: 600 }}>mart_airline_performance</h3>
            <span style={{ fontSize: '0.6875rem', padding: '2px 6px', background: 'rgba(30, 122, 77, 0.1)', color: 'var(--status-ontime)', borderRadius: '3px', fontWeight: 600 }}>2 tests pass</span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.4 }}>
            Aggregates flights, delays, and cancellations by carrier per month. Validates uniqueness on carrier-month.
          </p>
          <Link href="/airlines" style={{ color: 'var(--data-primary)', fontSize: '0.8125rem', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
            View airlines analytics &rarr;
          </Link>
        </div>

        {/* Airports Mart */}
        <div className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-plex-mono), monospace', fontSize: '0.8125rem', fontWeight: 600 }}>mart_airport_performance</h3>
            <span style={{ fontSize: '0.6875rem', padding: '2px 6px', background: 'rgba(30, 122, 77, 0.1)', color: 'var(--status-ontime)', borderRadius: '3px', fontWeight: 600 }}>2 tests pass</span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.4 }}>
            Calculates departure and arrival delay metrics by airport hub. Validates airport code keys and volume metrics.
          </p>
          <Link href="/airports" style={{ color: 'var(--data-primary)', fontSize: '0.8125rem', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
            View airports analytics &rarr;
          </Link>
        </div>

        {/* Routes Mart */}
        <div className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-plex-mono), monospace', fontSize: '0.8125rem', fontWeight: 600 }}>mart_route_reliability</h3>
            <span style={{ fontSize: '0.6875rem', padding: '2px 6px', background: 'rgba(30, 122, 77, 0.1)', color: 'var(--status-ontime)', borderRadius: '3px', fontWeight: 600 }}>1 test pass</span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.4 }}>
            Computes reliability and delay frequency between origin-destination corridors across all domestic routes.
          </p>
          <Link href="/routes" style={{ color: 'var(--data-primary)', fontSize: '0.8125rem', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
            View routes analytics &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}
