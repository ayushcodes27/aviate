'use client';

import React from 'react';
import Link from 'next/link';
import DataTable from '@/components/DataTable';
import { getAirportName } from '@/lib/airports';

export default function AirportsTable({ data }: { data: any[] }) {
  const columns = [
    { 
      header: "Airport code", 
      accessorKey: "airport_code", 
      render: (row: any) => (
        <span 
          title={getAirportName(row.airport_code)}
          style={{ 
            fontWeight: 600, 
            fontFamily: 'var(--font-plex-mono), monospace',
            cursor: 'help'
          }}
        >
          <Link 
            href={`/routes?origin=${encodeURIComponent(row.airport_code)}`}
            style={{ color: 'var(--data-primary)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
          >
            {row.airport_code}
          </Link>
        </span>
      ) 
    },
    { header: "Departures", accessorKey: "total_departures", isNumeric: true, render: (row: any) => row.total_departures?.toLocaleString() },
    { header: "Arrivals", accessorKey: "total_arrivals", isNumeric: true, render: (row: any) => row.total_arrivals?.toLocaleString() },
    { header: "Avg dep delay (min)", accessorKey: "avg_departure_delay", isNumeric: true, render: (row: any) => row.avg_departure_delay ? row.avg_departure_delay.toFixed(1) : '-' },
    { header: "Avg arr delay (min)", accessorKey: "avg_arrival_delay", isNumeric: true, render: (row: any) => row.avg_arrival_delay ? row.avg_arrival_delay.toFixed(1) : '-' },
    { header: "Total cancellations", accessorKey: "total_cancellations", isNumeric: true, render: (row: any) => row.total_cancellations?.toLocaleString() }
  ];

  return <DataTable columns={columns} data={data} />;
}
