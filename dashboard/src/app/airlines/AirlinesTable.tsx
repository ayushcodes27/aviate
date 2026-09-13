'use client';

import React from 'react';
import Link from 'next/link';
import DataTable from '@/components/DataTable';

export default function AirlinesTable({ data }: { data: any[] }) {
  const getScoreColor = (score: number) => {
    if (score >= 84.5) return 'var(--accent-green)';
    if (score >= 80) return 'var(--accent-amber)';
    return 'var(--accent-red)';
  };

  const cancelColor = (rate: number) => {
    return rate >= 5 ? 'var(--accent-red)' : 'var(--text-ink)';
  };

  const columns = [
    { 
      header: "Carrier", 
      accessorKey: "carrier", 
      render: (row: any) => (
        <strong>
          <Link 
            href={`/routes?carrier=${encodeURIComponent(row.carrier)}`} 
            style={{ color: 'var(--accent-blue)', textDecoration: 'underline', textUnderlineOffset: '4px' }}
          >
            {row.carrier}
          </Link>
        </strong>
      ) 
    },
    { header: "Total Flights", accessorKey: "total_flights", isNumeric: true, render: (row: any) => row.total_flights?.toLocaleString() },
    { header: "Delayed", accessorKey: "delayed_flights", isNumeric: true, render: (row: any) => row.delayed_flights?.toLocaleString() },
    { 
      header: "Cancel Rate", 
      accessorKey: "cancellation_rate", 
      isNumeric: true, 
      render: (row: any) => (
        <span style={{ color: cancelColor(row.cancellation_rate) }}>
          {row.cancellation_rate ? `${row.cancellation_rate.toFixed(1)}%` : '-'}
        </span>
      ) 
    },
    { 
      header: "Avg Arrival Offset (m)", 
      accessorKey: "avg_delay_minutes", 
      isNumeric: true, 
      render: (row: any) => row.avg_delay_minutes ? row.avg_delay_minutes.toFixed(1) : '-' 
    },
    { 
      header: "Reliability Score", 
      accessorKey: "reliability_score", 
      isNumeric: true, 
      render: (row: any) => (
        <span style={{ color: getScoreColor(row.reliability_score), fontWeight: 600 }}>
          {row.reliability_score ? `${row.reliability_score.toFixed(1)}%` : '-'}
        </span>
      )
    }
  ];

  return <DataTable columns={columns} data={data} />;
}
