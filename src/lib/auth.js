import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

/**
 * Generate JWT token for user
 */
export function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: '30d',
  });
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Hash password
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Get token from request headers
 * Next.js 14 App Router uses Web API Headers object
 */
export function getTokenFromRequest(req) {
  // Next.js 14 App Router: req.headers is a Headers object
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

/**
 * Middleware to verify authentication
 */
export async function requireAuth(req) {
  const token = getTokenFromRequest(req);
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) {
    throw new Error('Invalid or expired token');
  }

  return decoded.userId;
}

