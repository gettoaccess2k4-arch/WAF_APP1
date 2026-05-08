import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart }         = useCart();

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>WAFLab Shop</Link>
      <div style={styles.links}>
        <Link to="/">Products</Link>
        <Link to="/cart">Cart ({cart.length})</Link>
        {user
          ? <><span style={{ color: '#9ca3af' }}>Hi, {user.username}</span><button onClick={logout} style={styles.btn}>Logout</button></>
          : <Link to="/login">Login</Link>
        }
      </div>
    </nav>
  );
}

const styles = {
  nav:   { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 24px', background:'#1e293b', color:'#fff' },
  brand: { color:'#fff', fontWeight:'700', fontSize:'1.2rem' },
  links: { display:'flex', gap:'20px', alignItems:'center', color:'#cbd5e1' },
  btn:   { background:'#ef4444', color:'#fff', border:'none', borderRadius:'4px', padding:'6px 12px' },
};
