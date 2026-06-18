import React, { useState } from 'react';
import api from '../../services/api';
import { FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';
import useApi from '../../hooks/useApi';
import DataTable from '../../components/common/DataTable';

const statusColors = {
  enrolled: '#e3f2fd', in_progress: '#fff3e0',
  completed: '#e8f5e9', cancelled: '#fce4ec',
};
const statusTextColors = {
  enrolled: '#1565c0', in_progress: '#e65100',
  completed: '#2e7d32', cancelled: '#c62828',
};

const TrainingRecords = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const toast = useToast();

  const { data: result, loading, execute: refetch } = useApi(
    () => api.get('/training/records', { params: { page, limit } }),
    { immediate: true, showToast: false }
  );
  const records = result?.data || [];
  const total = result?.total || 0;
  const totalPages = result?.totalPages || 1;

  const handleUpdate = async (record, updates) => {
    try {
      await api.put(`/training/records/${record._id}`, updates);
      toast.success('Record updated');
      refetch();
    } catch (err) { toast.error(err.normalizedMessage || 'Update failed'); }
  };

  const columns = [
    { key: 'employee', label: 'Employee', sortable: true, render: (r) => <strong>{r.employee?.fullName || '-'}</strong> },
    { key: 'course', label: 'Course', render: (r) => r.course?.title || '-' },
    { key: 'enrollmentDate', label: 'Enrolled', render: (r) => new Date(r.enrollmentDate).toLocaleDateString() },
    { key: 'completionDate', label: 'Completed', render: (r) => r.completionDate ? new Date(r.completionDate).toLocaleDateString() : '-' },
    {
      key: 'status', label: 'Status', render: (r) => (
        <span className="status-badge" style={{ background: statusColors[r.status], color: statusTextColors[r.status] }}>
          {r.status.replace('_', ' ')}
        </span>
      )
    },
    { key: 'score', label: 'Score', render: (r) => r.score !== undefined ? `${r.score}%` : '-' },
  ];

  const actions = [
    {
      icon: FiCheck, label: 'Mark Completed', className: 'action-btn-approve',
      hide: (r) => r.status === 'completed' || r.status === 'cancelled',
      onClick: (r) => handleUpdate(r, { status: 'completed' }),
    },
    {
      icon: FiX, label: 'Cancel', className: 'action-btn-reject',
      hide: (r) => r.status === 'completed' || r.status === 'cancelled',
      onClick: (r) => handleUpdate(r, { status: 'cancelled' }),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={records}
      loading={loading}
      total={total}
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
      limit={limit}
      onLimitChange={(l) => { setLimit(l); setPage(1); }}
      storageKey="cols_training_records"
      emptyMessage="No training records found"
      actions={actions}
    />
  );
};

export default TrainingRecords;
