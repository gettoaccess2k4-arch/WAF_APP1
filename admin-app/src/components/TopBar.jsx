import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TITLES = {
  '/dashboard': { label: 'Dashboard',      icon: '▣' },
  '/products':  { label: 'Sản phẩm',       icon: '📦' },
  '/orders':    { label: 'Đơn hàng',       icon: '🧾' },
  '/users':     { label: 'Người dùng',     icon: '👤' },
  '/upload':    { label: 'File Upload',    icon: '📁' },
};

export default function TopBar() {
  const { admin, logout }   = useAuth();
  const { pathname }        = useLocation();
  const navigate            = useNavigate();
  const [menuOpen, setMenu] = useState(false);
  const page = TITLES[pathname] || { label: 'Admin', icon: '⚙' };

  const now = new Date().toLocaleDateString('vi-VN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header style={S.bar}>
      {/* Left: page title */}
      <div style={S.left}>
        <span style={S.pageIcon}>{page.icon}</span>
        <div>
          <h1 style={S.pageTitle}>{page.label}</h1>
          <p style={S.date}>{now}</p>
        </div>
      </div>

      {/* Right: actions */}
      <div style={S.right}>
        {/* Notification bell (decorative) */}
        <button style={S.iconBtn} title="Thông báo">
          <span style={{ fontSize: '18px' }}>🔔</span>
          <span style={S.notifDot} />
        </button>

        {/* User menu */}
        <div style={{ position: 'relative' }}>
          <button style={S.userBtn} onClick={() => setMenu(m => !m)}>
            <div style={S.avatar}>{admin?.username?.[0]?.toUpperCase() || 'A'}</div>
            <div style={S.userInfo}>
              <span style={S.userName}>{admin?.username}</span>
              <span style={S.userRole}>Administrator</span>
            </div>
            <span style={{ color: 'var(--text-3)', fontSize: '12px' }}>▾</span>
          </button>

          {menuOpen && (
            <div style={S.dropdown} onMouseLeave={() => setMenu(false)}>
              <div style={S.dropHeader}>
                <p style={{ fontWeight: '700' }}>{admin?.username}</p>
                <p style={{ color: 'var(--text-3)', fontSize: '12px' }}>{admin?.email}</p>
              </div>
              <hr style={S.divider} />
              <button style={S.dropItem} onClick={() => { setMenu(false); navigate('/dashboard'); }}>▣ Dashboard</button>
              <hr style={S.divider} />
              <button style={{ ...S.dropItem, color: 'var(--red)' }} onClick={handleLogout}>↩ Đăng xuất</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const S = {
  bar:       { height: 'var(--topbar-h)', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 50, boxShadow: 'var(--shadow-xs)' },
  left:      { display: 'flex', alignItems: 'center', gap: '12px' },
  pageIcon:  { fontSize: '20px' },
  pageTitle: { fontSize: '17px', fontWeight: '700', color: 'var(--text)', lineHeight: 1 },
  date:      { fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' },
  right:     { display: 'flex', alignItems: 'center', gap: '8px' },
  iconBtn:   { width: '38px', height: '38px', border: 'none', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', transition: 'var(--transition)' },
  notifDot:  { position: 'absolute', top: '8px', right: '8px', width: '7px', height: '7px', background: 'var(--primary)', borderRadius: '50%', border: '1.5px solid #fff' },
  userBtn:   { display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface)', cursor: 'pointer', transition: 'var(--transition)' },
  avatar:    { width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),#ff6b7a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '12px', flexShrink: 0 },
  userInfo:  { display: 'flex', flexDirection: 'column', textAlign: 'left' },
  userName:  { fontSize: '13px', fontWeight: '600', color: 'var(--text)', lineHeight: 1 },
  userRole:  { fontSize: '11px', color: 'var(--text-3)', marginTop: '1px' },
  dropdown:  { position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-md)', minWidth: '200px', overflow: 'hidden', zIndex: 100 },
  dropHeader:{ padding: '12px 16px' },
  divider:   { border: 'none', borderTop: '1px solid var(--border)' },
  dropItem:  { display: 'block', width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', textAlign: 'left', fontSize: '13px', cursor: 'pointer', color: 'var(--text)' },
};
