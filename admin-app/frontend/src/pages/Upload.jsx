import { useState } from 'react';
import axios from 'axios';

export default function Upload() {
  const [file, setFile]     = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError]   = useState('');

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    setError('');
    setResult(null);

    const form = new FormData();
    form.append('image', file);

    try {
      const r = await axios.post('/api/upload/image', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(r.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed.');
    }
  }

  return (
    <main style={S.main}>
      <h2 style={S.h2}>Product Image Upload</h2>

      <div style={S.warningBox}>
        <strong>WAF TEST POINT — Unrestricted File Upload</strong>
        <p style={{ marginTop:'8px', fontSize:'0.9rem' }}>
          This endpoint accepts ANY file type (no MIME/extension filter). Use it to test WAF detection of:
        </p>
        <ul style={S.list}>
          <li>Web shell upload (.php, .jsp, .phtml files)</li>
          <li>Content-Type mismatch (image/jpeg but actually PHP)</li>
          <li>Double extension bypass (shell.php.jpg)</li>
          <li>Null byte injection (shell.php%00.jpg)</li>
        </ul>
        <p style={{ marginTop:'8px', fontSize:'0.85rem', color:'#fca5a5' }}>
          Uploaded files are served at <code>/uploads/&lt;filename&gt;</code>
        </p>
      </div>

      <form onSubmit={handleUpload} style={S.form}>
        <input type="file" style={S.fileInput} onChange={e => setFile(e.target.files[0])} />
        {file && <p style={S.fileInfo}>Selected: <strong>{file.name}</strong> ({(file.size/1024).toFixed(1)} KB) — Type: {file.type || 'unknown'}</p>}
        <button type="submit" style={S.btn} disabled={!file}>Upload File</button>
      </form>

      {error  && <p style={S.err}>{error}</p>}
      {result && (
        <div style={S.result}>
          <h3 style={{ marginBottom:'12px', color:'#4ade80' }}>Upload Successful</h3>
          <table style={{ borderCollapse:'collapse', width:'100%' }}>
            {Object.entries(result).filter(([k]) => k !== 'message').map(([k, v]) => (
              <tr key={k} style={{ borderBottom:'1px solid #334155' }}>
                <td style={S.rtd}><strong>{k}</strong></td>
                <td style={S.rtd}>{k === 'url' ? <a href={v} target="_blank" rel="noreferrer" style={{ color:'#60a5fa' }}>{v}</a> : String(v)}</td>
              </tr>
            ))}
          </table>
        </div>
      )}
    </main>
  );
}

const S = {
  main:       { maxWidth:'700px', margin:'0 auto', padding:'24px 16px' },
  h2:         { marginBottom:'20px', color:'#f1f5f9' },
  warningBox: { background:'#7f1d1d', border:'1px solid #ef4444', borderRadius:'8px', padding:'16px 20px', marginBottom:'24px', color:'#fecaca' },
  list:       { marginLeft:'20px', marginTop:'8px', lineHeight:'1.8', fontSize:'0.9rem' },
  form:       { background:'#1e293b', padding:'20px', borderRadius:'8px', display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' },
  fileInput:  { color:'#e2e8f0', padding:'8px', border:'1px solid #334155', borderRadius:'6px', background:'#0f172a' },
  fileInfo:   { fontSize:'0.9rem', color:'#94a3b8' },
  btn:        { padding:'10px 24px', background:'#1e40af', color:'#fff', border:'none', borderRadius:'6px', width:'fit-content' },
  err:        { color:'#f87171', marginTop:'8px' },
  result:     { background:'#1e293b', border:'1px solid #166534', borderRadius:'8px', padding:'20px' },
  rtd:        { padding:'8px 12px', fontSize:'0.9rem', color:'#cbd5e1', fontFamily:'monospace' },
};
