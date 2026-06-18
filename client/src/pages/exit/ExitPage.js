import React, { useMemo } from 'react';
import TabPage from '../../components/common/TabPage';
import { FiLogOut, FiList } from 'react-icons/fi';
import { usePermission } from '../../context/AuthContext';
import ExitRequestList from './ExitRequestList';
import MyExitRequests from './MyExitRequests';

const baseTabs = [
  { key: 'all', label: 'All Requests', icon: FiList, component: ExitRequestList, permission: 'admin' },
  { key: 'my', label: 'My Requests', icon: FiLogOut, component: MyExitRequests },
];

const ExitPage = () => {
  const { hasModuleAccess } = usePermission();
  const tabs = useMemo(() => baseTabs.filter(t => !t.permission || hasModuleAccess(t.permission)), [hasModuleAccess]);
  return <TabPage tabs={tabs} defaultTab="my" moduleIcon={FiLogOut} moduleTitle="Exit Management" />;
};

export default ExitPage;
