import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const PimAddEmployee = () => {
  const navigate = useNavigate();
  const [jobTitles, setJobTitles] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [form, setForm] = useState({
    firstName: '', middleName: '', lastName: '',
    employeeId: '', department: '', workEmail: '',
    jobTitle: '', supervisor: '',
    createUser: false, username: '', password: '', role: 'ess'
  });

  useEffect(() => {
    api.get('/admin/job-titles').then(res => setJobTitles(res.data)).catch(() => {});
    api.get('/pim/employees').then(res => setSupervisors(res.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form };
    for (const key of ['jobTitle', 'supervisor', 'workEmail', 'employeeId', 'department', 'middleName']) {
      if (!payload[key]) delete payload[key];
    }
    await api.post('/pim/employees', payload);
    navigate('/pim');
  };

  return (
    <div className="card">
      <div className="card-header"><h3>Add Employee</h3></div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <h4 style={{ marginBottom: 16, color: '#666' }}>Personal Details</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div className="form-group"><label htmlFor="firstName">First Name*</label><input id="firstName" name="firstName" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} required /></div>
            <div className="form-group"><label htmlFor="middleName">Middle Name</label><input id="middleName" name="middleName" value={form.middleName} onChange={e => setForm({...form, middleName: e.target.value})} /></div>
            <div className="form-group"><label htmlFor="lastName">Last Name*</label><input id="lastName" name="lastName" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} required /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group"><label htmlFor="employeeId">Employee ID</label><input id="employeeId" name="employeeId" value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})} /></div>
            <div className="form-group"><label htmlFor="department">Department</label><input id="department" name="department" value={form.department} onChange={e => setForm({...form, department: e.target.value})} /></div>
            <div className="form-group"><label htmlFor="workEmail">Work Email</label><input id="workEmail" name="workEmail" type="email" value={form.workEmail} onChange={e => setForm({...form, workEmail: e.target.value})} /></div>
            <div className="form-group"><label htmlFor="jobTitle">Job Title</label><select id="jobTitle" name="jobTitle" value={form.jobTitle} onChange={e => setForm({...form, jobTitle: e.target.value})}>
              <option value="">Select...</option>
              {jobTitles.map(jt => <option key={jt._id} value={jt._id}>{jt.title}</option>)}
            </select></div>
            <div className="form-group"><label htmlFor="supervisor">Supervisor</label><select id="supervisor" name="supervisor" value={form.supervisor} onChange={e => setForm({...form, supervisor: e.target.value})}>
              <option value="">None</option>
              {supervisors.map(s => <option key={s._id} value={s._id}>{s.fullName}</option>)}
            </select></div>
          </div>
          <h4 style={{ margin: '16px 0', color: '#666' }}>Login Details</h4>
          <div className="form-group"><label><input id="createUser" name="createUser" type="checkbox" checked={form.createUser} onChange={e => setForm({...form, createUser: e.target.checked})} /> Create Login Account</label></div>
          {form.createUser && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div className="form-group"><label htmlFor="username">Username*</label><input id="username" name="username" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required={form.createUser} /></div>
              <div className="form-group"><label htmlFor="password">Password*</label><input id="password" name="password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required={form.createUser} /></div>
              <div className="form-group"><label htmlFor="role">Role</label><select id="role" name="role" value={form.role} onChange={e => setForm({...form, role: e.target.value})}><option value="ess">ESS</option><option value="admin">Admin</option><option value="supervisor">Supervisor</option></select></div>
            </div>
          )}
          <div style={{ marginTop: 20 }}>
            <button type="submit" className="btn btn-primary">Save Employee</button>
            <button type="button" className="btn btn-outline" style={{ marginLeft: 8 }} onClick={() => navigate('/pim')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PimAddEmployee;
