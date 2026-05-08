import { useState, useEffect } from 'react';

const SLIDES = [
  { bg: 'linear-gradient(135deg,#D0021B 0%,#ff6b35 100%)', emoji:'📱', title:'iPhone 15 Pro Max', sub:'Chip A17 Pro · Khung Titanium · Camera 48MP', badge:'Trả góp 0%' },
  { bg: 'linear-gradient(135deg,#1565C0 0%,#42a5f5 100%)', emoji:'💻', title:'MacBook Air M3',    sub:'Pin 18 giờ · Mỏng nhẹ · Hiệu năng vượt trội', badge:'Tặng túi 500k' },
  { bg: 'linear-gradient(135deg,#2E7D32 0%,#66bb6a 100%)', emoji:'⌚', title:'Galaxy S24 Ultra',  sub:'Camera 200MP · S Pen · Snapdragon 8 Gen 3',   badge:'Giảm 2 triệu' },
];

export default function Banner() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const s = SLIDES[idx];
  return (
    <div style={{ ...S.wrap, background: s.bg }}>
      <div className="container" style={S.inner}>
        <div>
          <span style={S.badge}>{s.badge}</span>
          <h2 style={S.title}>{s.title}</h2>
          <p  style={S.sub}>{s.sub}</p>
          <button style={S.cta}>Mua ngay →</button>
        </div>
        <span style={S.emoji}>{s.emoji}</span>
      </div>
      <div style={S.dots}>
        {SLIDES.map((_,i) => (
          <span key={i} onClick={() => setIdx(i)}
            style={{ ...S.dot, background: i === idx ? '#fff' : 'rgba(255,255,255,.4)' }} />
        ))}
      </div>
    </div>
  );
}

const S = {
  wrap:  { borderRadius:'12px', overflow:'hidden', margin:'16px 0', position:'relative', cursor:'pointer' },
  inner: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'32px 24px', minHeight:'180px' },
  badge: { display:'inline-block', background:'#FFB700', color:'#222', fontWeight:'700', fontSize:'12px', padding:'4px 10px', borderRadius:'20px', marginBottom:'12px' },
  title: { fontSize:'28px', fontWeight:'800', color:'#fff', marginBottom:'8px' },
  sub:   { color:'rgba(255,255,255,.85)', marginBottom:'20px', fontSize:'15px' },
  cta:   { background:'#fff', color:'#D0021B', fontWeight:'700', border:'none', borderRadius:'8px', padding:'10px 24px', fontSize:'15px' },
  emoji: { fontSize:'90px', lineHeight:1 },
  dots:  { display:'flex', justifyContent:'center', gap:'6px', paddingBottom:'12px' },
  dot:   { width:'8px', height:'8px', borderRadius:'50%', cursor:'pointer', transition:'.2s' },
};
