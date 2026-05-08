import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode]     = useState('login');
  const [form, setForm]     = useState({ username: '', email: '', password: '' });
  const [error, setError]   = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        navigate('/');
      } else {
        await register(form.username, form.email, form.password);
        setMode('login');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    }
  }

  return (
    <div style={S.wrapper}>
      <form onSubmit={handleSubmit} style={S.card}>
        <h2 style={S.title}>{mode === 'login' ? 'Sign In' : 'Register'}</h2>
        {error && <p style={S.err}>{error}</p>}
        {mode === 'register' && (
          <input style={S.inp} placeholder="Username" value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })} required />
        )}
        <input style={S.inp} type="email" placeholder="Email" value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })} required />
        <input style={S.inp} type="password" placeholder="Password" value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })} required />
        <button type="submit" style={S.btn}>{mode === 'login' ? 'Login' : 'Register'}</button>
        <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.9rem' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have one? '}
          <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={S.link}>
            {mode === 'login' ? 'Register' : 'Sign In'}
          </button>
        </p>
      </form>
    </div>
  );
}

const S = {
  wrapper: { display:'flex', justifyContent:'center', alignItems:'center', minHeight:'80vh' },
  card:    { background:'#fff', padding:'2rem', borderRadius:'8px', width:'360px', boxShadow:'0 2px 12px rgba(0,0,0,.1)', display:'flex', flexDirection:'column', gap:'12px' },
  title:   { textAlign:'center', marginBottom:'8px' },
  inp:     { padding:'10px', border:'1px solid #d1d5db', borderRadius:'6px', fontSize:'1rem' },
  btn:     { padding:'10px', background:'#2563eb', color:'#fff', border:'none', borderRadius:'6px', fontSize:'1rem' },
  err:     { color:'#ef4444', fontSize:'0.9rem', textAlign:'center' },
  link:    { background:'none', border:'none', color:'#2563eb', textDecoration:'underline', cursor:'pointer' },
};
