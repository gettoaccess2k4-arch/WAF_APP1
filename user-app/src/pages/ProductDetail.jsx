import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductDetail() {
  const { slug }       = useParams();
  const navigate        = useNavigate();
  const [p, setP]       = useState(null);
  const [qty, setQty]   = useState(1);
  const { add }         = useCart();
  const { user }        = useAuth();

  useEffect(() => {
    api.get(`/products/slug/${slug}`)
      .then(r => setP(r.data))
      .catch(() => navigate('/'));
  }, [slug]);

  if (!p) return <div style={{ padding:'60px', textAlign:'center', color:'#757575' }}>Đang tải…</div>;

  const discount = p.original_price ? Math.round((1 - p.price / p.original_price) * 100) : 0;
  const specs    = typeof p.specs === 'string' ? JSON.parse(p.specs) : (p.specs || {});

  return (
    <div className="container" style={{ padding:'20px 16px' }}>
      <nav style={S.breadcrumb}>
        <a href="/">Trang chủ</a> &rsaquo; <a href={`/?category=${p.category_slug}`}>{p.category_name}</a> &rsaquo; {p.name}
      </nav>

      <div style={S.layout}>
        {/* Image */}
        <div style={S.imgBox}>
          {p.image_url
            ? <img src={p.image_url} alt={p.name} style={S.img} />
            : <span style={{ fontSize:'100px' }}>📦</span>}
          {discount > 0 && <span style={S.discBadge}>Giảm {discount}%</span>}
        </div>

        {/* Info */}
        <div style={S.info}>
          <p style={S.brand}>{p.brand_name}</p>
          <h1 style={S.name}>{p.name}</h1>

          <div style={S.priceBlock}>
            <span style={S.priceCur}>{Number(p.price).toLocaleString('vi-VN')}đ</span>
            {p.original_price && (
              <span className="price-original">{Number(p.original_price).toLocaleString('vi-VN')}đ</span>
            )}
          </div>

          {/* Key specs */}
          {Object.keys(specs).length > 0 && (
            <div style={S.specList}>
              {Object.entries(specs).map(([k, v]) => (
                <div key={k} style={S.specRow}>
                  <span style={S.specKey}>{k}</span>
                  <span style={S.specVal}>{v}</span>
                </div>
              ))}
            </div>
          )}

          {/* Stock */}
          <p style={{ fontSize:'13px', color: p.stock > 0 ? '#2E7D32' : '#D0021B', marginBottom:'16px' }}>
            {p.stock > 0 ? `✓ Còn hàng (${p.stock} sản phẩm)` : '✗ Hết hàng'}
          </p>

          {user ? (
            <div style={S.buyRow}>
              <div style={S.qtyCtrl}>
                <button style={S.qBtn} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span style={S.qNum}>{qty}</span>
                <button style={S.qBtn} onClick={() => setQty(q => Math.min(p.stock, q + 1))}>+</button>
              </div>
              <button
                className="btn-primary"
                style={{ flex:1, padding:'14px', fontSize:'16px' }}
                disabled={p.stock === 0}
                onClick={() => { for (let i = 0; i < qty; i++) add({ productId: p.id, name: p.name, price: +p.price, image_url: p.image_url }); navigate('/cart'); }}
              >
                🛒 Thêm vào giỏ hàng
              </button>
            </div>
          ) : (
            <div style={{ background:'#fff3e0', borderRadius:'6px', padding:'14px', textAlign:'center' }}>
              <a href="/login" style={{ color:'#D0021B', fontWeight:'600' }}>Đăng nhập</a> để mua hàng
            </div>
          )}

          {/* Description */}
          {p.description && (
            <div style={S.desc}>
              <h3 style={S.descTitle}>Mô tả sản phẩm</h3>
              <p style={{ lineHeight:'1.7', color:'#424242' }}>{p.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const S = {
  breadcrumb: { fontSize:'13px', color:'#757575', marginBottom:'16px' },
  layout:     { display:'flex', gap:'24px', flexWrap:'wrap' },
  imgBox:     { width:'340px', flexShrink:0, background:'#fff', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', minHeight:'320px', position:'relative', boxShadow:'0 1px 4px rgba(0,0,0,.08)' },
  img:        { maxWidth:'100%', maxHeight:'320px', objectFit:'contain', padding:'16px' },
  discBadge:  { position:'absolute', top:'12px', right:'12px', background:'#D0021B', color:'#fff', fontWeight:'700', fontSize:'13px', padding:'4px 10px', borderRadius:'20px' },
  info:       { flex:1, minWidth:'280px' },
  brand:      { fontSize:'12px', color:'#757575', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'4px' },
  name:       { fontSize:'22px', fontWeight:'700', marginBottom:'12px', lineHeight:'1.4' },
  priceBlock: { display:'flex', alignItems:'baseline', gap:'10px', marginBottom:'16px', flexWrap:'wrap' },
  priceCur:   { fontSize:'28px', fontWeight:'800', color:'#D0021B' },
  specList:   { background:'#f9f9f9', borderRadius:'6px', overflow:'hidden', marginBottom:'16px', border:'1px solid #e0e0e0' },
  specRow:    { display:'flex', borderBottom:'1px solid #e0e0e0', fontSize:'13px' },
  specKey:    { width:'120px', flexShrink:0, padding:'8px 12px', background:'#f0f0f0', fontWeight:'600', color:'#424242' },
  specVal:    { padding:'8px 12px', color:'#212121' },
  buyRow:     { display:'flex', gap:'12px', alignItems:'center', marginBottom:'20px' },
  qtyCtrl:    { display:'flex', alignItems:'center', border:'1px solid #e0e0e0', borderRadius:'6px', overflow:'hidden' },
  qBtn:       { width:'36px', height:'46px', border:'none', background:'#f5f5f5', fontSize:'18px', fontWeight:'bold' },
  qNum:       { width:'40px', textAlign:'center', fontWeight:'700', fontSize:'16px' },
  desc:       { marginTop:'20px', padding:'16px', background:'#fff', borderRadius:'8px', boxShadow:'0 1px 4px rgba(0,0,0,.06)' },
  descTitle:  { fontSize:'15px', fontWeight:'700', color:'#D0021B', marginBottom:'10px', paddingBottom:'8px', borderBottom:'1px solid #e0e0e0' },
};
