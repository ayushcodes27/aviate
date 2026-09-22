'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
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
          <Link href="/" className={styles.brand} style={{ fontWeight: 600, color: 'var(--text-ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '2px', background: 'var(--data-primary)' }}></span>
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
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Trust indicator in header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                  fontSize: '12px', 
                  color: 'var(--text-muted)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  cursor: 'pointer',
                  padding: '3px 8px',
                  borderRadius: '4px',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--status-ontime)', display: 'inline-block' }}></span>
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
                  width: '300px',
                  backgroundColor: 'var(--bg-panel)',
                  border: '1px solid var(--border-hairline)',
                  borderRadius: '4px',
                  padding: '14px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  zIndex: 50
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <strong style={{ fontSize: '13px', color: 'var(--text-ink)' }}>Warehouse Status</strong>
                  <span style={{ fontSize: '12px', color: 'var(--status-ontime)', fontWeight: 600 }}>Verified</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Pipeline:</span>
                    <span style={{ color: 'var(--text-ink)' }}>PySpark &rarr; dbt &rarr; Supabase</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Data scale:</span>
                    <span style={{ color: 'var(--text-ink)' }}>6.4M flight records</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Data marts:</span>
                    <span style={{ color: 'var(--text-ink)' }}>5 marts &middot; 8 tests passed</span>
                  </div>
                </div>
                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-hairline)' }}>
                  <Link href="/pipeline" style={{ color: 'var(--data-primary)', fontSize: '12px', textDecoration: 'none', fontWeight: 500 }}>
                    View Pipeline Health &rarr;
                  </Link>
                </div>
              </div>
            </div>

            <span style={{ fontSize: '12px', color: 'var(--text-muted)', borderLeft: '1px solid var(--border-hairline)', paddingLeft: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={13} color="var(--status-ontime)" />
              5 marts &middot; 8 dbt tests
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <select 
              value={currentRange}
              onChange={handleRangeChange}
              style={{ 
                fontSize: '0.8125rem', 
                color: 'var(--text-ink)', 
                padding: '0.375rem 0.625rem', 
                border: '1px solid var(--border-hairline)', 
                borderRadius: '4px',
                background: 'var(--bg-panel)',
                outline: 'none', 
                cursor: 'pointer' 
              }}
            >
              <option value="all">All time (2019 - 2023)</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
              <option value="2019">2019</option>
            </select>
          </div>
        </div>
      </div>
    </nav>
  );
}
