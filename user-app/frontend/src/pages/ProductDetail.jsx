import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductDetail() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [product, setProduct] = useState(null);
  const { addToCart } = useCart();
  const { user }      = useAuth();

  useEffect(() => {
    axios.get(`/api/products/${id}`).then(r => setProduct(r.data)).catch(() => navigate('/'));
  }, [id]);

  if (!product) return <p style={{ padding: '2rem' }}>Loading…</p>;

  return (
    <main style={S.main}>
      <button onClick={() => navigate(-1)} style={S.back}>← Back</button>
      <div style={S.card}>
        <div style={S.imgBox}>📦</div>
        <div style={S.info}>
          <h1 style={S.name}>{product.name}</h1>
          <p style={S.cat}>{product.category}</p>
          <p style={S.desc}>{product.description}</p>
          <p style={S.price}>${product.price.toFixed(2)}</p>
          <p style={{ color: '#6b7280' }}>In stock: {product.stock}</p>
          {user ? (
            <button style={S.btn} onClick={() => addToCart(product.id)}>Add to Cart</button>
          ) : (
            <p style={{ color:'#6b7280', marginTop:'12px' }}>Please <a href="/login">login</a> to purchase.</p>
          )}
        </div>
      </div>
    </main>
  );
}

const S = {
  main:  { maxWidth:'900px', margin:'0 auto', padding:'24px 16px' },
  back:  { background:'none', border:'1px solid #d1d5db', borderRadius:'6px', padding:'6px 14px', marginBottom:'20px' },
  card:  { display:'flex', gap:'24px', background:'#fff', borderRadius:'8px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,.08)' },
  imgBox:{ width:'280px', height:'280px', background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'8px', fontSize:'5rem', flexShrink:0 },
  info:  { display:'flex', flexDirection:'column', gap:'10px' },
  name:  { fontSize:'1.5rem', fontWeight:'700' },
  cat:   { color:'#6b7280', fontSize:'0.9rem' },
  desc:  { color:'#374151', lineHeight:'1.6' },
  price: { fontSize:'1.8rem', fontWeight:'700', color:'#2563eb' },
  btn:   { padding:'12px 24px', background:'#16a34a', color:'#fff', border:'none', borderRadius:'6px', fontSize:'1rem', width:'fit-content', marginTop:'8px' },
};
