import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import ColumnSettings from '../../components/common/ColumnSettings';
import ExportButton from '../../components/common/ExportButton';
import ImportButton from '../../components/common/ImportButton';

const RecruitmentCandidates = () => {
  const [items, setItems] = useState([]);
  const [vacancies, setVacancies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ firstName: '', middleName: '', lastName: '', email: '', contactNumber: '', vacancy: '', status: 'applied' });
  const toast = useToast();
  const confirm = useConfirm();

  const allColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'vacancy', label: 'Vacancy' },
    { key: 'status', label: 'Status' },
    { key: 'dateOfApplication', label: 'Applied' },
    { key: '_actions', label: 'Actions' },
  ];
  const saved = JSON.parse(localStorage.getItem('cols_recruitment_candidates') || 'null');
  const [visibleColumns, setVisibleColumns] = useState(saved || allColumns.map(c => c.key));

  useEffect(() => {
    fetchItems();
    api.get('/recruitment/vacancies').then(res => setVacancies(res.data)).catch(() => {});
  }, []);

  const fetchItems = async () => {
    const { data } = await api.get('/recruitment/candidates');
    setItems(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (edit) {
      await api.put(`/recruitment/candidates/${edit._id}`, form);
    } else {
      await api.post('/recruitment/candidates', form);
    }
    setShowModal(false); setEdit(null); setForm({ firstName: '', middleName: '', lastName: '', email: '', contactNumber: '', vacancy: '', status: 'applied' });
    fetchItems();
  };

  const handleDelete = async (id) => {
    const ok = await confirm('Delete this candidate record?', 'Delete Candidate');
    if (!ok) return;
    try {
      await api.delete(`/recruitment/candidates/${id}`);
      toast.success('Candidate deleted');
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const pipelineStages = ['applied', 'shortlisted', 'interviewed', 'offered', 'hired', 'rejected'];

  return (
    <div>
      <div className="toolbar">
        <div className="toolbar-right" style={{ marginLeft: 'auto' }}>
          <ColumnSettings columns={allColumns} visibleColumns={visibleColumns} onChange={setVisibleColumns} storageKey="cols_recruitment_candidates" />
          <ExportButton data={items} columns={allColumns} filename="candidates" visibleColumns={visibleColumns} />
          <ImportButton onImport={(rows) => api.post('/recruitment/candidates/import', rows)} columns={allColumns} />
          <button className="btn btn-primary" onClick={() => { setEdit(null); setForm({ firstName: '', middleName: '', lastName: '', email: '', contactNumber: '', vacancy: '', status: 'applied' }); setShowModal(true); }}><FiPlus /> Add Candidate</button>
        </div>
      </div>

      <div className="pipeline" style={{ marginBottom: 20 }}>
        {pipelineStages.map(stage => (
          <div key={stage} className="pipeline-column">
            <h4>{stage} ({items.filter(c => c.status === stage).length})</h4>
            {items.filter(c => c.status === stage).map(c => (
              <div key={c._id} className="pipeline-card">
                <h5>{c.firstName} {c.lastName}</h5>
                <p>{c.email}</p>
                <p>{c.vacancy?.name || '-'}</p>
                <div style={{ marginTop: 4 }}>
                  <button className="btn btn-sm btn-outline" onClick={() => {
                    const nextIdx = pipelineStages.indexOf(c.status) + 1;
                    if (nextIdx < pipelineStages.length) {
                      const nextStatus = pipelineStages[nextIdx];
                      api.put(`/recruitment/candidates/${c._id}`, { status: nextStatus }).then(fetchItems);
                    }
                  }} style={{ fontSize: 11 }}>Advance</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header"><h3>All Candidates</h3></div>
        <div className="card-body">
          <div className="table-container">
            <table>
              <thead><tr>{allColumns.filter(c => visibleColumns.includes(c.key)).map(c => <th key={c.key}>{c.label}</th>)}</tr></thead>
              <tbody>
                {items.map(c => (
                  <tr key={c._id}>
                    {visibleColumns.includes('name') && <td><strong>{c.firstName} {c.lastName}</strong></td>}
                    {visibleColumns.includes('email') && <td>{c.email}</td>}
                    {visibleColumns.includes('vacancy') && <td>{c.vacancy?.name || '-'}</td>}
                    {visibleColumns.includes('status') && <td><span className={`status-badge status-${c.status}`}>{c.status}</span></td>}
                    {visibleColumns.includes('dateOfApplication') && <td>{new Date(c.dateOfApplication).toLocaleDateString()}</td>}
                    {visibleColumns.includes('_actions') && <td>
                      <button className="action-btn" onClick={() => { setEdit(c); setForm({ firstName: c.firstName, middleName: c.middleName, lastName: c.lastName, email: c.email, contactNumber: c.contactNumber, vacancy: c.vacancy?._id || '', status: c.status }); setShowModal(true); }}><FiEdit2 /></button>
                      <button className="action-btn" onClick={() => handleDelete(c._id)}><FiTrash2 /></button>
                    </td>}
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan={visibleColumns.length} style={{ textAlign: 'center', padding: 24, color: '#999' }}>No candidates found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>{edit ? 'Edit' : 'Add'} Candidate</h3><button className="close-btn" onClick={() => setShowModal(false)}>&times;</button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div className="form-group"><label>First Name*</label><input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} required /></div>
                  <div className="form-group"><label>Middle Name</label><input value={form.middleName} onChange={e => setForm({...form, middleName: e.target.value})} /></div>
                  <div className="form-group"><label>Last Name*</label><input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} required /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group"><label>Email*</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
                  <div className="form-group"><label>Contact Number</label><input value={form.contactNumber} onChange={e => setForm({...form, contactNumber: e.target.value})} /></div>
                  <div className="form-group"><label>Vacancy</label><select value={form.vacancy} onChange={e => setForm({...form, vacancy: e.target.value})}>
                    <option value="">Select...</option>
                    {vacancies.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                  </select></div>
                  <div className="form-group"><label>Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    {pipelineStages.map(s => <option key={s} value={s}>{s}</option>)}
                  </select></div>
                </div>
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

export default RecruitmentCandidates;
