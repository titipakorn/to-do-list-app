import db from '$lib/server/db.js';
import { hashPassword, verifyPassword } from './crypto.js';
import { signToken } from './jwt.js';

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User object with JWT token
 * @throws {Object} Error object with message and status code
 */
export async function registerUser(email, password) {
  if (!email || !password) {
    throw { message: 'Email and password are required', status: 400 };
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw { message: 'Invalid email format', status: 400 };
  }

  // Check if user already exists
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    throw { message: 'Email already registered', status: 409 };
  }

  try {
    const password_hash = await hashPassword(password);
    const result = db
      .prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
      .run(email, password_hash);

    const user = {
      id: result.lastInsertRowid,
      email
    };

    const token = signToken({ id: user.id, email: user.email });

    return {
      user,
      token
    };
  } catch (error) {
    throw { message: 'Registration failed', status: 500 };
  }
}

/**
 * Login a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User object with JWT token
 * @throws {Object} Error object with message and status code
 */
export async function loginUser(email, password) {
  if (!email || !password) {
    throw { message: 'Email and password are required', status: 400 };
  }

  const user = db.prepare('SELECT id, email, password_hash FROM users WHERE email = ?').get(email);

  if (!user) {
    throw { message: 'Invalid email or password', status: 401 };
  }

  const passwordMatch = await verifyPassword(password, user.password_hash);

  if (!passwordMatch) {
    throw { message: 'Invalid email or password', status: 401 };
  }

  const token = signToken({ id: user.id, email: user.email });

  return {
    user: {
      id: user.id,
      email: user.email
    },
    token
  };
}

/**
 * Get user by ID
 * @param {number} userId - User ID
 * @returns {Object|null} User object or null if not found
 */
export function getUserById(userId) {
  return db.prepare('SELECT id, email, created_at FROM users WHERE id = ?').get(userId);
}
