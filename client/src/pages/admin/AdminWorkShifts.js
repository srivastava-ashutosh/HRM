import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import ColumnSettings from '../../components/common/ColumnSettings';
import ExportButton from '../../components/common/ExportButton';
import ImportButton from '../../components/common/ImportButton';

const AdminWorkShifts = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ name: '', startTime: '09:00', endTime: '18:00', hoursPerDay: 8 });

  const allColumns = [
    { key: 'name', label: 'Name' },
    { key: 'startTime', label: 'Start' },
    { key: 'endTime', label: 'End' },
    { key: 'hoursPerDay', label: 'Hours/Day' },
    { key: '_actions', label: 'Actions' },
  ];
  const saved = JSON.parse(localStorage.getItem('cols_admin_workshifts') || 'null');
  const [visibleColumns, setVisibleColumns] = useState(saved || allColumns.map(c => c.key));

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const { data } = await api.get('/admin/work-shifts');
    setItems(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (edit) {
      await api.put(`/admin/work-shifts/${edit._id}`, form);
    } else {
      await api.post('/admin/work-shifts', form);
    }
    setShowModal(false); setEdit(null); setForm({ name: '', startTime: '09:00', endTime: '18:00', hoursPerDay: 8 });
    fetchItems();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this work shift?')) {
      await api.delete(`/admin/work-shifts/${id}`);
      fetchItems();
    }
  };

  return (
    <div>
      <div className="toolbar">
        <div className="toolbar-right" style={{ marginLeft: 'auto' }}>
          <ColumnSettings columns={allColumns} visibleColumns={visibleColumns} onChange={setVisibleColumns} storageKey="cols_admin_workshifts" />
          <ExportButton data={items} columns={allColumns} filename="work-shifts" visibleColumns={visibleColumns} />
          <ImportButton onImport={(rows) => api.post('/admin/work-shifts/import', rows)} columns={allColumns} />
          <button className="btn btn-primary" onClick={() => { setEdit(null); setForm({ name: '', startTime: '09:00', endTime: '18:00', hoursPerDay: 8 }); setShowModal(true); }}><FiPlus /> Add Work Shift</button>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3>Work Shifts</h3></div>
        <div className="card-body">
          <div className="table-container">
            <table>
              <thead><tr>{allColumns.filter(c => visibleColumns.includes(c.key)).map(c => <th key={c.key}>{c.label}</th>)}</tr></thead>
              <tbody>
                {items.map(item => (
                  <tr key={item._id}>
                    {visibleColumns.includes('name') && <td><strong>{item.name}</strong></td>}
                    {visibleColumns.includes('startTime') && <td>{item.startTime}</td>}
                    {visibleColumns.includes('endTime') && <td>{item.endTime}</td>}
                    {visibleColumns.includes('hoursPerDay') && <td>{item.hoursPerDay}</td>}
                    {visibleColumns.includes('_actions') && <td>
                      <button className="action-btn" onClick={() => { setEdit(item); setForm({ name: item.name, startTime: item.startTime, endTime: item.endTime, hoursPerDay: item.hoursPerDay }); setShowModal(true); }}><FiEdit2 /></button>
                      <button className="action-btn" onClick={() => handleDelete(item._id)}><FiTrash2 /></button>
                    </td>}
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan={visibleColumns.length} style={{ textAlign: 'center', padding: 24, color: '#999' }}>No work shifts found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>{edit ? 'Edit' : 'Add'} Work Shift</h3><button className="close-btn" onClick={() => setShowModal(false)}>&times;</button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group"><label>Name</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div className="form-group"><label>Start</label><input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} /></div>
                  <div className="form-group"><label>End</label><input type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} /></div>
                  <div className="form-group"><label>Hours/Day</label><input type="number" value={form.hoursPerDay} onChange={e => setForm({...form, hoursPerDay: +e.target.value})} /></div>
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

export default AdminWorkShifts;
