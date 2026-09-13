'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, List, AlignJustify } from 'lucide-react';
import { useDashboardContext } from './DashboardContext';

type ColumnDef = {
  header: string;
  accessorKey: string;
  isNumeric?: boolean;
  render?: (row: any) => React.ReactNode;
};

export default function DataTable({ 
  columns, 
  data, 
  emptyMessage = "No data available.",
  showSearch = true
}: { 
  columns: ColumnDef[], 
  data: any[],
  emptyMessage?: string,
  showSearch?: boolean
}) {
  const { density, setDensity } = useDashboardContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter(row => {
      return columns.some(col => {
        const val = row[col.accessorKey];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(lowerSearch);
      });
    });
  }, [data, searchTerm, columns]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        return null;
      }
      return { key, direction: 'asc' };
    });
  };

  const rowPadding = density === 'compact' ? '0.375rem 1rem' : '0.75rem 1rem';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {showSearch && data && data.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Search size={16} />
            </div>
            <input 
              type="text" 
              placeholder="Search table..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.375rem 1rem 0.375rem 2.25rem',
                border: '1px solid var(--border-hairline)',
                borderRadius: '4px',
                backgroundColor: 'var(--bg-panel)',
                color: 'var(--text-ink)',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              title="Compact View"
              onClick={() => setDensity('compact')}
              style={{
                background: density === 'compact' ? 'var(--border-hairline)' : 'transparent',
                border: '1px solid var(--border-hairline)',
                borderRadius: '4px',
                padding: '4px',
                cursor: 'pointer',
                color: 'var(--text-ink)',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <AlignJustify size={16} />
            </button>
            <button 
              title="Comfortable View"
              onClick={() => setDensity('comfortable')}
              style={{
                background: density === 'comfortable' ? 'var(--border-hairline)' : 'transparent',
                border: '1px solid var(--border-hairline)',
                borderRadius: '4px',
                padding: '4px',
                cursor: 'pointer',
                color: 'var(--text-ink)',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="table-container" style={{ border: '1px solid var(--border-hairline)', borderRadius: '6px', overflowX: 'auto', backgroundColor: 'var(--bg-panel)', maxHeight: '600px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-page)', zIndex: 10 }}>
            <tr>
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  onClick={() => handleSort(col.accessorKey)}
                  style={{ 
                    padding: '0.75rem 1rem', 
                    borderBottom: '1px solid var(--border-hairline)',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textAlign: col.isNumeric ? 'right' : 'left',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: col.isNumeric ? 'flex-end' : 'flex-start', gap: '4px' }}>
                    {col.header}
                    {sortConfig?.key === col.accessorKey && (
                      <span style={{ color: 'var(--text-ink)' }}>
                        {sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData && sortedData.length > 0 ? (
              sortedData.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {columns.map((col, colIdx) => (
                    <td 
                      key={colIdx} 
                      style={{ 
                        padding: rowPadding,
                        borderBottom: rowIdx === sortedData.length - 1 ? 'none' : '1px solid var(--border-hairline)',
                        textAlign: col.isNumeric ? 'right' : 'left',
                        fontFamily: col.isNumeric ? 'var(--font-plex-mono), monospace' : 'inherit',
                        color: 'var(--text-ink)'
                      }}
                    >
                      {col.render ? col.render(row) : row[col.accessorKey]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '1rem', color: 'var(--text-ink)', marginBottom: '0.5rem' }}>No records found</div>
                  {searchTerm ? 'No data matches this filter — try widening your date range or adjusting your search.' : emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {data && data.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Showing {sortedData.length} of {data.length} rows
        </div>
      )}
    </div>
  );
}
