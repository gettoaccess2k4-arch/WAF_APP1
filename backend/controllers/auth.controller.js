import bcrypt   from 'bcrypt';
import jwt      from 'jsonwebtoken';
import { pool } from '../config/db.js';

const ACCESS_SECRET  = process.env.ACCESS_TOKEN_SECRET  || 'waflab_access_secret_2024';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'waflab_refresh_secret_2024';

function makeTokens(user) {
  const payload     = { sub: user.id, username: user.username, role: user.role };
  const accessToken = jwt.sign(payload, ACCESS_SECRET,  { expiresIn: '15m' });
  const refreshToken= jwt.sign({ sub: user.id }, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

function setCookies(res, access, refresh) {
  const base = { httpOnly: true, sameSite: 'Lax', secure: process.env.NODE_ENV === 'production' };
  res.cookie('accessToken',  access,  { ...base, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refresh, { ...base, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

// POST /api/auth/register
export async function register(req, res) {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: 'username, email, password required.' });

  const hash = await bcrypt.hash(password, 10);
  try {
    await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1,$2,$3)',
      [username, email, hash]
    );
    res.status(201).json({ message: 'Registration successful.' });
  } catch (err) {
    if (err.code === '23505')
      return res.status(409).json({ error: 'Email or username already taken.' });
    throw err;
  }
}

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.body;
  const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
  const user = rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    return res.status(401).json({ error: 'Invalid email or password.' });

  const { accessToken, refreshToken } = makeTokens(user);
  await pool.query('UPDATE users SET refresh_token=$1 WHERE id=$2', [refreshToken, user.id]);

  setCookies(res, accessToken, refreshToken);
  res.json({ message: 'Logged in.', user: { id: user.id, username: user.username, role: user.role, email: user.email } });
}

// POST /api/auth/refresh
export async function refresh(req, res) {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ error: 'No refresh token.' });

  const decoded = jwt.verify(token, REFRESH_SECRET);
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE id=$1 AND refresh_token=$2',
    [decoded.sub, token]
  );
  const user = rows[0];
  if (!user) return res.status(403).json({ error: 'Refresh token revoked.' });

  const { accessToken, refreshToken } = makeTokens(user);
  await pool.query('UPDATE users SET refresh_token=$1 WHERE id=$2', [refreshToken, user.id]);
  setCookies(res, accessToken, refreshToken);
  res.json({ message: 'Tokens refreshed.' });
}

// POST /api/auth/logout
export async function logout(req, res) {
  const token = req.cookies?.refreshToken;
  if (token) {
    await pool.query('UPDATE users SET refresh_token=NULL WHERE refresh_token=$1', [token]);
  }
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out.' });
}

// GET /api/auth/me
export async function me(req, res) {
  const { rows } = await pool.query(
    'SELECT id, username, email, role, created_at FROM users WHERE id=$1',
    [req.user.sub]
  );
  if (!rows[0]) return res.status(404).json({ error: 'User not found.' });
  res.json(rows[0]);
}
