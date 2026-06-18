import React, { useState } from 'react';
import api from '../../services/api';
import { FiCheck, FiX, FiPlay, FiDollarSign } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import useApi from '../../hooks/useApi';
import DataTable from '../../components/common/DataTable';

const statusColors = {
  pending: 'status-pending', approved: 'status-info',
  clearing: 'status-pending', completed: 'status-approved', rejected: 'status-draft',
};

const ApproveModal = ({ request, onApprove, onClose }) => (
  <div className="modal-backdrop" onClick={onClose}>
    <div className="modal" onClick={e => e.stopPropagation()}>
      <div className="modal-header"><h3>Approve Exit Request</h3><button className="close-btn" onClick={onClose}>&times;</button></div>
      <div className="modal-body">
        <p><strong>{request.employee?.fullName}</strong> — {request.type}</p>
        <p>Reason: {request.reason}</p>
        <p>Last Working Day: {request.lastWorkingDay ? new Date(request.lastWorkingDay).toLocaleDateString() : 'Not set'}</p>
      </div>
      <div className="modal-footer">
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => onApprove(request._id)}>Approve</button>
      </div>
    </div>
  </div>
);

const RejectModal = ({ request, onReject, onClose }) => {
  const [reason, setReason] = useState('');
  const handleSubmit = (e) => { e.preventDefault(); onReject(request._id, reason); };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h3>Reject Exit Request</h3><button className="close-btn" onClick={onClose}>&times;</button></div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p><strong>{request.employee?.fullName}</strong></p>
            <div className="form-group"><label htmlFor="rejectionReason">Rejection Reason</label><textarea id="rejectionReason" value={reason} onChange={e => setReason(e.target.value)} rows={3} required /></div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-danger">Reject</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ClearanceModal = ({ request, onRefresh, onClose }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(null);

  const handleClear = async (itemId) => {
    setLoading(itemId);
    try {
      await api.put(`/exit/requests/${request._id}/clear-item/${itemId}`);
      toast.success('Item cleared');
      onRefresh();
    } catch (err) { toast.error(err.normalizedMessage); }
    finally { setLoading(null); }
  };

  const allCleared = request.clearanceItems?.every(i => i.status === 'cleared');

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h3>Clearance Checklist — {request.employee?.fullName}</h3><button className="close-btn" onClick={onClose}>&times;</button></div>
        <div className="modal-body">
          <table className="table" style={{ fontSize: 13 }}>
            <thead><tr><th>Department</th><th>Item</th><th>Status</th><th>Cleared At</th><th style={{ width: 100 }}></th></tr></thead>
            <tbody>
              {request.clearanceItems?.map(item => (
                <tr key={item._id}>
                  <td><span className="status-badge status-info">{item.department}</span></td>
                  <td>{item.item}</td>
                  <td><span className={`status-badge ${item.status === 'cleared' ? 'status-approved' : 'status-pending'}`}>{item.status}</span></td>
                  <td>{item.clearedAt ? new Date(item.clearedAt).toLocaleDateString() : '-'}</td>
                  <td>
                    {item.status === 'pending' && (
                      <button className="btn btn-sm btn-primary" onClick={() => handleClear(item._id)} disabled={loading === item._id}>
                        {loading === item._id ? '...' : 'Clear'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="modal-footer">
          {allCleared && <span style={{ color: '#76BC21', fontWeight: 600, marginRight: 12 }}>All items cleared.</span>}
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

const FnfModal = ({ request, onComplete, onClose }) => {
  const [amount, setAmount] = useState('');
  const handleSubmit = (e) => { e.preventDefault(); onComplete(request._id, parseFloat(amount)); };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h3>Full & Final Settlement</h3><button className="close-btn" onClick={onClose}>&times;</button></div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p><strong>{request.employee?.fullName}</strong></p>
            <p>All clearance items completed. Enter the F&F amount to finalize.</p>
            <div className="form-group"><label htmlFor="fnfAmount">F&F Amount ($)</label><input id="fnfAmount" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required /></div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Complete & Deactivate</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ExitRequestList = () => {
  const [showApprove, setShowApprove] = useState(null);
  const [showReject, setShowReject] = useState(null);
  const [showClearance, setShowClearance] = useState(null);
  const [showFnf, setShowFnf] = useState(null);
  const toast = useToast();
  const confirm = useConfirm();

  const { data, loading, execute: refetch } = useApi(
    () => api.get('/exit/requests', { params: { limit: 100 } }),
    { immediate: true, showToast: false }
  );
  const items = data?.data || [];
  const total = data?.pagination?.total || 0;

  const handleApprove = async (id) => {
    try { await api.put(`/exit/requests/${id}/approve`); toast.success('Approved'); setShowApprove(null); refetch(); }
    catch (err) { toast.error(err.normalizedMessage); }
  };

  const handleReject = async (id, reason) => {
    try { await api.put(`/exit/requests/${id}/reject`, { rejectionReason: reason }); toast.success('Rejected'); setShowReject(null); refetch(); }
    catch (err) { toast.error(err.normalizedMessage); }
  };

  const handleStartClearance = async (request) => {
    const ok = await confirm(`Start clearance for ${request.employee?.fullName}?`);
    if (!ok) return;
    try { await api.put(`/exit/requests/${request._id}/start-clearance`); toast.success('Clearance started'); refetch(); }
    catch (err) { toast.error(err.normalizedMessage); }
  };

  const handleCompleteFnf = async (id, amount) => {
    try { await api.put(`/exit/requests/${id}/complete-fnf`, { fnfAmount: amount }); toast.success('Exit completed. Employee deactivated.'); setShowFnf(null); refetch(); }
    catch (err) { toast.error(err.normalizedMessage); }
  };

  const columns = [
    { key: 'employee', label: 'Employee', sortable: true, render: (r) => r.employee?.fullName || '-' },
    { key: 'employee', label: 'Department', render: (r) => r.employee?.department || '-' },
    { key: 'type', label: 'Type', render: (r) => <span className="status-badge status-info">{r.type}</span> },
    { key: 'reason', label: 'Reason', render: (r) => r.reason?.length > 50 ? r.reason.slice(0, 50) + '...' : r.reason },
    { key: 'status', label: 'Status', render: (r) => <span className={`status-badge ${statusColors[r.status] || ''}`}>{r.status}</span> },
    { key: 'lastWorkingDay', label: 'Last Day', render: (r) => r.lastWorkingDay ? new Date(r.lastWorkingDay).toLocaleDateString() : '-' },
    { key: 'createdAt', label: 'Submitted', render: (r) => new Date(r.createdAt).toLocaleDateString() },
  ];

  const actions = [
    {
      icon: FiCheck, label: 'Approve', onClick: (r) => {
        if (r.status !== 'pending') return toast.warning(`Already ${r.status}`);
        setShowApprove(r);
      },
    },
    {
      icon: FiX, label: 'Reject', onClick: (r) => {
        if (r.status !== 'pending') return toast.warning(`Already ${r.status}`);
        setShowReject(r);
      },
    },
    {
      icon: FiPlay, label: 'Start Clearance', onClick: (r) => {
        if (r.status !== 'approved') return toast.warning('Must be approved first');
        handleStartClearance(r);
      },
    },
    {
      icon: FiCheck, label: 'View Clearance', onClick: (r) => {
        if (!['clearing', 'completed'].includes(r.status)) return toast.warning('Clearance not started');
        setShowClearance(r);
      },
    },
    {
      icon: FiDollarSign, label: 'Complete F&F', onClick: (r) => {
        if (r.status !== 'clearing') return toast.warning('Clearance must be in progress');
        const allCleared = r.clearanceItems?.every(i => i.status === 'cleared');
        if (!allCleared) return toast.warning('All clearance items must be cleared first');
        setShowFnf(r);
      },
    },
  ];

  return (
    <div>
      <DataTable columns={columns} data={items} loading={loading} total={total} storageKey="cols_exit" emptyMessage="No exit requests" actions={actions} />
      {showApprove && <ApproveModal request={showApprove} onApprove={handleApprove} onClose={() => setShowApprove(null)} />}
      {showReject && <RejectModal request={showReject} onReject={handleReject} onClose={() => setShowReject(null)} />}
      {showClearance && <ClearanceModal request={showClearance} onRefresh={refetch} onClose={() => setShowClearance(null)} />}
      {showFnf && <FnfModal request={showFnf} onComplete={handleCompleteFnf} onClose={() => setShowFnf(null)} />}
    </div>
  );
};

export default ExitRequestList;
