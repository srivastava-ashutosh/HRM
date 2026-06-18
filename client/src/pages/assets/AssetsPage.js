import React, { useMemo } from 'react';
import TabPage from '../../components/common/TabPage';
import { FiMonitor, FiList } from 'react-icons/fi';
import { usePermission } from '../../context/AuthContext';
import AssetList from './AssetList';
import MyAssets from './MyAssets';

const baseTabs = [
  { key: 'assets', label: 'Assets', icon: FiMonitor, component: AssetList, permission: 'admin' },
  { key: 'my-assets', label: 'My Assets', icon: FiList, component: MyAssets, permission: 'admin' },
];

const AssetsPage = () => {
  const { hasModuleAccess } = usePermission();
  const tabs = useMemo(() => baseTabs.filter(t => hasModuleAccess(t.permission)), [hasModuleAccess]);
  return <TabPage tabs={tabs} defaultTab="assets" moduleIcon={FiMonitor} moduleTitle="Assets" />;
};

export default AssetsPage;
