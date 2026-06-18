import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const usePermission = () => {
  const { user } = useAuth();
  const permissions = user?.permissions || [];

  const hasPermission = useCallback((module, action) => {
    if (user?.role === 'admin') return true;
    return permissions.some(p => p.module === module && p.action === action);
  }, [permissions, user?.role]);

  const hasAnyPermission = useCallback((module, actions) => {
    if (user?.role === 'admin') return true;
    return actions.some(action => permissions.some(p => p.module === module && p.action === action));
  }, [permissions, user?.role]);

  const hasModuleAccess = useCallback((module) => {
    if (user?.role === 'admin') return true;
    return permissions.some(p => p.module === module);
  }, [permissions, user?.role]);

  return { permissions, hasPermission, hasAnyPermission, hasModuleAccess };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.get('/auth/me').then(res => {
        setUser(res.data);
      }).catch(() => {
        localStorage.removeItem('token');
      }).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password });
    localStorage.setItem('token', data.token);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch (e) { /* ignore */ }
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
