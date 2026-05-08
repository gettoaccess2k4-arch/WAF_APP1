import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import * as C from '../controllers/user.controller.js';

const router = Router();
router.get   ('/',    authenticate, requireAdmin, C.listUsers);
router.delete('/:id', authenticate, requireAdmin, C.deleteUser);
export default router;
