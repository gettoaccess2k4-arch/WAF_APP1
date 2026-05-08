import { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts';
import api from '../services/api';

const STATUS_META = {
  pending:    { label:'Chờ xác nhận', color:'#f59e0b', bg:'#fffbeb' },
  processing: { label:'Đang xử lý',   color:'#3b82f6', bg:'#eff6ff' },
  shipped:    { label:'Đang giao',     color:'#8b5cf6', bg:'#f5f3ff' },
  delivered:  { label:'Đã giao',       color:'#10b981', bg:'#ecfdf5' },
  cancelled:  { label:'Đã hủy',        color:'#ef4444', bg:'#fef2f2' },
};
const PIE_COLORS = {
  'Chờ xác nhận':'#f59e0b','Đang xử lý':'#3b82f6','Đang giao':'#8b5cf6','Đã giao':'#10b981','Đã hủy':'#ef4444',
};

function StatusPill({ status }) {
  const m = STATUS_META[status] || { label:status, color:'#999', bg:'#f5f5f5' };
  return (
    <span style={{ background:m.bg, color:m.color, fontWeight:'700', fontSize:'11px',
      padding:'3px 10px', borderRadius:'99px', whiteSpace:'nowrap' }}>
      {m.label}
    </span>
  );
}

function KpiCard({ icon, label, value, sub, color, trend, trendUp }) {
  return (
    <div style={{ background:'#fff', borderRadius:'12px', padding:'20px',
      boxShadow:'0 1px 4px rgba(15,23,42,.07)', borderTop:`3px solid ${color}`,
      display:'flex', flexDirection:'column', gap:'6px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{ width:'42px', height:'42px', borderRadius:'10px',
          background:color+'18', color, display:'flex', alignItems:'center',
          justifyContent:'center', fontSize:'20px' }}>
          {icon}
        </div>
        {trend && (
          <span style={{ fontSize:'12px', fontWeight:'700',
            color: trendUp ? '#10b981' : '#ef4444',
            background: trendUp ? '#ecfdf5' : '#fef2f2',
            padding:'2px 8px', borderRadius:'99px' }}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <div style={{ fontSize:'28px', fontWeight:'800', color:'#0f172a', lineHeight:1.1, marginTop:'4px' }}>{value}</div>
      <div style={{ fontSize:'13px', fontWeight:'600', color:'#475569' }}>{label}</div>
      {sub && <div style={{ fontSize:'11px', color:'#94a3b8' }}>{sub}</div>}
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:'10px',
      padding:'10px 14px', boxShadow:'0 4px 20px rgba(15,23,42,.1)', fontSize:'13px' }}>
      <p style={{ fontWeight:'700', marginBottom:'6px', color:'#475569' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color:p.color, fontWeight:'600' }}>
          {p.name}: {p.name === 'Doanh thu' ? `${Number(p.value).toLocaleString()}M đ` : p.value}
        </p>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [stats,   setStats]   = useState(null);
  const [recent,  setRecent]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/orders/stats'),
      api.get('/orders'),
    ]).then(([s, o]) => {
      setStats(s.data);
      setRecent(o.data.slice(0, 8));
    }).finally(() => setLoading(false));
  }, []);

  const chartData = (stats?.daily || []).slice(-14).map(d => ({
    day:         new Date(d.day).toLocaleDateString('vi-VN', { month:'short', day:'numeric' }),
    'Doanh thu': +(+d.revenue / 1e6).toFixed(1),
    'Đơn hàng':  +d.orders,
  }));

  const pieData = (stats?.byStatus || []).map(d => ({
    name:  STATUS_META[d.status]?.label || d.status,
    value: +d.count,
  }));

  const totalRevM   = stats ? (+stats.totalRevenue / 1e6).toFixed(1) : '—';
  const pendingN    = stats?.byStatus?.find(s => s.status === 'pending')?.count    ?? 0;
  const deliveredN  = stats?.byStatus?.find(s => s.status === 'delivered')?.count  ?? 0;

  if (loading) return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px' }}>
      {[...Array(4)].map((_,i) => (
        <div key={i} className="skeleton" style={{ height:'120px', borderRadius:'12px' }} />
      ))}
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

      {/* KPI */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))', gap:'16px' }}>
        <KpiCard icon="💰" label="Tổng doanh thu"       value={`${totalRevM}M đ`}         sub="Tất cả đơn chưa hủy"   color="#10b981" trend="+12%" trendUp />
        <KpiCard icon="🧾" label="Tổng đơn hàng"        value={stats?.totalOrders ?? '—'}  sub="Không tính đơn hủy"    color="#3b82f6" trend="+8%"  trendUp />
        <KpiCard icon="⏳" label="Chờ xử lý"            value={pendingN}                   sub="Cần duyệt ngay"        color="#f59e0b" trend={pendingN > 0 ? `${pendingN} đơn mới` : null} trendUp={false} />
        <KpiCard icon="✅" label="Đã giao thành công"   value={deliveredN}                 sub="Cộng dồn"              color="#8b5cf6" />
      </div>

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'16px' }}>
        <div style={C.card}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'16px' }}>
            <div>
              <h3 style={C.title}>📈 Doanh thu & Đơn hàng (14 ngày)</h3>
              <p style={C.sub}>Đơn vị: Triệu đồng VND</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={chartData} margin={{ top:4, right:4, left:0, bottom:0 }}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#e8192c" stopOpacity={0.18}/>
                  <stop offset="95%" stopColor="#e8192c" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gOrd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false}/>
              <XAxis dataKey="day" tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false}/>
              <Tooltip content={<ChartTooltip />}/>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:'12px', paddingTop:'8px' }}/>
              <Area type="monotone" dataKey="Doanh thu" stroke="#e8192c" strokeWidth={2.5} fill="url(#gRev)" dot={false} activeDot={{ r:5 }}/>
              <Area type="monotone" dataKey="Đơn hàng"  stroke="#3b82f6" strokeWidth={2}   fill="url(#gOrd)" dot={false} activeDot={{ r:5 }}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={C.card}>
          <h3 style={{ ...C.title, marginBottom:'8px' }}>🥧 Trạng thái đơn hàng</h3>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name"
                cx="50%" cy="46%" outerRadius={82} innerRadius={44} paddingAngle={3}>
                {pieData.map((e,i) => <Cell key={i} fill={PIE_COLORS[e.name] || '#ccc'}/>)}
              </Pie>
              <Tooltip formatter={(v,n) => [`${v} đơn`, n]}/>
              <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize:'12px' }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent orders + WAF info */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'16px', alignItems:'start' }}>
        <div style={C.card}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
            <h3 style={C.title}>🕐 Đơn hàng gần đây</h3>
            <a href="/orders" style={{ fontSize:'12px', color:'#e8192c', fontWeight:'600' }}>Xem tất cả →</a>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table>
              <thead>
                <tr>
                  {['Mã đơn','Khách hàng','Tổng tiền','Trạng thái','Ngày đặt'].map(h => (
                    <th key={h} style={{ padding:'8px 14px', textAlign:'left', fontSize:'11px',
                      fontWeight:'700', color:'#94a3b8', textTransform:'uppercase',
                      letterSpacing:'.5px', borderBottom:'1px solid #f1f5f9' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((o, i) => (
                  <tr key={o.id} style={{ borderBottom: i < recent.length-1 ? '1px solid #f8fafc' : 'none' }}>
                    <td style={{ padding:'11px 14px' }}>
                      <code style={{ fontSize:'12px', color:'#e8192c', fontWeight:'700' }}>
                        #{o.id.slice(0,8).toUpperCase()}
                      </code>
                    </td>
                    <td style={{ padding:'11px 14px', fontWeight:'600', fontSize:'13px' }}>{o.username || '—'}</td>
                    <td style={{ padding:'11px 14px', color:'#e8192c', fontWeight:'700' }}>
                      {Number(o.total).toLocaleString('vi-VN')}đ
                    </td>
                    <td style={{ padding:'11px 14px' }}><StatusPill status={o.status}/></td>
                    <td style={{ padding:'11px 14px', color:'#94a3b8', fontSize:'12px' }}>
                      {new Date(o.created_at).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!recent.length && <p style={{ textAlign:'center', padding:'24px', color:'#94a3b8' }}>Chưa có đơn hàng</p>}
          </div>
        </div>

        <div style={{ ...C.card, borderLeft:'3px solid #ef4444' }}>
          <h3 style={{ fontSize:'14px', fontWeight:'700', color:'#ef4444', marginBottom:'16px' }}>⚠ WAF Test Points</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            {[
              { type:'XSS',   color:'#f59e0b', ep:'GET /api/products/search', hint:'?q=<img src=x onerror=alert(1)>' },
              { type:'SQLi',  color:'#ef4444', ep:'GET /api/products/vuln',   hint:"?id=1 UNION SELECT username,password_hash FROM users--" },
              { type:'Shell', color:'#8b5cf6', ep:'POST /api/upload/image',   hint:'Upload shell.php — no MIME/ext filter' },
            ].map(w => (
              <div key={w.type} style={{ paddingLeft:'10px', borderLeft:`3px solid ${w.color}` }}>
                <span style={{ background:w.color, color:'#fff', fontSize:'10px', fontWeight:'800', padding:'1px 7px', borderRadius:'99px' }}>{w.type}</span>
                <p style={{ fontFamily:'monospace', fontSize:'11px', color:'#0f172a', marginTop:'5px', wordBreak:'break-all' }}>{w.ep}</p>
                <p style={{ fontSize:'11px', color:'#94a3b8', marginTop:'3px', wordBreak:'break-all' }}>{w.hint}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const C = {
  card:  { background:'#fff', borderRadius:'12px', padding:'20px', boxShadow:'0 1px 4px rgba(15,23,42,.07)' },
  title: { fontSize:'14px', fontWeight:'700', color:'#0f172a' },
  sub:   { fontSize:'11px', color:'#94a3b8', marginTop:'2px' },
};
