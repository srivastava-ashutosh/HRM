import React, { useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import useApi from '../../hooks/useApi';
import DataTable from '../../components/common/DataTable';

const statusColors = {
  pending: 'status-pending', approved: 'status-info',
  clearing: 'status-pending', completed: 'status-approved', rejected: 'status-draft',
};

const CreateModal = ({ onClose, onSubmit }) => {
  const [form, setForm] = useState({ reason: '', lastWorkingDay: '' });
  const handleSubmit = (e) => { e.preventDefault(); if (!form.reason.trim()) return; onSubmit(form); };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h3>Submit Resignation</h3><button className="close-btn" onClick={onClose}>&times;</button></div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group"><label htmlFor="exitReason">Reason for Leaving</label><textarea id="exitReason" name="reason" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} rows={3} required /></div>
            <div className="form-group"><label htmlFor="lastWorkingDay">Last Working Day</label><input id="lastWorkingDay" type="date" value={form.lastWorkingDay} onChange={e => setForm({...form, lastWorkingDay: e.target.value})} /></div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ClearanceModal = ({ request, onClose }) => (
  <div className="modal-backdrop" onClick={onClose}>
    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
      <div className="modal-header"><h3>Clearance Checklist</h3><button className="close-btn" onClick={onClose}>&times;</button></div>
      <div className="modal-body">
        <table className="table" style={{ fontSize: 13 }}>
          <thead><tr><th>Department</th><th>Item</th><th>Status</th><th>Cleared At</th></tr></thead>
          <tbody>
            {request.clearanceItems?.map(item => (
              <tr key={item._id}>
                <td><span className="status-badge status-info">{item.department}</span></td>
                <td>{item.item}</td>
                <td><span className={`status-badge ${item.status === 'cleared' ? 'status-approved' : 'status-pending'}`}>{item.status}</span></td>
                <td>{item.clearedAt ? new Date(item.clearedAt).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="modal-footer">
        <button className="btn btn-outline" onClick={onClose}>Close</button>
      </div>
    </div>
  </div>
);

const MyExitRequests = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const toast = useToast();

  const { data: items, loading, execute: refetch } = useApi(
    () => api.get('/exit/requests/my'),
    { immediate: true, showToast: false }
  );

  const handleCreate = async (form) => {
    try {
      await api.post('/exit/requests', {
        reason: form.reason,
        lastWorkingDay: form.lastWorkingDay || undefined,
      });
      toast.success('Exit request submitted');
      setShowCreate(false);
      refetch();
    } catch (err) { toast.error(err.normalizedMessage || 'Submission failed'); }
  };

  const columns = [
    { key: 'type', label: 'Type', render: (r) => <span className="status-badge status-info">{r.type}</span> },
    { key: 'status', label: 'Status', render: (r) => <span className={`status-badge ${statusColors[r.status] || ''}`}>{r.status}</span> },
    { key: 'lastWorkingDay', label: 'Last Working Day', render: (r) => r.lastWorkingDay ? new Date(r.lastWorkingDay).toLocaleDateString() : '-' },
    { key: 'createdAt', label: 'Submitted', render: (r) => new Date(r.createdAt).toLocaleDateString() },
    { key: 'reviewedBy', label: 'Reviewed By', render: (r) => r.reviewedBy?.fullName || '-' },
  ];

  const actions = [
    {
      icon: null, label: 'View Clearance', onClick: (r) => {
        if (!['clearing', 'completed'].includes(r.status)) return toast.warning('Clearance not started yet');
        setActiveRequest(r);
      },
    },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        data={items || []}
        loading={loading}
        storageKey="cols_my_exit"
        emptyMessage="No exit requests submitted"
        addLabel="Submit Resignation"
        onAdd={() => setShowCreate(true)}
        actions={actions}
      />
      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onSubmit={handleCreate} />}
      {activeRequest && <ClearanceModal request={activeRequest} onClose={() => setActiveRequest(null)} />}
    </div>
  );
};

export default MyExitRequests;
