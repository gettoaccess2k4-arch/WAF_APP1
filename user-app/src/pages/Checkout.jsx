import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { cart, total, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm]    = useState({ fullName:'', phone:'', address:'', city:'' });
  const [error, setError]  = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone]    = useState(null);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const r = await api.post('/orders/checkout', {
        items: cart.map(i => ({ productId: i.productId, qty: i.qty })),
        shippingAddress: form,
      });
      clear();
      setDone(r.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Đặt hàng thất bại.');
    } finally { setLoading(false); }
  }

  if (done) return (
    <div className="container" style={{ padding:'40px 16px', textAlign:'center' }}>
      <div style={S.success}>
        <span style={{ fontSize:'56px' }}>🎉</span>
        <h2 style={{ color:'#2E7D32', margin:'12px 0' }}>Đặt hàng thành công!</h2>
        <p style={{ color:'#757575', marginBottom:'8px' }}>Mã đơn hàng: <strong style={{ color:'#212121' }}>{done.id}</strong></p>
        <p>Tổng tiền: <strong style={{ color:'#D0021B', fontSize:'20px' }}>{Number(done.total).toLocaleString('vi-VN')}đ</strong></p>
        <div style={{ display:'flex', gap:'12px', justifyContent:'center', marginTop:'24px' }}>
          <button className="btn-primary" onClick={() => navigate('/')}>Tiếp tục mua sắm</button>
          <button className="btn-outline" onClick={() => navigate('/orders')}>Xem đơn hàng</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container" style={{ padding:'20px 16px' }}>
      <h2 style={{ marginBottom:'20px' }}>Thanh toán</h2>
      <div style={S.layout}>
        <form onSubmit={submit} style={S.form}>
          <h3 style={S.sectionHead}>📍 Địa chỉ giao hàng</h3>
          {error && <div style={S.err}>{error}</div>}
          {[
            ['fullName','Họ và tên','Nguyễn Văn A'],
            ['phone',   'Số điện thoại','0901234567'],
            ['address', 'Địa chỉ','123 Nguyễn Huệ'],
            ['city',    'Thành phố','TP. Hồ Chí Minh'],
          ].map(([k, label, ph]) => (
            <div key={k} style={S.field}>
              <label style={S.label}>{label} *</label>
              <input style={S.inp} value={form[k]} onChange={set(k)} placeholder={ph} required />
            </div>
          ))}
          <div style={S.payMethod}>
            <h3 style={S.sectionHead}>💳 Phương thức thanh toán</h3>
            <label style={S.payOpt}><input type="radio" defaultChecked /> Thanh toán khi nhận hàng (COD)</label>
          </div>
          <button type="submit" className="btn-primary" style={{ padding:'16px', fontSize:'16px' }} disabled={loading || !cart.length}>
            {loading ? 'Đang xử lý…' : `Đặt hàng — ${Number(total).toLocaleString('vi-VN')}đ`}
          </button>
        </form>

        <div style={S.summary}>
          <h3 style={S.sectionHead}>📦 Đơn hàng ({cart.length})</h3>
          {cart.map(i => (
            <div key={i.productId} style={S.item}>
              <span style={S.itemName}>{i.name}</span>
              <span style={S.itemQty}>×{i.qty}</span>
              <span style={{ color:'#D0021B', fontWeight:'700', minWidth:'90px', textAlign:'right' }}>
                {Number(i.price * i.qty).toLocaleString('vi-VN')}đ
              </span>
            </div>
          ))}
          <hr style={{ border:'none', borderTop:'1px solid #e0e0e0', margin:'12px 0' }} />
          <div style={{ display:'flex', justifyContent:'space-between', fontWeight:'800', fontSize:'16px' }}>
            <span>Tổng cộng</span>
            <span style={{ color:'#D0021B' }}>{Number(total).toLocaleString('vi-VN')}đ</span>
          </div>
          <div style={S.freeShip}>🚚 Miễn phí vận chuyển toàn quốc</div>
        </div>
      </div>
    </div>
  );
}

const S = {
  layout:     { display:'flex', gap:'20px', alignItems:'flex-start', flexWrap:'wrap' },
  form:       { flex:1, minWidth:'300px', background:'#fff', borderRadius:'8px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,.08)', display:'flex', flexDirection:'column', gap:'14px' },
  sectionHead:{ fontSize:'15px', fontWeight:'700', color:'#D0021B', paddingBottom:'10px', borderBottom:'1px solid #f0f0f0', marginBottom:'4px' },
  field:      { display:'flex', flexDirection:'column', gap:'6px' },
  label:      { fontSize:'13px', fontWeight:'600', color:'#424242' },
  inp:        { padding:'11px 14px', border:'1.5px solid #e0e0e0', borderRadius:'6px', fontSize:'14px' },
  payMethod:  { background:'#f9f9f9', borderRadius:'8px', padding:'14px' },
  payOpt:     { display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontSize:'14px' },
  err:        { background:'#ffebee', color:'#c62828', padding:'10px', borderRadius:'6px', fontSize:'13px' },
  summary:    { width:'300px', background:'#fff', borderRadius:'8px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,.08)', flexShrink:0 },
  item:       { display:'flex', gap:'8px', alignItems:'center', paddingBottom:'8px', borderBottom:'1px solid #f0f0f0', marginBottom:'8px', fontSize:'13px' },
  itemName:   { flex:1, color:'#212121' },
  itemQty:    { color:'#757575' },
  freeShip:   { background:'#e8f5e9', color:'#2E7D32', padding:'8px 12px', borderRadius:'6px', fontSize:'13px', marginTop:'12px', textAlign:'center' },
  success:    { background:'#fff', borderRadius:'12px', padding:'40px', boxShadow:'0 4px 20px rgba(0,0,0,.1)', maxWidth:'480px', margin:'0 auto' },
};
