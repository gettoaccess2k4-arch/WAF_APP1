import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const [products, setProducts]   = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery]         = useState(searchParams.get('q') || '');
  const [reflected, setReflected] = useState('');
  const { addToCart }             = useCart();
  const { user }                  = useAuth();

  useEffect(() => {
    const q = searchParams.get('q') || '';
    if (q) {
      axios.get(`/api/products/search?q=${encodeURIComponent(q)}`)
        .then(r => {
          setProducts(r.data.results);
          // ⚠️  WAF TEST POINT: r.data.query is the unsanitised reflected value from server.
          // Rendered via dangerouslySetInnerHTML to simulate stored/reflected XSS for WAF testing.
          setReflected(r.data.query);
        });
    } else {
      axios.get('/api/products').then(r => setProducts(r.data));
      setReflected('');
    }
  }, [searchParams]);

  function handleSearch(e) {
    e.preventDefault();
    setSearchParams(query ? { q: query } : {});
  }

  return (
    <main style={S.main}>
      <form onSubmit={handleSearch} style={S.searchBar}>
        <input style={S.inp} value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search products… (WAF XSS test point)" />
        <button type="submit" style={S.btn}>Search</button>
      </form>

      {/* ⚠️  Reflected XSS surface — intentional for WAF lab */}
      {reflected && (
        <p style={S.reflected}>
          Results for: <span dangerouslySetInnerHTML={{ __html: reflected }} />
        </p>
      )}

      <div style={S.grid}>
        {products.map(p => (
          <div key={p.id} style={S.card}>
            <div style={S.imgBox}>{p.image ? <img src={p.image} alt={p.name} style={S.img} /> : <div style={S.placeholder}>📦</div>}</div>
            <div style={S.body}>
              <Link to={`/products/${p.id}`} style={S.name}>{p.name}</Link>
              <p style={S.cat}>{p.category}</p>
              <p style={S.price}>${p.price.toFixed(2)}</p>
              <p style={S.stock}>Stock: {p.stock}</p>
              {user && (
                <button style={S.atcBtn} onClick={() => addToCart(p.id)}>Add to Cart</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

const S = {
  main:      { maxWidth:'1100px', margin:'0 auto', padding:'24px 16px' },
  searchBar: { display:'flex', gap:'8px', marginBottom:'20px' },
  inp:       { flex:1, padding:'10px', border:'1px solid #d1d5db', borderRadius:'6px', fontSize:'1rem' },
  btn:       { padding:'10px 20px', background:'#2563eb', color:'#fff', border:'none', borderRadius:'6px' },
  reflected: { marginBottom:'12px', color:'#374151', fontSize:'0.95rem' },
  grid:      { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'20px' },
  card:      { background:'#fff', borderRadius:'8px', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,.08)' },
  imgBox:    { height:'160px', background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center' },
  img:       { width:'100%', height:'100%', objectFit:'cover' },
  placeholder:{ fontSize:'3rem' },
  body:      { padding:'12px', display:'flex', flexDirection:'column', gap:'6px' },
  name:      { fontWeight:'600', color:'#111' },
  cat:       { fontSize:'0.8rem', color:'#6b7280' },
  price:     { fontSize:'1.1rem', fontWeight:'700', color:'#2563eb' },
  stock:     { fontSize:'0.8rem', color:'#6b7280' },
  atcBtn:    { marginTop:'8px', padding:'8px', background:'#16a34a', color:'#fff', border:'none', borderRadius:'6px' },
};
