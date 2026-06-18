import React, { useState, useMemo } from 'react';
import api from '../../services/api';
import { FiEdit2, FiTrash2, FiUserPlus } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import useApi from '../../hooks/useApi';
import DataTable from '../../components/common/DataTable';

const CourseModal = ({ edit, form, setForm, onSubmit, onClose }) => (
  <div className="modal-backdrop" onClick={onClose}>
    <div className="modal" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3>{edit ? 'Edit' : 'Add'} Course</h3>
        <button className="close-btn" onClick={onClose}>&times;</button>
      </div>
      <form onSubmit={onSubmit}>
        <div className="modal-body">
          <div className="form-group">
            <label>Title</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                {['General', 'Technical', 'Management', 'Compliance', 'Soft Skills'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Provider</label>
              <input value={form.provider} onChange={e => setForm({...form, provider: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Duration</label>
              <input type="number" value={form.duration} onChange={e => setForm({...form, duration: Number(e.target.value)})} min={0} />
            </div>
            <div className="form-group">
              <label>Unit</label>
              <select value={form.durationUnit} onChange={e => setForm({...form, durationUnit: e.target.value})}>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
              </select>
            </div>
            <div className="form-group">
              <label>Max Participants</label>
              <input type="number" value={form.maxParticipants} onChange={e => setForm({...form, maxParticipants: Number(e.target.value)})} min={0} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Cost</label>
              <input type="number" value={form.cost || ''} onChange={e => setForm({...form, cost: Number(e.target.value)})} min={0} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">{edit ? 'Update' : 'Save'}</button>
        </div>
      </form>
    </div>
  </div>
);

const EnrollModal = ({ courses, onEnroll, onClose }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [courseId, setCourseId] = useState('');
  const { data: employees } = useApi(() => api.get('/pim/supervisors'), { immediate: true, showToast: false });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!employeeId || !courseId) return;
    onEnroll({ employeeId, courseId });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Enroll Employee</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Employee</label>
              <select value={employeeId} onChange={e => setEmployeeId(e.target.value)} required>
                <option value="">Select employee...</option>
                {(employees || []).map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.fullName} ({emp.employeeId})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Course</label>
              <select value={courseId} onChange={e => setCourseId(e.target.value)} required>
                <option value="">Select course...</option>
                {courses.filter(c => c.status === 'active').map(c => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Enroll</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TrainingCourses = () => {
  const [showModal, setShowModal] = useState(false);
  const [showEnroll, setShowEnroll] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', category: 'General', duration: 1,
    durationUnit: 'days', maxParticipants: 0, cost: 0, provider: '', status: 'active',
  });
  const toast = useToast();
  const confirm = useConfirm();

  const { data: courses, loading, execute: refetch } = useApi(
    () => api.get('/training/courses', { params: { limit: 100 } }),
    { immediate: true, showToast: false }
  );
  const items = courses?.data || [];
  const total = courses?.total || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.warning('Title is required');
    try {
      if (edit) {
        await api.put(`/training/courses/${edit._id}`, form);
        toast.success('Course updated');
      } else {
        await api.post('/training/courses', form);
        toast.success('Course created');
      }
      setShowModal(false); setEdit(null);
      setForm({ title: '', description: '', category: 'General', duration: 1, durationUnit: 'days', maxParticipants: 0, cost: 0, provider: '', status: 'active' });
      refetch();
    } catch (err) { toast.error(err.normalizedMessage || 'Operation failed'); }
  };

  const handleDelete = async (course) => {
    const ok = await confirm(`Deactivate course "${course.title}"?`, 'Deactivate Course');
    if (!ok) return;
    try {
      await api.delete(`/training/courses/${course._id}`);
      toast.success('Course deactivated');
      refetch();
    } catch (err) { toast.error(err.normalizedMessage || 'Delete failed'); }
  };

  const handleEnroll = async ({ employeeId, courseId }) => {
    try {
      await api.post('/training/enroll', { employeeId, courseId });
      toast.success('Employee enrolled');
      setShowEnroll(false);
    } catch (err) { toast.error(err.normalizedMessage || 'Enrollment failed'); }
  };

  const columns = [
    { key: 'title', label: 'Title', sortable: true, render: (c) => <strong>{c.title}</strong> },
    { key: 'category', label: 'Category', render: (c) => <span className="status-badge status-info">{c.category}</span> },
    { key: 'duration', label: 'Duration', render: (c) => `${c.duration} ${c.durationUnit}` },
    { key: 'provider', label: 'Provider', render: (c) => c.provider || '-' },
    { key: 'status', label: 'Status', render: (c) => <span className={`status-badge ${c.status === 'active' ? 'status-approved' : 'status-rejected'}`}>{c.status}</span> },
    { key: 'enrolled', label: 'Enrolled', render: (c) => '-' },
  ];

  const actions = [
    { icon: FiEdit2, label: 'Edit', onClick: (c) => { setEdit(c); setForm({ title: c.title, description: c.description || '', category: c.category, duration: c.duration, durationUnit: c.durationUnit, maxParticipants: c.maxParticipants, cost: c.cost || 0, provider: c.provider || '', status: c.status }); setShowModal(true); } },
    { icon: FiUserPlus, label: 'Enroll', onClick: () => setShowEnroll(true) },
    { icon: FiTrash2, label: 'Deactivate', onClick: handleDelete },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        total={total}
        storageKey="cols_training_courses"
        emptyMessage="No courses found"
        addLabel="Add Course"
        onAdd={() => { setEdit(null); setForm({ title: '', description: '', category: 'General', duration: 1, durationUnit: 'days', maxParticipants: 0, cost: 0, provider: '', status: 'active' }); setShowModal(true); }}
        actions={actions}
      />
      {showModal && <CourseModal edit={edit} form={form} setForm={setForm} onSubmit={handleSubmit} onClose={() => setShowModal(false)} />}
      {showEnroll && <EnrollModal courses={items} onEnroll={handleEnroll} onClose={() => setShowEnroll(false)} />}
    </div>
  );
};

export default TrainingCourses;
