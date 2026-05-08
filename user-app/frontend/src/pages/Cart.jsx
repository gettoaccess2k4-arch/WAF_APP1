import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cart, total, fetchCart, updateQty, removeFromCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => { fetchCart(); }, []);

  if (cart.length === 0) return (
    <main style={S.main}><p>Your cart is empty. <a href="/">Continue shopping.</a></p></main>
  );

  return (
    <main style={S.main}>
      <h2 style={S.h2}>Shopping Cart</h2>
      {cart.map(item => (
        <div key={item.productId} style={S.row}>
          <span style={S.name}>{item.name}</span>
          <span style={S.price}>${item.price.toFixed(2)}</span>
          <div style={S.qtyCtrl}>
            <button style={S.qBtn} onClick={() => updateQty(item.productId, item.qty - 1)}>-</button>
            <span style={S.qty}>{item.qty}</span>
            <button style={S.qBtn} onClick={() => updateQty(item.productId, item.qty + 1)}>+</button>
          </div>
          <span style={S.sub}>${(item.price * item.qty).toFixed(2)}</span>
          <button style={S.del} onClick={() => removeFromCart(item.productId)}>Remove</button>
        </div>
      ))}
      <div style={S.footer}>
        <strong style={S.total}>Total: ${total.toFixed(2)}</strong>
        <button style={S.checkout} onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
      </div>
    </main>
  );
}

const S = {
  main:     { maxWidth:'800px', margin:'0 auto', padding:'24px 16px' },
  h2:       { marginBottom:'20px' },
  row:      { display:'flex', alignItems:'center', gap:'16px', background:'#fff', padding:'14px 20px', borderRadius:'8px', marginBottom:'10px', boxShadow:'0 1px 3px rgba(0,0,0,.06)' },
  name:     { flex:1, fontWeight:'500' },
  price:    { color:'#6b7280', width:'80px' },
  qtyCtrl:  { display:'flex', alignItems:'center', gap:'8px' },
  qBtn:     { width:'28px', height:'28px', border:'1px solid #d1d5db', borderRadius:'4px', background:'#f9fafb' },
  qty:      { width:'24px', textAlign:'center' },
  sub:      { width:'80px', fontWeight:'600' },
  del:      { color:'#ef4444', background:'none', border:'none', fontSize:'0.85rem' },
  footer:   { display:'flex', justifyContent:'flex-end', alignItems:'center', gap:'24px', marginTop:'20px' },
  total:    { fontSize:'1.3rem' },
  checkout: { padding:'12px 28px', background:'#2563eb', color:'#fff', border:'none', borderRadius:'6px', fontSize:'1rem' },
};
