import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const ITEMS_PER_PAGE = 10;

function Modal({ title, onClose, children }) {
  return (
    <div style={M.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={M.box}>
        <div style={M.header}>
          <h3 style={M.title}>{title}</h3>
          <button style={M.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={M.body}>{children}</div>
      </div>
    </div>
  );
}

const M = {
  overlay: { position:'fixed', inset:0, background:'rgba(15,23,42,.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:'20px', backdropFilter:'blur(2px)' },
  box:     { background:'#fff', borderRadius:'14px', width:'100%', maxWidth:'720px', maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 20px 60px rgba(15,23,42,.2)' },
  header:  { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 24px', borderBottom:'1px solid #f1f5f9' },
  title:   { fontSize:'16px', fontWeight:'700', color:'#0f172a' },
  closeBtn:{ width:'30px', height:'30px', border:'none', background:'#f1f5f9', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', color:'#64748b' },
  body:    { overflowY:'auto', padding:'24px', flex:1 },
};

function Field({ label, children }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
      <label style={{ fontSize:'12px', fontWeight:'700', color:'#64748b', textTransform:'uppercase', letterSpacing:'.4px' }}>{label}</label>
      {children}
    </div>
  );
}

const inp = { padding:'10px 12px', border:'1.5px solid #e2e8f0', borderRadius:'8px', fontSize:'14px', outline:'none', color:'#0f172a', transition:'.15s', width:'100%' };

export default function Products() {
  const { toast } = useToast();
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [editItem,   setEditItem]   = useState(null);
  const [search,     setSearch]     = useState('');
  const [catFilter,  setCatFilter]  = useState('');
  const [page,       setPage]       = useState(1);
  const [form,       setForm]       = useState(defaultForm());
  const [preview,    setPreview]    = useState('');

  function defaultForm() {
    return { name:'', slug:'', description:'', price:'', original_price:'', stock:'10',
             category_id:'', brand_id:'', image_url:'', is_featured:false, specs:'{}' };
  }

  useEffect(() => {
    Promise.all([fetchProducts(), api.get('/categories').then(r => setCategories(r.data))]);
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const r = await api.get('/products', { params:{ limit:500 } });
    setProducts(r.data);
    setLoading(false);
  }

  const filtered = useMemo(() => {
    let list = products;
    if (search)    list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand_name?.toLowerCase().includes(search.toLowerCase()));
    if (catFilter) list = list.filter(p => String(p.category_id) === catFilter);
    return list;
  }, [products, search, catFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged      = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  function openCreate() { setEditItem(null); setForm(defaultForm()); setPreview(''); setShowModal(true); }
  function openEdit(p) {
    setEditItem(p);
    const f = { ...p, price: p.price, original_price: p.original_price || '',
      specs: JSON.stringify(typeof p.specs === 'string' ? JSON.parse(p.specs) : (p.specs || {}), null, 2) };
    setForm(f);
    setPreview(p.image_url || '');
    setShowModal(true);
  }

  const set = k => e => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [k]: v }));
    if (k === 'image_url') setPreview(v);
    if (k === 'name' && !editItem) {
      setForm(f => ({ ...f, [k]: v, slug: v.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'') }));
    }
  };

  async function save(e) {
    e.preventDefault();
    try {
      const payload = {
        ...form, price: +form.price,
        original_price: form.original_price ? +form.original_price : null,
        stock: +form.stock,
        specs: JSON.parse(form.specs || '{}'),
      };
      if (editItem) { await api.put(`/products/${editItem.id}`, payload); toast('Đã cập nhật sản phẩm', 'success'); }
      else          { await api.post('/products', payload);                toast('Đã thêm sản phẩm mới', 'success'); }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast(err.response?.data?.error || 'Lỗi khi lưu sản phẩm', 'error');
    }
  }

  async function del(p) {
    if (!confirm(`Xóa sản phẩm "${p.name}"?`)) return;
    try {
      await api.delete(`/products/${p.id}`);
      toast('Đã xóa sản phẩm', 'success');
      fetchProducts();
    } catch { toast('Xóa thất bại', 'error'); }
  }

  const discount = p => p.original_price ? Math.round((1 - p.price / p.original_price) * 100) : 0;

  return (
    <div style={S.page}>
      {/* Top bar */}
      <div style={S.topBar}>
        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', flex:1 }}>
          <div style={S.searchWrap}>
            <span style={S.searchIcon}>🔍</span>
            <input style={S.searchInp} placeholder="Tìm sản phẩm, thương hiệu…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select style={S.sel} value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }}>
            <option value="">Tất cả danh mục</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <button style={S.addBtn} onClick={openCreate}>+ Thêm sản phẩm</button>
      </div>

      {/* Stats chips */}
      <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
        {[
          { label:'Tổng', val:products.length, color:'#3b82f6' },
          { label:'Kết quả', val:filtered.length, color:'#8b5cf6' },
          { label:'Hết hàng', val:products.filter(p=>p.stock===0).length, color:'#ef4444' },
          { label:'Nổi bật', val:products.filter(p=>p.is_featured).length, color:'#f59e0b' },
        ].map(c => (
          <div key={c.label} style={{ background:c.color+'12', color:c.color, fontSize:'12px', fontWeight:'700', padding:'5px 12px', borderRadius:'99px', border:`1px solid ${c.color}28` }}>
            {c.label}: {c.val}
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={S.tableCard}>
        {loading ? (
          <div style={{ padding:'40px', display:'flex', flexDirection:'column', gap:'10px' }}>
            {[...Array(5)].map((_,i) => <div key={i} className="skeleton" style={{ height:'52px', borderRadius:'8px' }} />)}
          </div>
        ) : (
          <>
            <div style={{ overflowX:'auto' }}>
              <table>
                <thead>
                  <tr style={{ background:'#f8fafc' }}>
                    {['Sản phẩm','Danh mục','Giá bán','Tồn kho','Trạng thái',''].map(h => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.map(p => (
                    <tr key={p.id} style={S.tr}>
                      <td style={S.td}>
                        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                          <div style={S.imgWrap}>
                            {p.image_url
                              ? <img src={p.image_url} alt="" style={{ width:'100%', height:'100%', objectFit:'contain' }}/>
                              : <span style={{ fontSize:'22px' }}>📦</span>}
                          </div>
                          <div>
                            <div style={{ fontWeight:'700', fontSize:'13px', color:'#0f172a', maxWidth:'200px' }} className="truncate">{p.name}</div>
                            <div style={{ fontSize:'11px', color:'#94a3b8', marginTop:'2px' }}>{p.brand_name || '—'} · {p.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td style={S.td}>
                        <span style={S.catChip}>{p.category_name || '—'}</span>
                      </td>
                      <td style={S.td}>
                        <div style={{ color:'#e8192c', fontWeight:'800', fontSize:'13px' }}>{Number(p.price).toLocaleString('vi-VN')}đ</div>
                        {p.original_price && <div style={{ fontSize:'11px', color:'#94a3b8', textDecoration:'line-through' }}>{Number(p.original_price).toLocaleString('vi-VN')}đ</div>}
                        {discount(p) > 0 && <div style={{ fontSize:'11px', color:'#10b981', fontWeight:'600' }}>-{discount(p)}%</div>}
                      </td>
                      <td style={S.td}>
                        <span style={{ background: p.stock > 10 ? '#ecfdf5' : p.stock > 0 ? '#fffbeb' : '#fef2f2',
                          color: p.stock > 10 ? '#10b981' : p.stock > 0 ? '#f59e0b' : '#ef4444',
                          fontWeight:'700', fontSize:'12px', padding:'3px 10px', borderRadius:'99px' }}>
                          {p.stock > 0 ? p.stock + ' sản phẩm' : 'Hết hàng'}
                        </span>
                      </td>
                      <td style={S.td}>
                        {p.is_featured
                          ? <span style={{ background:'#fffbeb', color:'#f59e0b', fontSize:'12px', fontWeight:'700', padding:'3px 10px', borderRadius:'99px' }}>⭐ Nổi bật</span>
                          : <span style={{ color:'#94a3b8', fontSize:'12px' }}>—</span>}
                      </td>
                      <td style={{ ...S.td, textAlign:'right' }}>
                        <div style={{ display:'flex', gap:'6px', justifyContent:'flex-end' }}>
                          <button style={S.editBtn} onClick={() => openEdit(p)}>✏ Sửa</button>
                          <button style={S.delBtn}  onClick={() => del(p)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {paged.length === 0 && (
              <div style={{ textAlign:'center', padding:'40px', color:'#94a3b8' }}>
                <span style={{ fontSize:'36px' }}>📦</span><p style={{ marginTop:'8px' }}>Không có sản phẩm nào</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={S.pagination}>
                <span style={{ fontSize:'13px', color:'#64748b' }}>
                  {(page-1)*ITEMS_PER_PAGE+1}–{Math.min(page*ITEMS_PER_PAGE, filtered.length)} / {filtered.length}
                </span>
                <div style={{ display:'flex', gap:'4px' }}>
                  <button style={S.pgBtn} disabled={page===1} onClick={() => setPage(p => p-1)}>←</button>
                  {[...Array(Math.min(totalPages, 7))].map((_,i) => {
                    const n = i+1;
                    return <button key={n} style={{ ...S.pgBtn, ...(page===n ? S.pgActive : {}) }} onClick={() => setPage(n)}>{n}</button>;
                  })}
                  <button style={S.pgBtn} disabled={page===totalPages} onClick={() => setPage(p => p+1)}>→</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal title={editItem ? `Sửa: ${editItem.name}` : 'Thêm sản phẩm mới'} onClose={() => setShowModal(false)}>
          <form onSubmit={save} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
              <Field label="Tên sản phẩm *">
                <input style={inp} value={form.name} onChange={set('name')} required placeholder="iPhone 15 Pro Max…" />
              </Field>
              <Field label="Slug *">
                <input style={inp} value={form.slug} onChange={set('slug')} required placeholder="iphone-15-pro-max" />
              </Field>
              <Field label="Giá bán (đ) *">
                <input style={inp} type="number" value={form.price} onChange={set('price')} required min="0" />
              </Field>
              <Field label="Giá gốc (đ)">
                <input style={inp} type="number" value={form.original_price} onChange={set('original_price')} min="0" />
              </Field>
              <Field label="Tồn kho">
                <input style={inp} type="number" value={form.stock} onChange={set('stock')} min="0" />
              </Field>
              <Field label="Danh mục">
                <select style={inp} value={form.category_id} onChange={set('category_id')}>
                  <option value="">— Chọn danh mục —</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </Field>
            </div>

            <Field label="URL ảnh sản phẩm">
              <input style={inp} value={form.image_url} onChange={set('image_url')} placeholder="https://…" />
            </Field>
            {preview && (
              <div style={{ display:'flex', justifyContent:'center' }}>
                <img src={preview} alt="preview" style={{ maxHeight:'120px', maxWidth:'100%', objectFit:'contain', borderRadius:'8px', border:'1px solid #e2e8f0' }}/>
              </div>
            )}

            <Field label="Mô tả">
              <textarea style={{ ...inp, height:'72px', resize:'vertical' }} value={form.description} onChange={set('description')} />
            </Field>

            <Field label="Thông số kỹ thuật (JSON)">
              <textarea style={{ ...inp, height:'90px', fontFamily:'monospace', fontSize:'12px', resize:'vertical' }} value={form.specs} onChange={set('specs')} />
            </Field>

            <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontSize:'13px', fontWeight:'600', color:'#475569' }}>
              <input type="checkbox" checked={form.is_featured} onChange={set('is_featured')} style={{ width:'16px', height:'16px' }}/>
              ⭐ Đánh dấu là sản phẩm nổi bật
            </label>

            <div style={{ display:'flex', justifyContent:'flex-end', gap:'10px', paddingTop:'4px' }}>
              <button type="button" style={S.cancelBtn} onClick={() => setShowModal(false)}>Hủy</button>
              <button type="submit" style={S.saveBtn}>{editItem ? 'Cập nhật' : 'Thêm sản phẩm'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

const S = {
  page:       { display:'flex', flexDirection:'column', gap:'16px' },
  topBar:     { display:'flex', gap:'12px', alignItems:'center', flexWrap:'wrap' },
  searchWrap: { position:'relative', flex:1, minWidth:'220px' },
  searchIcon: { position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', fontSize:'14px', pointerEvents:'none' },
  searchInp:  { width:'100%', padding:'10px 12px 10px 36px', border:'1.5px solid #e2e8f0', borderRadius:'8px', fontSize:'14px', outline:'none', background:'#fff' },
  sel:        { padding:'10px 12px', border:'1.5px solid #e2e8f0', borderRadius:'8px', fontSize:'13px', color:'#475569', background:'#fff', outline:'none' },
  addBtn:     { padding:'10px 20px', background:'#e8192c', color:'#fff', border:'none', borderRadius:'8px', fontWeight:'700', fontSize:'13px', flexShrink:0 },
  tableCard:  { background:'#fff', borderRadius:'12px', boxShadow:'0 1px 4px rgba(15,23,42,.07)', overflow:'hidden' },
  th:         { padding:'12px 16px', textAlign:'left', fontSize:'11px', fontWeight:'700', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.5px', borderBottom:'1px solid #f1f5f9', whiteSpace:'nowrap' },
  tr:         { borderBottom:'1px solid #f8fafc' },
  td:         { padding:'14px 16px', verticalAlign:'middle' },
  imgWrap:    { width:'46px', height:'46px', borderRadius:'8px', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 },
  catChip:    { background:'#eff6ff', color:'#3b82f6', fontSize:'12px', fontWeight:'600', padding:'3px 10px', borderRadius:'99px' },
  editBtn:    { padding:'5px 12px', background:'#f1f5f9', color:'#475569', border:'none', borderRadius:'6px', fontSize:'12px', fontWeight:'600' },
  delBtn:     { padding:'5px 10px', background:'#fef2f2', color:'#ef4444', border:'none', borderRadius:'6px', fontSize:'13px' },
  pagination: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 20px', borderTop:'1px solid #f1f5f9' },
  pgBtn:      { padding:'5px 10px', border:'1px solid #e2e8f0', background:'#fff', borderRadius:'6px', fontSize:'13px', cursor:'pointer', minWidth:'32px' },
  pgActive:   { background:'#e8192c', color:'#fff', border:'1px solid #e8192c' },
  saveBtn:    { padding:'10px 24px', background:'#e8192c', color:'#fff', border:'none', borderRadius:'8px', fontWeight:'700', fontSize:'14px' },
  cancelBtn:  { padding:'10px 24px', background:'#f1f5f9', color:'#475569', border:'none', borderRadius:'8px', fontWeight:'600', fontSize:'14px' },
};
