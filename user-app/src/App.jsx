import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar         from './components/Navbar';
import Home           from './pages/Home';
import ProductDetail  from './pages/ProductDetail';
import Cart           from './pages/Cart';
import Checkout       from './pages/Checkout';
import Login          from './pages/Login';
import Orders         from './pages/Orders';
import { useAuth }    from './context/AuthContext';

function Guard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"               element={<Home />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/cart"           element={<Guard><Cart /></Guard>} />
        <Route path="/checkout"       element={<Guard><Checkout /></Guard>} />
        <Route path="/orders"         element={<Guard><Orders /></Guard>} />
      </Routes>
      <footer style={{ background:'#212121', color:'rgba(255,255,255,.6)', textAlign:'center', padding:'24px', marginTop:'40px', fontSize:'13px' }}>
        © 2024 TechMobile — WAFLab Demo | shop.lab.local
      </footer>
    </>
  );
}
