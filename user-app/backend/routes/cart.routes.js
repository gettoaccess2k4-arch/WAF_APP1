import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { readJson } from '../utils/db.js';

const router = Router();

// In-memory cart store (keyed by userId). Resets on server restart — good enough for lab.
const carts = {};

// GET /api/cart
router.get('/', authenticate, (req, res) => {
  const cart = carts[req.user.sub] || [];
  res.json(cart);
});

// POST /api/cart  — add item { productId, qty }
router.post('/', authenticate, (req, res) => {
  const { productId, qty = 1 } = req.body;
  if (!productId) return res.status(400).json({ error: 'productId is required.' });

  const products = readJson('products.json');
  const product  = products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ error: 'Product not found.' });

  if (!carts[req.user.sub]) carts[req.user.sub] = [];
  const cart    = carts[req.user.sub];
  const existing = cart.find(i => i.productId === productId);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ productId, name: product.name, price: product.price, qty });
  }

  res.json(cart);
});

// PUT /api/cart/:productId  — update qty
router.put('/:productId', authenticate, (req, res) => {
  const { qty } = req.body;
  const cart = carts[req.user.sub] || [];
  const item = cart.find(i => i.productId === req.params.productId);
  if (!item) return res.status(404).json({ error: 'Item not in cart.' });

  if (qty <= 0) {
    carts[req.user.sub] = cart.filter(i => i.productId !== req.params.productId);
  } else {
    item.qty = qty;
  }
  res.json(carts[req.user.sub]);
});

// DELETE /api/cart/:productId
router.delete('/:productId', authenticate, (req, res) => {
  const cart = carts[req.user.sub] || [];
  carts[req.user.sub] = cart.filter(i => i.productId !== req.params.productId);
  res.json(carts[req.user.sub]);
});

export default router;
