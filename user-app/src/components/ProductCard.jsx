import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ product: p }) {
  const { add }  = useCart();
  const { user } = useAuth();

  const discount = p.original_price
    ? Math.round((1 - p.price / p.original_price) * 100)
    : 0;

  return (
    <div style={S.card}>
      {discount > 0 && <span style={S.discBadge}>-{discount}%</span>}
      <Link to={`/products/${p.slug}`}>
        <div style={S.imgWrap}>
          {p.image_url
            ? <img src={p.image_url} alt={p.name} style={S.img} />
            : <span style={S.imgPlaceholder}>📦</span>}
        </div>
        <div style={S.body}>
          <p style={S.brand}>{p.brand_name}</p>
          <h3 style={S.name}>{p.name}</h3>
          <div style={S.priceRow}>
            <span className="price-current">{Number(p.price).toLocaleString('vi-VN')}đ</span>
            {p.original_price && (
              <span className="price-original">{Number(p.original_price).toLocaleString('vi-VN')}đ</span>
            )}
          </div>
          {p.stock <= 5 && p.stock > 0 && (
            <p style={S.lowStock}>Chỉ còn {p.stock} sản phẩm</p>
          )}
        </div>
      </Link>
      {user && (
        <button
          className="btn-primary"
          style={{ width:'100%', borderRadius:'0 0 6px 6px', borderTopLeftRadius:0, borderTopRightRadius:0 }}
          onClick={() => add({ productId: p.id, name: p.name, price: +p.price, image_url: p.image_url })}
        >
          🛒 Thêm vào giỏ
        </button>
      )}
    </div>
  );
}

const S = {
  card:        { background:'#fff', borderRadius:'6px', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,.08)', position:'relative', transition:'.15s', display:'flex', flexDirection:'column' },
  discBadge:   { position:'absolute', top:'8px', left:'8px', background:'#D0021B', color:'#fff', fontSize:'11px', fontWeight:'700', padding:'2px 6px', borderRadius:'4px', zIndex:1 },
  imgWrap:     { height:'180px', display:'flex', alignItems:'center', justifyContent:'center', background:'#f9f9f9', overflow:'hidden' },
  img:         { width:'100%', height:'100%', objectFit:'contain', padding:'8px' },
  imgPlaceholder:{ fontSize:'60px' },
  body:        { padding:'10px 12px', flex:1 },
  brand:       { fontSize:'11px', color:'#757575', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'4px' },
  name:        { fontSize:'13px', fontWeight:'600', color:'#212121', lineHeight:'1.4', marginBottom:'8px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' },
  priceRow:    { display:'flex', alignItems:'baseline', flexWrap:'wrap', gap:'4px' },
  lowStock:    { color:'#D0021B', fontSize:'11px', marginTop:'4px' },
};
