'use client';

import React from 'react';
import Link from 'next/link';
import DataTable from '@/components/DataTable';

export default function RoutesTable({ data }: { data: any[] }) {
  const delayColor = (rate: number) => {
    if (rate >= 35) return '#8C2E27';
    if (rate >= 30) return 'var(--accent-red)';
    if (rate >= 25) return '#C0562E';
    return 'var(--accent-amber)';
  };

  const cancelColor = (rate: number) => {
    return rate >= 5 ? 'var(--accent-red)' : 'var(--text-ink)';
  };

  const columns = [
    { 
      header: "Origin", 
      accessorKey: "origin", 
      render: (row: any) => (
        <strong>
          <Link href={`/airports?airport=${encodeURIComponent(row.origin)}`} style={{ color: 'var(--accent-blue)', textDecoration: 'underline', textUnderlineOffset: '4px' }}>
            {row.origin}
          </Link>
        </strong>
      ) 
    },
    { 
      header: "Destination", 
      accessorKey: "dest", 
      render: (row: any) => (
        <strong>
          <Link href={`/airports?airport=${encodeURIComponent(row.dest)}`} style={{ color: 'var(--accent-blue)', textDecoration: 'underline', textUnderlineOffset: '4px' }}>
            {row.dest}
          </Link>
        </strong>
      ) 
    },
    { header: "Total Flights", accessorKey: "route_flights", isNumeric: true, render: (row: any) => row.route_flights?.toLocaleString() },
    { 
      header: "Delay Rate", 
      accessorKey: "delay_rate", 
      isNumeric: true, 
      render: (row: any) => <span style={{ color: delayColor(row.delay_rate) }}>{row.delay_rate ? `${row.delay_rate.toFixed(1)}%` : '-'}</span> 
    },
    { 
      header: "Cancel Rate", 
      accessorKey: "cancellation_rate", 
      isNumeric: true, 
      render: (row: any) => <span style={{ color: cancelColor(row.cancellation_rate) }}>{row.cancellation_rate ? `${row.cancellation_rate.toFixed(1)}%` : '-'}</span> 
    },
    { header: "Avg Route Delay (m)", accessorKey: "avg_route_delay", isNumeric: true, render: (row: any) => row.avg_route_delay ? row.avg_route_delay.toFixed(1) : '-' }
  ];

  return <DataTable columns={columns} data={data} />;
}
