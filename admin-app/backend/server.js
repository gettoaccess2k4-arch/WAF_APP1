import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import authRoutes    from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes   from './routes/order.routes.js';
import uploadRoutes  from './routes/upload.routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app  = express();
const PORT = process.env.PORT || 5001;

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://admin.waflab.local:3001',
  credentials: true,
}));

// ── Body / Cookie Parsing ─────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Static: serve uploaded files ──────────────────────────────────────────────
// ⚠️  WAF TEST POINT — Serves uploaded files (including potential web shells) statically.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/upload',   uploadRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', app: 'admin-app', port: PORT }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: err.message || 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`✔  Admin-App Backend  →  http://localhost:${PORT}`);
  console.log(`   Access tokens:     HttpOnly cookie (15 min)`);
  console.log(`   Refresh tokens:    HttpOnly cookie (7 days)`);
  console.log(`   WAF test points:`);
  console.log(`     XSS:       GET /api/products/search?q=<payload>    (user-app)`);
  console.log(`     WebShell:  POST /api/upload/image  (admin-app)`);
});
