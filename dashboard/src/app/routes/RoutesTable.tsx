'use client';

import React from 'react';
import Link from 'next/link';
import DataTable from '@/components/DataTable';
import { getAirportName } from '@/lib/airports';

export default function RoutesTable({ data }: { data: any[] }) {
  const renderDelayPill = (rate: number) => {
    if (!rate && rate !== 0) return '-';
    // WCAG compliant dark crimson & amber tones
    if (rate >= 30.0) {
      return (
        <span style={{ 
          display: 'inline-flex',
          padding: '2px 7px',
          borderRadius: '3px',
          backgroundColor: 'rgba(153, 27, 27, 0.08)',
          color: '#991B1B', // Dark crimson - WCAG AAA compliant on white
          border: '1px solid rgba(153, 27, 27, 0.2)',
          fontSize: '0.75rem',
          fontWeight: 600,
          fontFamily: 'var(--font-plex-mono), monospace'
        }}>
          {rate.toFixed(1)}%
        </span>
      );
    } else if (rate >= 20.0) {
      return (
        <span style={{ 
          display: 'inline-flex',
          padding: '2px 7px',
          borderRadius: '3px',
          backgroundColor: 'rgba(180, 83, 9, 0.08)',
          color: '#B45309', // Dark amber - WCAG compliant
          border: '1px solid rgba(180, 83, 9, 0.2)',
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

  const renderCancelPill = (rate: number) => {
    if (!rate && rate !== 0) return '-';
    if (rate >= 5.0) {
      return (
        <span style={{ 
          display: 'inline-flex',
          padding: '2px 7px',
          borderRadius: '3px',
          backgroundColor: 'rgba(153, 27, 27, 0.08)',
          color: '#991B1B',
          border: '1px solid rgba(153, 27, 27, 0.2)',
          fontSize: '0.75rem',
          fontWeight: 600,
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
      header: "Origin", 
      accessorKey: "origin", 
      render: (row: any) => (
        <span 
          title={getAirportName(row.origin)}
          style={{ 
            fontWeight: 600, 
            fontFamily: 'var(--font-plex-mono), monospace',
            cursor: 'help'
          }}
        >
          <Link href={`/airports?airport=${encodeURIComponent(row.origin)}`} style={{ color: 'var(--data-primary)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
            {row.origin}
          </Link>
        </span>
      ) 
    },
    { 
      header: "Destination", 
      accessorKey: "dest", 
      render: (row: any) => (
        <span 
          title={getAirportName(row.dest)}
          style={{ 
            fontWeight: 600, 
            fontFamily: 'var(--font-plex-mono), monospace',
            cursor: 'help'
          }}
        >
          <Link href={`/airports?airport=${encodeURIComponent(row.dest)}`} style={{ color: 'var(--data-primary)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
            {row.dest}
          </Link>
        </span>
      ) 
    },
    { header: "Total flights", accessorKey: "route_flights", isNumeric: true, render: (row: any) => row.route_flights?.toLocaleString() },
    { 
      header: "Delay rate", 
      accessorKey: "delay_rate", 
      isNumeric: true, 
      render: (row: any) => renderDelayPill(row.delay_rate)
    },
    { 
      header: "Cancellation rate", 
      accessorKey: "cancellation_rate", 
      isNumeric: true, 
      render: (row: any) => renderCancelPill(row.cancellation_rate)
    },
    { header: "Avg route delay (min)", accessorKey: "avg_route_delay", isNumeric: true, render: (row: any) => row.avg_route_delay ? row.avg_route_delay.toFixed(1) : '-' }
  ];

  return <DataTable columns={columns} data={data} />;
}
