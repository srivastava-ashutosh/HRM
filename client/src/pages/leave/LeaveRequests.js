import React, { useState } from 'react';
import api from '../../services/api';
import { FiPlus, FiCheck, FiX } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import useApi from '../../hooks/useApi';
import ColumnSettings from '../../components/common/ColumnSettings';
import ExportButton from '../../components/common/ExportButton';
import ImportButton from '../../components/common/ImportButton';

const LeaveRequests = () => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ employee: '', leaveType: '', fromDate: '', toDate: '', reason: '' });
  const toast = useToast();
  const confirm = useConfirm();

  const allColumns = [
    { key: 'employee', label: 'Employee' },
    { key: 'leaveType', label: 'Leave Type' },
    { key: 'fromDate', label: 'From' },
    { key: 'toDate', label: 'To' },
    { key: 'numberOfDays', label: 'Days' },
    { key: 'status', label: 'Status' },
    { key: '_actions', label: 'Actions' },
  ];
  const saved = JSON.parse(localStorage.getItem('cols_leave_requests') || 'null');
  const [visibleColumns, setVisibleColumns] = useState(saved || allColumns.map(c => c.key));

  const { data: requests, loading, execute: refetch } = useApi(() => api.get('/leave/requests'), { immediate: true, showToast: false });
  const { data: employees } = useApi(() => api.get('/pim/employees'), { immediate: true, showToast: false });
  const { data: leaveTypes } = useApi(() => api.get('/leave/types'), { immediate: true, showToast: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employee || !form.leaveType || !form.fromDate || !form.toDate) {
      return toast.warning('Please fill all required fields');
    }
    try {
      await api.post('/leave/requests', form);
      toast.success('Leave request submitted');
      setShowModal(false);
      setForm({ employee: '', leaveType: '', fromDate: '', toDate: '', reason: '' });
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit leave request');
    }
  };

  const handleApprove = async (id, employeeName) => {
    const ok = await confirm(`Approve leave request for ${employeeName}?`, 'Approve Leave');
    if (!ok) return;
    try {
      await api.put(`/leave/approve/${id}`);
      toast.success('Leave approved');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (id, employeeName) => {
    const ok = await confirm(`Reject leave request for ${employeeName}?`, 'Reject Leave');
    if (!ok) return;
    try {
      await api.put(`/leave/reject/${id}`);
      toast.success('Leave rejected');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed');
    }
  };

  return (
    <div>
      <div className="toolbar">
        <div className="toolbar-right" style={{ marginLeft: 'auto' }}>
          <ColumnSettings columns={allColumns} visibleColumns={visibleColumns} onChange={setVisibleColumns} storageKey="cols_leave_requests" />
          <ExportButton data={requests} columns={allColumns} filename="leave-requests" visibleColumns={visibleColumns} />
          <ImportButton onImport={(rows) => api.post('/leave/requests/import', rows)} columns={allColumns} />
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus /> Apply Leave</button>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3>Leave Requests</h3></div>
        <div className="card-body">
          <div className="table-container">
            <table>
              <thead><tr>{allColumns.filter(c => visibleColumns.includes(c.key)).map(c => <th key={c.key}>{c.label}</th>)}</tr></thead>
              <tbody>
                {(requests || []).map(r => (
                  <tr key={r._id}>
                    {visibleColumns.includes('employee') && <td><strong>{r.employee?.fullName}</strong></td>}
                    {visibleColumns.includes('leaveType') && <td>{r.leaveType?.name || '-'}</td>}
                    {visibleColumns.includes('fromDate') && <td>{new Date(r.fromDate).toLocaleDateString()}</td>}
                    {visibleColumns.includes('toDate') && <td>{new Date(r.toDate).toLocaleDateString()}</td>}
                    {visibleColumns.includes('numberOfDays') && <td>{r.numberOfDays}</td>}
                    {visibleColumns.includes('status') && <td><span className={`status-badge status-${r.status}`}>{r.status}</span></td>}
                    {visibleColumns.includes('_actions') && <td>
                      {r.status === 'pending' && (
                        <>
                          <button className="action-btn" style={{ color: '#2ecc71' }} onClick={() => handleApprove(r._id, r.employee?.fullName)} title="Approve"><FiCheck /></button>
                          <button className="action-btn" style={{ color: '#e74c3c' }} onClick={() => handleReject(r._id, r.employee?.fullName)} title="Reject"><FiX /></button>
                        </>
                      )}
                    </td>}
                  </tr>
                ))}
                {!loading && requests?.length === 0 && <tr><td colSpan={visibleColumns.length} style={{ textAlign: 'center', padding: 24, color: '#999' }}>No leave requests</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" id="leaveRequest" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Apply Leave</h3><button className="close-btn" onClick={() => setShowModal(false)}>&times;</button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group"><label htmlFor="leaveEmployee">Employee</label><select id="leaveEmployee" name="employee" value={form.employee} onChange={e => setForm({...form, employee: e.target.value})} required>
                  <option value="">Select...</option>
                  {(employees || []).map(e => <option key={e._id} value={e._id}>{e.fullName}</option>)}
                </select></div>
                <div className="form-group"><label htmlFor="leaveType">Leave Type</label><select id="leaveType" name="leaveType" value={form.leaveType} onChange={e => setForm({...form, leaveType: e.target.value})} required>
                  <option value="">Select...</option>
                  {(leaveTypes || []).map(lt => <option key={lt._id} value={lt._id}>{lt.name}</option>)}
                </select></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group"><label htmlFor="fromDate">From Date</label><input id="fromDate" name="fromDate" type="date" value={form.fromDate} onChange={e => setForm({...form, fromDate: e.target.value})} required /></div>
                  <div className="form-group"><label htmlFor="toDate">To Date</label><input id="toDate" name="toDate" type="date" value={form.toDate} onChange={e => setForm({...form, toDate: e.target.value})} required /></div>
                </div>
                <div className="form-group"><label htmlFor="leaveReason">Reason</label><textarea id="leaveReason" name="reason" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} rows={2} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Apply</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequests;
