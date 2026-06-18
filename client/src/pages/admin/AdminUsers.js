import React, { useState, useMemo } from 'react';
import api from '../../services/api';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { usePermission } from '../../context/AuthContext';
import useApi from '../../hooks/useApi';
import useDebounce from '../../hooks/useDebounce';
import validation from '../../utils/validation';
import FormField from '../../components/common/FormField';
import ImportButton from '../../components/common/ImportButton';
import DataTable from '../../components/common/DataTable';

const userRules = (isEdit) => ({
  username: validation.compose(validation.required('Username is required'), validation.minLength(3, 'Minimum 3 characters')),
  password: isEdit ? () => null : validation.required('Password is required'),
});

const AdminUsers = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ username: '', password: '', role: 'ess', status: true });
  const [touched, setTouched] = useState({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  const toast = useToast();
  const confirm = useConfirm();
  const { hasPermission } = usePermission();

  const { data: roles } = useApi(() => api.get('/roles'), { immediate: true });
  const roleOptions = useMemo(() => (roles || []).map(r => ({ value: r.name, label: r.displayName })), [roles]);

  const params = { page, limit, search: debouncedSearch || undefined };
  if (sortBy) { params.sortBy = sortBy; params.sortOrder = sortOrder; }
  const { data: result, loading, execute: loadUsers } = useApi(
    () => api.get('/admin/users', { params }),
    { immediate: true, showToast: false }
  );
  const users = result?.data || [];
  const total = result?.total || 0;
  const totalPages = result?.totalPages || 1;

  const handleSort = (key, order) => {
    setSortBy(key);
    setSortOrder(order);
    setPage(1);
  };

  const formErrors = validation.validate(form, userRules(!!editUser));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ username: true, password: true });
    if (!formErrors.valid) return;
    try {
      if (editUser) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await api.put(`/admin/users/${editUser._id}`, payload);
        toast.success('User updated successfully');
      } else {
        await api.post('/admin/users', form);
        toast.success('User created successfully');
      }
      setShowModal(false);
      setEditUser(null);
      setForm({ username: '', password: '', role: 'ess', status: true });
      setTouched({});
      loadUsers();
    } catch (err) {
      toast.error(err.normalizedMessage || 'Operation failed');
    }
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setForm({ username: user.username, password: '', role: user.role, status: user.status });
    setTouched({});
    setShowModal(true);
  };

  const handleDelete = async (user) => {
    const confirmed = await confirm(`Delete user "${user.username}"? This action cannot be undone.`, 'Delete User');
    if (!confirmed) return;
    try {
      await api.delete(`/admin/users/${user._id}`);
      toast.success('User deleted successfully');
      loadUsers();
    } catch (err) {
      toast.error(err.normalizedMessage || 'Delete failed');
    }
  };

  const columns = [
    { key: 'username', label: 'Username', sortable: true, render: (u) => <strong>{u.username}</strong> },
    {
      key: 'role', label: 'Role', render: (u) => (
        <span className="status-badge" style={{
          background: u.role === 'admin' ? '#fff3e0' : '#e3f2fd',
          color: u.role === 'admin' ? '#e65100' : '#1565c0'
        }}>{u.role}</span>
      )
    },
    {
      key: 'status', label: 'Status', render: (u) => (
        <span className={`status-badge ${u.status ? 'status-approved' : 'status-rejected'}`}>
          {u.status ? 'Enabled' : 'Disabled'}
        </span>
      )
    },
    { key: 'employee', label: 'Employee', render: (u) => u.employeeId?.fullName || '-' },
    { key: 'lastLogin', label: 'Last Login', render: (u) => u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never' },
  ];

  const actions = [];
  if (hasPermission('admin', 'update')) {
    actions.push({ icon: FiEdit2, label: 'Edit', onClick: handleEdit });
  }
  if (hasPermission('admin', 'delete')) {
    actions.push({ icon: FiTrash2, label: 'Delete', onClick: handleDelete });
  }

  return (
    <div>
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        total={total}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        limit={limit}
        onLimitChange={(l) => { setLimit(l); setPage(1); }}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search users..."
        actions={actions}
        storageKey="cols_admin_users"
        emptyMessage="No users found"
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        addLabel="Add User"
        onAdd={hasPermission('admin', 'create') ? () => { setEditUser(null); setForm({ username: '', password: '', role: 'ess', status: true }); setTouched({}); setShowModal(true); } : null}
        toolbarRight={<ImportButton onImport={(rows) => api.post('/admin/users/import', rows)} columns={columns} />}
      />

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>{editUser ? 'Edit User' : 'Add User'}</h3><button className="close-btn" onClick={() => setShowModal(false)}>&times;</button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <FormField label="Username" name="username" error={formErrors.errors.username} touched={touched.username} required>
                  <input value={form.username} onChange={e => { setForm({...form, username: e.target.value}); setTouched({...touched, username: true}); }} />
                </FormField>
                <FormField label={`Password ${editUser ? '(leave blank to keep)' : ''}`} name="password" error={formErrors.errors.password} touched={touched.password} required={!editUser}>
                  <input type="password" value={form.password} onChange={e => { setForm({...form, password: e.target.value}); setTouched({...touched, password: true}); }} />
                </FormField>
                <div className="form-group"><label>Role</label>
                  <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                    {roleOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group"><label><input type="checkbox" checked={form.status} onChange={e => setForm({...form, status: e.target.checked})} /> Active</label></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editUser ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
