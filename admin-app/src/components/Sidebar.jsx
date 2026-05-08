import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MENU = [
  { to:'/dashboard', icon:'📊', label:'Dashboard' },
  { to:'/products',  icon:'📱', label:'Sản phẩm' },
  { to:'/orders',    icon:'📋', label:'Đơn hàng' },
  { to:'/users',     icon:'👥', label:'Người dùng' },
  { to:'/upload',    icon:'📁', label:'Upload (WAF Test)' },
];

export default function Sidebar() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() { await logout(); navigate('/login'); }

  return (
    <aside style={S.aside}>
      <div style={S.logo}>
        <span style={{ fontSize:'24px' }}>📱</span>
        <div>
          <div style={S.brandName}>TechMobile</div>
          <div style={S.brandSub}>Admin Panel</div>
        </div>
      </div>

      <nav style={S.nav}>
        {MENU.map(m => (
          <NavLink key={m.to} to={m.to} style={({ isActive }) => ({ ...S.link, ...(isActive ? S.active : {}) })}>
            <span style={S.icon}>{m.icon}</span>
            <span>{m.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={S.footer}>
        <div style={S.adminInfo}>
          <span style={S.avatar}>👤</span>
          <div>
            <div style={{ fontWeight:'600', fontSize:'13px' }}>{admin?.username}</div>
            <div style={{ color:'rgba(255,255,255,.5)', fontSize:'11px' }}>Administrator</div>
          </div>
        </div>
        <button onClick={handleLogout} style={S.logoutBtn}>Đăng xuất</button>
      </div>
    </aside>
  );
}

const S = {
  aside:     { width:'220px', background:'#1a1f36', display:'flex', flexDirection:'column', minHeight:'100vh', flexShrink:0 },
  logo:      { display:'flex', alignItems:'center', gap:'10px', padding:'20px 16px', borderBottom:'1px solid rgba(255,255,255,.08)' },
  brandName: { color:'#fff', fontWeight:'800', fontSize:'16px' },
  brandSub:  { color:'rgba(255,255,255,.4)', fontSize:'11px' },
  nav:       { flex:1, padding:'12px 8px', display:'flex', flexDirection:'column', gap:'2px' },
  link:      { display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'6px', color:'rgba(255,255,255,.7)', textDecoration:'none', fontSize:'13px', fontWeight:'500', transition:'.15s' },
  active:    { background:'rgba(208,2,27,.25)', color:'#ff6b6b' },
  icon:      { fontSize:'16px', width:'20px', textAlign:'center' },
  footer:    { padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,.08)' },
  adminInfo: { display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' },
  avatar:    { width:'32px', height:'32px', background:'rgba(255,255,255,.1)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' },
  logoutBtn: { width:'100%', padding:'8px', background:'rgba(208,2,27,.3)', color:'#ff9999', border:'1px solid rgba(208,2,27,.4)', borderRadius:'6px', fontSize:'12px' },
};
