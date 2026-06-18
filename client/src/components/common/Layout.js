import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, usePermission } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import {
  FiGrid, FiUsers, FiCalendar, FiClock, FiUserCheck, FiTrendingUp,
  FiBookmark, FiShield, FiMessageSquare, FiLogOut, FiBriefcase,
  FiSun, FiMoon, FiChevronDown, FiChevronRight, FiList, FiUserPlus,
  FiSend, FiTag, FiAward, FiSun as FiSunny, FiEdit3, FiCamera,
  FiStar, FiDollarSign, FiHome, FiSearch, FiTrash2, FiHeart,
  FiLayers, FiCoffee, FiBook, FiMenu, FiX, FiArrowRight, FiMonitor, FiLifeBuoy
} from 'react-icons/fi';
import api from '../../services/api';

const menuGroups = [
  {
    module: 'Dashboard',
    icon: FiHome,
    path: '/',
    end: true,
    single: true
  },
  {
    module: 'Admin',
    icon: FiShield,
    path: '/admin',
    items: [
      { label: 'Users', path: '/admin/users', icon: FiUsers },
      { label: 'Job Titles', path: '/admin/job-titles', icon: FiBriefcase },
      { label: 'Pay Grades', path: '/admin/pay-grades', icon: FiDollarSign },
      { label: 'Work Shifts', path: '/admin/work-shifts', icon: FiClock },
      { label: 'Organization', path: '/admin/organization', icon: FiBookmark },
      { label: 'Roles', path: '/admin/roles', icon: FiShield },
    ]
  },
  {
    module: 'PIM',
    icon: FiLayers,
    path: '/pim',
    items: [
      { label: 'Employee List', path: '/pim/list', icon: FiList },
      { label: 'Add Employee', path: '/pim/add', icon: FiUserPlus },
    ]
  },
  {
    module: 'Leave',
    icon: FiCalendar,
    path: '/leave',
    items: [
      { label: 'Leave Requests', path: '/leave/requests', icon: FiSend },
      { label: 'Leave Types', path: '/leave/types', icon: FiTag },
      { label: 'Entitlements', path: '/leave/entitlements', icon: FiAward },
      { label: 'Holidays', path: '/leave/holidays', icon: FiSunny },
    ]
  },
  {
    module: 'Time',
    icon: FiClock,
    path: '/time',
    items: [
      { label: 'Timesheets', path: '/time/timesheets', icon: FiEdit3 },
      { label: 'Attendance', path: '/time/attendance', icon: FiCamera },
    ]
  },
  {
    module: 'Recruitment',
    icon: FiUserCheck,
    path: '/recruitment',
    items: [
      { label: 'Vacancies', path: '/recruitment/vacancies', icon: FiBriefcase },
      { label: 'Candidates', path: '/recruitment/candidates', icon: FiUsers },
    ]
  },
  {
    module: 'Assets',
    icon: FiMonitor,
    path: '/assets',
    items: [
      { label: 'Asset List', path: '/assets', icon: FiMonitor },
    ]
  },
  {
    module: 'Help Desk',
    icon: FiLifeBuoy,
    path: '/helpdesk',
    items: [
      { label: 'Tickets', path: '/helpdesk/tickets', icon: FiList },
    ]
  },
  {
    module: 'Exit',
    icon: FiLogOut,
    path: '/exit',
    items: [
      { label: 'Exit Requests', path: '/exit', icon: FiList },
    ]
  },
  {
    module: 'Training',
    icon: FiBook,
    path: '/training',
    items: [
      { label: 'Courses', path: '/training/courses', icon: FiBook },
      { label: 'Records', path: '/training/records', icon: FiList },
    ]
  },
  {
    module: 'Performance',
    icon: FiTrendingUp,
    path: '/performance',
    items: [
      { label: 'Reviews', path: '/performance/reviews', icon: FiStar },
    ]
  },
  {
    module: 'Directory',
    icon: FiSearch,
    path: '/directory',
    end: true,
    single: true
  },
  {
    module: 'Maintenance',
    icon: FiTrash2,
    path: '/maintenance',
    end: true,
    single: true
  },
  {
    module: 'Buzz',
    icon: FiHeart,
    path: '/buzz',
    end: true,
    single: true
  },
];

const modulePermissionMap = {
  Admin: 'admin', PIM: 'pim', Leave: 'leave', Time: 'time',
  Recruitment: 'recruitment', Training: 'training', Performance: 'performance',
  Directory: 'directory', Maintenance: 'maintenance', Buzz: 'buzz', Dashboard: 'dashboard',
  Assets: 'assets', 'Help Desk': 'helpdesk', Exit: 'exit'
};

const Layout = () => {
  const { user, logout } = useAuth();
  const { hasModuleAccess } = usePermission();
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef();
  const searchDropdownRef = useRef();

  const filteredMenuGroups = useMemo(() => {
    return menuGroups.filter(group => {
      const mod = modulePermissionMap[group.module];
      return !mod || hasModuleAccess(mod);
    });
  }, [hasModuleAccess]);

  const [expanded, setExpanded] = useState(() => {
    const saved = localStorage.getItem('sidebarExpanded');
    return saved ? JSON.parse(saved) : [];
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    localStorage.setItem('sidebarExpanded', JSON.stringify(expanded));
  }, [expanded]);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    menuGroups.forEach(group => {
      if (group.items) {
        const isActive = location.pathname.startsWith(group.path);
        if (isActive && !expanded.includes(group.module)) {
          setExpanded(prev => [...prev, group.module]);
        }
      }
    });
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target) &&
          searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleExpand = (module) => {
    setExpanded(prev =>
      prev.includes(module) ? prev.filter(m => m !== module) : [...prev, module]
    );
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const empName = user?.employeeId?.fullName || user?.username || 'User';
  const initials = empName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const isModuleActive = (group) => {
    if (group.single) return location.pathname === group.path;
    return location.pathname.startsWith(group.path);
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    setSearching(true);
    setSearchOpen(true);
    try {
      const { data } = await api.get('/dashboard/search', { params: { q: query } });
      setSearchResults(data || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const navigateTo = (path) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(path);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  return (
    <div className={`layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span>IndiaNIC</span>HRM
        </div>
        <nav className="sidebar-nav">
          {filteredMenuGroups.map((group) => {
            const ModuleIcon = group.icon;
            const isActive = isModuleActive(group);
            const isExpanded = expanded.includes(group.module);

            if (group.single) {
              return (
                <NavLink
                  key={group.path}
                  to={group.path}
                  end={group.end}
                  className={({ isActive: act }) => `nav-item ${act ? 'active' : ''}`}
                  title={sidebarCollapsed ? group.module : undefined}
                >
                  <ModuleIcon />
                  {!sidebarCollapsed && <span>{group.module}</span>}
                </NavLink>
              );
            }

            return (
              <div key={group.module} className="nav-group">
                <NavLink
                  to={group.path}
                  end
                  className={({ isActive: act }) => `nav-item nav-group-header ${(act || isActive) ? 'active-group' : ''}`}
                  onClick={(e) => { e.preventDefault(); navigate(group.path); if (!sidebarCollapsed) toggleExpand(group.module); }}
                  title={sidebarCollapsed ? group.module : undefined}
                >
                  <ModuleIcon />
                  {!sidebarCollapsed && <span>{group.module}</span>}
                  {!sidebarCollapsed && (
                    <span className="nav-chevron">
                      {isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
                    </span>
                  )}
                </NavLink>
                {!sidebarCollapsed && (
                  <div className={`nav-submenu ${isExpanded ? 'expanded' : ''}`}>
                    {group.items.map((item) => {
                      const SubIcon = item.icon;
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          className={({ isActive: act }) => `nav-subitem ${act ? 'active' : ''}`}
                        >
                          <SubIcon size={14} /><span>{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
      <div className="main-content">
        <header className="header">
          <div className="header-left">
            <button className="sidebar-toggle" onClick={toggleSidebar} title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
              {sidebarCollapsed ? <FiMenu size={18} /> : <FiX size={18} />}
            </button>
            <div className="global-search" ref={searchRef}>
              <FiSearch size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Search employees, users, courses, assets..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery && setSearchOpen(true)}
              />
              {searchQuery && (
                <button className="search-clear" onClick={() => { setSearchQuery(''); setSearchResults([]); setSearchOpen(false); }}>
                  <FiX size={14} />
                </button>
              )}
              {searchOpen && (
                <div className="global-search-dropdown" ref={searchDropdownRef}>
                  {searching ? (
                    <div className="search-loading">Searching...</div>
                  ) : searchResults.length === 0 ? (
                    <div className="search-empty">No results found</div>
                  ) : (
                    searchResults.map((r, i) => (
                      <div key={i} className="search-result-item" onClick={() => navigateTo(r.path)}>
                        <div className="search-result-type">{r.type}</div>
                        <div className="search-result-text">
                          <strong>{r.label}</strong>
                          {r.subtitle && <span>{r.subtitle}</span>}
                        </div>
                        <FiArrowRight size={14} className="search-result-arrow" />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="header-right">
            <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
              {theme === 'light' ? <FiMoon /> : <FiSun />}
            </button>
            <div className="header-user">
              <div className="header-avatar">{initials}</div>
              <span>{empName} ({user?.role})</span>
            </div>
            <button className="btn btn-sm btn-outline" onClick={handleLogout}>
              <FiLogOut /> Logout
            </button>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
