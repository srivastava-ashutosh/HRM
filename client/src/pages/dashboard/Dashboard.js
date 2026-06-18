import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, RadialLinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line, PolarArea } from 'react-chartjs-2';
import api from '../../services/api';
import {
  FiUsers, FiCalendar, FiClock, FiUserCheck, FiTrendingUp,
  FiStar, FiHeart, FiBriefcase, FiBook, FiShield, FiMonitor, FiLifeBuoy, FiLogOut,
} from 'react-icons/fi';
import AnimatedIcon from '../../components/common/AnimatedIcon';

ChartJS.register(CategoryScale, LinearScale, RadialLinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const chartColors = ['#FF7B1D', '#76BC21', '#3498DB', '#9B59B6', '#F1C40F', '#E74C3C', '#1ABC9C', '#E67E22'];
const chartBgs = chartColors.map(c => c + 'B3');

const AnimatedNumber = ({ value, label, icon: Icon, color, bgColor, animation = 'float', onClick }) => {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (!value && value !== 0) return;
    let start = 0;
    const end = value;
    const duration = 1500;
    const stepTime = Math.max(Math.floor(duration / end), 16);
    const timer = setInterval(() => {
      start += 1;
      setDisplayed(start);
      if (start >= end) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className={`stat-card animate-slide-up ${onClick ? 'stat-card-clickable' : ''}`} onClick={onClick} style={onClick ? { cursor: 'pointer' } : {}}>
      <div className="stat-icon" style={{ background: bgColor }}>
        <AnimatedIcon icon={Icon} size={24} color={color} animation={animation} />
      </div>
      <div className="stat-info">
        <h4 className="animated-number">{displayed}</h4>
        <p>{label}</p>
      </div>
    </div>
  );
};

const InteractiveChart = ({ title, icon, iconColor, iconAnim, children }) => (
  <div className="chart-card animate-slide-up">
    <h4><AnimatedIcon icon={icon} color={iconColor} animation={iconAnim} /> {title}</h4>
    {children}
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard').then(res => setData(res.data)).catch(() => {});
  }, []);

  if (!data) return <div className="loading-screen"><div className="spinner"></div></div>;

  const deptLabels = data.departmentStats?.map(d => d.name) || [];
  const deptCounts = data.departmentStats?.map(d => d.count) || [];

  const leaveLabels = data.leaveTypeStats?.map(l => l._id?.name || 'Unknown') || [];
  const leaveCounts = data.leaveTypeStats?.map(l => l.count) || [];

  const monthLabels = data.monthlyHires?.map(m => {
    const [y, mo] = m._id.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(mo) - 1]} ${y.slice(2)}`;
  }) || [];
  const hireCounts = data.monthlyHires?.map(m => m.count) || [];

  const jobLabels = data.jobTitleStats?.map(j => j.name) || [];
  const jobCounts = data.jobTitleStats?.map(j => j.count) || [];

  const defaultPlugin = {
    legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true, font: { size: 10 } } },
    tooltip: {
      backgroundColor: 'rgba(0,0,0,0.8)',
      titleFont: { size: 12 },
      bodyFont: { size: 11 },
      padding: 10,
      cornerRadius: 6,
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1500, easing: 'easeOutQuart' },
    plugins: {
      ...defaultPlugin,
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 10 } } },
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
    },
    onClick: (_, elements) => {
      if (elements.length > 0) navigate('/pim/list');
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { animateRotate: true, duration: 1500 },
    plugins: {
      ...defaultPlugin,
      tooltip: {
        ...defaultPlugin.tooltip,
        callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw} employees (${((ctx.raw / data.employeeCount) * 100).toFixed(1)}%)` },
      },
    },
    cutout: '62%',
    onClick: (_, elements) => {
      if (elements.length > 0) navigate('/pim/list');
    },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1800, easing: 'easeInOutQuart' },
    plugins: {
      ...defaultPlugin,
      legend: { display: false },
      tooltip: {
        ...defaultPlugin.tooltip,
        callbacks: { label: (ctx) => `${ctx.parsed.y} new hires` },
      },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 10 }, stepSize: 1 } },
      x: { grid: { display: false }, ticks: { font: { size: 9 } } },
    },
  };

  const polarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1500 },
    plugins: {
      ...defaultPlugin,
      legend: { position: 'right', labels: { padding: 10, usePointStyle: true, font: { size: 9 } } },
    },
    scales: {
      r: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { display: false } },
    },
  };

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <AnimatedNumber value={data.employeeCount} label="Total Employees" icon={FiUsers} color="#FF7B1D" bgColor="#fff3e0" animation="bounce" onClick={() => navigate('/pim/list')} />
        <AnimatedNumber value={data.totalUsers} label="System Users" icon={FiShield} color="#3498DB" bgColor="#e3f2fd" animation="pulse" onClick={() => navigate('/admin/users')} />
        <AnimatedNumber value={data.pendingLeaves?.length || 0} label="Pending Leave" icon={FiCalendar} color="#76BC21" bgColor="#e8f5e9" animation="pulse" onClick={() => navigate('/leave/requests')} />
        <AnimatedNumber value={data.employeesOnLeave?.length || 0} label="On Leave Today" icon={FiClock} color="#3498DB" bgColor="#e3f2fd" animation="float" />
        <AnimatedNumber value={data.candidateCount} label="Candidates" icon={FiUserCheck} color="#9B59B6" bgColor="#f3e5f5" animation="wiggle" onClick={() => navigate('/recruitment/candidates')} />
        <AnimatedNumber value={data.activeCourses || 0} label="Active Courses" icon={FiBook} color="#E67E22" bgColor="#fdf2e9" animation="float" onClick={() => navigate('/training/courses')} />
        <AnimatedNumber value={data.totalAssets || 0} label="Total Assets" icon={FiMonitor} color="#2ECC71" bgColor="#eafaf1" animation="bounce" onClick={() => navigate('/assets')} />
        <AnimatedNumber value={data.openTickets || 0} label="Open Tickets" icon={FiLifeBuoy} color="#E74C3C" bgColor="#fce4ec" animation="pulse" onClick={() => navigate('/helpdesk')} />
        <AnimatedNumber value={data.pendingExits || 0} label="Pending Exits" icon={FiLogOut} color="#E67E22" bgColor="#fff3e0" animation="pulse" onClick={() => navigate('/exit')} />
      </div>

      <div className="charts-grid">
        <InteractiveChart title="Department Distribution" icon={FiStar} iconColor="#F1C40F" iconAnim="glow">
          <div className="chart-wrapper" style={{ height: 260 }}>
            {deptLabels.length > 0 ? (
              <Doughnut
                data={{
                  labels: deptLabels,
                  datasets: [{ data: deptCounts, backgroundColor: chartBgs.slice(0, deptLabels.length), borderWidth: 2, borderColor: '#fff', hoverOffset: 16 }],
                }}
                options={doughnutOptions}
              />
            ) : <p className="chart-empty">No department data</p>}
          </div>
        </InteractiveChart>

        <InteractiveChart title="Job Title Breakdown" icon={FiBriefcase} iconColor="#3498DB" iconAnim="pulse">
          <div className="chart-wrapper" style={{ height: 260 }}>
            {jobLabels.length > 0 ? (
              <PolarArea
                data={{
                  labels: jobLabels,
                  datasets: [{ data: jobCounts, backgroundColor: chartBgs.slice(0, jobLabels.length), borderWidth: 1, borderColor: '#fff' }],
                }}
                options={polarOptions}
              />
            ) : <p className="chart-empty">No job title data</p>}
          </div>
        </InteractiveChart>

        <InteractiveChart title="Monthly Hiring Trend" icon={FiTrendingUp} iconColor="#FF7B1D" iconAnim="pulse">
          <div className="chart-wrapper" style={{ height: 200 }}>
            {monthLabels.length > 0 ? (
              <Line
                data={{
                  labels: monthLabels,
                  datasets: [{
                    label: 'New Hires',
                    data: hireCounts,
                    borderColor: '#FF7B1D',
                    backgroundColor: 'rgba(255,123,29,0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#FF7B1D',
                    pointRadius: 4,
                    pointHoverRadius: 7,
                  }],
                }}
                options={lineOptions}
              />
            ) : <p className="chart-empty">No hiring data yet</p>}
          </div>
        </InteractiveChart>

        <InteractiveChart title="Leave Requests by Type" icon={FiCalendar} iconColor="#76BC21" iconAnim="bounce">
          <div className="chart-wrapper" style={{ height: 200 }}>
            {leaveLabels.length > 0 ? (
              <Bar
                data={{
                  labels: leaveLabels,
                  datasets: [{
                    label: 'Requests',
                    data: leaveCounts,
                    backgroundColor: chartBgs.slice(0, leaveLabels.length),
                    borderColor: chartColors.slice(0, leaveLabels.length),
                    borderWidth: 1,
                    borderRadius: 4,
                  }],
                }}
                options={barOptions}
              />
            ) : <p className="chart-empty">No leave data yet</p>}
          </div>
        </InteractiveChart>
      </div>

      <div className="dashboard-cards">
        <div className="card animate-slide-up">
          <div className="card-header">
            <h3><FiCalendar /> Pending Leave Requests</h3>
            <button className="btn btn-sm btn-outline" onClick={() => navigate('/leave/requests')}>View All</button>
          </div>
          <div className="card-body">
            {data.pendingLeaves?.length === 0 ? (
              <p className="empty-text">No pending leave requests.</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead><tr><th>Employee</th><th>Type</th><th>Dates</th><th></th></tr></thead>
                  <tbody>
                    {data.pendingLeaves?.slice(0, 5).map((l, i) => (
                      <tr key={l._id} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                        <td><strong>{l.employee?.fullName}</strong></td>
                        <td><span className="status-badge status-pending">{l.leaveType?.name}</span></td>
                        <td>{new Date(l.fromDate).toLocaleDateString()} - {new Date(l.toDate).toLocaleDateString()}</td>
                        <td>
                          <button className="btn btn-sm btn-primary" onClick={() => navigate('/leave/requests')}>Review</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="card animate-slide-up">
          <div className="card-header">
            <h3><FiClock /> Employees On Leave Today</h3>
          </div>
          <div className="card-body">
            {data.employeesOnLeave?.length === 0 ? (
              <p className="empty-text">No employees on leave today.</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead><tr><th>Name</th><th>Department</th></tr></thead>
                  <tbody>
                    {data.employeesOnLeave?.map(l => (
                      <tr key={l._id}>
                        <td><strong>{l.employee?.fullName}</strong></td>
                        <td>{l.employee?.department || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
