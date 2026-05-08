import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar    from './components/Sidebar';
import Login      from './pages/Login';
import Dashboard  from './pages/Dashboard';
import Products   from './pages/Products';
import Orders     from './pages/Orders';
import Users      from './pages/Users';
import Upload     from './pages/Upload';
import { useAuth } from './context/AuthContext';

function Guard({ children }) {
  const { admin, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontSize:'18px', color:'#9aa0a6' }}>Đang tải…</div>;
  return admin ? children : <Navigate to="/login" replace />;
}

function Layout({ children }) {
  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar />
      <main style={{ flex:1, background:'#f4f6fb', overflowY:'auto' }}>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={
        <Guard>
          <Layout>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products"  element={<Products />} />
              <Route path="/orders"    element={<Orders />} />
              <Route path="/users"     element={<Users />} />
              <Route path="/upload"    element={<Upload />} />
              <Route path="*"          element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        </Guard>
      } />
    </Routes>
  );
}
