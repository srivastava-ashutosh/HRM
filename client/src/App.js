import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, usePermission } from './context/AuthContext';
import Layout from './components/common/Layout';

const Login = lazy(() => import('./pages/auth/Login'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const AdminPage = lazy(() => import('./pages/admin/AdminPage'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminJobTitles = lazy(() => import('./pages/admin/AdminJobTitles'));
const AdminPayGrades = lazy(() => import('./pages/admin/AdminPayGrades'));
const AdminWorkShifts = lazy(() => import('./pages/admin/AdminWorkShifts'));
const AdminOrganization = lazy(() => import('./pages/admin/AdminOrganization'));
const AdminRoles = lazy(() => import('./pages/admin/AdminRoles'));
const AuditLog = lazy(() => import('./pages/audit/AuditLog'));
const PimPage = lazy(() => import('./pages/pim/PimPage'));
const PimEmployeeList = lazy(() => import('./pages/pim/PimEmployeeList'));
const PimAddEmployee = lazy(() => import('./pages/pim/PimAddEmployee'));
const PimEmployeeDetails = lazy(() => import('./pages/pim/PimEmployeeDetails'));
const LeavePage = lazy(() => import('./pages/leave/LeavePage'));
const LeaveTypes = lazy(() => import('./pages/leave/LeaveTypes'));
const LeaveRequests = lazy(() => import('./pages/leave/LeaveRequests'));
const LeaveEntitlements = lazy(() => import('./pages/leave/LeaveEntitlements'));
const LeaveHolidays = lazy(() => import('./pages/leave/LeaveHolidays'));
const TimePage = lazy(() => import('./pages/time/TimePage'));
const TimeTimesheets = lazy(() => import('./pages/time/TimeTimesheets'));
const TimeAttendance = lazy(() => import('./pages/time/TimeAttendance'));
const RecruitmentPage = lazy(() => import('./pages/recruitment/RecruitmentPage'));
const RecruitmentVacancies = lazy(() => import('./pages/recruitment/RecruitmentVacancies'));
const RecruitmentCandidates = lazy(() => import('./pages/recruitment/RecruitmentCandidates'));
const TrainingPage = lazy(() => import('./pages/training/TrainingPage'));
const HelpDeskPage = lazy(() => import('./pages/helpdesk/HelpDeskPage'));
const ExitPage = lazy(() => import('./pages/exit/ExitPage'));
const AssetsPage = lazy(() => import('./pages/assets/AssetsPage'));
const PerformancePage = lazy(() => import('./pages/performance/PerformancePage'));
const PerformanceReviews = lazy(() => import('./pages/performance/PerformanceReviews'));
const DirectoryView = lazy(() => import('./pages/directory/DirectoryView'));
const Maintenance = lazy(() => import('./pages/maintenance/Maintenance'));
const Buzz = lazy(() => import('./pages/buzz/Buzz'));

const PageLoader = () => <div className="loading-screen"><div className="spinner"></div></div>;

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? children : <Navigate to="/login" />;
};

const ModuleRoute = ({ module, children }) => {
  const { hasModuleAccess } = usePermission();
  if (!hasModuleAccess(module)) return <Navigate to="/" />;
  return children;
};

function App() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />

          <Route path="admin" element={<ModuleRoute module="admin"><AdminPage /></ModuleRoute>} />
          <Route path="admin/users" element={<ModuleRoute module="admin"><AdminUsers /></ModuleRoute>} />
          <Route path="admin/job-titles" element={<ModuleRoute module="admin"><AdminJobTitles /></ModuleRoute>} />
          <Route path="admin/pay-grades" element={<ModuleRoute module="admin"><AdminPayGrades /></ModuleRoute>} />
          <Route path="admin/work-shifts" element={<ModuleRoute module="admin"><AdminWorkShifts /></ModuleRoute>} />
          <Route path="admin/organization" element={<ModuleRoute module="admin"><AdminOrganization /></ModuleRoute>} />
          <Route path="admin/roles" element={<ModuleRoute module="admin"><AdminRoles /></ModuleRoute>} />

          <Route path="pim" element={<ModuleRoute module="pim"><PimPage /></ModuleRoute>} />
          <Route path="pim/list" element={<ModuleRoute module="pim"><PimEmployeeList /></ModuleRoute>} />
          <Route path="pim/add" element={<ModuleRoute module="pim"><PimAddEmployee /></ModuleRoute>} />
          <Route path="pim/:id" element={<ModuleRoute module="pim"><PimEmployeeDetails /></ModuleRoute>} />

          <Route path="leave" element={<ModuleRoute module="leave"><LeavePage /></ModuleRoute>} />
          <Route path="leave/requests" element={<ModuleRoute module="leave"><LeaveRequests /></ModuleRoute>} />
          <Route path="leave/types" element={<ModuleRoute module="leave"><LeaveTypes /></ModuleRoute>} />
          <Route path="leave/entitlements" element={<ModuleRoute module="leave"><LeaveEntitlements /></ModuleRoute>} />
          <Route path="leave/holidays" element={<ModuleRoute module="leave"><LeaveHolidays /></ModuleRoute>} />

          <Route path="time" element={<ModuleRoute module="time"><TimePage /></ModuleRoute>} />
          <Route path="time/timesheets" element={<ModuleRoute module="time"><TimeTimesheets /></ModuleRoute>} />
          <Route path="time/attendance" element={<ModuleRoute module="time"><TimeAttendance /></ModuleRoute>} />

          <Route path="recruitment" element={<ModuleRoute module="recruitment"><RecruitmentPage /></ModuleRoute>} />
          <Route path="recruitment/vacancies" element={<ModuleRoute module="recruitment"><RecruitmentVacancies /></ModuleRoute>} />
          <Route path="recruitment/candidates" element={<ModuleRoute module="recruitment"><RecruitmentCandidates /></ModuleRoute>} />

        <Route path="helpdesk" element={<ModuleRoute module="helpdesk"><HelpDeskPage /></ModuleRoute>} />
        <Route path="exit" element={<ModuleRoute module="exit"><ExitPage /></ModuleRoute>} />
        <Route path="training" element={<ModuleRoute module="training"><TrainingPage /></ModuleRoute>} />
        <Route path="assets" element={<ModuleRoute module="assets"><AssetsPage /></ModuleRoute>} />
        <Route path="performance" element={<ModuleRoute module="performance"><PerformancePage /></ModuleRoute>} />
        <Route path="performance/reviews" element={<ModuleRoute module="performance"><PerformanceReviews /></ModuleRoute>} />

          <Route path="directory" element={<ModuleRoute module="directory"><DirectoryView /></ModuleRoute>} />
          <Route path="audit" element={<ModuleRoute module="admin"><AuditLog /></ModuleRoute>} />
          <Route path="maintenance" element={<ModuleRoute module="maintenance"><Maintenance /></ModuleRoute>} />
          <Route path="buzz" element={<ModuleRoute module="buzz"><Buzz /></ModuleRoute>} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
