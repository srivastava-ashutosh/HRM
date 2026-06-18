import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import ColumnSettings from '../../components/common/ColumnSettings';
import ExportButton from '../../components/common/ExportButton';
import ImportButton from '../../components/common/ImportButton';

const RecruitmentVacancies = () => {
  const [items, setItems] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ name: '', jobTitle: '', hiringManager: '', numPositions: 1, description: '', isPublished: false });
  const toast = useToast();
  const confirm = useConfirm();

  const allColumns = [
    { key: 'name', label: 'Name' },
    { key: 'jobTitle', label: 'Job Title' },
    { key: 'hiringManager', label: 'Hiring Manager' },
    { key: 'numPositions', label: 'Positions' },
    { key: 'status', label: 'Status' },
    { key: '_actions', label: 'Actions' },
  ];
  const saved = JSON.parse(localStorage.getItem('cols_recruitment_vacancies') || 'null');
  const [visibleColumns, setVisibleColumns] = useState(saved || allColumns.map(c => c.key));

  useEffect(() => {
    fetchItems();
    api.get('/admin/job-titles').then(res => setJobTitles(res.data)).catch(() => {});
    api.get('/pim/employees').then(res => setEmployees(res.data)).catch(() => {});
  }, []);

  const fetchItems = async () => {
    const { data } = await api.get('/recruitment/vacancies');
    setItems(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (edit) {
      await api.put(`/recruitment/vacancies/${edit._id}`, form);
    } else {
      await api.post('/recruitment/vacancies', form);
    }
    setShowModal(false); setEdit(null); setForm({ name: '', jobTitle: '', hiringManager: '', numPositions: 1, description: '', isPublished: false });
    fetchItems();
  };

  const handleDelete = async (id) => {
    const ok = await confirm('Delete this vacancy?', 'Delete Vacancy');
    if (!ok) return;
    try {
      await api.delete(`/recruitment/vacancies/${id}`);
      toast.success('Vacancy deleted');
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="toolbar">
        <div className="toolbar-right" style={{ marginLeft: 'auto' }}>
          <ColumnSettings columns={allColumns} visibleColumns={visibleColumns} onChange={setVisibleColumns} storageKey="cols_recruitment_vacancies" />
          <ExportButton data={items} columns={allColumns} filename="vacancies" visibleColumns={visibleColumns} />
          <ImportButton onImport={(rows) => api.post('/recruitment/vacancies/import', rows)} columns={allColumns} />
          <button className="btn btn-primary" onClick={() => { setEdit(null); setForm({ name: '', jobTitle: '', hiringManager: '', numPositions: 1, description: '', isPublished: false }); setShowModal(true); }}><FiPlus /> Add Vacancy</button>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3>Vacancies</h3></div>
        <div className="card-body">
          <div className="table-container">
            <table>
              <thead><tr>{allColumns.filter(c => visibleColumns.includes(c.key)).map(c => <th key={c.key}>{c.label}</th>)}</tr></thead>
              <tbody>
                {items.map(item => (
                  <tr key={item._id}>
                    {visibleColumns.includes('name') && <td><strong>{item.name}</strong></td>}
                    {visibleColumns.includes('jobTitle') && <td>{item.jobTitle?.title || '-'}</td>}
                    {visibleColumns.includes('hiringManager') && <td>{item.hiringManager?.fullName || '-'}</td>}
                    {visibleColumns.includes('numPositions') && <td>{item.numPositions}</td>}
                    {visibleColumns.includes('status') && <td><span className={`status-badge ${item.status ? 'status-approved' : 'status-rejected'}`}>{item.status ? 'Active' : 'Closed'}</span></td>}
                    {visibleColumns.includes('_actions') && <td>
                      <button className="action-btn" onClick={() => { setEdit(item); setForm({ name: item.name, jobTitle: item.jobTitle?._id || '', hiringManager: item.hiringManager?._id || '', numPositions: item.numPositions, description: item.description, isPublished: item.isPublished }); setShowModal(true); }}><FiEdit2 /></button>
                      <button className="action-btn" onClick={() => handleDelete(item._id)}><FiTrash2 /></button>
                    </td>}
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan={visibleColumns.length} style={{ textAlign: 'center', padding: 24, color: '#999' }}>No vacancies found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>{edit ? 'Edit' : 'Add'} Vacancy</h3><button className="close-btn" onClick={() => setShowModal(false)}>&times;</button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group"><label>Name</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group"><label>Job Title</label><select value={form.jobTitle} onChange={e => setForm({...form, jobTitle: e.target.value})} required>
                    <option value="">Select...</option>
                    {jobTitles.map(jt => <option key={jt._id} value={jt._id}>{jt.title}</option>)}
                  </select></div>
                  <div className="form-group"><label>Hiring Manager</label><select value={form.hiringManager} onChange={e => setForm({...form, hiringManager: e.target.value})}>
                    <option value="">Select...</option>
                    {employees.map(e => <option key={e._id} value={e._id}>{e.fullName}</option>)}
                  </select></div>
                  <div className="form-group"><label>Number of Positions</label><input type="number" min="1" value={form.numPositions} onChange={e => setForm({...form, numPositions: +e.target.value})} /></div>
                  <div className="form-group"><label><input type="checkbox" checked={form.isPublished} onChange={e => setForm({...form, isPublished: e.target.checked})} /> Published</label></div>
                </div>
                <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} /></div>
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

export default RecruitmentVacancies;
