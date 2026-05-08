import multer  from 'multer';
import path    from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname   = dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR  = process.env.UPLOAD_DIR || path.resolve(__dirname, '../uploads');

// ⚠️  WAF TEST POINT #3 — Unrestricted File Upload / Web Shell
//
//  This multer config has:
//    • NO fileFilter  → accepts any MIME type
//    • NO extension whitelist → .php, .jsp, .phtml, .py, .sh all accepted
//    • Original filename preserved → predictable URL after upload
//    • Files served at /uploads/<filename> by Express static middleware
//
//  WAF should detect and block:
//    1. Content-Type: application/x-php or text/x-php
//    2. Filename ending in .php / .phtml / .jsp / .asp / .sh / .py
//    3. File body containing <?php / <%@ / <% Runtime.getRuntime() / eval(
//    4. Double-extension bypass: shell.php.jpg
//    5. Null-byte injection: shell.php%00.jpg
//
//  In this Node.js environment PHP won't execute, but:
//    • The upload + static-serve path is identical to what Apache/PHP stacks expose
//    • WAF rules operate on the HTTP request, not server execution
//    • Real-world test: upload shell.php, then GET /uploads/<filename>?cmd=id

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, file, cb) => {
    // Intentionally preserves original name (incl. dangerous extensions)
    const ts = Date.now();
    cb(null, `${ts}-${file.originalname}`);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },  // 10 MB — no type limit
  // fileFilter: deliberately omitted
});

export function uploadImage(req, res) {
  if (!req.file) return res.status(400).json({ error: 'No file received.' });

  res.json({
    message:      'File uploaded successfully.',
    filename:     req.file.filename,
    originalName: req.file.originalname,
    mimetype:     req.file.mimetype,
    size:         req.file.size,
    url:          `/uploads/${req.file.filename}`,
  });
}
