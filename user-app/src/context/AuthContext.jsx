import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me').then(r => setUser(r.data)).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const login    = async (email, pw) => { const r = await api.post('/auth/login', { email, password: pw }); setUser(r.data.user); };
  const logout   = async ()          => { await api.post('/auth/logout'); setUser(null); };
  const register = async (u, e, pw)  => api.post('/auth/register', { username: u, email: e, password: pw });

  return <Ctx.Provider value={{ user, loading, login, logout, register }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
