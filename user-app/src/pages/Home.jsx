import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Banner      from '../components/Banner';
import CategoryBar from '../components/CategoryBar';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts]     = useState([]);
  const [loading,  setLoading]      = useState(true);
  const [reflected, setReflected]   = useState(null); // XSS test surface
  const [searchParams]              = useSearchParams();

  const q        = searchParams.get('q')        || '';
  const category = searchParams.get('category') || '';
  const brand    = searchParams.get('brand')    || '';

  useEffect(() => {
    setLoading(true);
    setReflected(null);

    const fetch = q
      ? api.get(`/products/search?q=${encodeURIComponent(q)}`)
      : api.get('/products', { params: { category, brand, featured: (!category && !brand) || undefined } });

    fetch
      .then(r => {
        if (q) {
          setProducts(r.data.results);
          // ⚠️  WAF TEST POINT — reflected XSS:
          // r.data.query is the raw unsanitised server echo.
          // Rendered via dangerouslySetInnerHTML below.
          setReflected(r.data.query);
        } else {
          setProducts(r.data);
        }
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [q, category, brand]);

  return (
    <div>
      {!q && !category && !brand && <Banner />}
      <CategoryBar />

      <div className="container">
        {/* ── XSS reflection surface ── */}
        {reflected !== null && (
          <div style={S.searchInfo}>
            Kết quả tìm kiếm cho:{' '}
            {/* dangerouslySetInnerHTML intentional — WAF XSS test */}
            <strong dangerouslySetInnerHTML={{ __html: reflected }} />
            <span style={{ color:'#757575', marginLeft:'8px' }}>({products.length} sản phẩm)</span>
          </div>
        )}

        {/* ── Section heading ── */}
        {!q && !category && !brand && (
          <div style={S.sectionHead}>
            <span style={S.sectionLine} />
            <h2 style={S.sectionTitle}>⚡ SẢN PHẨM NỔI BẬT</h2>
            <span style={S.sectionLine} />
          </div>
        )}

        {loading && <p style={S.loading}>Đang tải sản phẩm…</p>}

        {!loading && products.length === 0 && (
          <div style={S.empty}>
            <span style={{ fontSize:'48px' }}>🔍</span>
            <p>Không tìm thấy sản phẩm phù hợp.</p>
          </div>
        )}

        <div style={S.grid}>
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  );
}

const S = {
  searchInfo:   { background:'#fff8e1', border:'1px solid #FFB700', borderRadius:'6px', padding:'12px 16px', marginBottom:'16px', fontSize:'14px' },
  sectionHead:  { display:'flex', alignItems:'center', gap:'12px', margin:'20px 0 16px' },
  sectionLine:  { flex:1, height:'2px', background:'linear-gradient(90deg,#D0021B,transparent)' },
  sectionTitle: { color:'#D0021B', fontSize:'18px', fontWeight:'800', whiteSpace:'nowrap' },
  loading:      { textAlign:'center', padding:'40px', color:'#757575' },
  empty:        { textAlign:'center', padding:'60px 20px', color:'#757575', display:'flex', flexDirection:'column', alignItems:'center', gap:'12px' },
  grid:         { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'12px', paddingBottom:'40px' },
};
