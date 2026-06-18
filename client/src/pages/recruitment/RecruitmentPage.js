import React from 'react';
import TabPage from '../../components/common/TabPage';
import { FiUserCheck, FiBriefcase, FiUsers } from 'react-icons/fi';
import RecruitmentVacancies from './RecruitmentVacancies';
import RecruitmentCandidates from './RecruitmentCandidates';

const tabs = [
  { key: 'vacancies', label: 'Vacancies', icon: FiBriefcase, component: RecruitmentVacancies },
  { key: 'candidates', label: 'Candidates', icon: FiUsers, component: RecruitmentCandidates },
];

const RecruitmentPage = () => <TabPage tabs={tabs} defaultTab="vacancies" moduleIcon={FiUserCheck} moduleTitle="Recruitment" />;

export default RecruitmentPage;
