import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, register } = useAuth();
  const navigate             = useNavigate();
  const [mode, setMode]      = useState('login');
  const [form, setForm]      = useState({ username:'', email:'', password:'' });
  const [error, setError]    = useState('');
  const [loading, setLoading]= useState(false);

  async function submit(e) {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (mode === 'login') { await login(form.email, form.password); navigate('/'); }
      else { await register(form.username, form.email, form.password); setMode('login'); }
    } catch (err) {
      setError(err.response?.data?.error || 'Đã có lỗi xảy ra.');
    } finally { setLoading(false); }
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.header}>
          <span style={{ fontSize:'36px' }}>📱</span>
          <h1 style={S.brand}>TechMobile</h1>
        </div>

        <div style={S.tabs}>
          {['login','register'].map(m => (
            <button key={m} style={{ ...S.tab, ...(mode===m ? S.tabActive : {}) }} onClick={() => setMode(m)}>
              {m === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} style={S.form}>
          {error && <div style={S.err}>⚠ {error}</div>}
          {mode === 'register' && (
            <div style={S.field}>
              <label style={S.label}>Tên đăng nhập</label>
              <input style={S.inp} value={form.username} onChange={set('username')} placeholder="Nguyễn Văn A" required />
            </div>
          )}
          <div style={S.field}>
            <label style={S.label}>Email</label>
            <input style={S.inp} type="email" value={form.email} onChange={set('email')} placeholder="email@example.com" required />
          </div>
          <div style={S.field}>
            <label style={S.label}>Mật khẩu</label>
            <input style={S.inp} type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn-primary" style={{ width:'100%', padding:'14px', fontSize:'16px' }} disabled={loading}>
            {loading ? 'Đang xử lý…' : (mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản')}
          </button>
        </form>

        {mode === 'login' && (
          <div style={S.hint}>
            <strong>Demo:</strong> alice@shop.lab.local / User@123
          </div>
        )}
      </div>
    </div>
  );
}

const S = {
  page:      { minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' },
  card:      { background:'#fff', borderRadius:'12px', padding:'32px', width:'100%', maxWidth:'400px', boxShadow:'0 4px 20px rgba(0,0,0,.12)' },
  header:    { textAlign:'center', marginBottom:'24px' },
  brand:     { fontSize:'24px', fontWeight:'800', color:'#D0021B', marginTop:'8px' },
  tabs:      { display:'flex', background:'#f5f5f5', borderRadius:'8px', padding:'4px', marginBottom:'24px' },
  tab:       { flex:1, padding:'10px', border:'none', background:'transparent', borderRadius:'6px', fontWeight:'600', color:'#757575', fontSize:'14px' },
  tabActive: { background:'#D0021B', color:'#fff' },
  form:      { display:'flex', flexDirection:'column', gap:'16px' },
  field:     { display:'flex', flexDirection:'column', gap:'6px' },
  label:     { fontSize:'13px', fontWeight:'600', color:'#424242' },
  inp:       { padding:'12px 14px', border:'1.5px solid #e0e0e0', borderRadius:'6px', fontSize:'14px', outline:'none' },
  err:       { background:'#ffebee', color:'#c62828', padding:'10px 14px', borderRadius:'6px', fontSize:'13px' },
  hint:      { marginTop:'16px', background:'#e3f2fd', padding:'10px 14px', borderRadius:'6px', fontSize:'12px', color:'#1565C0' },
};
