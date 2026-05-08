import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then(r => { if (r.data.role === 'admin') setAdmin(r.data); else setAdmin(null); })
      .catch(() => setAdmin(null))
      .finally(() => setLoading(false));
  }, []);

  const login  = async (email, pw) => { const r = await api.post('/auth/login', { email, password: pw }); if (r.data.user.role !== 'admin') throw new Error('Not admin'); setAdmin(r.data.user); };
  const logout = async () => { await api.post('/auth/logout'); setAdmin(null); };

  return <Ctx.Provider value={{ admin, loading, login, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
