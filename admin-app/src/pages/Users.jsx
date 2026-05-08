import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Users() {
  const [users, setUsers]   = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/users').then(r => setUsers(r.data)).catch(() => {});
  }, []);

  async function del(id, username) {
    if (!confirm(`Xóa người dùng "${username}"?`)) return;
    await api.delete(`/users/${id}`);
    setUsers(u => u.filter(x => x.id !== id));
  }

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={S.page}>
      <div style={S.topBar}>
        <h2 style={S.title}>👥 Quản lý người dùng</h2>
        <input style={S.searchInp} placeholder="Tìm theo tên/email…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div style={S.tableWrap}>
        <table>
          <thead>
            <tr style={S.theadRow}>
              {['Username','Email','Role','Ngày tạo','Thao tác'].map(h => <th key={h} style={S.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} style={S.tbodyRow}>
                <td style={S.td}><div style={{ fontWeight:'600' }}>{u.username}</div></td>
                <td style={S.td}>{u.email}</td>
                <td style={S.td}>
                  <span style={{ ...S.roleBadge, background: u.role === 'admin' ? '#fce8e6' : '#e8f0fe', color: u.role === 'admin' ? '#d93025' : '#1a73e8' }}>
                    {u.role}
                  </span>
                </td>
                <td style={S.td}>{new Date(u.created_at).toLocaleDateString('vi-VN')}</td>
                <td style={S.td}>
                  {u.role !== 'admin' && (
                    <button style={S.delBtn} onClick={() => del(u.id, u.username)}>🗑 Xóa</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={S.empty}>Không có người dùng</div>}
      </div>
    </div>
  );
}

const S = {
  page:      { padding:'24px' },
  topBar:    { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' },
  title:     { fontSize:'20px', fontWeight:'700' },
  searchInp: { padding:'9px 14px', border:'1px solid #e8eaed', borderRadius:'6px', fontSize:'14px', width:'280px' },
  tableWrap: { background:'#fff', borderRadius:'8px', boxShadow:'0 1px 4px rgba(0,0,0,.07)', overflow:'hidden' },
  theadRow:  { background:'#f8f9fa' },
  th:        { padding:'12px 16px', textAlign:'left', fontSize:'12px', fontWeight:'700', color:'#5f6368', textTransform:'uppercase', borderBottom:'1px solid #e8eaed' },
  tbodyRow:  { borderBottom:'1px solid #f1f3f4' },
  td:        { padding:'12px 16px', verticalAlign:'middle' },
  roleBadge: { padding:'3px 10px', borderRadius:'12px', fontSize:'12px', fontWeight:'600' },
  delBtn:    { padding:'5px 12px', background:'#fce8e6', color:'#d93025', border:'none', borderRadius:'4px', fontSize:'12px' },
  empty:     { textAlign:'center', padding:'40px', color:'#9aa0a6' },
};
