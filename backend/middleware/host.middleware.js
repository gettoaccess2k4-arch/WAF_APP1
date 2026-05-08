/**
 * Logs Host header for WAF application-mapping tests.
 * Attaches req.appSource = 'user' | 'admin' | 'unknown'
 * so controllers can restrict endpoints by origin.
 */
export function hostLogger(req, res, next) {
  const host      = req.hostname || req.headers.host || '';
  const appSource = req.headers['x-app-source'] ||
                    (host.startsWith('admin') ? 'admin' : 'user');

  req.appSource = appSource;
  console.log(`[${new Date().toISOString()}] ${req.method} ${host}${req.path}  source=${appSource}`);
  next();
}
