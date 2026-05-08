import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import api from '../services/api';

const STATUS_COLOR = { pending:'#f9ab00', processing:'#1a73e8', shipped:'#9c27b0', delivered:'#1e8e3e', cancelled:'#d93025' };

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={S.statCard}>
      <div style={{ ...S.statIcon, background: color + '20', color }}>{icon}</div>
      <div>
        <div style={S.statVal}>{value}</div>
        <div style={S.statLabel}>{label}</div>
        {sub && <div style={S.statSub}>{sub}</div>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/orders/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const dailyData = (stats?.daily || []).map(d => ({
    day:     new Date(d.day).toLocaleDateString('vi-VN', { month:'short', day:'numeric' }),
    revenue: Math.round(d.revenue / 1e6),
    orders:  +d.orders,
  }));

  const pieData = (stats?.byStatus || []).map(d => ({
    name:  d.status,
    value: +d.count,
    color: STATUS_COLOR[d.status] || '#999',
  }));

  return (
    <div style={S.page}>
      <h2 style={S.title}>📊 Dashboard</h2>

      {/* Stats row */}
      <div style={S.statsRow}>
        <StatCard icon="💰" label="Tổng doanh thu" color="#1e8e3e"
          value={stats ? `${(+stats.totalRevenue / 1e6).toFixed(1)}M đ` : '…'}
          sub="Tất cả đơn hàng" />
        <StatCard icon="📋" label="Tổng đơn hàng" color="#1a73e8"
          value={stats?.totalOrders || '…'} sub="Không tính đã hủy" />
        <StatCard icon="⏳" label="Chờ xử lý" color="#f9ab00"
          value={stats?.byStatus?.find(s=>s.status==='pending')?.count || 0}
          sub="Cần duyệt ngay" />
        <StatCard icon="✅" label="Đã giao" color="#1e8e3e"
          value={stats?.byStatus?.find(s=>s.status==='delivered')?.count || 0}
          sub="30 ngày qua" />
      </div>

      <div style={S.chartsRow}>
        {/* Revenue Line Chart */}
        <div style={S.chartCard}>
          <h3 style={S.chartTitle}>📈 Doanh thu 30 ngày (triệu đồng)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" />
              <XAxis dataKey="day" tick={{ fontSize:11 }} />
              <YAxis tick={{ fontSize:11 }} />
              <Tooltip formatter={v => [`${v}M đ`, 'Doanh thu']} />
              <Line type="monotone" dataKey="revenue" stroke="#D0021B" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Pie Chart */}
        <div style={S.chartCard}>
          <h3 style={S.chartTitle}>🥧 Trạng thái đơn hàng</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false} style={{ fontSize:'11px' }}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
              <Legend iconSize={10} wrapperStyle={{ fontSize:'12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* WAF test point reminder */}
      <div style={S.wafBox}>
        <h3 style={{ color:'#d93025', marginBottom:'12px' }}>⚠ WAF Test Points</h3>
        <div style={S.wafGrid}>
          {[
            ['XSS',    'GET /api/products/search?q=',      '<script>alert(1)</script>',                  '#f9ab00'],
            ['SQLi',   'GET /api/products/vuln?id=',       "1 UNION SELECT username,password_hash FROM users--", '#d93025'],
            ['Shell',  'POST /api/upload/image',            'Upload shell.php (no validation)',            '#9c27b0'],
          ].map(([type, endpoint, payload, color]) => (
            <div key={type} style={{ ...S.wafCard, borderLeftColor: color }}>
              <span style={{ ...S.wafBadge, background: color }}>{type}</span>
              <code style={S.wafEndpoint}>{endpoint}</code>
              <p style={S.wafPayload}>{payload}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const S = {
  page:       { padding:'24px', maxWidth:'1100px' },
  title:      { fontSize:'22px', fontWeight:'700', marginBottom:'20px' },
  statsRow:   { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'16px', marginBottom:'24px' },
  statCard:   { background:'#fff', borderRadius:'8px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,.07)', display:'flex', gap:'16px', alignItems:'center' },
  statIcon:   { width:'48px', height:'48px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', flexShrink:0 },
  statVal:    { fontSize:'24px', fontWeight:'800', color:'#202124' },
  statLabel:  { fontSize:'13px', color:'#5f6368', marginTop:'2px' },
  statSub:    { fontSize:'11px', color:'#9aa0a6', marginTop:'2px' },
  chartsRow:  { display:'grid', gridTemplateColumns:'2fr 1fr', gap:'16px', marginBottom:'24px' },
  chartCard:  { background:'#fff', borderRadius:'8px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,.07)' },
  chartTitle: { fontSize:'14px', fontWeight:'600', color:'#5f6368', marginBottom:'16px' },
  wafBox:     { background:'#fff', borderRadius:'8px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,.07)' },
  wafGrid:    { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'12px' },
  wafCard:    { background:'#fafafa', borderLeft:'4px solid', borderRadius:'4px', padding:'12px 14px' },
  wafBadge:   { display:'inline-block', color:'#fff', fontSize:'11px', fontWeight:'700', padding:'2px 8px', borderRadius:'20px', marginBottom:'6px' },
  wafEndpoint:{ display:'block', fontSize:'12px', color:'#202124', marginBottom:'4px', wordBreak:'break-all' },
  wafPayload: { fontSize:'12px', color:'#5f6368', wordBreak:'break-all' },
};
