import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { FiSave, FiLock, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import useApi from '../../hooks/useApi';
import { SkeletonTable } from '../../components/common/Skeleton';

const MODULES = ['admin', 'pim', 'leave', 'time', 'recruitment', 'performance', 'buzz', 'directory', 'maintenance', 'dashboard'];
const ACTIONS = ['read', 'write', 'create', 'update', 'delete', 'approve', 'export', 'import'];

const AdminRoles = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [editRole, setEditRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', displayName: '', description: '' });

  const { data: roles, loading, execute: refetch } = useApi(() => api.get('/roles'), { immediate: true });

  const openEditor = (role) => {
    setEditRole(role);
    setPermissions(role.permissions.map(p => `${p.module}:${p.action}`));
  };

  const togglePermission = (perm) => {
    setPermissions(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]);
  };

  const handleSave = async () => {
    try {
      const perms = permissions.map(p => {
        const [module, action] = p.split(':');
        return { module, action };
      });
      await api.put(`/roles/${editRole._id}`, { permissions: perms });
      toast.success('Permissions updated');
      setEditRole(null);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newRole.name.trim() || !newRole.displayName.trim()) {
      return toast.warning('Name and display name are required');
    }
    try {
      await api.post('/roles', { ...newRole, permissions: [] });
      toast.success('Role created');
      setShowCreate(false);
      setNewRole({ name: '', displayName: '', description: '' });
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Create failed');
    }
  };

  const handleDelete = async (role) => {
    if (role.isSystem) return toast.warning('Cannot delete system roles');
    const ok = await confirm(`Delete role "${role.displayName}"? This cannot be undone.`, 'Delete Role');
    if (!ok) return;
    try {
      await api.delete(`/roles/${role._id}`);
      toast.success('Role deleted');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const canEdit = (role) => !(role.isSystem && role.name === 'admin');

  return (
    <div>
      <div className="toolbar">
        <div style={{ flex: 1 }} />
        <div className="toolbar-right">
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}><FiPlus /> Create Role</button>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3>Role Management</h3></div>
        <div className="card-body">
          <div className="table-container">
            <table>
              <thead><tr><th>Role</th><th>Description</th><th>Permissions</th><th>Type</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? <SkeletonTable rows={3} cols={5} /> : (
                  (roles || []).map(role => (
                    <tr key={role._id}>
                      <td><strong>{role.displayName}</strong> <code style={{ fontSize: 11, color: '#999' }}>({role.name})</code></td>
                      <td style={{ fontSize: 13, color: '#666' }}>{role.description}</td>
                      <td style={{ fontSize: 12 }}>{role.permissions?.length || 0} permission(s)</td>
                      <td>{role.isSystem ? <span className="status-badge status-approved">System</span> : <span className="status-badge status-draft">Custom</span>}</td>
                      <td>
                        <button className="action-btn" onClick={() => openEditor(role)} title="Edit Permissions"><FiLock /></button>
                        {!role.isSystem && (
                          <button className="action-btn" onClick={() => handleDelete(role)} title="Delete"><FiTrash2 /></button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
                {!loading && roles?.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>No roles found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCreate && (
        <div className="modal-backdrop" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h3>Create New Role</h3>
              <button className="close-btn" onClick={() => setShowCreate(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Role Name (identifier)</label>
                  <input value={newRole.name} onChange={e => setNewRole({...newRole, name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_')})} placeholder="e.g. hr_manager" required />
                </div>
                <div className="form-group">
                  <label>Display Name</label>
                  <input value={newRole.displayName} onChange={e => setNewRole({...newRole, displayName: e.target.value})} placeholder="e.g. HR Manager" required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={newRole.description} onChange={e => setNewRole({...newRole, description: e.target.value})} placeholder="Optional role description" rows={3} />
                </div>
                <p style={{ fontSize: 12, color: '#999' }}>You can assign permissions after creating the role.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><FiPlus /> Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editRole && (
        <div className="modal-backdrop" onClick={() => setEditRole(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 800 }}>
            <div className="modal-header">
              <h3>Permissions: {editRole.displayName}</h3>
              <button className="close-btn" onClick={() => setEditRole(null)}>&times;</button>
            </div>
            <div className="modal-body" style={{ maxHeight: 500, overflow: 'auto' }}>
              <table className="permission-matrix">
                <thead>
                  <tr>
                    <th style={{ position: 'sticky', left: 0, background: 'var(--card-bg)' }}>Module</th>
                    {ACTIONS.map(a => <th key={a} style={{ textTransform: 'capitalize', fontSize: 11, textAlign: 'center' }}>{a}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {MODULES.map(mod => (
                    <tr key={mod}>
                      <td style={{ fontWeight: 600, textTransform: 'capitalize', position: 'sticky', left: 0, background: 'var(--card-bg)' }}>{mod}</td>
                      {ACTIONS.map(action => {
                        const perm = `${mod}:${action}`;
                        return (
                          <td key={perm} style={{ textAlign: 'center' }}>
                            {editRole.isSystem && mod === 'admin' && action === 'read' ? (
                              <span style={{ color: '#999' }}>&#10003;</span>
                            ) : (
                              <input type="checkbox" checked={permissions.includes(perm)} onChange={() => togglePermission(perm)} />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-header" style={{ borderTop: '1px solid var(--border)', padding: '12px 24px', marginTop: 8 }}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12 }}>
                <strong>Quick actions:</strong>
                <button type="button" className="btn btn-sm btn-outline" onClick={() => setPermissions(MODULES.flatMap(m => ACTIONS.map(a => `${m}:${a}`)))}>Select All</button>
                <button type="button" className="btn btn-sm btn-outline" onClick={() => setPermissions([])}>Clear All</button>
                <button type="button" className="btn btn-sm btn-outline" onClick={() => setPermissions(MODULES.flatMap(m => ['read', 'export'].map(a => `${m}:${a}`)))}>Read Only</button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setEditRole(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}><FiSave /> Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoles;
