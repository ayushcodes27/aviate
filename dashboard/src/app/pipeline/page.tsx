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
      icon: <Database size={24} className="text-gray-500" />,
      description: 'Bureau of Transportation Statistics',
      stats: ['2019-2023 CSVs', 'Monthly updates'],
      color: 'var(--border-hairline)'
    },
    {
      id: 'airflow',
      title: 'Airflow',
      icon: <Workflow size={24} className="text-blue-500" />,
      description: 'daily_flight_sync DAG',
      stats: ['Schedule: @daily', 'Avg Run: 4m 12s'],
      color: 'var(--accent-blue)'
    },
    {
      id: 'pyspark',
      title: 'PySpark',
      icon: <Cog size={24} className="text-amber-500" />,
      description: 'Data Cleaning & Validation',
      stats: ['3 Executors', '6.4M rows processed', 'Output: Parquet'],
      details: 'Validates schema, drops duplicate flight IDs, casts delay codes, and handles nulls.',
      color: 'var(--accent-amber)'
    },
    {
      id: 'postgres',
      title: 'Postgres',
      icon: <DatabaseZap size={24} className="text-indigo-500" />,
      description: 'Data Warehouse',
      stats: ['Fast COPY ingestion', '2.1 GB raw storage'],
      color: 'var(--accent-blue)'
    },
    {
      id: 'dbt',
      title: 'dbt',
      icon: <Activity size={24} className="text-orange-500" />,
      description: 'Mart Transformations',
      stats: ['5 Mart Models', '14 Tests Passed'],
      details: 'Builds analytical views. Tests for uniqueness and nulls on carriers, airports, and flights.',
      color: 'var(--accent-amber)'
    },
    {
      id: 'supabase',
      title: 'Supabase API',
      icon: <Server size={24} className="text-green-500" />,
      description: 'PostgREST API Layer',
      stats: ['REST API', 'Row Level Security'],
      color: 'var(--accent-green)'
    }
  ];

  return (
    <div className="container animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Pipeline Architecture</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          This dashboard is powered by a robust data engineering pipeline. 
          Raw flight data is orchestrated, cleaned, transformed, and served to this UI.
        </p>
      </div>

      {/* Architecture Flowchart */}
      <div className="panel" style={{ padding: '2rem', marginBottom: '2rem', overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem', minWidth: '900px' }}>
          {nodes.map((node, index) => (
            <React.Fragment key={node.id}>
              {/* Node Card */}
              <div style={{ 
                flex: '1', 
                minWidth: '200px',
                border: '1px solid var(--border-hairline)',
                borderRadius: '8px',
                padding: '1rem',
                backgroundColor: 'var(--bg-page)',
                position: 'relative'
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: node.color, borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}></div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', marginTop: '0.25rem' }}>
                  {node.icon}
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{node.title}</h3>
                </div>
                
                <div style={{ fontSize: '0.875rem', color: 'var(--text-ink)', fontWeight: 500, marginBottom: '0.5rem' }}>
                  {node.description}
                </div>
                
                {node.details && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.4 }}>
                    {node.details}
                  </p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {node.stats.map((stat, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <CheckCircle2 size={12} color="var(--accent-green)" />
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
                  <div style={{ width: '2rem', height: '2px', backgroundColor: 'var(--border-hairline)', position: 'relative' }}>
                    <div style={{ 
                      position: 'absolute', 
                      right: '-4px', 
                      top: '-4px', 
                      width: 0, 
                      height: 0, 
                      borderTop: '5px solid transparent',
                      borderBottom: '5px solid transparent',
                      borderLeft: '5px solid var(--border-hairline)'
                    }}></div>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Marts Lineage Section */}
      <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Data Marts & Lineage</h2>
      <div className="grid grid-cols-3" style={{ gap: '1.5rem' }}>
        
        {/* Airlines Mart */}
        <div className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-plex-mono), monospace', fontSize: '0.9rem' }}>mart_airline_performance</h3>
            <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'rgba(47, 122, 79, 0.1)', color: 'var(--accent-green)', borderRadius: '4px', fontWeight: 600 }}>2 Tests Pass</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Aggregates flights, delays, and cancellations by carrier per month. Tests for uniqueness and nulls on <code style={{ fontSize: '0.75rem' }}>carrier</code>.
          </p>
          <Link href="/airlines" style={{ color: 'var(--accent-blue)', fontSize: '0.875rem', textDecoration: 'underline' }}>
            Powers the Airlines Page &rarr;
          </Link>
        </div>

        {/* Airports Mart */}
        <div className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-plex-mono), monospace', fontSize: '0.9rem' }}>mart_airport_performance</h3>
            <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'rgba(47, 122, 79, 0.1)', color: 'var(--accent-green)', borderRadius: '4px', fontWeight: 600 }}>2 Tests Pass</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Calculates departure and arrival delay metrics by airport. Tests for uniqueness and nulls on <code style={{ fontSize: '0.75rem' }}>airport_code</code>.
          </p>
          <Link href="/airports" style={{ color: 'var(--accent-blue)', fontSize: '0.875rem', textDecoration: 'underline' }}>
            Powers the Airports Page &rarr;
          </Link>
        </div>

        {/* Routes Mart */}
        <div className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-plex-mono), monospace', fontSize: '0.9rem' }}>mart_route_reliability</h3>
            <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'rgba(47, 122, 79, 0.1)', color: 'var(--accent-green)', borderRadius: '4px', fontWeight: 600 }}>1 Test Pass</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Computes reliability scores between origin and destination pairs. Filters out low-volume routes.
          </p>
          <Link href="/routes" style={{ color: 'var(--accent-blue)', fontSize: '0.875rem', textDecoration: 'underline' }}>
            Powers the Routes Page &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}
