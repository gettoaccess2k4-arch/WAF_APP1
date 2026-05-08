import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import * as C from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', C.register);
router.post('/login',    C.login);
router.post('/refresh',  C.refresh);
router.post('/logout',   C.logout);
router.get ('/me',       authenticate, C.me);

export default router;
