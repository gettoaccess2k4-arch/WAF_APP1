import { pool } from '../config/db.js';

export async function listCategories(_req, res) {
  const { rows } = await pool.query('SELECT * FROM categories ORDER BY sort_order');
  res.json(rows);
}

export async function createCategory(req, res) {
  const { name, slug, icon, sort_order } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO categories (name,slug,icon,sort_order) VALUES ($1,$2,$3,$4) RETURNING *',
    [name, slug, icon || '📦', sort_order || 0]
  );
  res.status(201).json(rows[0]);
}
