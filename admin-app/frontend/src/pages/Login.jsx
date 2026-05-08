import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    }
  }

  return (
    <div style={S.wrapper}>
      <form onSubmit={handleSubmit} style={S.card}>
        <h2 style={S.title}>Admin Login</h2>
        {error && <p style={S.err}>{error}</p>}
        <input style={S.inp} type="email" placeholder="Email" value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })} required />
        <input style={S.inp} type="password" placeholder="Password" value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })} required />
        <button type="submit" style={S.btn}>Sign In</button>
      </form>
    </div>
  );
}

const S = {
  wrapper: { display:'flex', justifyContent:'center', alignItems:'center', minHeight:'80vh' },
  card:    { background:'#1e293b', padding:'2rem', borderRadius:'8px', width:'340px', display:'flex', flexDirection:'column', gap:'14px', boxShadow:'0 4px 20px rgba(0,0,0,.4)' },
  title:   { textAlign:'center', color:'#fff' },
  inp:     { padding:'10px', border:'1px solid #334155', borderRadius:'6px', background:'#0f172a', color:'#e2e8f0', fontSize:'1rem' },
  btn:     { padding:'10px', background:'#1e40af', color:'#fff', border:'none', borderRadius:'6px', fontSize:'1rem' },
  err:     { color:'#f87171', fontSize:'0.9rem', textAlign:'center' },
};
