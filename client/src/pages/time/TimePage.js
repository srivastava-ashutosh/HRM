import React from 'react';
import TabPage from '../../components/common/TabPage';
import { FiClock, FiEdit3, FiCamera } from 'react-icons/fi';
import TimeTimesheets from './TimeTimesheets';
import TimeAttendance from './TimeAttendance';

const tabs = [
  { key: 'timesheets', label: 'Timesheets', icon: FiEdit3, component: TimeTimesheets },
  { key: 'attendance', label: 'Attendance', icon: FiCamera, component: TimeAttendance },
];

const TimePage = () => <TabPage tabs={tabs} defaultTab="timesheets" moduleIcon={FiClock} moduleTitle="Time" />;

export default TimePage;
