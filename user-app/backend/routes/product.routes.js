import { Router } from 'express';
import { readJson } from '../utils/db.js';

const router = Router();

// GET /api/products  — list all products
router.get('/', (req, res) => {
  const products = readJson('products.json');
  res.json(products);
});

// GET /api/products/search?q=keyword
// ⚠️  WAF TEST POINT — XSS: query param is reflected in response WITHOUT sanitization.
// A WAF should block payloads like: <script>alert(1)</script> or "><img src=x onerror=alert(1)>
router.get('/search', (req, res) => {
  const q = req.query.q || '';               // raw, unsanitised input
  const products = readJson('products.json');

  const results = products.filter(p =>
    p.name.toLowerCase().includes(q.toLowerCase()) ||
    p.description.toLowerCase().includes(q.toLowerCase())
  );

  // Intentional reflection: q is embedded in the response without escaping.
  res.json({
    query: q,           // ← reflected XSS vector
    count: results.length,
    results,
  });
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const products = readJson('products.json');
  const product  = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  res.json(product);
});

export default router;
