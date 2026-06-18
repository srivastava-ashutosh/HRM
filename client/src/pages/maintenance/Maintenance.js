import React, { useState } from 'react';
import api from '../../services/api';
import { FiShield, FiTrash2, FiSearch } from 'react-icons/fi';

const Maintenance = () => {
  const [mode, setMode] = useState('purge');
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [result, setResult] = useState(null);

  const fetchEmployees = async () => {
    const { data } = await api.get('/pim/employees', { params: { search } });
    setEmployees(data);
  };

  const handlePurgeEmployee = async () => {
    if (!selectedId || !window.confirm('This will permanently delete this employee record. Are you sure?')) return;
    try {
      const { data } = await api.delete(`/maintenance/purge/employee/${selectedId}`);
      setResult(data);
      setSelectedId('');
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Purge failed');
    }
  };

  const handleAccessRecords = async () => {
    if (!selectedId) return;
    try {
      const { data } = await api.get(`/maintenance/access-records/${selectedId}`);
      setResult(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Access failed');
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header"><h3><FiShield /> Maintenance - GDPR Compliance</h3></div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <button className={`btn ${mode === 'purge' ? 'btn-danger' : 'btn-outline'}`} onClick={() => { setMode('purge'); setResult(null); }}>Purge Records</button>
            <button className={`btn ${mode === 'access' ? 'btn-info' : 'btn-outline'}`} onClick={() => { setMode('access'); setResult(null); }}>Access Records</button>
          </div>

          <div className="form-group">
            <label>Search Employee</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name..." style={{ flex: 1 }} />
              <button className="btn btn-sm btn-outline" onClick={fetchEmployees}><FiSearch /> Search</button>
            </div>
          </div>

          {employees.length > 0 && (
            <div className="table-container" style={{ marginBottom: 16 }}>
              <table>
                <thead><tr><th></th><th>ID</th><th>Name</th><th>Department</th></tr></thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp._id} style={{ cursor: 'pointer', background: selectedId === emp._id ? '#fff3e0' : 'inherit' }} onClick={() => setSelectedId(emp._id)}>
                      <td><input type="radio" name="emp" checked={selectedId === emp._id} readOnly /></td>
                      <td>{emp.employeeId}</td>
                      <td><strong>{emp.fullName}</strong></td>
                      <td>{emp.department}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            {mode === 'purge' && (
              <button className="btn btn-danger" disabled={!selectedId} onClick={handlePurgeEmployee}>
                <FiTrash2 /> Purge Selected Employee
              </button>
            )}
            {mode === 'access' && (
              <button className="btn btn-info" disabled={!selectedId} onClick={handleAccessRecords}>
                <FiSearch /> Access Records
              </button>
            )}
          </div>

          {result && (
            <div style={{ marginTop: 20, padding: 16, background: '#f8f9fa', borderRadius: 6 }}>
              <pre style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
