import { useState, useEffect } from 'react';
import api from '../services/api';

const STATUSES = ['pending','processing','shipped','delivered','cancelled'];
const STATUS_COLOR = { pending:'#f9ab00', processing:'#1a73e8', shipped:'#9c27b0', delivered:'#1e8e3e', cancelled:'#d93025' };
const STATUS_LABEL = { pending:'Chờ xác nhận', processing:'Đang xử lý', shipped:'Đang giao', delivered:'Đã giao', cancelled:'Đã hủy' };

export default function Orders() {
  const [orders, setOrders]   = useState([]);
  const [filter, setFilter]   = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { fetchOrders(); }, [filter]);

  async function fetchOrders() {
    setLoading(true);
    const r = await api.get('/orders', { params: filter ? { status: filter } : {} });
    setOrders(r.data);
    setLoading(false);
  }

  async function updateStatus(id, status) {
    await api.put(`/orders/${id}/status`, { status });
    fetchOrders();
  }

  return (
    <div style={S.page}>
      <div style={S.topBar}>
        <h2 style={S.title}>📋 Quản lý đơn hàng</h2>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          <button style={{ ...S.filterBtn, ...(filter === '' ? S.filterActive : {}) }} onClick={() => setFilter('')}>Tất cả</button>
          {STATUSES.map(s => (
            <button key={s} style={{ ...S.filterBtn, ...(filter === s ? { background: STATUS_COLOR[s], color:'#fff' } : {}) }} onClick={() => setFilter(s)}>
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {loading && <div style={{ textAlign:'center', padding:'40px', color:'#9aa0a6' }}>Đang tải…</div>}

      <div style={S.tableWrap}>
        <table>
          <thead>
            <tr style={S.theadRow}>
              {['Mã đơn','Khách hàng','Ngày đặt','Tổng tiền','Trạng thái','Thao tác'].map(h => <th key={h} style={S.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <>
                <tr key={o.id} style={S.tbodyRow}>
                  <td style={S.td}>
                    <span style={S.orderId} onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                      #{o.id.slice(0,8).toUpperCase()} {expanded === o.id ? '▲' : '▼'}
                    </span>
                  </td>
                  <td style={S.td}><div style={{ fontWeight:'600' }}>{o.username}</div><div style={{ color:'#9aa0a6', fontSize:'11px' }}>{o.email}</div></td>
                  <td style={S.td}>{new Date(o.created_at).toLocaleDateString('vi-VN')}</td>
                  <td style={S.td}><span style={{ color:'#D0021B', fontWeight:'700' }}>{Number(o.total).toLocaleString('vi-VN')}đ</span></td>
                  <td style={S.td}><span style={{ ...S.statusBadge, background: STATUS_COLOR[o.status] + '20', color: STATUS_COLOR[o.status] }}>{STATUS_LABEL[o.status]}</span></td>
                  <td style={S.td}>
                    <select style={S.statusSel} value={o.status} onChange={e => updateStatus(o.id, e.target.value)}>
                      {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                    </select>
                  </td>
                </tr>
                {expanded === o.id && (
                  <tr style={{ background:'#f8f9fa' }}>
                    <td colSpan={6} style={{ padding:'12px 24px' }}>
                      <div style={{ fontSize:'13px', color:'#5f6368', marginBottom:'8px' }}>
                        <strong>Địa chỉ:</strong> {o.shipping_address?.fullName} — {o.shipping_address?.phone} — {o.shipping_address?.address}, {o.shipping_address?.city}
                      </div>
                      <table style={{ fontSize:'12px', width:'auto' }}>
                        <thead><tr>{['Sản phẩm','Đơn giá','SL','Thành tiền'].map(h=><th key={h} style={{ padding:'4px 12px 4px 0', color:'#5f6368', textAlign:'left' }}>{h}</th>)}</tr></thead>
                        <tbody>
                          {(o.items||[]).map(i => (
                            <tr key={i.id}>
                              <td style={{ paddingRight:'20px' }}>{i.name}</td>
                              <td style={{ paddingRight:'12px' }}>{Number(i.price).toLocaleString('vi-VN')}đ</td>
                              <td style={{ paddingRight:'12px' }}>×{i.quantity}</td>
                              <td style={{ color:'#D0021B', fontWeight:'700' }}>{Number(i.price*i.quantity).toLocaleString('vi-VN')}đ</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {!loading && orders.length === 0 && <div style={S.empty}>Không có đơn hàng</div>}
      </div>
    </div>
  );
}

const S = {
  page:       { padding:'24px' },
  topBar:     { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px', flexWrap:'wrap', gap:'12px' },
  title:      { fontSize:'20px', fontWeight:'700' },
  filterBtn:  { padding:'7px 14px', background:'#f1f3f4', color:'#5f6368', border:'none', borderRadius:'20px', fontSize:'12px', fontWeight:'600' },
  filterActive:{ background:'#D0021B', color:'#fff' },
  tableWrap:  { background:'#fff', borderRadius:'8px', boxShadow:'0 1px 4px rgba(0,0,0,.07)', overflow:'hidden' },
  theadRow:   { background:'#f8f9fa' },
  th:         { padding:'12px 16px', textAlign:'left', fontSize:'12px', fontWeight:'700', color:'#5f6368', textTransform:'uppercase', borderBottom:'1px solid #e8eaed' },
  tbodyRow:   { borderBottom:'1px solid #f1f3f4' },
  td:         { padding:'12px 16px', verticalAlign:'middle' },
  orderId:    { fontFamily:'monospace', fontWeight:'600', cursor:'pointer', color:'#1a73e8' },
  statusBadge:{ padding:'4px 10px', borderRadius:'12px', fontSize:'12px', fontWeight:'600' },
  statusSel:  { padding:'5px 8px', border:'1px solid #e8eaed', borderRadius:'6px', fontSize:'12px', color:'#202124' },
  empty:      { textAlign:'center', padding:'40px', color:'#9aa0a6' },
};
