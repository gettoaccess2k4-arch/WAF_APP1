import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { readJson, writeJson } from '../utils/db.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

const ACCESS_SECRET  = process.env.ACCESS_TOKEN_SECRET  || 'admin_access_secret_change_in_prod';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'admin_refresh_secret_change_in_prod';

function makeAccessToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username, role: user.role },
    ACCESS_SECRET,
    { expiresIn: '15m' }
  );
}

function makeRefreshToken(user) {
  return jwt.sign({ sub: user.id }, REFRESH_SECRET, { expiresIn: '7d' });
}

function setCookies(res, access, refresh) {
  const base = { httpOnly: true, sameSite: 'Strict', secure: process.env.NODE_ENV === 'production' };
  res.cookie('accessToken',  access,  { ...base, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refresh, { ...base, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

// POST /api/auth/login  — admin only
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const users = readJson('users.json');
  const user  = users.find(u => u.email === email && u.role === 'admin');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials or insufficient role.' });
  }

  const access  = makeAccessToken(user);
  const refresh = makeRefreshToken(user);
  user.refreshToken = refresh;
  writeJson('users.json', users);

  setCookies(res, access, refresh);
  res.json({ message: 'Admin logged in.', user: { id: user.id, username: user.username, role: user.role } });
});

// POST /api/auth/refresh
router.post('/refresh', (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ error: 'No refresh token.' });

  try {
    const decoded = jwt.verify(token, REFRESH_SECRET);
    const users   = readJson('users.json');
    const user    = users.find(u => u.id === decoded.sub && u.refreshToken === token && u.role === 'admin');
    if (!user) return res.status(403).json({ error: 'Refresh token invalid.' });

    const newAccess  = makeAccessToken(user);
    const newRefresh = makeRefreshToken(user);
    user.refreshToken = newRefresh;
    writeJson('users.json', users);

    setCookies(res, newAccess, newRefresh);
    res.json({ message: 'Tokens refreshed.' });
  } catch {
    res.status(403).json({ error: 'Invalid or expired refresh token.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    const users = readJson('users.json');
    const user  = users.find(u => u.refreshToken === token);
    if (user) { user.refreshToken = null; writeJson('users.json', users); }
  }
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out.' });
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  const users = readJson('users.json');
  const user  = users.find(u => u.id === req.user.sub);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const { password, refreshToken, ...safe } = user;
  res.json(safe);
});

export default router;
