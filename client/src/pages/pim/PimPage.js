import React from 'react';
import TabPage from '../../components/common/TabPage';
import { FiLayers, FiList, FiUserPlus } from 'react-icons/fi';
import PimEmployeeList from './PimEmployeeList';
import PimAddEmployee from './PimAddEmployee';

const tabs = [
  { key: 'list', label: 'Employee List', icon: FiList, component: PimEmployeeList },
  { key: 'add', label: 'Add Employee', icon: FiUserPlus, component: PimAddEmployee },
];

const PimPage = () => <TabPage tabs={tabs} defaultTab="list" moduleIcon={FiLayers} moduleTitle="PIM" />;

export default PimPage;
