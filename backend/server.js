import express             from 'express';
import cookieParser        from 'cookie-parser';
import cors                from 'cors';
import path                from 'path';
import { fileURLToPath }   from 'url';
import { testConnection }  from './config/db.js';
import { hostLogger }      from './middleware/host.middleware.js';
import authRoutes          from './routes/auth.routes.js';
import productRoutes       from './routes/product.routes.js';
import categoryRoutes      from './routes/category.routes.js';
import orderRoutes         from './routes/order.routes.js';
import userRoutes          from './routes/user.routes.js';
import uploadRoutes        from './routes/upload.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://shop.lab.local',
    'http://admin.lab.local',
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  credentials: true,
}));

// ── Parsers ───────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Static uploads (WAF test: web-shell access path) ─────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Request logger with Host header (WAF application mapping) ────────────────
app.use(hostLogger);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/upload',     uploadRoutes);

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', service: 'waflab-backend', port: PORT })
);

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({ error: err.message });
});

// ── Boot ──────────────────────────────────────────────────────────────────────
async function boot() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`\n✔  WAFLab Backend  →  http://localhost:${PORT}`);
    console.log(`   WAF test points:`);
    console.log(`     [XSS]    GET  /api/products/search?q=<payload>`);
    console.log(`     [SQLi]   GET  /api/products/vuln?id=<payload>`);
    console.log(`     [Shell]  POST /api/upload/image  (no file validation)\n`);
  });
}
boot().catch(err => { console.error('Boot failed:', err); process.exit(1); });
