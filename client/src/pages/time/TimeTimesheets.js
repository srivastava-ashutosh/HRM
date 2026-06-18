import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiPlus, FiCheck, FiSend } from 'react-icons/fi';
import ExportButton from '../../components/common/ExportButton';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TimeTimesheets = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    employee: '', weekEnding: '', items: DAYS.map(() => ({ project: '', activity: '', monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0 }))
  });

  const allColumns = [
    { key: 'project', label: 'Project' },
    { key: 'mon', label: 'Mon' },
    { key: 'tue', label: 'Tue' },
    { key: 'wed', label: 'Wed' },
    { key: 'thu', label: 'Thu' },
    { key: 'fri', label: 'Fri' },
    { key: 'sat', label: 'Sat' },
    { key: 'sun', label: 'Sun' },
  ];
  const saved = JSON.parse(localStorage.getItem('cols_time_timesheets') || 'null');
  const [visibleColumns, setVisibleColumns] = useState(saved || allColumns.map(c => c.key));

  useEffect(() => {
    fetchTimesheets();
    api.get('/pim/employees').then(res => setEmployees(res.data)).catch(() => {});
  }, []);

  const fetchTimesheets = async () => {
    const { data } = await api.get('/time/timesheets');
    setTimesheets(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/time/timesheets', form);
    setShowModal(false);
    fetchTimesheets();
  };

  const handleSubmitTs = async (id) => {
    await api.put(`/time/timesheets/submit/${id}`);
    fetchTimesheets();
  };

  const handleApprove = async (id) => {
    await api.put(`/time/timesheets/approve/${id}`);
    fetchTimesheets();
  };

  return (
    <div>
      <div className="toolbar">
        <div className="toolbar-right" style={{ marginLeft: 'auto' }}>
          <ExportButton data={timesheets} columns={allColumns} filename="timesheets" visibleColumns={visibleColumns} />
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus /> New Timesheet</button>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3>Timesheets</h3></div>
        <div className="card-body">
          {timesheets.map(ts => (
            <div key={ts._id} style={{ marginBottom: 20, border: '1px solid var(--border)', borderRadius: 6, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <strong>{ts.employee?.fullName} - Week Ending {new Date(ts.weekEnding).toLocaleDateString()}</strong>
                <span className={`status-badge status-${ts.status}`}>{ts.status}</span>
              </div>
              <div className="table-container">
                <table>
                  <thead><tr><th>Project</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th><th>Sun</th></tr></thead>
                  <tbody>
                    {ts.items?.map((item, i) => (
                      <tr key={i}>
                        <td>{item.project}</td>
                        <td>{item.monday}</td><td>{item.tuesday}</td><td>{item.wednesday}</td><td>{item.thursday}</td>
                        <td>{item.friday}</td><td>{item.saturday}</td><td>{item.sunday}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                {ts.status === 'draft' && <button className="btn btn-sm btn-info" onClick={() => handleSubmitTs(ts._id)}><FiSend /> Submit</button>}
                {ts.status === 'submitted' && <button className="btn btn-sm btn-secondary" onClick={() => handleApprove(ts._id)}><FiCheck /> Approve</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 800 }}>
            <div className="modal-header"><h3>New Timesheet</h3><button className="close-btn" onClick={() => setShowModal(false)}>&times;</button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group"><label>Employee</label><select value={form.employee} onChange={e => setForm({...form, employee: e.target.value})} required>
                    <option value="">Select...</option>
                    {employees.map(e => <option key={e._id} value={e._id}>{e.fullName}</option>)}
                  </select></div>
                  <div className="form-group"><label>Week Ending</label><input type="date" value={form.weekEnding} onChange={e => setForm({...form, weekEnding: e.target.value})} required /></div>
                </div>
                <h4 style={{ margin: '12px 0', fontSize: 14 }}>Time Entries</h4>
                {form.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 4, alignItems: 'center' }}>
                    <input style={{ width: 120, padding: '4px 8px', fontSize: 12 }} placeholder="Project" value={item.project} onChange={e => {
                      const items = [...form.items]; items[i] = {...items[i], project: e.target.value}; setForm({...form, items});
                    }} />
                    <input style={{ width: 50, padding: '4px', fontSize: 12, textAlign: 'center' }} placeholder="Mon" type="number" min="0" max="24" value={item.monday} onChange={e => {
                      const items = [...form.items]; items[i] = {...items[i], monday: +e.target.value}; setForm({...form, items});
                    }} />
                    <input style={{ width: 50, padding: '4px', fontSize: 12, textAlign: 'center' }} placeholder="Tue" type="number" min="0" max="24" value={item.tuesday} onChange={e => {
                      const items = [...form.items]; items[i] = {...items[i], tuesday: +e.target.value}; setForm({...form, items});
                    }} />
                    <input style={{ width: 50, padding: '4px', fontSize: 12, textAlign: 'center' }} placeholder="Wed" type="number" min="0" max="24" value={item.wednesday} onChange={e => {
                      const items = [...form.items]; items[i] = {...items[i], wednesday: +e.target.value}; setForm({...form, items});
                    }} />
                    <input style={{ width: 50, padding: '4px', fontSize: 12, textAlign: 'center' }} placeholder="Thu" type="number" min="0" max="24" value={item.thursday} onChange={e => {
                      const items = [...form.items]; items[i] = {...items[i], thursday: +e.target.value}; setForm({...form, items});
                    }} />
                    <input style={{ width: 50, padding: '4px', fontSize: 12, textAlign: 'center' }} placeholder="Fri" type="number" min="0" max="24" value={item.friday} onChange={e => {
                      const items = [...form.items]; items[i] = {...items[i], friday: +e.target.value}; setForm({...form, items});
                    }} />
                    <input style={{ width: 50, padding: '4px', fontSize: 12, textAlign: 'center' }} placeholder="Sat" type="number" min="0" max="24" value={item.saturday} onChange={e => {
                      const items = [...form.items]; items[i] = {...items[i], saturday: +e.target.value}; setForm({...form, items});
                    }} />
                    <input style={{ width: 50, padding: '4px', fontSize: 12, textAlign: 'center' }} placeholder="Sun" type="number" min="0" max="24" value={item.sunday} onChange={e => {
                      const items = [...form.items]; items[i] = {...items[i], sunday: +e.target.value}; setForm({...form, items});
                    }} />
                  </div>
                ))}
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

export default TimeTimesheets;
