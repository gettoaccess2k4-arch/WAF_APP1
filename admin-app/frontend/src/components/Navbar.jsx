import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <nav style={S.nav}>
      <span style={S.brand}>WAFLab Admin</span>
      <div style={S.links}>
        <Link to="/products">Products</Link>
        <Link to="/orders">Orders</Link>
        <Link to="/upload">Upload</Link>
        {admin && (
          <><span style={S.user}>{admin.username}</span>
            <button onClick={handleLogout} style={S.btn}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

const S = {
  nav:   { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 24px', background:'#1e40af', color:'#fff' },
  brand: { fontWeight:'700', fontSize:'1.2rem' },
  links: { display:'flex', gap:'20px', alignItems:'center' },
  user:  { color:'#bfdbfe', fontSize:'0.9rem' },
  btn:   { background:'#ef4444', color:'#fff', border:'none', borderRadius:'4px', padding:'6px 12px' },
};
