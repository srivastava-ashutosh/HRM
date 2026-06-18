import React from 'react';
import TabPage from '../../components/common/TabPage';
import { FiCalendar, FiSend, FiTag, FiAward, FiSun } from 'react-icons/fi';
import LeaveRequests from './LeaveRequests';
import LeaveTypes from './LeaveTypes';
import LeaveEntitlements from './LeaveEntitlements';
import LeaveHolidays from './LeaveHolidays';

const tabs = [
  { key: 'requests', label: 'Leave Requests', icon: FiSend, component: LeaveRequests },
  { key: 'types', label: 'Leave Types', icon: FiTag, component: LeaveTypes },
  { key: 'entitlements', label: 'Entitlements', icon: FiAward, component: LeaveEntitlements },
  { key: 'holidays', label: 'Holidays', icon: FiSun, component: LeaveHolidays },
];

const LeavePage = () => <TabPage tabs={tabs} defaultTab="requests" moduleIcon={FiCalendar} moduleTitle="Leave" />;

export default LeavePage;
