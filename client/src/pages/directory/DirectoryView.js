import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const DirectoryView = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [jobTitles, setJobTitles] = useState([]);
  const [filterJob, setFilterJob] = useState('');

  useEffect(() => {
    fetchDirectory();
    api.get('/admin/job-titles').then(res => setJobTitles(res.data)).catch(() => {});
  }, []);

  const fetchDirectory = async (q, jt) => {
    const params = {};
    if (q) params.search = q;
    if (jt) params.jobTitle = jt;
    const { data } = await api.get('/directory', { params });
    setEmployees(data);
  };

  const handleSearch = (val) => {
    setSearch(val);
    fetchDirectory(val, filterJob);
  };

  const handleFilterJob = (val) => {
    setFilterJob(val);
    fetchDirectory(search, val);
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div>
      <div className="toolbar">
        <div className="search-box">
          <input placeholder="Search directory..." value={search} onChange={e => handleSearch(e.target.value)} />
        </div>
        <div className="toolbar-right">
          <select value={filterJob} onChange={e => handleFilterJob(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13 }}>
            <option value="">All Jobs</option>
            {jobTitles.map(jt => <option key={jt._id} value={jt._id}>{jt.title}</option>)}
          </select>
        </div>
      </div>
      <div className="employee-grid">
        {employees.map(emp => (
          <div key={emp._id} className="employee-card">
            <div className="avatar">{getInitials(emp.fullName)}</div>
            <h4>{emp.fullName}</h4>
            <p>{emp.jobTitle?.title || 'No Title'}</p>
            <p>{emp.department || '-'}</p>
            <p style={{ fontSize: 12, marginTop: 8 }}>{emp.workEmail || ''}</p>
            <p style={{ fontSize: 12 }}>{emp.contactNumber || ''}</p>
          </div>
        ))}
        {employees.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: '#999' }}>No employees found</div>
        )}
      </div>
    </div>
  );
};

export default DirectoryView;
