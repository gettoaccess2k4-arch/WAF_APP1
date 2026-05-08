import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Products() {
  const [products, setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands]       = useState([]);
  const [showForm, setShowForm]   = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [search, setSearch]       = useState('');
  const [form, setForm]           = useState(defaultForm());
  const [error, setError]         = useState('');

  function defaultForm() {
    return { name:'', slug:'', description:'', price:'', original_price:'', stock:'', category_id:'', brand_id:'', image_url:'', is_featured:false, specs:'{}' };
  }

  useEffect(() => {
    fetchAll();
    api.get('/categories').then(r => setCategories(r.data));
  }, []);

  async function fetchAll() {
    const r = await api.get('/products', { params: { limit: 200 } });
    setProducts(r.data);
  }

  function openCreate() { setEditItem(null); setForm(defaultForm()); setError(''); setShowForm(true); }
  function openEdit(p)  { setEditItem(p); setForm({ ...p, specs: JSON.stringify(p.specs || {}), price: p.price, original_price: p.original_price || '' }); setError(''); setShowForm(true); }

  async function save(e) {
    e.preventDefault(); setError('');
    try {
      const payload = { ...form, price: +form.price, original_price: form.original_price ? +form.original_price : null, stock: +form.stock, specs: JSON.parse(form.specs || '{}') };
      if (editItem) await api.put(`/products/${editItem.id}`, payload);
      else          await api.post('/products', payload);
      setShowForm(false);
      fetchAll();
    } catch (err) { setError(err.response?.data?.error || 'Save failed.'); }
  }

  async function del(id) {
    if (!confirm('Xóa sản phẩm này?')) return;
    await api.delete(`/products/${id}`);
    fetchAll();
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={S.page}>
      <div style={S.topBar}>
        <h2 style={S.title}>📱 Quản lý sản phẩm</h2>
        <div style={{ display:'flex', gap:'10px' }}>
          <input style={S.searchInp} placeholder="Tìm sản phẩm…" value={search} onChange={e => setSearch(e.target.value)} />
          <button style={S.addBtn} onClick={openCreate}>+ Thêm sản phẩm</button>
        </div>
      </div>

      {showForm && (
        <div style={S.modal}>
          <div style={S.modalCard}>
            <h3 style={S.modalTitle}>{editItem ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
            {error && <div style={S.err}>{error}</div>}
            <form onSubmit={save} style={S.mForm}>
              <div style={S.mGrid}>
                {[['name','Tên sản phẩm *','text',true],['slug','Slug *','text',true],['price','Giá *','number',true],['original_price','Giá gốc','number',false],['stock','Tồn kho','number',false],['image_url','URL ảnh','text',false]].map(([k,label,type,req]) => (
                  <div key={k} style={S.mField}>
                    <label style={S.mLabel}>{label}</label>
                    <input style={S.mInp} type={type} value={form[k]} onChange={set(k)} required={req} />
                  </div>
                ))}
                <div style={S.mField}>
                  <label style={S.mLabel}>Danh mục</label>
                  <select style={S.mInp} value={form.category_id} onChange={set('category_id')}>
                    <option value="">-- Chọn --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ ...S.mField, alignItems:'center', flexDirection:'row', gap:'10px', marginTop:'12px' }}>
                  <input type="checkbox" id="feat" checked={form.is_featured} onChange={set('is_featured')} />
                  <label htmlFor="feat" style={{ fontSize:'13px', cursor:'pointer' }}>Sản phẩm nổi bật</label>
                </div>
              </div>
              <div style={S.mField}>
                <label style={S.mLabel}>Mô tả</label>
                <textarea style={{ ...S.mInp, height:'80px', resize:'vertical' }} value={form.description} onChange={set('description')} />
              </div>
              <div style={S.mField}>
                <label style={S.mLabel}>Specs (JSON)</label>
                <textarea style={{ ...S.mInp, height:'80px', fontFamily:'monospace', fontSize:'12px', resize:'vertical' }} value={form.specs} onChange={set('specs')} />
              </div>
              <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end', marginTop:'8px' }}>
                <button type="button" style={S.cancelBtn} onClick={() => setShowForm(false)}>Hủy</button>
                <button type="submit" style={S.saveBtn}>Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={S.tableWrap}>
        <table>
          <thead>
            <tr style={S.theadRow}>
              {['Ảnh','Tên sản phẩm','Danh mục','Giá','Tồn kho','Nổi bật','Thao tác'].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={S.tbodyRow}>
                <td style={S.td}>
                  {p.image_url ? <img src={p.image_url} alt="" style={S.thumb} /> : <span style={{ fontSize:'24px' }}>📦</span>}
                </td>
                <td style={S.td}>
                  <div style={{ fontWeight:'600', fontSize:'13px' }}>{p.name}</div>
                  <div style={{ color:'#9aa0a6', fontSize:'11px' }}>{p.slug}</div>
                </td>
                <td style={S.td}><span style={S.catBadge}>{p.category_name || '—'}</span></td>
                <td style={S.td}>
                  <div style={{ color:'#D0021B', fontWeight:'700' }}>{Number(p.price).toLocaleString('vi-VN')}đ</div>
                  {p.original_price && <div style={{ color:'#9aa0a6', fontSize:'11px', textDecoration:'line-through' }}>{Number(p.original_price).toLocaleString('vi-VN')}đ</div>}
                </td>
                <td style={S.td}><span style={{ ...S.stockBadge, background: p.stock > 0 ? '#e6f4ea' : '#fce8e6', color: p.stock > 0 ? '#1e8e3e' : '#d93025' }}>{p.stock}</span></td>
                <td style={S.td}>{p.is_featured ? '⭐' : '—'}</td>
                <td style={S.td}>
                  <button style={S.editBtn} onClick={() => openEdit(p)}>✏ Sửa</button>
                  <button style={S.delBtn}  onClick={() => del(p.id)}>🗑 Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={S.empty}>Không có sản phẩm nào</div>}
      </div>
    </div>
  );
}

const S = {
  page:      { padding:'24px' },
  topBar:    { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', flexWrap:'wrap', gap:'10px' },
  title:     { fontSize:'20px', fontWeight:'700' },
  searchInp: { padding:'9px 14px', border:'1px solid #e8eaed', borderRadius:'6px', fontSize:'14px', width:'240px' },
  addBtn:    { padding:'9px 18px', background:'#D0021B', color:'#fff', border:'none', borderRadius:'6px', fontWeight:'600' },
  tableWrap: { background:'#fff', borderRadius:'8px', boxShadow:'0 1px 4px rgba(0,0,0,.07)', overflow:'hidden' },
  theadRow:  { background:'#f8f9fa' },
  th:        { padding:'12px 16px', textAlign:'left', fontSize:'12px', fontWeight:'700', color:'#5f6368', textTransform:'uppercase', letterSpacing:'0.5px', borderBottom:'1px solid #e8eaed' },
  tbodyRow:  { borderBottom:'1px solid #f1f3f4' },
  td:        { padding:'12px 16px', verticalAlign:'middle' },
  thumb:     { width:'48px', height:'48px', objectFit:'contain', borderRadius:'4px', background:'#f8f9fa' },
  catBadge:  { background:'#e8f0fe', color:'#1a73e8', padding:'2px 8px', borderRadius:'12px', fontSize:'12px' },
  stockBadge:{ padding:'2px 8px', borderRadius:'12px', fontSize:'12px', fontWeight:'600' },
  editBtn:   { padding:'4px 10px', background:'#e8f0fe', color:'#1a73e8', border:'none', borderRadius:'4px', marginRight:'6px', fontSize:'12px' },
  delBtn:    { padding:'4px 10px', background:'#fce8e6', color:'#d93025', border:'none', borderRadius:'4px', fontSize:'12px' },
  empty:     { textAlign:'center', padding:'40px', color:'#9aa0a6' },
  modal:     { position:'fixed', inset:0, background:'rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'20px' },
  modalCard: { background:'#fff', borderRadius:'12px', padding:'24px', width:'100%', maxWidth:'700px', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 8px 32px rgba(0,0,0,.2)' },
  modalTitle:{ fontSize:'18px', fontWeight:'700', marginBottom:'16px' },
  mForm:     { display:'flex', flexDirection:'column', gap:'12px' },
  mGrid:     { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' },
  mField:    { display:'flex', flexDirection:'column', gap:'4px' },
  mLabel:    { fontSize:'12px', fontWeight:'600', color:'#5f6368' },
  mInp:      { padding:'9px 12px', border:'1px solid #e8eaed', borderRadius:'6px', fontSize:'14px', outline:'none' },
  saveBtn:   { padding:'10px 24px', background:'#D0021B', color:'#fff', border:'none', borderRadius:'6px', fontWeight:'600' },
  cancelBtn: { padding:'10px 24px', background:'#f1f3f4', color:'#5f6368', border:'none', borderRadius:'6px' },
  err:       { background:'#fce8e6', color:'#d93025', padding:'10px', borderRadius:'6px', marginBottom:'8px', fontSize:'13px' },
};
