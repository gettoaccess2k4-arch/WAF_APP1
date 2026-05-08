import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar       from './components/Navbar';
import Home         from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart         from './pages/Cart';
import Checkout     from './pages/Checkout';
import Login        from './pages/Login';
import { useAuth }  from './context/AuthContext';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p style={{ padding: '2rem' }}>Loading…</p>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"            element={<Home />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/login"       element={<Login />} />
        <Route path="/cart"        element={<PrivateRoute><Cart /></PrivateRoute>} />
        <Route path="/checkout"    element={<PrivateRoute><Checkout /></PrivateRoute>} />
      </Routes>
    </>
  );
}
