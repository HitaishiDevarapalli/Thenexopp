import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nexopp_enterprise_jwt_super_secret_key_2026';
const JWT_EXPIRES_IN = '7d';

/**
 * Hash a plain text password using bcryptjs with 10 salt rounds
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Verify a plain text password against a stored bcrypt hash
 */
export const verifyPassword = async (password, storedHash) => {
  return bcrypt.compare(password, storedHash);
};

/**
 * Generate Access and Refresh JWT Tokens
 */
export const generateTokens = (userPayload) => {
  const accessToken = jwt.sign(
    {
      id: userPayload.id,
      email: userPayload.email,
      role: userPayload.role,
      fullName: userPayload.fullName,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return { accessToken, expiresIn: '7 days' };
};

/**
 * Express Middleware to verify JWT Bearer Token
 */
export const authMiddleware = (req, res, next) => {
  let token = null;

  // Check Authorization Header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.auth_token) {
    // Check HTTP-Only Cookie
    token = req.cookies.auth_token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Token expired or invalid' });
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware
 */
export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
    }

    next();
  };
};

/**
 * Optional Express Middleware: Attaches req.user if valid token exists, but does not block requests if not present
 */
export const optionalAuthMiddleware = (req, res, next) => {
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.auth_token) {
    token = req.cookies.auth_token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (_) {
      // Ignore invalid or expired token for optional auth
    }
  }

  next();
};

