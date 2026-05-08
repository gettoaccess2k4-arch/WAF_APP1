import { useState } from 'react';
import api from '../services/api';

export default function Upload() {
  const [file, setFile]     = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  async function handleUpload(e) {
    e.preventDefault(); setError(''); setResult(null); setLoading(true);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const r = await api.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(r.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload thất bại.');
    } finally { setLoading(false); }
  }

  return (
    <div style={S.page}>
      <h2 style={S.title}>📁 File Upload — WAF Test Point</h2>

      <div style={S.warnBox}>
        <h3 style={{ color:'#d93025', marginBottom:'10px' }}>⚠ WAF TEST POINT #3 — Unrestricted File Upload</h3>
        <p style={{ marginBottom:'12px', lineHeight:'1.6' }}>
          Endpoint <code style={S.code}>POST /api/upload/image</code> không có kiểm tra loại file.
          Tất cả file đều được lưu vào <code style={S.code}>/uploads/</code> và phục vụ công khai.
        </p>
        <p style={{ fontWeight:'600', marginBottom:'8px', color:'#b06000' }}>Các kỹ thuật bypass WAF cần test:</p>
        <ul style={S.list}>
          {[
            ['Content-Type mismatch', 'Gửi file PHP nhưng Content-Type: image/jpeg'],
            ['Extension bypass',      'Upload shell.php — WAF nên block .php/.phtml/.jsp'],
            ['Double extension',      'shell.php.jpg — một số WAF bị qua mặt'],
            ['Magic bytes bypass',    'Thêm GIF89a; vào đầu file PHP'],
            ['Web shell content',     '<?php system($_GET["cmd"]); ?> trong body'],
          ].map(([t, d]) => (
            <li key={t} style={{ marginBottom:'6px' }}>
              <strong>{t}:</strong> <span style={{ color:'#5f6368' }}>{d}</span>
            </li>
          ))}
        </ul>
        <p style={{ marginTop:'12px', fontSize:'12px', color:'#9aa0a6' }}>
          Note: Node.js không thực thi PHP. Test này dùng để xem WAF có chặn request không.
        </p>
      </div>

      <div style={S.card}>
        <form onSubmit={handleUpload} style={S.form}>
          <div style={S.dropZone} onClick={() => document.getElementById('fileInput').click()}>
            {file
              ? <><span style={{ fontSize:'32px' }}>📄</span><p style={{ fontWeight:'600' }}>{file.name}</p><p style={{ color:'#9aa0a6', fontSize:'12px' }}>{(file.size/1024).toFixed(1)} KB — {file.type || 'unknown MIME'}</p></>
              : <><span style={{ fontSize:'40px' }}>📤</span><p style={{ fontWeight:'600', marginTop:'8px' }}>Chọn file để upload</p><p style={{ color:'#9aa0a6', fontSize:'12px' }}>Mọi loại file đều được chấp nhận</p></>}
          </div>
          <input id="fileInput" type="file" style={{ display:'none' }} onChange={e => setFile(e.target.files[0])} />
          <button type="submit" style={S.uploadBtn} disabled={!file || loading}>
            {loading ? 'Đang upload…' : '⬆ Upload File'}
          </button>
        </form>

        {error  && <div style={S.err}>{error}</div>}
        {result && (
          <div style={S.result}>
            <h3 style={{ color:'#1e8e3e', marginBottom:'12px' }}>✅ Upload thành công</h3>
            {[
              ['Tên file', result.filename],
              ['Tên gốc',  result.originalName],
              ['MIME',     result.mimetype],
              ['Kích thước', `${(result.size/1024).toFixed(1)} KB`],
            ].map(([k,v]) => (
              <div key={k} style={S.resultRow}><span style={S.resultKey}>{k}</span><span>{v}</span></div>
            ))}
            <div style={S.resultRow}>
              <span style={S.resultKey}>URL truy cập</span>
              <a href={result.url} target="_blank" rel="noreferrer" style={{ color:'#1a73e8', wordBreak:'break-all' }}>{result.url}</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const S = {
  page:       { padding:'24px', maxWidth:'800px' },
  title:      { fontSize:'20px', fontWeight:'700', marginBottom:'20px' },
  warnBox:    { background:'#fce8e6', border:'1px solid #f5c6cb', borderRadius:'8px', padding:'20px', marginBottom:'20px' },
  code:       { background:'rgba(0,0,0,.08)', padding:'1px 6px', borderRadius:'3px', fontFamily:'monospace', fontSize:'12px' },
  list:       { marginLeft:'20px', lineHeight:'1.8', fontSize:'13px' },
  card:       { background:'#fff', borderRadius:'8px', padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,.07)' },
  form:       { display:'flex', flexDirection:'column', gap:'16px' },
  dropZone:   { border:'2px dashed #e8eaed', borderRadius:'8px', padding:'32px', textAlign:'center', cursor:'pointer', background:'#fafafa' },
  uploadBtn:  { padding:'12px', background:'#D0021B', color:'#fff', border:'none', borderRadius:'6px', fontWeight:'700', fontSize:'15px' },
  err:        { background:'#fce8e6', color:'#d93025', padding:'10px 14px', borderRadius:'6px', fontSize:'13px', marginTop:'12px' },
  result:     { background:'#e6f4ea', border:'1px solid #ceead6', borderRadius:'8px', padding:'16px', marginTop:'16px' },
  resultRow:  { display:'flex', gap:'12px', marginBottom:'8px', fontSize:'13px', alignItems:'flex-start' },
  resultKey:  { width:'100px', flexShrink:0, fontWeight:'600', color:'#5f6368' },
};
