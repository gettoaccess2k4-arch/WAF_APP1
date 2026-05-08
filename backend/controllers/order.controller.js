import { pool } from '../config/db.js';

// GET /api/orders  (user sees own; admin sees all)
export async function listOrders(req, res) {
  let query, params;
  if (req.user.role === 'admin') {
    const { status } = req.query;
    query  = status
      ? `SELECT o.*, u.username, u.email FROM orders o JOIN users u ON u.id=o.user_id WHERE o.status=$1 ORDER BY o.created_at DESC`
      : `SELECT o.*, u.username, u.email FROM orders o JOIN users u ON u.id=o.user_id ORDER BY o.created_at DESC`;
    params = status ? [status] : [];
  } else {
    query  = `SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC`;
    params = [req.user.sub];
  }

  const { rows: orders } = await pool.query(query, params);

  // Attach items to each order
  for (const order of orders) {
    const { rows } = await pool.query(
      'SELECT * FROM order_items WHERE order_id=$1', [order.id]
    );
    order.items = rows;
  }
  res.json(orders);
}

// GET /api/orders/:id
export async function getOrder(req, res) {
  const { rows } = await pool.query('SELECT * FROM orders WHERE id=$1', [req.params.id]);
  const order = rows[0];
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  if (req.user.role !== 'admin' && order.user_id !== req.user.sub)
    return res.status(403).json({ error: 'Access denied.' });

  const { rows: items } = await pool.query('SELECT * FROM order_items WHERE order_id=$1', [order.id]);
  order.items = items;
  res.json(order);
}

// POST /api/orders/checkout
export async function checkout(req, res) {
  const { items, shippingAddress } = req.body;
  if (!items?.length)    return res.status(400).json({ error: 'Cart is empty.' });
  if (!shippingAddress)  return res.status(400).json({ error: 'shippingAddress required.' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let total = 0;
    const resolved = [];

    for (const item of items) {
      const { rows } = await client.query(
        'SELECT id, name, price, stock FROM products WHERE id=$1', [item.productId]
      );
      const p = rows[0];
      if (!p) throw Object.assign(new Error(`Product ${item.productId} not found.`), { status: 404 });
      if (p.stock < item.qty) throw Object.assign(new Error(`Not enough stock for ${p.name}.`), { status: 400 });
      total += p.price * item.qty;
      resolved.push({ ...p, qty: item.qty });
    }

    const { rows: [order] } = await client.query(
      `INSERT INTO orders (user_id,total,status,shipping_address) VALUES ($1,$2,'pending',$3) RETURNING *`,
      [req.user.sub, total.toFixed(2), JSON.stringify(shippingAddress)]
    );

    for (const p of resolved) {
      await client.query(
        'INSERT INTO order_items (order_id,product_id,name,price,quantity) VALUES ($1,$2,$3,$4,$5)',
        [order.id, p.id, p.name, p.price, p.qty]
      );
      await client.query(
        'UPDATE products SET stock=stock-$1 WHERE id=$2', [p.qty, p.id]
      );
    }

    await client.query('COMMIT');
    order.items = resolved;
    res.status(201).json(order);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// PUT /api/orders/:id/status  (admin)
export async function updateStatus(req, res) {
  const VALID = ['pending','processing','shipped','delivered','cancelled'];
  const { status } = req.body;
  if (!VALID.includes(status))
    return res.status(400).json({ error: `status must be: ${VALID.join(', ')}` });

  const { rows } = await pool.query(
    `UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
    [status, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Order not found.' });
  res.json(rows[0]);
}

// GET /api/orders/stats  (admin dashboard)
export async function stats(_req, res) {
  const [revenue, byStatus, daily] = await Promise.all([
    pool.query(`SELECT COALESCE(SUM(total),0) AS total, COUNT(*) AS count FROM orders WHERE status != 'cancelled'`),
    pool.query(`SELECT status, COUNT(*) AS count FROM orders GROUP BY status`),
    pool.query(`
      SELECT DATE(created_at) AS day, COALESCE(SUM(total),0) AS revenue, COUNT(*) AS orders
      FROM orders WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY day ORDER BY day
    `),
  ]);
  res.json({
    totalRevenue: revenue.rows[0].total,
    totalOrders:  revenue.rows[0].count,
    byStatus:     byStatus.rows,
    daily:        daily.rows,
  });
}
