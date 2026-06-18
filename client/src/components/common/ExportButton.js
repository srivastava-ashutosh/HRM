import React from 'react';
import { FiDownload } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';

const ExportButton = ({ data, columns, filename = 'export', visibleColumns }) => {
  const toast = useToast();

  const handleExport = () => {
    try {
      const cols = columns.filter(c => visibleColumns ? visibleColumns.includes(c.key) : true);
      const header = cols.map(c => c.label).join(',');
      const rows = (data || []).map(row =>
        cols.map(col => {
          let val = col.render ? col.render(row) : row[col.key];
          if (val && typeof val === 'object') val = '';
          val = String(val ?? '');
          return val.includes(',') || val.includes('"') || val.includes('\n') ? `"${val.replace(/"/g, '""')}"` : val;
        }).join(',')
      );
      const csv = [header, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${data?.length || 0} records`);
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <button className="btn btn-outline btn-sm" onClick={handleExport} title="Export CSV">
      <FiDownload /> Export
    </button>
  );
};

export default ExportButton;
