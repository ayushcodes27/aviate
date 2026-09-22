'use client';

import React from 'react';
import Link from 'next/link';
import DataTable from '@/components/DataTable';

export default function AirlinesTable({ data }: { data: any[] }) {
  const renderScorePill = (score: number) => {
    if (!score && score !== 0) return '-';
    let bg = 'rgba(30, 122, 77, 0.08)';
    let color = 'var(--status-ontime)';
    let border = 'rgba(30, 122, 77, 0.2)';

    if (score < 80) {
      bg = 'rgba(186, 45, 40, 0.08)';
      color = 'var(--status-cancelled)';
      border = 'rgba(186, 45, 40, 0.2)';
    } else if (score < 84.5) {
      bg = 'rgba(192, 104, 24, 0.08)';
      color = 'var(--status-delayed)';
      border = 'rgba(192, 104, 24, 0.2)';
    }

    return (
      <span style={{ 
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: '3px',
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        fontSize: '0.75rem',
        fontWeight: 500,
        fontFamily: 'var(--font-plex-mono), monospace'
      }}>
        {score.toFixed(1)}%
      </span>
    );
  };

  const renderCancelRate = (rate: number) => {
    if (!rate && rate !== 0) return '-';
    if (rate >= 5.0) {
      return (
        <span style={{ 
          display: 'inline-flex',
          padding: '2px 6px',
          borderRadius: '3px',
          backgroundColor: 'rgba(186, 45, 40, 0.08)',
          color: 'var(--status-cancelled)',
          fontSize: '0.75rem',
          fontWeight: 500,
          fontFamily: 'var(--font-plex-mono), monospace'
        }}>
          {rate.toFixed(1)}%
        </span>
      );
    }
    return `${rate.toFixed(1)}%`;
  };

  const columns = [
    { 
      header: "Carrier", 
      accessorKey: "carrier", 
      render: (row: any) => (
        <span style={{ fontWeight: 500, color: 'var(--text-ink)' }}>
          <Link 
            href={`/routes?carrier=${encodeURIComponent(row.carrier)}`} 
            style={{ color: 'var(--data-primary)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
          >
            {row.carrier}
          </Link>
        </span>
      ) 
    },
    { header: "Total flights", accessorKey: "total_flights", isNumeric: true, render: (row: any) => row.total_flights?.toLocaleString() },
    { header: "Delayed flights", accessorKey: "delayed_flights", isNumeric: true, render: (row: any) => row.delayed_flights?.toLocaleString() },
    { 
      header: "Cancellation rate", 
      accessorKey: "cancellation_rate", 
      isNumeric: true, 
      render: (row: any) => renderCancelRate(row.cancellation_rate)
    },
    { 
      header: "Avg arrival delay (min)", 
      accessorKey: "avg_delay_minutes", 
      isNumeric: true, 
      render: (row: any) => row.avg_delay_minutes ? row.avg_delay_minutes.toFixed(1) : '-' 
    },
    { 
      header: "Reliability score", 
      accessorKey: "reliability_score", 
      isNumeric: true, 
      render: (row: any) => renderScorePill(row.reliability_score)
    }
  ];

  return <DataTable columns={columns} data={data} />;
}
