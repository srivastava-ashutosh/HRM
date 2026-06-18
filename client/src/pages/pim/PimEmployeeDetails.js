import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const PimEmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    api.get(`/pim/employees/${id}`).then(res => {
      setEmployee(res.data);
      setForm(res.data);
    }).catch(() => navigate('/pim'));
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.put(`/pim/employees/${id}`, form);
    setEmployee({...employee, ...form});
    setEditing(false);
  };

  if (!employee) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3>Employee: {employee.fullName} ({employee.employeeId})</h3>
          <button className="btn btn-sm btn-outline" onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>
        <div className="card-body">
          {editing ? (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div className="form-group"><label>First Name</label><input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} /></div>
                <div className="form-group"><label>Middle Name</label><input value={form.middleName} onChange={e => setForm({...form, middleName: e.target.value})} /></div>
                <div className="form-group"><label>Last Name</label><input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} /></div>
                <div className="form-group"><label>Work Email</label><input value={form.workEmail} onChange={e => setForm({...form, workEmail: e.target.value})} /></div>
                <div className="form-group"><label>Contact Number</label><input value={form.contactNumber} onChange={e => setForm({...form, contactNumber: e.target.value})} /></div>
                <div className="form-group"><label>Department</label><input value={form.department} onChange={e => setForm({...form, department: e.target.value})} /></div>
                <div className="form-group"><label>Marital Status</label><select value={form.maritalStatus} onChange={e => setForm({...form, maritalStatus: e.target.value})}><option>Single</option><option>Married</option><option>Divorced</option><option>Other</option></select></div>
                <div className="form-group"><label>Gender</label><select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}><option>Male</option><option>Female</option><option>Other</option></select></div>
                <div className="form-group"><label>Nationality</label><input value={form.nationality} onChange={e => setForm({...form, nationality: e.target.value})} /></div>
                <div className="form-group"><label>Date of Birth</label><input type="date" value={form.dateOfBirth ? new Date(form.dateOfBirth).toISOString().split('T')[0] : ''} onChange={e => setForm({...form, dateOfBirth: e.target.value})} /></div>
                <div className="form-group"><label>Joined Date</label><input type="date" value={form.joinedDate ? new Date(form.joinedDate).toISOString().split('T')[0] : ''} onChange={e => setForm({...form, joinedDate: e.target.value})} /></div>
                <div className="form-group"><label>Address</label><input value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: 16 }}>Save Changes</button>
            </form>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div><strong>Name:</strong> {employee.fullName}</div>
              <div><strong>Employee ID:</strong> {employee.employeeId}</div>
              <div><strong>Department:</strong> {employee.department || '-'}</div>
              <div><strong>Job Title:</strong> {employee.jobTitle?.title || '-'}</div>
              <div><strong>Work Email:</strong> {employee.workEmail || '-'}</div>
              <div><strong>Contact:</strong> {employee.contactNumber || '-'}</div>
              <div><strong>Status:</strong> <span className={`status-badge ${employee.isActive ? 'status-approved' : 'status-rejected'}`}>{employee.isActive ? 'Active' : 'Inactive'}</span></div>
              <div><strong>Marital Status:</strong> {employee.maritalStatus}</div>
              <div><strong>Gender:</strong> {employee.gender}</div>
              <div><strong>Date of Birth:</strong> {employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : '-'}</div>
              <div><strong>Joined Date:</strong> {employee.joinedDate ? new Date(employee.joinedDate).toLocaleDateString() : '-'}</div>
              <div><strong>Nationality:</strong> {employee.nationality || '-'}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PimEmployeeDetails;
