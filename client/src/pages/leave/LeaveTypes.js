import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import ColumnSettings from '../../components/common/ColumnSettings';
import ExportButton from '../../components/common/ExportButton';
import ImportButton from '../../components/common/ImportButton';

const LeaveTypes = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ name: '', color: '#76BC21' });

  const allColumns = [
    { key: 'name', label: 'Name' },
    { key: 'color', label: 'Color' },
    { key: '_actions', label: 'Actions' },
  ];
  const saved = JSON.parse(localStorage.getItem('cols_leave_types') || 'null');
  const [visibleColumns, setVisibleColumns] = useState(saved || allColumns.map(c => c.key));

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const { data } = await api.get('/leave/types');
    setItems(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (edit) {
      await api.put(`/leave/types/${edit._id}`, form);
    } else {
      await api.post('/leave/types', form);
    }
    setShowModal(false); setEdit(null); setForm({ name: '', color: '#76BC21' });
    fetchItems();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this leave type?')) {
      await api.delete(`/leave/types/${id}`);
      fetchItems();
    }
  };

  return (
    <div>
      <div className="toolbar">
        <div className="toolbar-right" style={{ marginLeft: 'auto' }}>
          <ColumnSettings columns={allColumns} visibleColumns={visibleColumns} onChange={setVisibleColumns} storageKey="cols_leave_types" />
          <ExportButton data={items} columns={allColumns} filename="leave-types" visibleColumns={visibleColumns} />
          <ImportButton onImport={(rows) => api.post('/leave/types/import', rows)} columns={allColumns} />
          <button className="btn btn-primary" onClick={() => { setEdit(null); setForm({ name: '', color: '#76BC21' }); setShowModal(true); }}><FiPlus /> Add Leave Type</button>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3>Leave Types</h3></div>
        <div className="card-body">
          <div className="table-container">
            <table>
              <thead><tr>{allColumns.filter(c => visibleColumns.includes(c.key)).map(c => <th key={c.key}>{c.label}</th>)}</tr></thead>
              <tbody>
                {items.map(item => (
                  <tr key={item._id}>
                    {visibleColumns.includes('name') && <td><strong>{item.name}</strong></td>}
                    {visibleColumns.includes('color') && <td><span style={{ display: 'inline-block', width: 20, height: 20, borderRadius: 4, background: item.color, verticalAlign: 'middle', marginRight: 8 }}></span>{item.color}</td>}
                    {visibleColumns.includes('_actions') && <td>
                      <button className="action-btn" onClick={() => { setEdit(item); setForm({ name: item.name, color: item.color }); setShowModal(true); }}><FiEdit2 /></button>
                      <button className="action-btn" onClick={() => handleDelete(item._id)}><FiTrash2 /></button>
                    </td>}
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan={visibleColumns.length} style={{ textAlign: 'center', padding: 24, color: '#999' }}>No leave types found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>{edit ? 'Edit' : 'Add'} Leave Type</h3><button className="close-btn" onClick={() => setShowModal(false)}>&times;</button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group"><label>Name</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                <div className="form-group"><label>Color</label><input type="color" value={form.color} onChange={e => setForm({...form, color: e.target.value})} /></div>
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

export default LeaveTypes;
