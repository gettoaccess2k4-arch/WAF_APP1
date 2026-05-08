import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm]         = useState({ name:'', description:'', price:'', stock:'', category:'', image:'' });
  const [editId, setEditId]     = useState(null);
  const [error, setError]       = useState('');

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    const r = await axios.get('/api/products');
    setProducts(r.data);
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    try {
      if (editId) {
        await axios.put(`/api/products/${editId}`, { ...form, price: +form.price, stock: +form.stock });
      } else {
        await axios.post('/api/products', { ...form, price: +form.price, stock: +form.stock });
      }
      setForm({ name:'', description:'', price:'', stock:'', category:'', image:'' });
      setEditId(null);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed.');
    }
  }

  function startEdit(p) {
    setEditId(p.id);
    setForm({ name:p.name, description:p.description, price:p.price, stock:p.stock, category:p.category, image:p.image });
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return;
    await axios.delete(`/api/products/${id}`);
    fetchProducts();
  }

  return (
    <main style={S.main}>
      <h2 style={S.h2}>Product Management</h2>
      <form onSubmit={handleSave} style={S.form}>
        <h3>{editId ? 'Edit Product' : 'Add Product'}</h3>
        {error && <p style={S.err}>{error}</p>}
        {[['name','Name'],['description','Description'],['price','Price'],['stock','Stock'],['category','Category'],['image','Image URL']].map(([key, label]) => (
          <input key={key} style={S.inp} placeholder={label} value={form[key]}
            onChange={e => setForm({ ...form, [key]: e.target.value })} required={key==='name'||key==='price'} />
        ))}
        <div style={{ display:'flex', gap:'8px' }}>
          <button type="submit" style={S.btn}>{editId ? 'Update' : 'Create'}</button>
          {editId && <button type="button" onClick={() => { setEditId(null); setForm({ name:'', description:'', price:'', stock:'', category:'', image:'' }); }} style={S.cancelBtn}>Cancel</button>}
        </div>
      </form>

      <table style={S.table}>
        <thead><tr>{['ID','Name','Category','Price','Stock','Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} style={S.tr}>
              <td style={S.td}>{p.id}</td>
              <td style={S.td}>{p.name}</td>
              <td style={S.td}>{p.category}</td>
              <td style={S.td}>${p.price}</td>
              <td style={S.td}>{p.stock}</td>
              <td style={S.td}>
                <button style={S.editBtn} onClick={() => startEdit(p)}>Edit</button>
                <button style={S.delBtn}  onClick={() => handleDelete(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

const S = {
  main:      { maxWidth:'1100px', margin:'0 auto', padding:'24px 16px' },
  h2:        { marginBottom:'20px', color:'#f1f5f9' },
  form:      { background:'#1e293b', padding:'20px', borderRadius:'8px', marginBottom:'24px', display:'flex', flexDirection:'column', gap:'10px' },
  inp:       { padding:'10px', border:'1px solid #334155', borderRadius:'6px', background:'#0f172a', color:'#e2e8f0', fontSize:'1rem' },
  btn:       { padding:'10px 20px', background:'#1e40af', color:'#fff', border:'none', borderRadius:'6px' },
  cancelBtn: { padding:'10px 20px', background:'#475569', color:'#fff', border:'none', borderRadius:'6px' },
  err:       { color:'#f87171' },
  table:     { width:'100%', borderCollapse:'collapse', background:'#1e293b', borderRadius:'8px', overflow:'hidden' },
  th:        { padding:'12px 16px', textAlign:'left', background:'#334155', color:'#94a3b8', fontWeight:'600', fontSize:'0.85rem' },
  tr:        { borderBottom:'1px solid #334155' },
  td:        { padding:'12px 16px', fontSize:'0.9rem', color:'#cbd5e1' },
  editBtn:   { marginRight:'8px', padding:'4px 12px', background:'#0369a1', color:'#fff', border:'none', borderRadius:'4px', fontSize:'0.8rem' },
  delBtn:    { padding:'4px 12px', background:'#b91c1c', color:'#fff', border:'none', borderRadius:'4px', fontSize:'0.8rem' },
};
