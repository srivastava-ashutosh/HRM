import React, { useState } from 'react';
import api from '../../services/api';
import { FiCheck, FiX, FiUserPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import useApi from '../../hooks/useApi';
import DataTable from '../../components/common/DataTable';

const categories = ['IT', 'HR', 'Facilities', 'Finance', 'Other'];
const priorities = ['low', 'medium', 'high', 'urgent'];
const statusColors = {
  open: 'status-pending', assigned: 'status-info', in_progress: 'status-pending',
  resolved: 'status-approved', closed: 'status-draft',
};
const priorityColors = { low: '#999', medium: '#FF7B1D', high: '#E74C3C', urgent: '#C0392B' };

const CreateModal = ({ onClose, onSubmit }) => {
  const [form, setForm] = useState({ subject: '', description: '', category: 'IT', priority: 'medium' });
  const handleSubmit = (e) => { e.preventDefault(); if (!form.subject.trim()) return; onSubmit(form); };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h3>Create Ticket</h3><button className="close-btn" onClick={onClose}>&times;</button></div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group"><label htmlFor="ticketSubject">Subject</label><input id="ticketSubject" name="subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required /></div>
            <div className="form-group"><label htmlFor="ticketDesc">Description</label><textarea id="ticketDesc" name="description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group"><label htmlFor="ticketCategory">Category</label><select id="ticketCategory" name="category" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select></div>
              <div className="form-group"><label htmlFor="ticketPriority">Priority</label><select id="ticketPriority" name="priority" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select></div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AssignModal = ({ ticket, onAssign, onClose }) => {
  const [employeeId, setEmployeeId] = useState('');
  const { data: employees } = useApi(() => api.get('/pim/employees'), { immediate: true, showToast: false });
  const handleSubmit = (e) => { e.preventDefault(); onAssign(ticket._id, employeeId); };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h3>Assign Ticket</h3><button className="close-btn" onClick={onClose}>&times;</button></div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p><strong>{ticket.subject}</strong></p>
            <div className="form-group"><label htmlFor="assignEmployee">Assign To</label><select id="assignEmployee" value={employeeId} onChange={e => setEmployeeId(e.target.value)} required>
              <option value="">Select...</option>
              {(employees || []).map(e => <option key={e._id} value={e._id}>{e.fullName}</option>)}
            </select></div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Assign</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ResolveModal = ({ ticket, onResolve, onClose }) => {
  const [resolution, setResolution] = useState('');
  const handleSubmit = (e) => { e.preventDefault(); onResolve(ticket._id, resolution); };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h3>Resolve Ticket</h3><button className="close-btn" onClick={onClose}>&times;</button></div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p><strong>{ticket.subject}</strong></p>
            <div className="form-group"><label htmlFor="resolution">Resolution Notes</label><textarea id="resolution" value={resolution} onChange={e => setResolution(e.target.value)} rows={3} required /></div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Resolve</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TicketList = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState(null);
  const [showResolve, setShowResolve] = useState(null);
  const toast = useToast();
  const confirm = useConfirm();

  const { data: tickets, loading, execute: refetch } = useApi(
    () => api.get('/helpdesk/tickets', { params: { limit: 100 } }),
    { immediate: true, showToast: false }
  );
  const items = tickets?.data || [];
  const total = tickets?.pagination?.total || 0;

  const handleCreate = async (form) => {
    try {
      await api.post('/helpdesk/tickets', form);
      toast.success('Ticket created');
      setShowCreate(false);
      refetch();
    } catch (err) { toast.error(err.normalizedMessage || 'Create failed'); }
  };

  const handleAssign = async (id, employeeId) => {
    try {
      await api.put(`/helpdesk/tickets/${id}/assign`, { assignedTo: employeeId });
      toast.success('Ticket assigned');
      setShowAssign(null);
      refetch();
    } catch (err) { toast.error(err.normalizedMessage || 'Assign failed'); }
  };

  const handleResolve = async (id, resolution) => {
    try {
      await api.put(`/helpdesk/tickets/${id}/resolve`, { resolution });
      toast.success('Ticket resolved');
      setShowResolve(null);
      refetch();
    } catch (err) { toast.error(err.normalizedMessage || 'Resolve failed'); }
  };

  const handleClose = async (ticket) => {
    const ok = await confirm(`Close ticket "${ticket.subject}"?`, 'Close Ticket');
    if (!ok) return;
    try {
      await api.put(`/helpdesk/tickets/${ticket._id}/close`);
      toast.success('Ticket closed');
      refetch();
    } catch (err) { toast.error(err.normalizedMessage || 'Close failed'); }
  };

  const columns = [
    { key: 'subject', label: 'Subject', sortable: true, render: (t) => <strong>{t.subject}</strong> },
    { key: 'category', label: 'Category', render: (t) => <span className="status-badge status-info">{t.category}</span> },
    {
      key: 'priority', label: 'Priority', render: (t) => (
        <span style={{ color: priorityColors[t.priority], fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>{t.priority}</span>
      ),
    },
    { key: 'status', label: 'Status', render: (t) => <span className={`status-badge ${statusColors[t.status] || ''}`}>{t.status.replace('_', ' ')}</span> },
    { key: 'createdBy', label: 'Created By', render: (t) => t.createdBy?.fullName || '-' },
    { key: 'assignedTo', label: 'Assigned To', render: (t) => t.assignedTo?.fullName || <span style={{ color: '#999' }}>Unassigned</span> },
    { key: 'createdAt', label: 'Created', render: (t) => new Date(t.createdAt).toLocaleDateString() },
  ];

  const actions = [
    {
      icon: FiUserPlus, label: 'Assign', onClick: (t) => {
        if (t.status === 'closed') return toast.warning('Ticket is closed');
        setShowAssign(t);
      },
    },
    {
      icon: FiCheck, label: 'Resolve', onClick: (t) => {
        if (t.status === 'closed') return toast.warning('Ticket is closed');
        if (t.status === 'resolved') return toast.warning('Already resolved');
        setShowResolve(t);
      },
    },
    { icon: FiX, label: 'Close', onClick: handleClose },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        total={total}
        storageKey="cols_helpdesk"
        emptyMessage="No tickets found"
        addLabel="Create Ticket"
        onAdd={() => setShowCreate(true)}
        actions={actions}
      />
      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onSubmit={handleCreate} />}
      {showAssign && <AssignModal ticket={showAssign} onAssign={handleAssign} onClose={() => setShowAssign(null)} />}
      {showResolve && <ResolveModal ticket={showResolve} onResolve={handleResolve} onClose={() => setShowResolve(null)} />}
    </div>
  );
};

export default TicketList;
