import { useState, useEffect } from 'react';
import axios from 'axios';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function Orders() {
  const [orders, setOrders]         = useState([]);
  const [filterStatus, setFilter]   = useState('');

  useEffect(() => { fetchOrders(); }, [filterStatus]);

  async function fetchOrders() {
    const params = filterStatus ? { status: filterStatus } : {};
    const r = await axios.get('/api/orders', { params });
    setOrders(r.data);
  }

  async function updateStatus(id, status) {
    await axios.put(`/api/orders/${id}/status`, { status });
    fetchOrders();
  }

  const badgeColor = { pending:'#d97706', processing:'#2563eb', shipped:'#7c3aed', delivered:'#16a34a', cancelled:'#dc2626' };

  return (
    <main style={S.main}>
      <h2 style={S.h2}>Order Management</h2>
      <div style={S.toolbar}>
        <select style={S.sel} value={filterStatus} onChange={e => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span style={S.count}>{orders.length} orders</span>
      </div>
      {orders.map(o => (
        <div key={o.id} style={S.card}>
          <div style={S.cardHead}>
            <span style={S.orderId}>{o.id}</span>
            <span style={{ ...S.badge, background: badgeColor[o.status] || '#6b7280' }}>{o.status}</span>
            <span style={S.total}>${o.total.toFixed(2)}</span>
            <span style={S.date}>{new Date(o.createdAt).toLocaleDateString()}</span>
          </div>
          <div style={S.cardBody}>
            <div>
              <strong>Items:</strong>
              <ul style={{ marginLeft:'16px', marginTop:'4px' }}>
                {o.items.map(i => <li key={i.productId} style={{ fontSize:'0.85rem', color:'#94a3b8' }}>{i.name} × {i.qty} — ${(i.price*i.qty).toFixed(2)}</li>)}
              </ul>
            </div>
            <div style={{ marginTop:'8px' }}>
              <strong>Ship to:</strong> <span style={{ color:'#94a3b8' }}>{o.shippingAddress?.fullName}, {o.shippingAddress?.city}</span>
            </div>
            <div style={S.actions}>
              <label style={{ fontSize:'0.85rem' }}>Update status: </label>
              <select style={S.selSmall} value={o.status} onChange={e => updateStatus(o.id, e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
      ))}
    </main>
  );
}

const S = {
  main:     { maxWidth:'900px', margin:'0 auto', padding:'24px 16px' },
  h2:       { marginBottom:'20px', color:'#f1f5f9' },
  toolbar:  { display:'flex', alignItems:'center', gap:'16px', marginBottom:'20px' },
  sel:      { padding:'8px 12px', border:'1px solid #334155', borderRadius:'6px', background:'#1e293b', color:'#e2e8f0' },
  selSmall: { padding:'4px 8px', border:'1px solid #334155', borderRadius:'4px', background:'#0f172a', color:'#e2e8f0', fontSize:'0.85rem' },
  count:    { color:'#64748b', fontSize:'0.9rem' },
  card:     { background:'#1e293b', borderRadius:'8px', padding:'16px 20px', marginBottom:'12px', border:'1px solid #334155' },
  cardHead: { display:'flex', alignItems:'center', gap:'16px', marginBottom:'12px' },
  orderId:  { fontWeight:'600', color:'#60a5fa', fontFamily:'monospace' },
  badge:    { padding:'2px 10px', borderRadius:'12px', fontSize:'0.75rem', color:'#fff', fontWeight:'600' },
  total:    { marginLeft:'auto', fontWeight:'700', color:'#f1f5f9' },
  date:     { color:'#64748b', fontSize:'0.85rem' },
  cardBody: { borderTop:'1px solid #334155', paddingTop:'12px', color:'#cbd5e1', fontSize:'0.9rem' },
  actions:  { marginTop:'12px', display:'flex', alignItems:'center', gap:'8px' },
};
