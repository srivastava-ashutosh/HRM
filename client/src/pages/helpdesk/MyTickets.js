import React from 'react';
import api from '../../services/api';
import useApi from '../../hooks/useApi';
import DataTable from '../../components/common/DataTable';

const statusColors = {
  open: 'status-pending', assigned: 'status-info', in_progress: 'status-pending',
  resolved: 'status-approved', closed: 'status-draft',
};
const priorityColors = { low: '#999', medium: '#FF7B1D', high: '#E74C3C', urgent: '#C0392B' };

const MyTickets = () => {
  const { data: items, loading } = useApi(() => api.get('/helpdesk/tickets/my'), { immediate: true, showToast: false });

  const columns = [
    { key: 'subject', label: 'Subject', sortable: true, render: (t) => <strong>{t.subject}</strong> },
    { key: 'category', label: 'Category', render: (t) => <span className="status-badge status-info">{t.category}</span> },
    {
      key: 'priority', label: 'Priority', render: (t) => (
        <span style={{ color: priorityColors[t.priority], fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>{t.priority}</span>
      ),
    },
    { key: 'status', label: 'Status', render: (t) => <span className={`status-badge ${statusColors[t.status] || ''}`}>{t.status.replace('_', ' ')}</span> },
    {
      key: 'role', label: 'Role', render: (t) => (
        <span style={{ fontSize: 12, color: '#999' }}>{t.createdBy?._id === (items?.[0]?.createdBy?._id) ? 'Reporter' : 'Assignee'}</span>
      ),
    },
    { key: 'createdAt', label: 'Created', render: (t) => new Date(t.createdAt).toLocaleDateString() },
  ];

  return (
    <DataTable
      columns={columns}
      data={items || []}
      loading={loading}
      storageKey="cols_my_tickets"
      emptyMessage="No tickets found"
    />
  );
};

export default MyTickets;
