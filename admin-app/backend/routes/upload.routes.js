import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

const router    = Router();
const __dirname = dirname(fileURLToPath(import.meta.url));

// ⚠️  WAF TEST POINT — Web Shell / Unrestricted File Upload:
//
//  Multer is configured with NO extension or MIME-type filtering.
//  An attacker can upload a .php / .jsp / .js file (web shell) and
//  the server saves it to the public uploads/ directory.
//
//  A WAF should:
//    1. Block requests whose Content-Type is not image/*
//    2. Block filenames ending in .php, .phtml, .jsp, .asp, .js, .sh, etc.
//    3. Block file content matching known web-shell signatures (e.g. <?php, eval(, exec()
//
//  DO NOT deploy this in production. Lab use only.

const storage = multer.diskStorage({
  destination: path.resolve(__dirname, '../uploads'),
  filename: (_req, file, cb) => {
    // Preserves original filename, including dangerous extensions — intentional for WAF testing.
    const unique = `${Date.now()}-${file.originalname}`;
    cb(null, unique);
  },
});

// No fileFilter → accepts any file type.
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// POST /api/upload/image
router.post('/image', authenticate, requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

  res.json({
    message: 'File uploaded.',
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    url: `/uploads/${req.file.filename}`,
  });
});

export default router;
