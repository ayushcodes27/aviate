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
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link href="/" className={styles.brand}>
            <Plane className={styles.icon} />
            <span>Aviate</span>
          </Link>
          <div className={styles.links}>
            <Link href="/" className={styles.link}><BarChart2 size={18} /> Overview</Link>
            <Link href="/airlines" className={styles.link}><Activity size={18} /> Airlines</Link>
            <Link href="/airports" className={styles.link}><Map size={18} /> Airports</Link>
            <Link href="/routes" className={styles.link}><Activity size={18} /> Routes</Link>
            <Link href="/trends" className={styles.link}><TrendingUp size={18} /> Trends</Link>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div className="status-badge" title="Last synced: Just now">
            <CheckCircle2 size={14} /> Synced
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', padding: '0.25rem 0.5rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
            <Calendar size={16} />
            <select 
              value={currentRange}
              onChange={handleRangeChange}
              style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.25rem' }}
            >
              <option value="all">All Time (Jan 2019 - Aug 2023)</option>
              <option value="2023">2023 Only</option>
              <option value="2022">2022 Only</option>
              <option value="2021">2021 Only</option>
              <option value="2020">2020 Only</option>
              <option value="2019">2019 Only</option>
            </select>
          </div>

          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <User size={18} />
          </div>
        </div>
      </div>
    </nav>
  );
}
