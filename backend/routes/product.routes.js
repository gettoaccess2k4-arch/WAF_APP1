import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import * as C from '../controllers/product.controller.js';

const router = Router();
const admin  = [authenticate, requireAdmin];

router.get  ('/search',     C.searchProducts);    // ⚠️ XSS test point
router.get  ('/vuln',       C.vulnGetProduct);    // ⚠️ SQLi test point
router.get  ('/slug/:slug', C.getProductBySlug);
router.get  ('/',           C.listProducts);
router.get  ('/:id',        C.getProduct);
router.post ('/',      admin, C.createProduct);
router.put  ('/:id',   admin, C.updateProduct);
router.delete('/:id',  admin, C.deleteProduct);

export default router;
