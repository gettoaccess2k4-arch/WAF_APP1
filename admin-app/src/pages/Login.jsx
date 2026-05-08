import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]     = useState({ email:'', password:'' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Đăng nhập thất bại.');
    } finally { setLoading(false); }
  }

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.header}>
          <span style={{ fontSize:'40px' }}>🔐</span>
          <h1 style={S.title}>TechMobile Admin</h1>
          <p style={S.sub}>Đăng nhập vào hệ thống quản trị</p>
        </div>
        {error && <div style={S.err}>{error}</div>}
        <form onSubmit={submit} style={S.form}>
          <div style={S.field}>
            <label style={S.label}>Email</label>
            <input style={S.inp} type="email" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="admin@admin.lab.local" required />
          </div>
          <div style={S.field}>
            <label style={S.label}>Mật khẩu</label>
            <input style={S.inp} type="password" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••" required />
          </div>
          <button type="submit" style={S.btn} disabled={loading}>
            {loading ? 'Đang xử lý…' : 'Đăng nhập'}
          </button>
        </form>
        <div style={S.hint}>Demo: admin@admin.lab.local / password: <code>password</code></div>
      </div>
    </div>
  );
}

const S = {
  page:   { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0f1117' },
  card:   { background:'#1a1f36', borderRadius:'12px', padding:'36px', width:'380px', boxShadow:'0 8px 32px rgba(0,0,0,.4)' },
  header: { textAlign:'center', marginBottom:'24px' },
  title:  { color:'#fff', fontSize:'22px', fontWeight:'800', margin:'8px 0 4px' },
  sub:    { color:'rgba(255,255,255,.5)', fontSize:'13px' },
  form:   { display:'flex', flexDirection:'column', gap:'16px' },
  field:  { display:'flex', flexDirection:'column', gap:'6px' },
  label:  { color:'rgba(255,255,255,.7)', fontSize:'13px', fontWeight:'600' },
  inp:    { padding:'12px 14px', background:'#252d4a', border:'1px solid rgba(255,255,255,.1)', borderRadius:'6px', color:'#fff', fontSize:'14px', outline:'none' },
  btn:    { padding:'14px', background:'#D0021B', color:'#fff', border:'none', borderRadius:'8px', fontWeight:'700', fontSize:'15px' },
  err:    { background:'rgba(208,2,27,.2)', border:'1px solid rgba(208,2,27,.4)', color:'#ff9999', padding:'10px 14px', borderRadius:'6px', marginBottom:'16px', fontSize:'13px' },
  hint:   { marginTop:'16px', color:'rgba(255,255,255,.35)', fontSize:'12px', textAlign:'center' },
};
