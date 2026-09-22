'use client';

import React from 'react';
import DataTable from '@/components/DataTable';

export default function TrendsTable({ data }: { data: any[] }) {
  const columns = [
    { 
      header: "Date", 
      accessorKey: "flight_date", 
      render: (row: any) => <span style={{ fontFamily: 'var(--font-plex-mono), monospace', fontWeight: 500 }}>{row.flight_date}</span> 
    },
    { 
      header: "Total flights", 
      accessorKey: "total_flights", 
      isNumeric: true, 
      render: (row: any) => row.total_flights ? Number(row.total_flights).toLocaleString() : '-' 
    },
    { 
      header: "Delayed flights", 
      accessorKey: "total_delayed_flights", 
      isNumeric: true, 
      render: (row: any) => row.total_delayed_flights ? Number(row.total_delayed_flights).toLocaleString() : '-' 
    },
    { 
      header: "Cancelled flights", 
      accessorKey: "total_cancelled_flights", 
      isNumeric: true, 
      render: (row: any) => row.total_cancelled_flights ? Number(row.total_cancelled_flights).toLocaleString() : '-' 
    },
    { 
      header: "Avg daily delay (min)", 
      accessorKey: "avg_daily_delay", 
      isNumeric: true, 
      render: (row: any) => row.avg_daily_delay ? Number(row.avg_daily_delay).toFixed(1) : '-' 
    }
  ];

  return <DataTable columns={columns} data={data} />;
}
