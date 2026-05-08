import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cart, total, update, remove } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) return (
    <div className="container" style={{ textAlign:'center', padding:'60px 20px' }}>
      <span style={{ fontSize:'60px' }}>🛒</span>
      <h2 style={{ margin:'16px 0 8px' }}>Giỏ hàng trống</h2>
      <p style={{ color:'#757575', marginBottom:'24px' }}>Hãy thêm sản phẩm vào giỏ hàng</p>
      <button className="btn-primary" onClick={() => navigate('/')}>Tiếp tục mua sắm</button>
    </div>
  );

  return (
    <div className="container" style={{ padding:'20px 16px' }}>
      <h2 style={{ marginBottom:'20px' }}>🛒 Giỏ hàng ({cart.length} sản phẩm)</h2>

      <div style={S.layout}>
        {/* Items */}
        <div style={S.items}>
          {cart.map(item => (
            <div key={item.productId} style={S.row}>
              <div style={S.imgBox}>
                {item.image_url
                  ? <img src={item.image_url} alt={item.name} style={S.img} />
                  : <span style={{ fontSize:'32px' }}>📦</span>}
              </div>
              <div style={{ flex:1 }}>
                <p style={S.itemName}>{item.name}</p>
                <p className="price-current">{Number(item.price).toLocaleString('vi-VN')}đ</p>
              </div>
              <div style={S.qtyCtrl}>
                <button style={S.qBtn} onClick={() => update(item.productId, item.qty - 1)}>−</button>
                <span style={S.qNum}>{item.qty}</span>
                <button style={S.qBtn} onClick={() => update(item.productId, item.qty + 1)}>+</button>
              </div>
              <div style={{ minWidth:'110px', textAlign:'right' }}>
                <p style={S.subTotal}>{Number(item.price * item.qty).toLocaleString('vi-VN')}đ</p>
                <button style={S.removeBtn} onClick={() => remove(item.productId)}>🗑 Xóa</button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={S.summary}>
          <h3 style={S.sumTitle}>Tóm tắt đơn hàng</h3>
          <div style={S.sumRow}><span>Tạm tính</span><span>{Number(total).toLocaleString('vi-VN')}đ</span></div>
          <div style={S.sumRow}><span>Phí vận chuyển</span><span style={{ color:'#2E7D32' }}>Miễn phí</span></div>
          <div style={S.sumRow}><span>Giảm giá</span><span style={{ color:'#D0021B' }}>0đ</span></div>
          <hr style={{ border:'none', borderTop:'1px solid #e0e0e0', margin:'12px 0' }} />
          <div style={{ ...S.sumRow, fontWeight:'800', fontSize:'18px' }}>
            <span>Tổng cộng</span>
            <span style={{ color:'#D0021B' }}>{Number(total).toLocaleString('vi-VN')}đ</span>
          </div>
          <button className="btn-primary" style={{ width:'100%', marginTop:'16px', padding:'14px', fontSize:'16px' }}
            onClick={() => navigate('/checkout')}>
            Tiến hành đặt hàng →
          </button>
          <button style={S.continueBtn} onClick={() => navigate('/')}>← Tiếp tục mua sắm</button>
        </div>
      </div>
    </div>
  );
}

const S = {
  layout:     { display:'flex', gap:'20px', alignItems:'flex-start', flexWrap:'wrap' },
  items:      { flex:1, minWidth:'300px', display:'flex', flexDirection:'column', gap:'8px' },
  row:        { background:'#fff', borderRadius:'8px', padding:'14px 16px', display:'flex', alignItems:'center', gap:'12px', boxShadow:'0 1px 3px rgba(0,0,0,.06)' },
  imgBox:     { width:'70px', height:'70px', display:'flex', alignItems:'center', justifyContent:'center', background:'#f9f9f9', borderRadius:'6px', flexShrink:0 },
  img:        { maxWidth:'100%', maxHeight:'100%', objectFit:'contain' },
  itemName:   { fontWeight:'600', fontSize:'13px', marginBottom:'4px' },
  qtyCtrl:    { display:'flex', alignItems:'center', border:'1px solid #e0e0e0', borderRadius:'6px', overflow:'hidden' },
  qBtn:       { width:'30px', height:'30px', border:'none', background:'#f5f5f5', fontSize:'16px' },
  qNum:       { width:'32px', textAlign:'center', fontWeight:'700' },
  subTotal:   { fontWeight:'700', color:'#D0021B', fontSize:'15px' },
  removeBtn:  { background:'none', border:'none', color:'#757575', fontSize:'12px', marginTop:'4px' },
  summary:    { width:'280px', background:'#fff', borderRadius:'8px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,.08)', flexShrink:0 },
  sumTitle:   { fontWeight:'700', fontSize:'16px', marginBottom:'16px', paddingBottom:'12px', borderBottom:'1px solid #e0e0e0' },
  sumRow:     { display:'flex', justifyContent:'space-between', marginBottom:'10px', fontSize:'14px' },
  continueBtn:{ width:'100%', marginTop:'8px', padding:'12px', background:'transparent', border:'1.5px solid #e0e0e0', borderRadius:'6px', color:'#424242' },
};
