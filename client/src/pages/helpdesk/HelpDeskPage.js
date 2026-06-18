import React, { useMemo } from 'react';
import TabPage from '../../components/common/TabPage';
import { FiLifeBuoy, FiList } from 'react-icons/fi';
import { usePermission } from '../../context/AuthContext';
import TicketList from './TicketList';
import MyTickets from './MyTickets';

const baseTabs = [
  { key: 'all', label: 'All Tickets', icon: FiList, component: TicketList, permission: 'admin' },
  { key: 'my', label: 'My Tickets', icon: FiLifeBuoy, component: MyTickets },
];

const HelpDeskPage = () => {
  const { hasModuleAccess } = usePermission();
  const tabs = useMemo(() => baseTabs.filter(t => !t.permission || hasModuleAccess(t.permission)), [hasModuleAccess]);
  return <TabPage tabs={tabs} defaultTab="my" moduleIcon={FiLifeBuoy} moduleTitle="Help Desk" />;
};

export default HelpDeskPage;
