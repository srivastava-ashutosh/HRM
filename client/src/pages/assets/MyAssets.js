import React from 'react';
import api from '../../services/api';
import useApi from '../../hooks/useApi';
import DataTable from '../../components/common/DataTable';

const statusColors = { available: 'status-approved', assigned: 'status-info', maintenance: 'status-pending', retired: 'status-rejected' };

const MyAssets = () => {
  const { data: items, loading } = useApi(() => api.get('/assets/my-assets'), { immediate: true, showToast: false });

  const columns = [
    { key: 'asset.name', label: 'Asset', sortable: true, render: (a) => <strong>{a.asset?.name}</strong> },
    { key: 'asset.type', label: 'Type', render: (a) => <span className="status-badge status-info">{a.asset?.type}</span> },
    { key: 'asset.brand', label: 'Brand', render: (a) => a.asset?.brand || '-' },
    { key: 'asset.serialNumber', label: 'Serial #', render: (a) => a.asset?.serialNumber || '-' },
    { key: 'asset.status', label: 'Status', render: (a) => <span className={`status-badge ${statusColors[a.asset?.status] || ''}`}>{a.asset?.status}</span> },
    { key: 'assignedDate', label: 'Assigned', render: (a) => new Date(a.assignedDate).toLocaleDateString() },
  ];

  return (
    <DataTable
      columns={columns}
      data={items || []}
      loading={loading}
      storageKey="cols_my_assets"
      emptyMessage="No assets assigned to you"
    />
  );
};

export default MyAssets;
