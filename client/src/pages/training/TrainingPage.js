import React, { useMemo } from 'react';
import TabPage from '../../components/common/TabPage';
import { FiBook, FiList } from 'react-icons/fi';
import { usePermission } from '../../context/AuthContext';
import TrainingCourses from './TrainingCourses';
import TrainingRecords from './TrainingRecords';

const baseTabs = [
  { key: 'courses', label: 'Courses', icon: FiBook, component: TrainingCourses, permission: 'admin' },
  { key: 'records', label: 'Training Records', icon: FiList, component: TrainingRecords, permission: 'admin' },
];

const TrainingPage = () => {
  const { hasModuleAccess } = usePermission();
  const tabs = useMemo(() => baseTabs.filter(t => hasModuleAccess(t.permission)), [hasModuleAccess]);
  return <TabPage tabs={tabs} defaultTab="courses" moduleIcon={FiBook} moduleTitle="Training" />;
};

export default TrainingPage;
