import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ContextBannerProps {
  title: string;
  comparisonText: string;
  trend?: 'up' | 'down' | 'flat';
}

export default function ContextBanner({ title, comparisonText, trend }: ContextBannerProps) {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.75rem', 
      padding: '0.75rem 1rem', 
      backgroundColor: 'var(--bg-panel)',
      border: '1px solid var(--border-hairline)',
      borderRadius: '6px',
      marginBottom: '1rem',
      fontSize: '0.875rem'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        width: '24px', 
        height: '24px', 
        borderRadius: '50%',
        backgroundColor: trend === 'up' ? 'rgba(47, 122, 79, 0.1)' : trend === 'down' ? 'rgba(178, 58, 52, 0.1)' : 'var(--bg-page)',
        color: trend === 'up' ? 'var(--accent-green)' : trend === 'down' ? 'var(--accent-red)' : 'var(--text-muted)'
      }}>
        {trend === 'up' && <TrendingUp size={14} />}
        {trend === 'down' && <TrendingDown size={14} />}
        {trend === 'flat' && <Minus size={14} />}
      </div>
      <div>
        <strong style={{ color: 'var(--text-ink)', fontWeight: 500 }}>{title}</strong>
        <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>{comparisonText}</span>
      </div>
    </div>
  );
}
