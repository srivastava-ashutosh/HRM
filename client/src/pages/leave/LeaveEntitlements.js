import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiPlus } from 'react-icons/fi';
import ColumnSettings from '../../components/common/ColumnSettings';
import ExportButton from '../../components/common/ExportButton';
import ImportButton from '../../components/common/ImportButton';

const LeaveEntitlements = () => {
  const [items, setItems] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ employee: '', leaveType: '', entitlement: 0, leavePeriod: '2026-01-01' });

  const allColumns = [
    { key: 'employee', label: 'Employee' },
    { key: 'leaveType', label: 'Leave Type' },
    { key: 'entitlement', label: 'Entitlement' },
    { key: 'daysUsed', label: 'Used' },
    { key: 'balance', label: 'Balance' },
    { key: 'leavePeriod', label: 'Period' },
  ];
  const saved = JSON.parse(localStorage.getItem('cols_leave_entitlements') || 'null');
  const [visibleColumns, setVisibleColumns] = useState(saved || allColumns.map(c => c.key));

  useEffect(() => {
    fetchItems();
    api.get('/pim/employees').then(res => setEmployees(res.data)).catch(() => {});
    api.get('/leave/types').then(res => setLeaveTypes(res.data)).catch(() => {});
  }, []);

  const fetchItems = async () => {
    const { data } = await api.get('/leave/entitlements');
    setItems(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/leave/entitlements', form);
    setShowModal(false);
    setForm({ employee: '', leaveType: '', entitlement: 0, leavePeriod: '2026-01-01' });
    fetchItems();
  };

  return (
    <div>
      <div className="toolbar">
        <div className="toolbar-right" style={{ marginLeft: 'auto' }}>
          <ColumnSettings columns={allColumns} visibleColumns={visibleColumns} onChange={setVisibleColumns} storageKey="cols_leave_entitlements" />
          <ExportButton data={items} columns={allColumns} filename="leave-entitlements" visibleColumns={visibleColumns} />
          <ImportButton onImport={(rows) => api.post('/leave/entitlements/import', rows)} columns={allColumns} />
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus /> Add Entitlement</button>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3>Leave Entitlements</h3></div>
        <div className="card-body">
          <div className="table-container">
            <table>
              <thead><tr>{allColumns.filter(c => visibleColumns.includes(c.key)).map(c => <th key={c.key}>{c.label}</th>)}</tr></thead>
              <tbody>
                {items.map(item => (
                  <tr key={item._id}>
                    {visibleColumns.includes('employee') && <td><strong>{item.employee?.fullName}</strong></td>}
                    {visibleColumns.includes('leaveType') && <td>{item.leaveType?.name}</td>}
                    {visibleColumns.includes('entitlement') && <td>{item.entitlement}</td>}
                    {visibleColumns.includes('daysUsed') && <td>{item.daysUsed || 0}</td>}
                    {visibleColumns.includes('balance') && <td><strong>{(item.entitlement || 0) - (item.daysUsed || 0)}</strong></td>}
                    {visibleColumns.includes('leavePeriod') && <td>{item.leavePeriod}</td>}
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan={visibleColumns.length} style={{ textAlign: 'center', padding: 24, color: '#999' }}>No entitlements found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Add Leave Entitlement</h3><button className="close-btn" onClick={() => setShowModal(false)}>&times;</button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group"><label>Employee</label><select value={form.employee} onChange={e => setForm({...form, employee: e.target.value})} required>
                  <option value="">Select...</option>
                  {employees.map(e => <option key={e._id} value={e._id}>{e.fullName}</option>)}
                </select></div>
                <div className="form-group"><label>Leave Type</label><select value={form.leaveType} onChange={e => setForm({...form, leaveType: e.target.value})} required>
                  <option value="">Select...</option>
                  {leaveTypes.map(lt => <option key={lt._id} value={lt._id}>{lt.name}</option>)}
                </select></div>
                <div className="form-group"><label>Entitlement Days</label><input type="number" value={form.entitlement} onChange={e => setForm({...form, entitlement: +e.target.value})} required /></div>
                <div className="form-group"><label>Leave Period</label><input type="text" value={form.leavePeriod} onChange={e => setForm({...form, leavePeriod: e.target.value})} /></div>
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

export default LeaveEntitlements;
