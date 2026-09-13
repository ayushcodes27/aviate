'use client';

import React from 'react';
import DataTable from '@/components/DataTable';

export default function AirportsTable({ data }: { data: any[] }) {
  const columns = [
    { header: "Airport Code", accessorKey: "airport_code", render: (row: any) => <strong>{row.airport_code}</strong> },
    { header: "Departures", accessorKey: "total_departures", isNumeric: true, render: (row: any) => row.total_departures?.toLocaleString() },
    { header: "Arrivals", accessorKey: "total_arrivals", isNumeric: true, render: (row: any) => row.total_arrivals?.toLocaleString() },
    { header: "Avg Dep Delay (m)", accessorKey: "avg_departure_delay", isNumeric: true, render: (row: any) => row.avg_departure_delay ? row.avg_departure_delay.toFixed(1) : '-' },
    { header: "Avg Arr Delay (m)", accessorKey: "avg_arrival_delay", isNumeric: true, render: (row: any) => row.avg_arrival_delay ? row.avg_arrival_delay.toFixed(1) : '-' },
    { header: "Total Cancellations", accessorKey: "total_cancellations", isNumeric: true, render: (row: any) => row.total_cancellations?.toLocaleString() }
  ];

  return <DataTable columns={columns} data={data} />;
}
