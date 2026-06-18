import React, { useState } from 'react';
import api from '../../services/api';
import useApi from '../../hooks/useApi';
import PaginationBar from '../../components/common/PaginationBar';
import { SkeletonTable } from '../../components/common/Skeleton';

const AuditLog = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [filters, setFilters] = useState({ action: '', resource: '', username: '' });

  const fetchLogs = () => api.get('/audit/logs', { params: { page, limit, ...filters } });
  const { data, loading, execute: refetch } = useApi(fetchLogs, { immediate: true });

  const applyFilter = () => { setPage(1); refetch(); };

  return (
    <div>
      <div className="card">
        <div className="card-header"><h3>Audit Trail</h3></div>
        <div className="card-body">
          <div className="filter-bar" style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <input placeholder="Username" value={filters.username} onChange={e => setFilters({...filters, username: e.target.value})} style={{ width: 150 }} />
            <select value={filters.action} onChange={e => setFilters({...filters, action: e.target.value})} style={{ width: 130 }}>
              <option value="">All Actions</option>
              <option value="CREATE">CREATE</option><option value="UPDATE">UPDATE</option><option value="DELETE">DELETE</option>
              <option value="LOGIN">LOGIN</option><option value="APPROVE">APPROVE</option><option value="REJECT">REJECT</option>
              <option value="IMPORT">IMPORT</option><option value="EXPORT">EXPORT</option>
            </select>
            <select value={filters.resource} onChange={e => setFilters({...filters, resource: e.target.value})} style={{ width: 150 }}>
              <option value="">All Resources</option>
              <option value="users">Users</option><option value="employees">Employees</option><option value="job-titles">Job Titles</option>
              <option value="leave-requests">Leave Requests</option><option value="leave-types">Leave Types</option>
              <option value="vacancies">Vacancies</option><option value="candidates">Candidates</option>
              <option value="reviews">Reviews</option><option value="timesheets">Timesheets</option>
            </select>
            <button className="btn btn-primary btn-sm" onClick={applyFilter}>Filter</button>
          </div>
          <div className="table-container">
            <table>
              <thead><tr><th>Date</th><th>User</th><th>Action</th><th>Resource</th><th>Description</th></tr></thead>
              <tbody>
                {loading ? <SkeletonTable rows={5} cols={5} /> : (
                  (data?.data || []).map(log => (
                    <tr key={log._id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{new Date(log.createdAt).toLocaleString()}</td>
                      <td><strong>{log.username || log.user?.username}</strong></td>
                      <td><span className={`status-badge status-${log.action === 'CREATE' || log.action === 'LOGIN' ? 'approved' : log.action === 'DELETE' ? 'rejected' : 'submitted'}`}>{log.action}</span></td>
                      <td><code style={{ fontSize: 12 }}>{log.resource}</code></td>
                      <td style={{ fontSize: 13, color: '#666' }}>{log.description}</td>
                    </tr>
                  ))
                )}
                {!loading && data?.data?.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>No audit logs found</td></tr>}
              </tbody>
            </table>
          </div>
          <PaginationBar page={data?.page || 1} limit={limit} totalPages={data?.totalPages || 1} total={data?.total || 0} onPageChange={setPage} onLimitChange={(l) => { setLimit(l); setPage(1); }} />
        </div>
      </div>
    </div>
  );
};

export default AuditLog;
