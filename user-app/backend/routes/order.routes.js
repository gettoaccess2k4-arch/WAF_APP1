import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.middleware.js';
import { readJson, writeJson } from '../utils/db.js';

const router = Router();
const carts = {};  // shared ref — in production, import from cart.routes.js

// GET /api/orders — user's own orders
router.get('/', authenticate, (req, res) => {
  const orders = readJson('orders.json');
  const mine   = orders.filter(o => o.userId === req.user.sub);
  res.json(mine);
});

// GET /api/orders/:id
router.get('/:id', authenticate, (req, res) => {
  const orders = readJson('orders.json');
  const order  = orders.find(o => o.id === req.params.id && o.userId === req.user.sub);
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  res.json(order);
});

// POST /api/orders/checkout  — create order from cart body
router.post('/checkout', authenticate, (req, res) => {
  const { items, shippingAddress } = req.body;
  if (!items || items.length === 0) return res.status(400).json({ error: 'Cart is empty.' });
  if (!shippingAddress) return res.status(400).json({ error: 'shippingAddress is required.' });

  const products = readJson('products.json');
  const orderItems = items.map(item => {
    const product = products.find(p => p.id === item.productId);
    if (!product) throw new Error(`Product ${item.productId} not found.`);
    return { productId: item.productId, name: product.name, price: product.price, qty: item.qty };
  });

  const total = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const newOrder = {
    id: `o${uuidv4().slice(0, 8)}`,
    userId: req.user.sub,
    items: orderItems,
    total: +total.toFixed(2),
    status: 'pending',
    shippingAddress,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const orders = readJson('orders.json');
  orders.push(newOrder);
  writeJson('orders.json', orders);

  res.status(201).json(newOrder);
});

export default router;
