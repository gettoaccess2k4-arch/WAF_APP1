import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

function Avatar({ name, size = 38 }) {
  const initials = (name || '?').slice(0, 2).toUpperCase();
  const hue = [...(name || '')].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `hsl(${hue},55%,52%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: '700', fontSize: size * 0.37 + 'px',
      userSelect: 'none',
    }}>
      {initials}
    </div>
  );
}

function RoleBadge({ role }) {
  const isAdmin = role === 'admin';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: '700',
      background: isAdmin ? '#fef2f2' : '#eff6ff',
      color: isAdmin ? '#ef4444' : '#3b82f6',
      border: `1px solid ${isAdmin ? '#fecaca' : '#bfdbfe'}`,
    }}>
      {isAdmin ? '🛡 Admin' : '👤 User'}
    </span>
  );
}

function ConfirmModal({ user, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
    }} onClick={onCancel}>
      <div style={{
        background: '#fff', borderRadius: '14px', padding: '28px 32px',
        boxShadow: '0 20px 60px rgba(15,23,42,.25)', minWidth: '360px', maxWidth: '90vw',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: '#fef2f2', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '24px', margin: '0 auto 14px',
          }}>🗑</div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
            Xóa người dùng?
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
            Bạn chắc chắn muốn xóa <strong>{user.username}</strong>?<br />
            Hành động này không thể hoàn tác.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px',
            background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#475569',
          }}>Hủy</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '10px', border: 'none', borderRadius: '8px',
            background: '#ef4444', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '700',
          }}>Xóa</button>
        </div>
      </div>
    </div>
  );
}

export default function Users() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [confirm, setConfirm] = useState(null);
  const toast = useToast();

  useEffect(() => {
    api.get('/users').then(r => setUsers(r.data)).catch(() => toast.push('Không thể tải danh sách người dùng', 'error')).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q ? users.filter(u => u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) : users;
  }, [users, search]);

  async function doDelete(user) {
    try {
      await api.delete(`/users/${user.id}`);
      setUsers(u => u.filter(x => x.id !== user.id));
      toast.push(`Đã xóa "${user.username}"`, 'success');
    } catch (e) {
      toast.push(e.response?.data?.error || 'Xóa thất bại', 'error');
    } finally {
      setConfirm(null);
    }
  }

  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount  = users.filter(u => u.role === 'user').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {confirm && <ConfirmModal user={confirm} onConfirm={() => doDelete(confirm)} onCancel={() => setConfirm(null)} />}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>Quản lý người dùng</h2>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Tổng cộng {users.length} tài khoản</p>
        </div>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '14px' }}>🔍</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc email…"
            style={{
              paddingLeft: '34px', paddingRight: '14px', height: '38px',
              border: '1px solid var(--border)', borderRadius: 'var(--radius)',
              fontSize: '13px', width: '260px', outline: 'none', background: 'var(--surface)',
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '12px' }}>
        {[
          { label: 'Tổng tài khoản', value: users.length,  color: '#3b82f6', icon: '👥' },
          { label: 'Quản trị viên',  value: adminCount,     color: '#ef4444', icon: '🛡' },
          { label: 'Người dùng',     value: userCount,      color: '#10b981', icon: '👤' },
          { label: 'Kết quả tìm',    value: filtered.length, color: '#8b5cf6', icon: '🔎' },
        ].map(s => (
          <div key={s.label} style={{
            background: '#fff', borderRadius: '10px', padding: '14px 16px',
            boxShadow: '0 1px 4px rgba(15,23,42,.07)', borderLeft: `3px solid ${s.color}`,
          }}>
            <div style={{ fontSize: '22px', marginBottom: '6px' }}>{s.icon}</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(15,23,42,.07)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Đang tải…</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  {['Người dùng', 'Email', 'Vai trò', 'Ngày tạo', 'Thao tác'].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: 'left', fontSize: '11px',
                      fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase',
                      letterSpacing: '.5px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id} style={{
                    borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none',
                    transition: 'background .15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Avatar name={u.username} />
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>{u.username}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                            ID: <code style={{ fontSize: '10px' }}>{u.id.slice(0, 8)}…</code>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#475569' }}>{u.email}</td>
                    <td style={{ padding: '14px 16px' }}><RoleBadge role={u.role} /></td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                      {new Date(u.created_at).toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {u.role !== 'admin' ? (
                        <button
                          onClick={() => setConfirm(u)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            padding: '6px 12px', border: '1px solid #fecaca', borderRadius: '8px',
                            background: '#fff', color: '#ef4444', cursor: 'pointer',
                            fontSize: '12px', fontWeight: '600', transition: 'var(--transition)',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                        >
                          🗑 Xóa
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>Không thể xóa</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filtered.length && (
              <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
                <p style={{ fontWeight: '600' }}>Không tìm thấy người dùng nào</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
