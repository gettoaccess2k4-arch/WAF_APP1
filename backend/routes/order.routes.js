import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import * as C from '../controllers/order.controller.js';

const router = Router();

router.get ('/stats',        authenticate, requireAdmin, C.stats);
router.get ('/',             authenticate, C.listOrders);
router.get ('/:id',          authenticate, C.getOrder);
router.post('/checkout',     authenticate, C.checkout);
router.put ('/:id/status',   authenticate, requireAdmin, C.updateStatus);

export default router;
