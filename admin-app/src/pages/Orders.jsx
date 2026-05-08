import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const STATUSES = ['pending','processing','shipped','delivered','cancelled'];
const STATUS_META = {
  pending:    { label:'Chờ xác nhận', color:'#f59e0b', bg:'#fffbeb', icon:'⏳' },
  processing: { label:'Đang xử lý',   color:'#3b82f6', bg:'#eff6ff', icon:'⚙️' },
  shipped:    { label:'Đang giao',     color:'#8b5cf6', bg:'#f5f3ff', icon:'🚚' },
  delivered:  { label:'Đã giao',       color:'#10b981', bg:'#ecfdf5', icon:'✅' },
  cancelled:  { label:'Đã hủy',        color:'#ef4444', bg:'#fef2f2', icon:'✕' },
};

function StatusPill({ status }) {
  const m = STATUS_META[status] || { label:status, color:'#999', bg:'#f5f5f5', icon:'•' };
  return (
    <span style={{ background:m.bg, color:m.color, fontWeight:'700', fontSize:'11px',
      padding:'4px 10px', borderRadius:'99px', whiteSpace:'nowrap', display:'inline-flex', alignItems:'center', gap:'4px' }}>
      {m.icon} {m.label}
    </span>
  );
}

/* ── Detail Drawer ─────────────────────────────────────────────────────────── */
function OrderDrawer({ order, onClose, onStatusChange }) {
  const { toast } = useToast();
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);

  async function saveStatus() {
    setSaving(true);
    try {
      await api.put(`/orders/${order.id}/status`, { status });
      onStatusChange(order.id, status);
      toast('Đã cập nhật trạng thái', 'success');
    } catch { toast('Cập nhật thất bại', 'error'); }
    finally { setSaving(false); }
  }

  const addr = order.shipping_address || {};
  const timeline = STATUSES.slice(0, STATUSES.indexOf('cancelled'));
  const currentIdx = timeline.indexOf(order.status);

  return (
    <div style={D.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={D.drawer}>
        <div style={D.header}>
          <div>
            <p style={{ fontSize:'12px', color:'#94a3b8', marginBottom:'4px' }}>Mã đơn hàng</p>
            <h2 style={D.orderId}>#{order.id.slice(0,8).toUpperCase()}</h2>
          </div>
          <button style={D.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={D.content}>
          {/* Timeline */}
          {order.status !== 'cancelled' && (
            <div style={D.section}>
              <p style={D.sectionTitle}>📍 Tiến trình đơn hàng</p>
              <div style={{ display:'flex', alignItems:'center', gap:'0', marginTop:'12px' }}>
                {timeline.map((s, i) => {
                  const done    = i <= currentIdx;
                  const current = i === currentIdx;
                  const m       = STATUS_META[s];
                  return (
                    <div key={s} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center' }}>
                      <div style={{ display:'flex', alignItems:'center', width:'100%' }}>
                        {i > 0 && <div style={{ flex:1, height:'2px', background: i <= currentIdx ? m.color : '#e2e8f0' }} />}
                        <div style={{ width:'28px', height:'28px', borderRadius:'50%', background: done ? m.color : '#f1f5f9', border: `2px solid ${done ? m.color : '#e2e8f0'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', zIndex:1, flexShrink:0 }}>
                          {done ? '✓' : i+1}
                        </div>
                        {i < timeline.length - 1 && <div style={{ flex:1, height:'2px', background: i < currentIdx ? STATUS_META[timeline[i+1]]?.color : '#e2e8f0' }} />}
                      </div>
                      <p style={{ fontSize:'10px', marginTop:'4px', fontWeight: current ? '700' : '500', color: done ? m.color : '#94a3b8', textAlign:'center' }}>{m.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Customer */}
          <div style={D.section}>
            <p style={D.sectionTitle}>👤 Thông tin khách hàng</p>
            <div style={D.infoGrid}>
              <div style={D.infoRow}><span style={D.infoKey}>Họ tên</span><span style={D.infoVal}>{addr.fullName || '—'}</span></div>
              <div style={D.infoRow}><span style={D.infoKey}>Điện thoại</span><span style={D.infoVal}>{addr.phone || '—'}</span></div>
              <div style={D.infoRow}><span style={D.infoKey}>Địa chỉ</span><span style={D.infoVal}>{addr.address || '—'}</span></div>
              <div style={D.infoRow}><span style={D.infoKey}>Thành phố</span><span style={D.infoVal}>{addr.city || '—'}</span></div>
              <div style={D.infoRow}><span style={D.infoKey}>Tài khoản</span><span style={D.infoVal}>{order.username || '—'}</span></div>
              <div style={D.infoRow}><span style={D.infoKey}>Ngày đặt</span><span style={D.infoVal}>{new Date(order.created_at).toLocaleString('vi-VN')}</span></div>
            </div>
          </div>

          {/* Items */}
          <div style={D.section}>
            <p style={D.sectionTitle}>📦 Sản phẩm</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginTop:'8px' }}>
              {(order.items || []).map(i => (
                <div key={i.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', background:'#f8fafc', borderRadius:'8px' }}>
                  <div>
                    <p style={{ fontWeight:'600', fontSize:'13px' }}>{i.name}</p>
                    <p style={{ fontSize:'12px', color:'#94a3b8' }}>{Number(i.price).toLocaleString('vi-VN')}đ × {i.quantity}</p>
                  </div>
                  <p style={{ fontWeight:'700', color:'#e8192c' }}>{Number(i.price * i.quantity).toLocaleString('vi-VN')}đ</p>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 0 0', borderTop:'1px solid #f1f5f9', marginTop:'10px' }}>
              <span style={{ fontWeight:'700', fontSize:'15px' }}>Tổng cộng</span>
              <span style={{ fontWeight:'800', fontSize:'18px', color:'#e8192c' }}>{Number(order.total).toLocaleString('vi-VN')}đ</span>
            </div>
          </div>

          {/* Update status */}
          <div style={D.section}>
            <p style={D.sectionTitle}>🔄 Cập nhật trạng thái</p>
            <div style={{ display:'flex', gap:'8px', marginTop:'8px' }}>
              <select style={{ flex:1, padding:'10px 12px', border:'1.5px solid #e2e8f0', borderRadius:'8px', fontSize:'14px', outline:'none' }}
                value={status} onChange={e => setStatus(e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_META[s]?.icon} {STATUS_META[s]?.label}</option>)}
              </select>
              <button style={{ padding:'10px 18px', background:'#e8192c', color:'#fff', border:'none', borderRadius:'8px', fontWeight:'700', fontSize:'13px' }}
                onClick={saveStatus} disabled={saving || status === order.status}>
                {saving ? '…' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const D = {
  overlay:      { position:'fixed', inset:0, background:'rgba(15,23,42,.4)', zIndex:200, display:'flex', justifyContent:'flex-end', backdropFilter:'blur(2px)' },
  drawer:       { width:'460px', maxWidth:'100vw', background:'#fff', height:'100vh', display:'flex', flexDirection:'column', boxShadow:'-8px 0 40px rgba(15,23,42,.15)', overflowY:'auto' },
  header:       { display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'20px 24px', background:'#0f172a', flexShrink:0 },
  orderId:      { color:'#fff', fontFamily:'monospace', fontSize:'20px', fontWeight:'800' },
  closeBtn:     { width:'32px', height:'32px', border:'none', background:'rgba(255,255,255,.1)', borderRadius:'50%', color:'#fff', fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center' },
  content:      { flex:1, overflowY:'auto' },
  section:      { padding:'16px 24px', borderBottom:'1px solid #f1f5f9' },
  sectionTitle: { fontSize:'12px', fontWeight:'700', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:'2px' },
  infoGrid:     { display:'flex', flexDirection:'column', gap:'6px', marginTop:'8px' },
  infoRow:      { display:'flex', gap:'12px', fontSize:'13px', padding:'4px 0' },
  infoKey:      { width:'90px', flexShrink:0, color:'#94a3b8', fontWeight:'600' },
  infoVal:      { color:'#0f172a', fontWeight:'500' },
};

/* ── Main ─────────────────────────────────────────────────────────────────── */
export default function Orders() {
  const { toast }               = useToast();
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('');
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchOrders(); }, [filter]);

  async function fetchOrders() {
    setLoading(true);
    try {
      const r = await api.get('/orders', { params: filter ? { status:filter } : {} });
      setOrders(r.data);
    } finally { setLoading(false); }
  }

  function handleStatusChange(id, newStatus) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status:newStatus } : o));
    if (selected?.id === id) setSelected(prev => ({ ...prev, status:newStatus }));
  }

  const filtered = useMemo(() => {
    if (!search) return orders;
    const q = search.toLowerCase();
    return orders.filter(o =>
      o.id.toLowerCase().includes(q) ||
      (o.username || '').toLowerCase().includes(q) ||
      (o.email    || '').toLowerCase().includes(q)
    );
  }, [orders, search]);

  // Status counts for chips
  const counts = useMemo(() => {
    const c = {};
    orders.forEach(o => { c[o.status] = (c[o.status] || 0) + 1; });
    return c;
  }, [orders]);

  return (
    <div style={S.page}>
      {/* Filter bar */}
      <div style={S.filterRow}>
        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
          <button style={{ ...S.filterBtn, ...(filter === '' ? S.filterActive : {}) }} onClick={() => setFilter('')}>
            Tất cả <span style={S.countBadge}>{orders.length}</span>
          </button>
          {STATUSES.map(s => {
            const m = STATUS_META[s];
            const active = filter === s;
            return (
              <button key={s} style={{ ...S.filterBtn, ...(active ? { background:m.color, color:'#fff', borderColor:m.color } : {}) }}
                onClick={() => setFilter(s)}>
                {m.icon} {m.label}
                {counts[s] > 0 && <span style={{ ...S.countBadge, ...(active ? { background:'rgba(255,255,255,.3)' } : {}) }}>{counts[s]}</span>}
              </button>
            );
          })}
        </div>
        <div style={S.searchWrap}>
          <span style={S.searchIcon}>🔍</span>
          <input style={S.searchInp} placeholder="Tìm mã đơn, tên khách…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div style={S.tableCard}>
        {loading ? (
          <div style={{ padding:'32px', display:'flex', flexDirection:'column', gap:'10px' }}>
            {[...Array(6)].map((_,i) => <div key={i} className="skeleton" style={{ height:'52px', borderRadius:'8px' }}/>)}
          </div>
        ) : (
          <>
            <div style={{ overflowX:'auto' }}>
              <table>
                <thead>
                  <tr style={{ background:'#f8fafc' }}>
                    {['Mã đơn','Khách hàng','Sản phẩm','Tổng tiền','Trạng thái','Ngày đặt',''].map(h => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(o => (
                    <tr key={o.id} style={{ ...S.tr, cursor:'pointer' }} onClick={() => setSelected(o)}>
                      <td style={S.td}><code style={{ fontSize:'12px', color:'#e8192c', fontWeight:'700' }}>#{o.id.slice(0,8).toUpperCase()}</code></td>
                      <td style={S.td}>
                        <div style={{ fontWeight:'600', fontSize:'13px' }}>{o.username || '—'}</div>
                        <div style={{ fontSize:'11px', color:'#94a3b8' }}>{o.email || ''}</div>
                      </td>
                      <td style={S.td}>
                        <span style={{ fontSize:'12px', color:'#64748b' }}>
                          {(o.items || []).slice(0,2).map(i => i.name).join(', ')}{o.items?.length > 2 ? ` +${o.items.length-2}` : ''}
                        </span>
                      </td>
                      <td style={S.td}><span style={{ color:'#e8192c', fontWeight:'800', fontSize:'13px' }}>{Number(o.total).toLocaleString('vi-VN')}đ</span></td>
                      <td style={S.td}><StatusPill status={o.status}/></td>
                      <td style={S.td}><span style={{ fontSize:'12px', color:'#94a3b8' }}>{new Date(o.created_at).toLocaleDateString('vi-VN')}</span></td>
                      <td style={{ ...S.td, textAlign:'right' }}>
                        <button style={S.viewBtn} onClick={e => { e.stopPropagation(); setSelected(o); }}>Chi tiết →</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div style={{ textAlign:'center', padding:'48px', color:'#94a3b8' }}>
                <span style={{ fontSize:'36px' }}>🧾</span><p style={{ marginTop:'8px' }}>Không có đơn hàng nào</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Drawer */}
      {selected && (
        <OrderDrawer order={selected} onClose={() => setSelected(null)} onStatusChange={handleStatusChange} />
      )}
    </div>
  );
}

const S = {
  page:        { display:'flex', flexDirection:'column', gap:'16px' },
  filterRow:   { display:'flex', justifyContent:'space-between', alignItems:'center', gap:'12px', flexWrap:'wrap' },
  filterBtn:   { padding:'7px 14px', background:'#fff', color:'#475569', border:'1.5px solid #e2e8f0', borderRadius:'99px', fontSize:'12px', fontWeight:'600', display:'flex', alignItems:'center', gap:'5px', transition:'.15s' },
  filterActive:{ background:'#e8192c', color:'#fff', borderColor:'#e8192c' },
  countBadge:  { background:'rgba(0,0,0,.1)', borderRadius:'99px', fontSize:'10px', padding:'1px 6px', fontWeight:'700' },
  searchWrap:  { position:'relative' },
  searchIcon:  { position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', fontSize:'13px', pointerEvents:'none' },
  searchInp:   { padding:'9px 12px 9px 34px', border:'1.5px solid #e2e8f0', borderRadius:'8px', fontSize:'13px', outline:'none', width:'260px', background:'#fff' },
  tableCard:   { background:'#fff', borderRadius:'12px', boxShadow:'0 1px 4px rgba(15,23,42,.07)', overflow:'hidden' },
  th:          { padding:'12px 16px', textAlign:'left', fontSize:'11px', fontWeight:'700', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.5px', borderBottom:'1px solid #f1f5f9', whiteSpace:'nowrap' },
  tr:          { borderBottom:'1px solid #f8fafc', transition:'.12s' },
  td:          { padding:'13px 16px', verticalAlign:'middle' },
  viewBtn:     { padding:'5px 12px', background:'#f1f5f9', color:'#475569', border:'none', borderRadius:'6px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
};
