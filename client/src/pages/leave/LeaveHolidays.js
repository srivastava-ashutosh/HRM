import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiTrash2, FiPlus } from 'react-icons/fi';
import ColumnSettings from '../../components/common/ColumnSettings';
import ExportButton from '../../components/common/ExportButton';
import ImportButton from '../../components/common/ImportButton';

const LeaveHolidays = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', date: '', recurring: false });

  const allColumns = [
    { key: 'name', label: 'Name' },
    { key: 'date', label: 'Date' },
    { key: 'recurring', label: 'Recurring' },
    { key: '_actions', label: 'Actions' },
  ];
  const saved = JSON.parse(localStorage.getItem('cols_leave_holidays') || 'null');
  const [visibleColumns, setVisibleColumns] = useState(saved || allColumns.map(c => c.key));

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const { data } = await api.get('/leave/holidays');
    setItems(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/leave/holidays', form);
    setShowModal(false); setForm({ name: '', date: '', recurring: false });
    fetchItems();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this holiday?')) {
      await api.delete(`/leave/holidays/${id}`);
      fetchItems();
    }
  };

  return (
    <div>
      <div className="toolbar">
        <div className="toolbar-right" style={{ marginLeft: 'auto' }}>
          <ColumnSettings columns={allColumns} visibleColumns={visibleColumns} onChange={setVisibleColumns} storageKey="cols_leave_holidays" />
          <ExportButton data={items} columns={allColumns} filename="leave-holidays" visibleColumns={visibleColumns} />
          <ImportButton onImport={(rows) => api.post('/leave/holidays/import', rows)} columns={allColumns} />
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus /> Add Holiday</button>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3>Holidays</h3></div>
        <div className="card-body">
          <div className="table-container">
            <table>
              <thead><tr>{allColumns.filter(c => visibleColumns.includes(c.key)).map(c => <th key={c.key}>{c.label}</th>)}</tr></thead>
              <tbody>
                {items.map(item => (
                  <tr key={item._id}>
                    {visibleColumns.includes('name') && <td><strong>{item.name}</strong></td>}
                    {visibleColumns.includes('date') && <td>{new Date(item.date).toLocaleDateString()}</td>}
                    {visibleColumns.includes('recurring') && <td>{item.recurring ? 'Yes' : 'No'}</td>}
                    {visibleColumns.includes('_actions') && <td><button className="action-btn" onClick={() => handleDelete(item._id)}><FiTrash2 /></button></td>}
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan={visibleColumns.length} style={{ textAlign: 'center', padding: 24, color: '#999' }}>No holidays found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Add Holiday</h3><button className="close-btn" onClick={() => setShowModal(false)}>&times;</button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group"><label>Holiday Name</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required /></div>
                <div className="form-group"><label><input type="checkbox" checked={form.recurring} onChange={e => setForm({...form, recurring: e.target.checked})} /> Recurring Yearly</label></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveHolidays;
