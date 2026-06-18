import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiClock } from 'react-icons/fi';
import ColumnSettings from '../../components/common/ColumnSettings';
import ExportButton from '../../components/common/ExportButton';

const TimeAttendance = () => {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [punchEmp, setPunchEmp] = useState('');
  const [note, setNote] = useState('');

  const allColumns = [
    { key: 'employee', label: 'Employee' },
    { key: 'date', label: 'Date' },
    { key: 'punchIn', label: 'Punch In' },
    { key: 'punchOut', label: 'Punch Out' },
    { key: 'totalHours', label: 'Hours' },
    { key: 'state', label: 'Status' },
  ];
  const saved = JSON.parse(localStorage.getItem('cols_time_attendance') || 'null');
  const [visibleColumns, setVisibleColumns] = useState(saved || allColumns.map(c => c.key));

  useEffect(() => {
    fetchRecords();
    api.get('/pim/employees').then(res => setEmployees(res.data)).catch(() => {});
  }, []);

  const fetchRecords = async () => {
    const { data } = await api.get('/time/attendance');
    setRecords(data);
  };

  const handlePunchIn = async () => {
    if (!punchEmp) return alert('Select an employee');
    try {
      await api.post('/time/attendance/punch-in', { employee: punchEmp, note });
      setNote('');
      fetchRecords();
    } catch (err) {
      alert(err.response?.data?.message || 'Error punching in');
    }
  };

  const handlePunchOut = async () => {
    if (!punchEmp) return alert('Select an employee');
    try {
      await api.post('/time/attendance/punch-out', { employee: punchEmp, note });
      setNote('');
      fetchRecords();
    } catch (err) {
      alert(err.response?.data?.message || 'Error punching out');
    }
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div>
      <div className="attendance-status">
        <div className="attendance-time">{timeStr}</div>
        <div className="attendance-date">{dateStr}</div>
        <div style={{ marginTop: 16 }}>
          <div className="form-group" style={{ maxWidth: 300, margin: '0 auto' }}>
            <select value={punchEmp} onChange={e => setPunchEmp(e.target.value)} style={{ width: '100%' }}>
              <option value="">Select Employee</option>
              {employees.map(e => <option key={e._id} value={e._id}>{e.fullName}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ maxWidth: 300, margin: '12px auto' }}>
            <input placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-secondary punch-btn" onClick={handlePunchIn}><FiClock /> Punch In</button>
            <button className="btn btn-danger punch-btn" style={{ background: '#e74c3c' }} onClick={handlePunchOut}><FiClock /> Punch Out</button>
          </div>
        </div>
      </div>

      <div className="toolbar" style={{ marginTop: 20 }}>
        <div className="toolbar-right" style={{ marginLeft: 'auto' }}>
          <ColumnSettings columns={allColumns} visibleColumns={visibleColumns} onChange={setVisibleColumns} storageKey="cols_time_attendance" />
          <ExportButton data={records} columns={allColumns} filename="attendance" visibleColumns={visibleColumns} />
        </div>
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><h3>Attendance Records</h3></div>
        <div className="card-body">
          <div className="table-container">
            <table>
              <thead><tr>{allColumns.filter(c => visibleColumns.includes(c.key)).map(c => <th key={c.key}>{c.label}</th>)}</tr></thead>
              <tbody>
                {records.map(r => (
                  <tr key={r._id}>
                    {visibleColumns.includes('employee') && <td><strong>{r.employee?.fullName}</strong></td>}
                    {visibleColumns.includes('date') && <td>{new Date(r.date).toLocaleDateString()}</td>}
                    {visibleColumns.includes('punchIn') && <td>{r.punchIn ? new Date(r.punchIn).toLocaleTimeString() : '-'}</td>}
                    {visibleColumns.includes('punchOut') && <td>{r.punchOut ? new Date(r.punchOut).toLocaleTimeString() : '-'}</td>}
                    {visibleColumns.includes('totalHours') && <td>{r.totalHours ? r.totalHours.toFixed(1) : '-'}</td>}
                    {visibleColumns.includes('state') && <td><span className={`status-badge ${r.state === 'punched_in' ? 'status-pending' : 'status-approved'}`}>{r.state === 'punched_in' ? 'Punched In' : 'Punched Out'}</span></td>}
                  </tr>
                ))}
                {records.length === 0 && <tr><td colSpan={visibleColumns.length} style={{ textAlign: 'center', padding: 24, color: '#999' }}>No attendance records found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeAttendance;
