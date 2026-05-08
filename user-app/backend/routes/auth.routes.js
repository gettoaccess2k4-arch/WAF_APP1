import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { readJson, writeJson } from '../utils/db.js';

const router = Router();

const ACCESS_SECRET  = process.env.ACCESS_TOKEN_SECRET  || 'user_access_secret_change_in_prod';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'user_refresh_secret_change_in_prod';

const ACCESS_TTL  = '15m';
const REFRESH_TTL = '7d';

function makeAccessToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username, role: user.role },
    ACCESS_SECRET,
    { expiresIn: ACCESS_TTL }
  );
}

function makeRefreshToken(user) {
  return jwt.sign(
    { sub: user.id },
    REFRESH_SECRET,
    { expiresIn: REFRESH_TTL }
  );
}

function setCookies(res, accessToken, refreshToken) {
  const cookieOpts = { httpOnly: true, sameSite: 'Strict', secure: process.env.NODE_ENV === 'production' };
  res.cookie('accessToken',  accessToken,  { ...cookieOpts, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email and password are required.' });
  }

  const users = readJson('users.json');
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ error: 'Email already registered.' });
  }

  const hash = await bcrypt.hash(password, 10);
  const newUser = { id: uuidv4(), username, email, password: hash, role: 'user', createdAt: new Date().toISOString(), refreshToken: null };
  users.push(newUser);
  writeJson('users.json', users);

  res.status(201).json({ message: 'Registration successful. Please log in.' });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const users = readJson('users.json');
  const user  = users.find(u => u.email === email && u.role === 'user');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const accessToken  = makeAccessToken(user);
  const refreshToken = makeRefreshToken(user);

  user.refreshToken = refreshToken;
  writeJson('users.json', users);

  setCookies(res, accessToken, refreshToken);
  res.json({ message: 'Logged in.', user: { id: user.id, username: user.username, role: user.role } });
});

// POST /api/auth/refresh
router.post('/refresh', (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ error: 'No refresh token.' });

  try {
    const decoded = jwt.verify(token, REFRESH_SECRET);
    const users   = readJson('users.json');
    const user    = users.find(u => u.id === decoded.sub && u.refreshToken === token);

    if (!user) return res.status(403).json({ error: 'Refresh token revoked or invalid.' });

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
import { authenticate } from '../middleware/auth.middleware.js';
router.get('/me', authenticate, (req, res) => {
  const users = readJson('users.json');
  const user  = users.find(u => u.id === req.user.sub);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const { password, refreshToken, ...safe } = user;
  res.json(safe);
});

export default router;
