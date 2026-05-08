import { useState, useRef, useCallback } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const WAF_TESTS = [
  { id: 'ext',     color: '#ef4444', label: 'Extension',      hint: 'Upload shell.php / shell.phtml / shell.jsp — WAF phải block' },
  { id: 'mime',    color: '#f59e0b', label: 'MIME mismatch',   hint: 'Đổi Content-Type thành image/jpeg nhưng nội dung là PHP' },
  { id: 'double',  color: '#8b5cf6', label: 'Double ext',      hint: 'shell.php.jpg — kiểm tra WAF có detect không' },
  { id: 'magic',   color: '#3b82f6', label: 'Magic bytes',     hint: 'Prepend GIF89a; trước <?php system($_GET["cmd"]); ?>' },
  { id: 'webshell',color: '#10b981', label: 'Web shell body',  hint: '<?php system($_GET["cmd"]); ?> — nội dung shell đơn giản nhất' },
  { id: 'svg',     color: '#f97316', label: 'SVG XSS',         hint: '<svg onload=alert(1)> — upload SVG chứa XSS payload' },
];

const EXT_ICONS = {
  php: '🐘', phtml: '🐘', jsp: '☕', asp: '🪟', aspx: '🪟',
  jpg: '🖼', jpeg: '🖼', png: '🖼', gif: '🖼', webp: '🖼',
  svg: '🎨', pdf: '📄', zip: '🗜', txt: '📝', html: '🌐',
};

function getIcon(name = '') {
  const ext = name.split('.').pop().toLowerCase();
  return EXT_ICONS[ext] || '📄';
}

function FileRow({ item, onCopy }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(item.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy(item.url);
    });
  }
  const isDangerous = /\.(php|phtml|jsp|asp|aspx|sh|py|rb|pl)$/i.test(item.filename);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
      borderBottom: '1px solid #f1f5f9', transition: 'background .15s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
      onMouseLeave={e => e.currentTarget.style.background = ''}
    >
      <span style={{ fontSize: '24px', width: '30px', textAlign: 'center', flexShrink: 0 }}>{getIcon(item.filename)}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', wordBreak: 'break-all' }}>{item.filename}</span>
          {isDangerous && (
            <span style={{
              background: '#fef2f2', color: '#ef4444', fontSize: '10px',
              fontWeight: '800', padding: '1px 7px', borderRadius: '99px', border: '1px solid #fecaca',
            }}>⚠ SHELL</span>
          )}
        </div>
        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
          {item.mimetype} · {(item.size / 1024).toFixed(1)} KB · {new Date(item.uploadedAt).toLocaleTimeString('vi-VN')}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
        <a href={item.url} target="_blank" rel="noreferrer" style={{
          padding: '5px 10px', borderRadius: '7px', border: '1px solid #e2e8f0',
          background: '#fff', fontSize: '12px', fontWeight: '600', color: '#475569',
          textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px',
        }}>↗ Mở</a>
        <button onClick={copy} style={{
          padding: '5px 10px', borderRadius: '7px', border: '1px solid #e2e8f0',
          background: copied ? '#ecfdf5' : '#fff', fontSize: '12px', fontWeight: '600',
          color: copied ? '#10b981' : '#475569', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: '4px',
        }}>
          {copied ? '✓ Đã copy' : '⎘ Copy URL'}
        </button>
      </div>
    </div>
  );
}

export default function Upload() {
  const [file,     setFile]     = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [history,  setHistory]  = useState([]);
  const [checked,  setChecked]  = useState({});
  const inputRef = useRef();
  const toast = useToast();

  const pickFile = useCallback(f => { if (f) setFile(f); }, []);

  function onDrop(e) {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const r = await api.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const item = { ...r.data, uploadedAt: new Date().toISOString() };
      setHistory(h => [item, ...h]);
      toast.push(`Upload thành công: ${r.data.filename}`, 'success');
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      toast.push(err.response?.data?.error || 'Upload thất bại', 'error');
    } finally {
      setLoading(false);
    }
  }

  function toggleCheck(id) {
    setChecked(c => ({ ...c, [id]: !c[id] }));
  }

  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>File Upload — WAF Test Point</h2>
        <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
          Endpoint <code style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '11px' }}>POST /api/upload/image</code> không có bộ lọc loại file
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>

        {/* Left: upload + history */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Drop zone */}
          <div style={{
            background: '#fff', borderRadius: '12px',
            boxShadow: '0 1px 4px rgba(15,23,42,.07)', overflow: 'hidden',
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>📤 Upload file</h3>
            </div>
            <div style={{ padding: '20px' }}>
              <form onSubmit={handleUpload}>
                <div
                  onClick={() => inputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  style={{
                    border: `2px dashed ${dragging ? '#e8192c' : file ? '#10b981' : '#e2e8f0'}`,
                    borderRadius: '10px', padding: '36px 20px', textAlign: 'center',
                    cursor: 'pointer', background: dragging ? '#fff5f5' : file ? '#f0fdf4' : '#fafafa',
                    transition: 'all .2s',
                  }}
                >
                  {file ? (
                    <>
                      <div style={{ fontSize: '40px', marginBottom: '8px' }}>{getIcon(file.name)}</div>
                      <p style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>{file.name}</p>
                      <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                        {(file.size / 1024).toFixed(1)} KB · {file.type || 'unknown MIME'}
                      </p>
                      <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>Click để chọn file khác</p>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: '40px', marginBottom: '10px' }}>☁️</div>
                      <p style={{ fontWeight: '700', fontSize: '14px', color: '#475569' }}>Kéo thả file vào đây</p>
                      <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>hoặc click để chọn file — <strong>mọi loại đều được chấp nhận</strong></p>
                    </>
                  )}
                </div>
                <input ref={inputRef} type="file" style={{ display: 'none' }} onChange={e => pickFile(e.target.files[0])} />
                <button type="submit" disabled={!file || loading} style={{
                  marginTop: '14px', width: '100%', padding: '11px', border: 'none', borderRadius: '9px',
                  background: !file || loading ? '#e2e8f0' : 'var(--primary)',
                  color: !file || loading ? '#94a3b8' : '#fff',
                  fontWeight: '700', fontSize: '14px', cursor: !file || loading ? 'not-allowed' : 'pointer',
                  transition: 'var(--transition)',
                }}>
                  {loading ? '⏳ Đang upload…' : '⬆ Upload File'}
                </button>
              </form>
            </div>
          </div>

          {/* Upload history */}
          {history.length > 0 && (
            <div style={{
              background: '#fff', borderRadius: '12px',
              boxShadow: '0 1px 4px rgba(15,23,42,.07)', overflow: 'hidden',
            }}>
              <div style={{
                padding: '14px 16px', borderBottom: '1px solid #f1f5f9',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                  📋 Lịch sử upload <span style={{
                    background: '#f1f5f9', color: '#64748b', fontSize: '11px',
                    padding: '2px 8px', borderRadius: '99px', marginLeft: '6px', fontWeight: '600',
                  }}>{history.length}</span>
                </h3>
                <button onClick={() => setHistory([])} style={{
                  fontSize: '12px', color: '#94a3b8', border: 'none', background: 'none', cursor: 'pointer',
                }}>Xóa tất cả</button>
              </div>
              {history.map(item => (
                <FileRow key={item.filename + item.uploadedAt} item={item} onCopy={url => toast.push(`Đã copy: ${url}`, 'info')} />
              ))}
            </div>
          )}
        </div>

        {/* Right: WAF test checklist */}
        <div style={{
          background: '#fff', borderRadius: '12px',
          boxShadow: '0 1px 4px rgba(15,23,42,.07)', overflow: 'hidden',
        }}>
          <div style={{
            padding: '14px 16px', background: '#fef2f2',
            borderBottom: '1px solid #fecaca',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#ef4444' }}>⚠ WAF Test Checklist</h3>
            <span style={{
              fontSize: '11px', fontWeight: '700', color: checkedCount === WAF_TESTS.length ? '#10b981' : '#94a3b8',
            }}>{checkedCount}/{WAF_TESTS.length}</span>
          </div>

          <div style={{ padding: '8px 0' }}>
            {WAF_TESTS.map(t => (
              <label key={t.id} style={{
                display: 'flex', gap: '12px', padding: '12px 16px', cursor: 'pointer',
                borderBottom: '1px solid #f8fafc', transition: 'background .15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                <input
                  type="checkbox" checked={!!checked[t.id]} onChange={() => toggleCheck(t.id)}
                  style={{ marginTop: '2px', accentColor: t.color, flexShrink: 0 }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{
                      background: t.color, color: '#fff', fontSize: '10px',
                      fontWeight: '800', padding: '1px 7px', borderRadius: '99px',
                    }}>{t.label}</span>
                  </div>
                  <p style={{
                    fontSize: '11px', color: checked[t.id] ? '#94a3b8' : '#475569', lineHeight: 1.5,
                    textDecoration: checked[t.id] ? 'line-through' : 'none',
                  }}>{t.hint}</p>
                </div>
              </label>
            ))}
          </div>

          <div style={{ padding: '14px 16px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
            <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.6 }}>
              <strong style={{ color: '#64748b' }}>Lưu ý:</strong> Node.js không thực thi PHP.
              Mục đích là kiểm tra WAF có phát hiện và block các payload này không.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
