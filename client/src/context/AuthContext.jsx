import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';
import { seedUsers } from '../data/seed';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { const raw = localStorage.getItem('avc_user'); return raw ? JSON.parse(raw) : null; } catch { return null; }
  });

  const finish = (u, token) => {
    if (token) localStorage.setItem('avc_token', token);
    localStorage.setItem('avc_user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const login = async (email, pass) => {
    try {
      const { data } = await api.post('/auth/login', { email, password: pass });
      return finish(data.user, data.access);
    } catch (e) {
      if (e.response) throw new Error(e.response.data?.msg || 'Invalid credentials');
      const u = seedUsers.find((x) => x.email === (email || '').toLowerCase());
      if (!u || u.pass !== pass) throw new Error('Invalid credentials (backend offline)');
      return finish({ id: u.id, name: u.name, email: u.email, roles: u.roles, section: u.voice, avatar: null }, null);
    }
  };

  const demoLogin = async (email) => {
    try {
      const { data } = await api.post('/auth/demo', { email });
      return finish(data.user, data.access);
    } catch (e) {
      if (e.response) throw new Error(e.response.data?.msg || 'Demo login failed');
      const u = seedUsers.find((x) => x.email === email);
      if (!u) throw new Error('Demo account not found');
      return finish({ id: u.id, name: u.name, email: u.email, roles: u.roles, section: u.voice, avatar: null }, null);
    }
  };

  const googleLogin = async (profile) => {
    try {
      const { data } = await api.post('/auth/google', profile);
      return finish(data.user, data.access);
    } catch (e) {
      if (e.response) throw new Error(e.response.data?.msg || 'Google sign-in failed');
      return finish({
        id: 'g-' + (profile.email || 'google'),
        name: profile.name || 'Google Chorister',
        email: profile.email,
        roles: ['member'],
        section: null,
        avatar: profile.avatarUrl || null,
      }, null);
    }
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    return data;
  };

  const setSection = async (section) => {
    try {
      const { data } = await api.post('/auth/section', { section });
      localStorage.setItem('avc_user', JSON.stringify(data.user));
      setUser(data.user);
    } catch {
      setUser((u) => {
        const next = { ...u, section };
        localStorage.setItem('avc_user', JSON.stringify(next));
        return next;
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('avc_token');
    localStorage.removeItem('avc_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, demoLogin, googleLogin, register, setSection, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);