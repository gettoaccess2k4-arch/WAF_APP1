import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar    from './components/Sidebar';
import TopBar     from './components/TopBar';
import Login      from './pages/Login';
import Dashboard  from './pages/Dashboard';
import Products   from './pages/Products';
import Orders     from './pages/Orders';
import Users      from './pages/Users';
import Upload     from './pages/Upload';
import { useAuth }  from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import api from './services/api';

function Guard({ children }) {
  const { admin, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', gap:'12px', color:'var(--text-3)' }}>
      <div style={{ width:'20px', height:'20px', border:'2px solid var(--border)', borderTopColor:'var(--primary)', borderRadius:'50%', animation:'spin .7s linear infinite' }} />
      Đang tải…
    </div>
  );
  return admin ? children : <Navigate to="/login" replace />;
}

function AdminLayout({ children }) {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    api.get('/orders', { params: { status: 'pending' } })
      .then(r => setPendingCount(r.data.length))
      .catch(() => {});
  }, []);

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      <Sidebar pendingCount={pendingCount} />
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <TopBar />
        <main style={{ flex:1, overflowY:'auto', padding:'24px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <Guard>
            <AdminLayout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/products"  element={<Products />} />
                <Route path="/orders"    element={<Orders />} />
                <Route path="/users"     element={<Users />} />
                <Route path="/upload"    element={<Upload />} />
                <Route path="*"          element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AdminLayout>
          </Guard>
        } />
      </Routes>
    </ToastProvider>
  );
}
