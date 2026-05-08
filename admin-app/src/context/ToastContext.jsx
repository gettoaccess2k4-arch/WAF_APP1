import { createContext, useContext, useState, useCallback } from 'react';

const Ctx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3800);
  }, []);

  const ICON = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const COLOR = {
    success: { bg: '#ecfdf5', border: '#6ee7b7', text: '#065f46' },
    error:   { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b' },
    warning: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e' },
    info:    { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af' },
  };

  return (
    <Ctx.Provider value={{ toast: push }}>
      {children}
      <div style={{ position:'fixed', bottom:'24px', right:'24px', zIndex:9999, display:'flex', flexDirection:'column', gap:'8px', pointerEvents:'none' }}>
        {toasts.map(t => {
          const c = COLOR[t.type] || COLOR.info;
          return (
            <div key={t.id} style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text, borderRadius:'10px', padding:'12px 16px', display:'flex', alignItems:'center', gap:'10px', fontSize:'13px', fontWeight:'600', boxShadow:'0 4px 20px rgba(0,0,0,.12)', minWidth:'280px', maxWidth:'380px', animation:'slideInRight .3s ease forwards', pointerEvents:'all' }}>
              <span>{ICON[t.type]}</span>
              <span style={{ flex:1 }}>{t.message}</span>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
