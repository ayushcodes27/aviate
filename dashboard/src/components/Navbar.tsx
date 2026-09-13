'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plane, BarChart2, Activity, Map, TrendingUp, Calendar, CheckCircle2, User } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentRange = searchParams?.get('range') || 'all';

  const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRange = e.target.value;
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (newRange === 'all') {
      params.delete('range');
    } else {
      params.set('range', newRange);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <nav className={styles.navbar} style={{ borderBottom: '1px solid var(--border-hairline)', backgroundColor: 'var(--bg-panel)' }}>
      <div className={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          <Link href="/" className={styles.brand} style={{ fontWeight: 600, color: 'var(--text-ink)' }}>
            Aviate
          </Link>
          <div className={styles.links} style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem' }}>
            <Link href="/" style={{ color: 'var(--text-muted)' }}>Overview</Link>
            <Link href="/airlines" style={{ color: 'var(--text-muted)' }}>Airlines</Link>
            <Link href="/airports" style={{ color: 'var(--text-muted)' }}>Airports</Link>
            <Link href="/routes" style={{ color: 'var(--text-muted)' }}>Routes</Link>
            <Link href="/trends" style={{ color: 'var(--text-muted)' }}>Trends</Link>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div 
            style={{ position: 'relative' }}
            onMouseEnter={(e) => {
              const tooltip = e.currentTarget.querySelector('.sync-tooltip') as HTMLElement;
              if (tooltip) tooltip.style.display = 'block';
            }}
            onMouseLeave={(e) => {
              const tooltip = e.currentTarget.querySelector('.sync-tooltip') as HTMLElement;
              if (tooltip) tooltip.style.display = 'none';
            }}
          >
            <span 
              style={{ 
                fontSize: '13px', 
                color: 'var(--text-muted)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'var(--border-hairline)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-green)', display: 'inline-block', boxShadow: '0 0 4px var(--accent-green)' }}></span>
              Synced
            </span>
            
            <div 
              className="sync-tooltip"
              style={{
                display: 'none',
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                width: '320px',
                backgroundColor: 'var(--bg-panel)',
                border: '1px solid var(--border-hairline)',
                borderRadius: '6px',
                padding: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 50
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <strong style={{ fontSize: '14px', color: 'var(--text-ink)' }}>Pipeline Health</strong>
                <span style={{ fontSize: '12px', color: 'var(--accent-green)', fontWeight: 600 }}>Healthy</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Last dbt run:</span>
                  <span style={{ color: 'var(--text-ink)' }}>Today, 03:00 UTC</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Rows Processed:</span>
                  <span style={{ color: 'var(--text-ink)' }}>6.4M records</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Orchestration:</span>
                  <span style={{ color: 'var(--text-ink)', fontFamily: 'var(--font-plex-mono), monospace' }}>daily_flight_sync</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>DAG Duration:</span>
                  <span style={{ color: 'var(--text-ink)' }}>4m 12s</span>
                </div>
              </div>
              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-hairline)' }}>
                <Link href="/pipeline" style={{ color: 'var(--accent-blue)', fontSize: '13px', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  View Data Pipeline &rarr;
                </Link>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <select 
              value={currentRange}
              onChange={handleRangeChange}
              style={{ 
                fontSize: '0.875rem', 
                color: 'var(--text-ink)', 
                padding: '0.375rem 0.75rem', 
                border: '1px solid var(--border-hairline)', 
                borderRadius: '4px',
                background: 'var(--bg-panel)',
                outline: 'none', 
                cursor: 'pointer' 
              }}
            >
              <option value="all">All Time (Jan 2019 - Aug 2023)</option>
              <option value="2023">2023 Only</option>
              <option value="2022">2022 Only</option>
              <option value="2021">2021 Only</option>
              <option value="2020">2020 Only</option>
              <option value="2019">2019 Only</option>
            </select>
          </div>
        </div>
      </div>
    </nav>
  );
}
