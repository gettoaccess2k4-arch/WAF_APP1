import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GROUPS = [
  {
    label: 'Tổng quan',
    items: [
      { to: '/dashboard', icon: '▣', label: 'Dashboard' },
    ],
  },
  {
    label: 'Quản lý',
    items: [
      { to: '/products', icon: '📦', label: 'Sản phẩm' },
      { to: '/orders',   icon: '🧾', label: 'Đơn hàng',  badge: 'pending' },
      { to: '/users',    icon: '👤', label: 'Người dùng' },
    ],
  },
  {
    label: 'Công cụ WAF',
    items: [
      { to: '/upload',   icon: '📁', label: 'Upload (Shell Test)', warn: true },
    ],
  },
];

export default function Sidebar({ pendingCount = 0 }) {
  const { admin } = useAuth();

  return (
    <aside style={S.aside}>
      {/* Brand */}
      <div style={S.brand}>
        <div style={S.brandIcon}>📱</div>
        <div>
          <div style={S.brandName}>TechMobile</div>
          <div style={S.brandRole}>Admin Portal</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={S.nav}>
        {GROUPS.map(g => (
          <div key={g.label} style={S.group}>
            <p style={S.groupLabel}>{g.label}</p>
            {g.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  ...S.link,
                  ...(isActive ? S.linkActive : {}),
                  ...(item.warn ? S.linkWarn : {}),
                })}
              >
                <span style={S.linkIcon}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && pendingCount > 0 && (
                  <span style={S.badge}>{pendingCount}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div style={S.footer}>
        <div style={S.avatar}>{admin?.username?.[0]?.toUpperCase() || 'A'}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={S.footerName} className="truncate">{admin?.username}</div>
          <div style={S.footerRole}>Administrator</div>
        </div>
      </div>
    </aside>
  );
}

const S = {
  aside:      { width: 'var(--sidebar-w)', background: 'var(--sidebar-bg)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, flexShrink: 0, userSelect: 'none' },
  brand:      { display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 16px 18px', borderBottom: '1px solid rgba(255,255,255,.06)' },
  brandIcon:  { width: '36px', height: '36px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 },
  brandName:  { color: '#f8fafc', fontWeight: '800', fontSize: '15px', letterSpacing: '-.3px' },
  brandRole:  { color: 'rgba(255,255,255,.35)', fontSize: '11px', marginTop: '1px' },
  nav:        { flex: 1, overflowY: 'auto', padding: '12px 10px' },
  group:      { marginBottom: '20px' },
  groupLabel: { color: 'rgba(255,255,255,.25)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 8px', marginBottom: '6px' },
  link:       { display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: 'var(--radius-sm)', color: 'rgba(255,255,255,.6)', textDecoration: 'none', fontSize: '13px', fontWeight: '500', transition: 'var(--transition)', marginBottom: '2px' },
  linkActive: { background: 'var(--sidebar-active)', color: '#ff6b7a', fontWeight: '700' },
  linkWarn:   { color: 'rgba(251,191,36,.7)' },
  linkIcon:   { fontSize: '15px', width: '20px', textAlign: 'center', flexShrink: 0 },
  badge:      { background: 'var(--primary)', color: '#fff', fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '99px', minWidth: '18px', textAlign: 'center' },
  footer:     { display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,.06)' },
  avatar:     { width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),#ff6b7a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '13px', flexShrink: 0 },
  footerName: { color: '#f1f5f9', fontWeight: '600', fontSize: '13px' },
  footerRole: { color: 'rgba(255,255,255,.3)', fontSize: '11px' },
};
