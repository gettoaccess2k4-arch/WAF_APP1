import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { uploadMiddleware, uploadImage } from '../controllers/upload.controller.js';

const router = Router();

// ⚠️  WAF TEST POINT #3 — unrestricted file upload
// Only admin-authenticated requests, but no file-type validation whatsoever.
router.post('/image', authenticate, requireAdmin, uploadMiddleware.single('image'), uploadImage);

export default router;
