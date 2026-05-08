import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRoutes    from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import cartRoutes    from './routes/cart.routes.js';
import orderRoutes   from './routes/order.routes.js';

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://shop.waflab.local:3000',
  credentials: true,   // allow cookies to be sent cross-origin
}));

// ── Body / Cookie Parsing ─────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart',     cartRoutes);
app.use('/api/orders',   orderRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', app: 'user-app', port: PORT }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: err.message || 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`✔  User-App Backend  →  http://localhost:${PORT}`);
  console.log(`   Access tokens:    HttpOnly cookie (15 min)`);
  console.log(`   Refresh tokens:   HttpOnly cookie (7 days)`);
});
