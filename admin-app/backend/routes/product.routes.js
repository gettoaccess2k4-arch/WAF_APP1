import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { readJson, writeJson } from '../utils/db.js';

const router = Router();
const guard  = [authenticate, requireAdmin];

// GET /api/products
router.get('/', guard, (req, res) => {
  res.json(readJson('products.json'));
});

// GET /api/products/:id
router.get('/:id', guard, (req, res) => {
  const product = readJson('products.json').find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  res.json(product);
});

// POST /api/products
router.post('/', guard, (req, res) => {
  const { name, description, price, stock, category, image } = req.body;
  if (!name || price === undefined) return res.status(400).json({ error: 'name and price are required.' });

  const products  = readJson('products.json');
  const newProduct = {
    id: `p${uuidv4().slice(0, 8)}`,
    name,
    description: description || '',
    price: +price,
    stock: +(stock || 0),
    category: category || 'Uncategorised',
    image: image || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  products.push(newProduct);
  writeJson('products.json', products);
  res.status(201).json(newProduct);
});

// PUT /api/products/:id
router.put('/:id', guard, (req, res) => {
  const products = readJson('products.json');
  const idx      = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found.' });

  products[idx] = { ...products[idx], ...req.body, updatedAt: new Date().toISOString() };
  writeJson('products.json', products);
  res.json(products[idx]);
});

// DELETE /api/products/:id
router.delete('/:id', guard, (req, res) => {
  const products = readJson('products.json');
  const filtered = products.filter(p => p.id !== req.params.id);
  if (filtered.length === products.length) return res.status(404).json({ error: 'Product not found.' });
  writeJson('products.json', filtered);
  res.json({ message: 'Product deleted.' });
});

export default router;
