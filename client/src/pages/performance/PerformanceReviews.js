import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiPlus, FiStar, FiTrash2 } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import ColumnSettings from '../../components/common/ColumnSettings';
import ExportButton from '../../components/common/ExportButton';
import ImportButton from '../../components/common/ImportButton';

const PerformanceReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    employee: '', reviewer: '', title: '', dueDate: '', reviewPeriod: '2026',
    items: [{ criteria: '', rating: 1, comment: '' }]
  });
  const toast = useToast();
  const confirm = useConfirm();

  const allColumns = [
    { key: 'employee', label: 'Employee' },
    { key: 'reviewer', label: 'Reviewer' },
    { key: 'title', label: 'Title' },
    { key: 'overallRating', label: 'Rating' },
    { key: 'status', label: 'Status' },
    { key: 'dueDate', label: 'Due' },
    { key: '_actions', label: 'Actions' },
  ];
  const saved = JSON.parse(localStorage.getItem('cols_performance_reviews') || 'null');
  const [visibleColumns, setVisibleColumns] = useState(saved || allColumns.map(c => c.key));

  useEffect(() => {
    fetchReviews();
    api.get('/pim/employees').then(res => setEmployees(res.data)).catch(() => {});
  }, []);

  const fetchReviews = async () => {
    const { data } = await api.get('/performance/reviews');
    setReviews(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/performance/reviews', form);
    setShowModal(false);
    setForm({ employee: '', reviewer: '', title: '', dueDate: '', reviewPeriod: '2026', items: [{ criteria: '', rating: 1, comment: '' }] });
    fetchReviews();
  };

  const handleComplete = async (id) => {
    await api.put(`/performance/reviews/complete/${id}`, { finalComment: '' });
    fetchReviews();
  };

  const handleDelete = async (id) => {
    const ok = await confirm('Archive this review?', 'Archive Review');
    if (!ok) return;
    try {
      await api.delete(`/performance/reviews/${id}`);
      toast.success('Review archived');
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Archive failed');
    }
  };

  const addCriteria = () => {
    setForm({...form, items: [...form.items, { criteria: '', rating: 1, comment: '' }]});
  };

  const updateCriteria = (idx, field, value) => {
    const items = [...form.items];
    items[idx] = {...items[idx], [field]: value};
    setForm({...form, items});
  };

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map(i => (
      <FiStar key={i} style={{ color: i <= rating ? '#f39c12' : '#ddd', cursor: 'pointer' }} />
    ));
  };

  return (
    <div>
      <div className="toolbar">
        <div className="toolbar-right" style={{ marginLeft: 'auto' }}>
          <ColumnSettings columns={allColumns} visibleColumns={visibleColumns} onChange={setVisibleColumns} storageKey="cols_performance_reviews" />
          <ExportButton data={reviews} columns={allColumns} filename="performance-reviews" visibleColumns={visibleColumns} />
          <ImportButton onImport={(rows) => api.post('/performance/reviews/import', rows)} columns={allColumns} />
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus /> New Review</button>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3>Performance Reviews</h3></div>
        <div className="card-body">
          <div className="table-container">
            <table>
              <thead><tr>{allColumns.filter(c => visibleColumns.includes(c.key)).map(c => <th key={c.key}>{c.label}</th>)}</tr></thead>
              <tbody>
                {reviews.map(r => (
                  <tr key={r._id}>
                    {visibleColumns.includes('employee') && <td><strong>{r.employee?.fullName}</strong></td>}
                    {visibleColumns.includes('reviewer') && <td>{r.reviewer?.fullName}</td>}
                    {visibleColumns.includes('title') && <td>{r.title}</td>}
                    {visibleColumns.includes('overallRating') && <td>{r.overallRating ? <span style={{ color: '#f39c12' }}>{'★'.repeat(Math.round(r.overallRating))}</span> : '-'}</td>}
                    {visibleColumns.includes('status') && <td><span className={`status-badge status-${r.status === 'completed' ? 'approved' : r.status === 'in_progress' ? 'submitted' : 'draft'}`}>{r.status}</span></td>}
                    {visibleColumns.includes('dueDate') && <td>{r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '-'}</td>}
                    {visibleColumns.includes('_actions') && <td>
                      {r.status !== 'completed' && <button className="action-btn" style={{ color: '#2ecc71' }} onClick={() => handleComplete(r._id)} title="Complete"><FiStar /></button>}
                      <button className="action-btn" onClick={() => handleDelete(r._id)}><FiTrash2 /></button>
                    </td>}
                  </tr>
                ))}
                {reviews.length === 0 && <tr><td colSpan={visibleColumns.length} style={{ textAlign: 'center', padding: 24, color: '#999' }}>No reviews found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div className="modal-header"><h3>New Performance Review</h3><button className="close-btn" onClick={() => setShowModal(false)}>&times;</button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group"><label>Employee*</label><select value={form.employee} onChange={e => setForm({...form, employee: e.target.value})} required>
                    <option value="">Select...</option>
                    {employees.map(e => <option key={e._id} value={e._id}>{e.fullName}</option>)}
                  </select></div>
                  <div className="form-group"><label>Reviewer*</label><select value={form.reviewer} onChange={e => setForm({...form, reviewer: e.target.value})} required>
                    <option value="">Select...</option>
                    {employees.map(e => <option key={e._id} value={e._id}>{e.fullName}</option>)}
                  </select></div>
                  <div className="form-group"><label>Title*</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
                  <div className="form-group"><label>Due Date</label><input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} /></div>
                </div>
                <h4 style={{ margin: '12px 0', fontSize: 14 }}>Review Criteria</h4>
                {form.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <input style={{ flex: 2, padding: '6px 8px', fontSize: 12 }} placeholder="Criteria" value={item.criteria} onChange={e => updateCriteria(i, 'criteria', e.target.value)} required />
                    <select style={{ width: 80, padding: '6px', fontSize: 12 }} value={item.rating} onChange={e => updateCriteria(i, 'rating', +e.target.value)}>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <input style={{ flex: 2, padding: '6px 8px', fontSize: 12 }} placeholder="Comment" value={item.comment} onChange={e => updateCriteria(i, 'comment', e.target.value)} />
                  </div>
                ))}
                <button type="button" className="btn btn-sm btn-outline" onClick={addCriteria}>+ Add Criteria</button>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceReviews;
