import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || 'user_access_secret_change_in_prod';

/**
 * Verifies the HttpOnly access token cookie.
 * Attaches decoded payload to req.user on success.
 */
export function authenticate(req, res, next) {
  const token = req.cookies?.accessToken;
  if (!token) {
    return res.status(401).json({ error: 'No access token — please log in.' });
  }

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Access token expired.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(403).json({ error: 'Invalid access token.' });
  }
}

/**
 * Allows only users with role === 'user'.
 * Must be used AFTER authenticate().
 */
export function requireUser(req, res, next) {
  if (!req.user || req.user.role !== 'user') {
    return res.status(403).json({ error: 'Forbidden — user role required.' });
  }
  next();
}

/**
 * Allows any authenticated user (user or admin).
 * Must be used AFTER authenticate().
 */
export function requireAnyRole(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  next();
}
