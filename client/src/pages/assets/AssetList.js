import React, { useState } from 'react';
import api from '../../services/api';
import { FiEdit2, FiTrash2, FiArrowUpRight, FiArrowDownLeft } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import useApi from '../../hooks/useApi';
import DataTable from '../../components/common/DataTable';

const assetTypes = ['laptop', 'monitor', 'phone', 'tablet', 'headset', 'keyboard', 'mouse', 'printer', 'other'];
const statusColors = { available: 'status-approved', assigned: 'status-info', maintenance: 'status-pending', retired: 'status-rejected' };

const AssetModal = ({ edit, form, setForm, onSubmit, onClose }) => (
  <div className="modal-backdrop" onClick={onClose}>
    <div className="modal" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3>{edit ? 'Edit' : 'Add'} Asset</h3>
        <button className="close-btn" onClick={onClose}>&times;</button>
      </div>
      <form onSubmit={onSubmit}>
        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} required>
                <option value="">Select type...</option>
                {assetTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Brand</label>
              <input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Model</label>
              <input value={form.model} onChange={e => setForm({...form, model: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Serial Number</label>
              <input value={form.serialNumber} onChange={e => setForm({...form, serialNumber: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Purchase Date</label>
              <input type="date" value={form.purchaseDate?.split('T')[0] || ''} onChange={e => setForm({...form, purchaseDate: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Purchase Price ($)</label>
              <input type="number" value={form.purchasePrice || ''} onChange={e => setForm({...form, purchasePrice: Number(e.target.value)})} min={0} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Warranty Expiry</label>
              <input type="date" value={form.warrantyExpiry?.split('T')[0] || ''} onChange={e => setForm({...form, warrantyExpiry: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} />
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">{edit ? 'Update' : 'Save'}</button>
        </div>
      </form>
    </div>
  </div>
);

const AssignModal = ({ onAssign, onClose }) => {
  const [assetId, setAssetId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [notes, setNotes] = useState('');
  const { data: assets } = useApi(() => api.get('/assets', { params: { status: 'available', limit: 200 } }), { immediate: true, showToast: false });
  const { data: employees } = useApi(() => api.get('/pim/supervisors'), { immediate: true, showToast: false });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!assetId || !employeeId) return;
    onAssign({ assetId, employeeId, notes });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Assign Asset</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Asset</label>
              <select value={assetId} onChange={e => setAssetId(e.target.value)} required>
                <option value="">Select asset...</option>
                {(assets?.data || assets || []).filter(a => a.status === 'available').map(a => (
                  <option key={a._id} value={a._id}>{a.name} ({a.type}{a.serialNumber ? ` - ${a.serialNumber}` : ''})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Employee</label>
              <select value={employeeId} onChange={e => setEmployeeId(e.target.value)} required>
                <option value="">Select employee...</option>
                {(employees || []).map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.fullName} ({emp.employeeId})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
            </div>
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

const ReturnModal = ({ asset, onReturn, onClose }) => {
  const [condition, setCondition] = useState('good');
  const [status, setStatus] = useState('available');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onReturn({ assetId: asset._id, condition, status, notes });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Return Asset: {asset.name}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Condition</label>
              <select value={condition} onChange={e => setCondition(e.target.value)}>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
                <option value="damaged">Damaged</option>
              </select>
            </div>
            <div className="form-group">
              <label>New Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Return</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AssetList = () => {
  const [showModal, setShowModal] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [edit, setEdit] = useState(null);
  const [returnAsset, setReturnAsset] = useState(null);
  const [form, setForm] = useState({
    name: '', type: '', brand: '', model: '', serialNumber: '',
    purchaseDate: '', purchasePrice: 0, warrantyExpiry: '', status: 'available',
    location: '', notes: '',
  });
  const toast = useToast();
  const confirm = useConfirm();

  const { data: assets, loading, execute: refetch } = useApi(
    () => api.get('/assets', { params: { limit: 100 } }),
    { immediate: true, showToast: false }
  );
  const items = assets?.data || [];
  const total = assets?.total || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.warning('Asset name is required');
    try {
      if (edit) {
        await api.put(`/assets/${edit._id}`, form);
        toast.success('Asset updated');
      } else {
        await api.post('/assets', form);
        toast.success('Asset created');
      }
      setShowModal(false); setEdit(null);
      setForm({ name: '', type: '', brand: '', model: '', serialNumber: '', purchaseDate: '', purchasePrice: 0, warrantyExpiry: '', status: 'available', location: '', notes: '' });
      refetch();
    } catch (err) { toast.error(err.normalizedMessage || 'Operation failed'); }
  };

  const handleDelete = async (asset) => {
    const ok = await confirm(`Retire asset "${asset.name}"?`, 'Retire Asset');
    if (!ok) return;
    try {
      await api.delete(`/assets/${asset._id}`);
      toast.success('Asset retired');
      refetch();
    } catch (err) { toast.error(err.normalizedMessage || 'Delete failed'); }
  };

  const handleAssign = async ({ assetId, employeeId, notes }) => {
    try {
      await api.post('/assets/assign', { assetId, employeeId, notes });
      toast.success('Asset assigned');
      setShowAssign(false);
      refetch();
    } catch (err) { toast.error(err.normalizedMessage || 'Assignment failed'); }
  };

  const handleReturn = async ({ assetId, condition, status, notes }) => {
    try {
      await api.post('/assets/return', { assetId, condition, status, notes });
      toast.success('Asset returned');
      setShowReturn(false);
      setReturnAsset(null);
      refetch();
    } catch (err) { toast.error(err.normalizedMessage || 'Return failed'); }
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true, render: (a) => <strong>{a.name}</strong> },
    { key: 'type', label: 'Type', render: (a) => <span className="status-badge status-info">{a.type}</span> },
    { key: 'brand', label: 'Brand', render: (a) => a.brand || '-' },
    { key: 'serialNumber', label: 'Serial #', render: (a) => a.serialNumber || '-' },
    { key: 'location', label: 'Location', render: (a) => a.location || '-' },
    { key: 'status', label: 'Status', render: (a) => <span className={`status-badge ${statusColors[a.status] || ''}`}>{a.status}</span> },
    { key: 'purchasePrice', label: 'Price', render: (a) => a.purchasePrice ? `$${a.purchasePrice.toLocaleString()}` : '-' },
  ];

  const actions = [
    { icon: FiArrowUpRight, label: 'Assign', onClick: (item) => { if (item.status === 'available') { setForm(item); setShowAssign(true); } else toast.warning('Only available assets can be assigned'); } },
    { icon: FiArrowDownLeft, label: 'Return', onClick: (item) => { if (item.status === 'assigned') { setReturnAsset(item); setShowReturn(true); } else toast.warning('Asset is not assigned'); } },
    { icon: FiEdit2, label: 'Edit', onClick: (item) => { setEdit(item); setForm({ name: item.name, type: item.type, brand: item.brand || '', model: item.model || '', serialNumber: item.serialNumber || '', purchaseDate: item.purchaseDate ? item.purchaseDate.split('T')[0] : '', purchasePrice: item.purchasePrice || 0, warrantyExpiry: item.warrantyExpiry ? item.warrantyExpiry.split('T')[0] : '', status: item.status, location: item.location || '', notes: item.notes || '' }); setShowModal(true); } },
    { icon: FiTrash2, label: 'Retire', onClick: handleDelete },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        total={total}
        storageKey="cols_assets"
        emptyMessage="No assets found"
        addLabel="Add Asset"
        onAdd={() => { setEdit(null); setForm({ name: '', type: '', brand: '', model: '', serialNumber: '', purchaseDate: '', purchasePrice: 0, warrantyExpiry: '', status: 'available', location: '', notes: '' }); setShowModal(true); }}
        actions={actions}
      />
      {showModal && <AssetModal edit={edit} form={form} setForm={setForm} onSubmit={handleSubmit} onClose={() => setShowModal(false)} />}
      {showAssign && <AssignModal onAssign={handleAssign} onClose={() => setShowAssign(false)} />}
      {showReturn && returnAsset && <ReturnModal asset={returnAsset} onReturn={handleReturn} onClose={() => { setShowReturn(false); setReturnAsset(null); }} />}
    </div>
  );
};

export default AssetList;
