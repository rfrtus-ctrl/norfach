import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('norfach_token');
    if (!token) { setLoading(false); return; }
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      setProfile(res.data.profile);
    } catch {
      localStorage.removeItem('norfach_token');
      localStorage.removeItem('norfach_user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('norfach_token', res.data.token);
    setUser(res.data.user);
    // Load full profile
    const me = await api.get('/auth/me');
    setUser(me.data);
    setProfile(me.data.profile);
    return res.data.user;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    localStorage.setItem('norfach_token', res.data.token);
    setUser(res.data.user);
    const me = await api.get('/auth/me');
    setUser(me.data);
    setProfile(me.data.profile);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('norfach_token');
    localStorage.removeItem('norfach_user');
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    const me = await api.get('/auth/me');
    setUser(me.data);
    setProfile(me.data.profile);
  };

  const isWorker  = user?.role === 'worker';
  const isCompany = user?.role === 'company';

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      login, register, logout, refreshProfile,
      isWorker, isCompany,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
