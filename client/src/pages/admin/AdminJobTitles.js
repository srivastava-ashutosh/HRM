import React, { useState } from 'react';
import api from '../../services/api';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import useApi from '../../hooks/useApi';
import ImportButton from '../../components/common/ImportButton';
import DataTable from '../../components/common/DataTable';

const AdminJobTitles = () => {
  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', note: '' });
  const toast = useToast();
  const confirm = useConfirm();

  const { data: items, loading, execute: refetch } = useApi(() => api.get('/admin/job-titles'), { immediate: true, showToast: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.warning('Title is required');
    try {
      if (edit) {
        await api.put(`/admin/job-titles/${edit._id}`, form);
        toast.success('Job title updated');
      } else {
        await api.post('/admin/job-titles', form);
        toast.success('Job title created');
      }
      setShowModal(false); setEdit(null); setForm({ title: '', description: '', note: '' });
      refetch();
    } catch (err) {
      toast.error(err.normalizedMessage || 'Operation failed');
    }
  };

  const handleDelete = async (item) => {
    const ok = await confirm(`Delete job title "${item.title}"? Related employees may be affected.`, 'Delete Job Title');
    if (!ok) return;
    try {
      await api.delete(`/admin/job-titles/${item._id}`);
      toast.success('Job title deleted');
      refetch();
    } catch (err) {
      toast.error(err.normalizedMessage || 'Delete failed');
    }
  };

  const columns = [
    { key: 'title', label: 'Title', render: (j) => <strong>{j.title}</strong> },
    { key: 'description', label: 'Description', render: (j) => j.description || '-' },
    { key: 'note', label: 'Note', render: (j) => j.note || '-' },
  ];

  const actions = [
    { icon: FiEdit2, label: 'Edit', onClick: (item) => { setEdit(item); setForm({ title: item.title, description: item.description, note: item.note }); setShowModal(true); } },
    { icon: FiTrash2, label: 'Delete', onClick: handleDelete },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        data={items || []}
        loading={loading}
        actions={actions}
        storageKey="cols_admin_jobtitles"
        emptyMessage="No job titles found"
        addLabel="Add Job Title"
        onAdd={() => { setEdit(null); setForm({ title: '', description: '', note: '' }); setShowModal(true); }}
        toolbarRight={<ImportButton onImport={(rows) => api.post('/admin/job-titles/import', rows)} columns={columns} />}
      />

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>{edit ? 'Edit' : 'Add'} Job Title</h3><button className="close-btn" onClick={() => setShowModal(false)}>&times;</button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group"><label>Title</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
                <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} /></div>
                <div className="form-group"><label>Note</label><textarea value={form.note} onChange={e => setForm({...form, note: e.target.value})} rows={2} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{edit ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobTitles;
