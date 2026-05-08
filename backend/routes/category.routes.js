import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import * as C from '../controllers/category.controller.js';

const router = Router();
router.get ('/',  C.listCategories);
router.post('/',  authenticate, requireAdmin, C.createCategory);
export default router;
