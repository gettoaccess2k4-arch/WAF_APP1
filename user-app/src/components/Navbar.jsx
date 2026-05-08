import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout }  = useAuth();
  const { count }         = useCart();
  const navigate          = useNavigate();
  const [q, setQ]         = useState('');

  function handleSearch(e) {
    e.preventDefault();
    if (q.trim()) navigate(`/?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <header>
      {/* Top bar */}
      <div style={S.topBar}>
        <div className="container" style={S.topInner}>
          <span>📞 1800 2091</span>
          <span>🏪 Hệ thống 2000+ cửa hàng toàn quốc</span>
          <span>🚚 Giao hàng miễn phí đơn từ 500k</span>
        </div>
      </div>

      {/* Main header */}
      <div style={S.header}>
        <div className="container" style={S.headerInner}>
          {/* Logo */}
          <Link to="/" style={S.logo}>
            <span style={S.logoIcon}>📱</span>
            <span style={S.logoText}>TechMobile</span>
          </Link>

          {/* Search bar — WAF XSS test surface */}
          <form onSubmit={handleSearch} style={S.searchForm}>
            <input
              style={S.searchInput}
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Tìm kiếm điện thoại, laptop, phụ kiện..."
            />
            <button type="submit" style={S.searchBtn}>🔍</button>
          </form>

          {/* Right actions */}
          <div style={S.actions}>
            <Link to="/cart" style={S.actionBtn}>
              <span style={S.cartIcon}>🛒</span>
              {count > 0 && <span style={S.badge}>{count}</span>}
              <span>Giỏ hàng</span>
            </Link>
            {user ? (
              <div style={S.actionBtn}>
                <span>👤</span>
                <span style={{ maxWidth:80, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {user.username}
                </span>
                <button onClick={logout} style={S.logoutBtn}>Đăng xuất</button>
              </div>
            ) : (
              <Link to="/login" style={S.actionBtn}>
                <span>👤</span><span>Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

const S = {
  topBar:      { background:'#b30016', color:'rgba(255,255,255,.85)', fontSize:'12px' },
  topInner:    { display:'flex', justifyContent:'space-between', padding:'6px 16px' },
  header:      { background:'#D0021B', padding:'10px 0', position:'sticky', top:0, zIndex:100, boxShadow:'0 2px 8px rgba(0,0,0,.2)' },
  headerInner: { display:'flex', alignItems:'center', gap:'16px' },
  logo:        { display:'flex', alignItems:'center', gap:'8px', color:'#fff', textDecoration:'none', flexShrink:0 },
  logoIcon:    { fontSize:'28px' },
  logoText:    { fontSize:'22px', fontWeight:'800', letterSpacing:'-0.5px' },
  searchForm:  { flex:1, display:'flex', maxWidth:'600px' },
  searchInput: { flex:1, padding:'10px 16px', border:'none', borderRadius:'6px 0 0 6px', fontSize:'14px', outline:'none' },
  searchBtn:   { padding:'10px 18px', background:'#FFB700', border:'none', borderRadius:'0 6px 6px 0', fontSize:'16px', fontWeight:'bold' },
  actions:     { display:'flex', gap:'8px', flexShrink:0 },
  actionBtn:   { display:'flex', alignItems:'center', gap:'6px', color:'#fff', textDecoration:'none', padding:'6px 12px', borderRadius:'6px', fontSize:'13px', background:'rgba(255,255,255,.15)' },
  cartIcon:    { position:'relative', fontSize:'18px' },
  badge:       { position:'absolute', top:'-6px', right:'-6px', background:'#FFB700', color:'#222', borderRadius:'50%', width:'18px', height:'18px', fontSize:'11px', fontWeight:'700', display:'flex', alignItems:'center', justifyContent:'center' },
  logoutBtn:   { background:'rgba(255,255,255,.25)', border:'none', color:'#fff', borderRadius:'4px', padding:'2px 8px', fontSize:'12px', marginLeft:'6px' },
};
