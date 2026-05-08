import { pool } from '../config/db.js';

// GET /api/users  (admin)
export async function listUsers(_req, res) {
  const { rows } = await pool.query(
    'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
  );
  res.json(rows);
}

// DELETE /api/users/:id  (admin)
export async function deleteUser(req, res) {
  const { rowCount } = await pool.query('DELETE FROM users WHERE id=$1 AND role!=\'admin\'', [req.params.id]);
  if (!rowCount) return res.status(404).json({ error: 'User not found or cannot delete admin.' });
  res.json({ message: 'User deleted.' });
}
