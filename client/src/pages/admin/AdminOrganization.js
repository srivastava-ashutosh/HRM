import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminOrganization = () => {
  const [org, setOrg] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => { fetchOrg(); }, []);

  const fetchOrg = async () => {
    const { data } = await api.get('/admin/organization');
    setOrg(data);
    setForm({ name: data.name, taxId: data.taxId, registrationNumber: data.registrationNumber, phone: data.phone, email: data.email, address: data.address, city: data.city, state: data.state, zipCode: data.zipCode, country: data.country, notes: data.notes });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data } = await api.put('/admin/organization', form);
    setOrg(data);
    alert('Organization updated!');
  };

  if (!org) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="card">
      <div className="card-header"><h3>Organization Information</h3></div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group"><label>Organization Name</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div className="form-group"><label>Tax ID</label><input value={form.taxId} onChange={e => setForm({...form, taxId: e.target.value})} /></div>
            <div className="form-group"><label>Registration Number</label><input value={form.registrationNumber} onChange={e => setForm({...form, registrationNumber: e.target.value})} /></div>
            <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
            <div className="form-group"><label>Address</label><input value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
            <div className="form-group"><label>City</label><input value={form.city} onChange={e => setForm({...form, city: e.target.value})} /></div>
            <div className="form-group"><label>State/Province</label><input value={form.state} onChange={e => setForm({...form, state: e.target.value})} /></div>
            <div className="form-group"><label>Zip/Postal Code</label><input value={form.zipCode} onChange={e => setForm({...form, zipCode: e.target.value})} /></div>
            <div className="form-group"><label>Country</label><input value={form.country} onChange={e => setForm({...form, country: e.target.value})} /></div>
          </div>
          <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3} /></div>
          <button type="submit" className="btn btn-primary">Save Organization</button>
        </form>
      </div>
    </div>
  );
};

export default AdminOrganization;
