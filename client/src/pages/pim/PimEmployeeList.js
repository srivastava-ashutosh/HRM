import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FiPlus, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import useApi from '../../hooks/useApi';
import useDebounce from '../../hooks/useDebounce';
import DebouncedInput from '../../components/common/DebouncedInput';
import { SkeletonTable } from '../../components/common/Skeleton';
import ColumnSettings from '../../components/common/ColumnSettings';
import ExportButton from '../../components/common/ExportButton';
import ImportButton from '../../components/common/ImportButton';

const PimEmployeeList = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();

  const allColumns = [
    { key: 'employeeId', label: 'ID' },
    { key: 'fullName', label: 'Name' },
    { key: 'jobTitle', label: 'Job Title' },
    { key: 'department', label: 'Department' },
    { key: 'workEmail', label: 'Email' },
    { key: 'isActive', label: 'Status' },
    { key: '_actions', label: 'Actions' },
  ];
  const saved = JSON.parse(localStorage.getItem('cols_pim_employees') || 'null');
  const [visibleColumns, setVisibleColumns] = useState(saved || allColumns.map(c => c.key));

  const fetchEmployees = () => api.get('/pim/employees', { params: { search: debouncedSearch || undefined } });
  const { data: employees, loading, execute: refetch } = useApi(fetchEmployees, { immediate: true, showToast: false });

  const handleDelete = async (id, name) => {
    const ok = await confirm(`Delete employee "${name}"? This will also disable their login account.`, 'Delete Employee');
    if (!ok) return;
    try {
      await api.delete(`/pim/employees/${id}`);
      toast.success('Employee deleted');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="toolbar">
        <DebouncedInput value={search} onChange={setSearch} placeholder="Search by name or ID..." />
        <div className="toolbar-right">
          <ColumnSettings columns={allColumns} visibleColumns={visibleColumns} onChange={setVisibleColumns} storageKey="cols_pim_employees" />
          <ExportButton data={employees} columns={allColumns} filename="employees" visibleColumns={visibleColumns} />
          <ImportButton onImport={(rows) => api.post('/pim/employees/import', rows)} columns={allColumns} />
          <button className="btn btn-primary" onClick={() => navigate('/pim/add')}><FiPlus /> Add Employee</button>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3>Employee List</h3><span style={{ color: '#999', fontSize: 13 }}>{employees?.length || 0} records</span></div>
        <div className="card-body">
          <div className="table-container">
            <table>
              <thead><tr>{allColumns.filter(c => visibleColumns.includes(c.key)).map(c => <th key={c.key}>{c.label}</th>)}</tr></thead>
              <tbody>
                {loading ? <SkeletonTable rows={5} cols={visibleColumns.length} /> : (
                  (employees || []).map(emp => (
                    <tr key={emp._id}>
                      {visibleColumns.includes('employeeId') && <td>{emp.employeeId}</td>}
                      {visibleColumns.includes('fullName') && <td><strong>{emp.fullName}</strong></td>}
                      {visibleColumns.includes('jobTitle') && <td>{emp.jobTitle?.title || '-'}</td>}
                      {visibleColumns.includes('department') && <td>{emp.department || '-'}</td>}
                      {visibleColumns.includes('workEmail') && <td>{emp.workEmail || '-'}</td>}
                      {visibleColumns.includes('isActive') && <td><span className={`status-badge ${emp.isActive ? 'status-approved' : 'status-rejected'}`}>{emp.isActive ? 'Active' : 'Inactive'}</span></td>}
                      {visibleColumns.includes('_actions') && <td>
                        <button className="action-btn" onClick={() => navigate(`/pim/${emp._id}`)} title="View"><FiEye /></button>
                        <button className="action-btn" onClick={() => navigate(`/pim/${emp._id}`)} title="Edit"><FiEdit2 /></button>
                        <button className="action-btn" onClick={() => handleDelete(emp._id, emp.fullName)} title="Delete"><FiTrash2 /></button>
                      </td>}
                    </tr>
                  ))
                )}
                {!loading && employees?.length === 0 && <tr><td colSpan={visibleColumns.length} style={{ textAlign: 'center', padding: 24, color: '#999' }}>No employees found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PimEmployeeList;
