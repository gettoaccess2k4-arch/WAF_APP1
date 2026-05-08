import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function CategoryBar() {
  const [cats, setCats]   = useState([]);
  const [params]          = useSearchParams();
  const navigate          = useNavigate();
  const active            = params.get('category') || '';

  useEffect(() => {
    api.get('/categories').then(r => setCats(r.data)).catch(() => {});
  }, []);

  return (
    <div style={S.bar}>
      <div style={S.scroll}>
        <button
          style={{ ...S.btn, ...(active === '' ? S.active : {}) }}
          onClick={() => navigate('/')}
        >
          🏠 Tất cả
        </button>
        {cats.map(c => (
          <button
            key={c.id}
            style={{ ...S.btn, ...(active === c.slug ? S.active : {}) }}
            onClick={() => navigate(`/?category=${c.slug}`)}
          >
            {c.icon} {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}

const S = {
  bar:    { background:'#fff', borderBottom:'2px solid #D0021B', marginBottom:'16px', boxShadow:'0 1px 4px rgba(0,0,0,.06)' },
  scroll: { display:'flex', gap:'4px', overflowX:'auto', padding:'8px 16px', maxWidth:'1200px', margin:'0 auto', scrollbarWidth:'none' },
  btn:    { flexShrink:0, padding:'8px 16px', border:'none', borderRadius:'20px', background:'#f5f5f5', color:'#424242', fontSize:'13px', fontWeight:'500', cursor:'pointer', transition:'.15s', whiteSpace:'nowrap' },
  active: { background:'#D0021B', color:'#fff' },
};
