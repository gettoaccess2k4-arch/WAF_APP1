import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar    from './components/Navbar';
import Login     from './pages/Login';
import Products  from './pages/Products';
import Orders    from './pages/Orders';
import Upload    from './pages/Upload';
import { useAuth } from './context/AuthContext';

function Guard({ children }) {
  const { admin, loading } = useAuth();
  if (loading) return <p style={{ padding:'2rem' }}>Loading…</p>;
  return admin ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/products" element={<Guard><Products /></Guard>} />
        <Route path="/orders"   element={<Guard><Orders /></Guard>} />
        <Route path="/upload"   element={<Guard><Upload /></Guard>} />
        <Route path="*"         element={<Navigate to="/products" replace />} />
      </Routes>
    </>
  );
}
