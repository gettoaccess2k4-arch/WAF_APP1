import { useState, useEffect } from 'react';
import api from '../services/api';

const STATUS_COLOR = { pending:'#FFB700', processing:'#1565C0', shipped:'#7B1FA2', delivered:'#2E7D32', cancelled:'#D0021B' };
const STATUS_LABEL = { pending:'Chờ xác nhận', processing:'Đang xử lý', shipped:'Đang giao', delivered:'Đã giao', cancelled:'Đã hủy' };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then(r => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding:'40px', textAlign:'center', color:'#757575' }}>Đang tải đơn hàng…</div>;

  if (!orders.length) return (
    <div className="container" style={{ textAlign:'center', padding:'60px 20px' }}>
      <span style={{ fontSize:'60px' }}>📋</span>
      <h2 style={{ margin:'16px 0 8px' }}>Chưa có đơn hàng</h2>
      <a href="/" style={{ color:'#D0021B' }}>Mua sắm ngay</a>
    </div>
  );

  return (
    <div className="container" style={{ padding:'20px 16px' }}>
      <h2 style={{ marginBottom:'20px' }}>📋 Đơn hàng của tôi</h2>
      {orders.map(o => (
        <div key={o.id} style={S.card}>
          <div style={S.head}>
            <span style={S.orderId}>#{o.id.slice(0,8).toUpperCase()}</span>
            <span style={{ ...S.statusBadge, background: STATUS_COLOR[o.status] }}>
              {STATUS_LABEL[o.status]}
            </span>
            <span style={S.date}>{new Date(o.created_at).toLocaleDateString('vi-VN')}</span>
            <span style={S.total}>{Number(o.total).toLocaleString('vi-VN')}đ</span>
          </div>
          <div style={S.items}>
            {(o.items || []).map(i => (
              <span key={i.id} style={S.item}>{i.name} ×{i.quantity}</span>
            ))}
          </div>
          {o.shipping_address && (
            <p style={S.addr}>
              📍 {o.shipping_address.fullName} — {o.shipping_address.address}, {o.shipping_address.city}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

const S = {
  card:        { background:'#fff', borderRadius:'8px', padding:'16px 20px', marginBottom:'10px', boxShadow:'0 1px 4px rgba(0,0,0,.07)' },
  head:        { display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap', marginBottom:'10px' },
  orderId:     { fontFamily:'monospace', fontWeight:'700', color:'#212121' },
  statusBadge: { color:'#fff', fontSize:'12px', fontWeight:'700', padding:'3px 10px', borderRadius:'20px' },
  date:        { color:'#757575', fontSize:'13px' },
  total:       { marginLeft:'auto', fontWeight:'800', color:'#D0021B', fontSize:'16px' },
  items:       { display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'8px' },
  item:        { background:'#f5f5f5', borderRadius:'4px', padding:'4px 10px', fontSize:'12px', color:'#424242' },
  addr:        { fontSize:'12px', color:'#757575' },
};
