import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { readJson, writeJson } from '../utils/db.js';

const router = Router();
const guard  = [authenticate, requireAdmin];

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

// GET /api/orders
router.get('/', guard, (req, res) => {
  const { status, userId } = req.query;
  let orders = readJson('orders.json');
  if (status)  orders = orders.filter(o => o.status === status);
  if (userId)  orders = orders.filter(o => o.userId === userId);
  res.json(orders);
});

// GET /api/orders/:id
router.get('/:id', guard, (req, res) => {
  const order = readJson('orders.json').find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  res.json(order);
});

// PUT /api/orders/:id/status
router.put('/:id/status', guard, (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  const orders = readJson('orders.json');
  const idx    = orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Order not found.' });

  orders[idx].status    = status;
  orders[idx].updatedAt = new Date().toISOString();
  writeJson('orders.json', orders);
  res.json(orders[idx]);
});

// DELETE /api/orders/:id
router.delete('/:id', guard, (req, res) => {
  const orders   = readJson('orders.json');
  const filtered = orders.filter(o => o.id !== req.params.id);
  if (filtered.length === orders.length) return res.status(404).json({ error: 'Order not found.' });
  writeJson('orders.json', filtered);
  res.json({ message: 'Order deleted.' });
});

export default router;
