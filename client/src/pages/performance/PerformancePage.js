import React from 'react';
import TabPage from '../../components/common/TabPage';
import { FiTrendingUp, FiStar } from 'react-icons/fi';
import PerformanceReviews from './PerformanceReviews';

const tabs = [
  { key: 'reviews', label: 'Reviews', icon: FiStar, component: PerformanceReviews },
];

const PerformancePage = () => <TabPage tabs={tabs} defaultTab="reviews" moduleIcon={FiTrendingUp} moduleTitle="Performance" />;

export default PerformancePage;
