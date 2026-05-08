import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { cart, total, fetchCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName:'', address:'', city:'', phone:'' });
  const [done, setDone] = useState(null);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const r = await axios.post('/api/orders/checkout', {
        items: cart.map(i => ({ productId: i.productId, qty: i.qty })),
        shippingAddress: form,
      });
      setDone(r.data);
      await fetchCart();
    } catch (err) {
      setError(err.response?.data?.error || 'Checkout failed.');
    }
  }

  if (done) return (
    <main style={S.main}>
      <div style={S.success}>
        <h2>Order Placed!</h2>
        <p>Order ID: <strong>{done.id}</strong></p>
        <p>Total: <strong>${done.total.toFixed(2)}</strong></p>
        <p>Status: <strong>{done.status}</strong></p>
        <button style={S.btn} onClick={() => navigate('/')}>Continue Shopping</button>
      </div>
    </main>
  );

  return (
    <main style={S.main}>
      <h2 style={S.h2}>Checkout</h2>
      <div style={S.layout}>
        <form onSubmit={handleSubmit} style={S.form}>
          <h3>Shipping Address</h3>
          {error && <p style={S.err}>{error}</p>}
          {['fullName','address','city','phone'].map(field => (
            <input key={field} style={S.inp} placeholder={field} value={form[field]}
              onChange={e => setForm({ ...form, [field]: e.target.value })} required />
          ))}
          <button type="submit" style={S.btn}>Place Order — ${total.toFixed(2)}</button>
        </form>
        <div style={S.summary}>
          <h3>Order Summary</h3>
          {cart.map(i => (
            <div key={i.productId} style={S.summaryRow}>
              <span>{i.name} × {i.qty}</span>
              <span>${(i.price * i.qty).toFixed(2)}</span>
            </div>
          ))}
          <hr style={{ margin:'12px 0' }} />
          <div style={S.summaryRow}><strong>Total</strong><strong>${total.toFixed(2)}</strong></div>
        </div>
      </div>
    </main>
  );
}

const S = {
  main:       { maxWidth:'900px', margin:'0 auto', padding:'24px 16px' },
  h2:         { marginBottom:'20px' },
  layout:     { display:'flex', gap:'24px' },
  form:       { flex:1, display:'flex', flexDirection:'column', gap:'12px', background:'#fff', padding:'24px', borderRadius:'8px', boxShadow:'0 1px 4px rgba(0,0,0,.08)' },
  inp:        { padding:'10px', border:'1px solid #d1d5db', borderRadius:'6px', fontSize:'1rem' },
  btn:        { padding:'12px', background:'#2563eb', color:'#fff', border:'none', borderRadius:'6px', fontSize:'1rem' },
  err:        { color:'#ef4444' },
  summary:    { width:'280px', background:'#fff', padding:'20px', borderRadius:'8px', boxShadow:'0 1px 4px rgba(0,0,0,.08)', height:'fit-content' },
  summaryRow: { display:'flex', justifyContent:'space-between', marginBottom:'8px' },
  success:    { background:'#fff', padding:'2rem', borderRadius:'8px', textAlign:'center', display:'flex', flexDirection:'column', gap:'12px', maxWidth:'400px', margin:'4rem auto', boxShadow:'0 1px 4px rgba(0,0,0,.08)' },
};
