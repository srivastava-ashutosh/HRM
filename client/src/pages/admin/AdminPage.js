import React, { useMemo } from 'react';
import TabPage from '../../components/common/TabPage';
import { FiShield, FiUsers, FiBriefcase, FiDollarSign, FiClock, FiBookmark, FiLock } from 'react-icons/fi';
import { usePermission } from '../../context/AuthContext';
import AdminUsers from './AdminUsers';
import AdminJobTitles from './AdminJobTitles';
import AdminPayGrades from './AdminPayGrades';
import AdminWorkShifts from './AdminWorkShifts';
import AdminOrganization from './AdminOrganization';
import AdminRoles from './AdminRoles';

const baseTabs = [
  { key: 'users', label: 'Users', icon: FiUsers, component: AdminUsers, permission: 'admin' },
  { key: 'job-titles', label: 'Job Titles', icon: FiBriefcase, component: AdminJobTitles, permission: 'admin' },
  { key: 'pay-grades', label: 'Pay Grades', icon: FiDollarSign, component: AdminPayGrades, permission: 'admin' },
  { key: 'work-shifts', label: 'Work Shifts', icon: FiClock, component: AdminWorkShifts, permission: 'admin' },
  { key: 'organization', label: 'Organization', icon: FiBookmark, component: AdminOrganization, permission: 'admin' },
  { key: 'roles', label: 'Roles', icon: FiLock, component: AdminRoles, permission: 'admin' },
];

const AdminPage = () => {
  const { hasModuleAccess } = usePermission();
  const tabs = useMemo(() => baseTabs.filter(t => hasModuleAccess(t.permission)), [hasModuleAccess]);
  return <TabPage tabs={tabs} defaultTab="users" moduleIcon={FiShield} moduleTitle="Admin" />;
};

export default AdminPage;
