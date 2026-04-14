import db from '$lib/server/db.js';
import { hashPassword, verifyPassword } from './crypto.js';
import { signToken } from './jwt.js';

const MIN_PASSWORD_LENGTH = 8;

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

  // Normalize email: lowercase and trim whitespace
  const normalizedEmail = email.toLowerCase().trim();

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw { message: 'Invalid email format', status: 400 };
  }

  // Validate password length
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw {
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
      status: 400
    };
  }

  // Check if user already exists
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
  if (existing) {
    throw { message: 'Email already registered', status: 409 };
  }

  try {
    const password_hash = await hashPassword(password);
    const result = db
      .prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
      .run(normalizedEmail, password_hash);

    const user = {
      id: result.lastInsertRowid,
      email: normalizedEmail
    };

    const token = signToken({ id: user.id, email: user.email });

    return {
      user,
      token
    };
  } catch (error) {
    // Only catch database constraint violations
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      throw { message: 'Email already registered', status: 409 };
    }
    // Re-throw other database errors
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

  // Normalize email: lowercase and trim whitespace
  const normalizedEmail = email.toLowerCase().trim();

  const user = db.prepare('SELECT id, email, password_hash FROM users WHERE email = ?').get(normalizedEmail);

  // Prevent timing attack: if user not found, still run bcrypt comparison with dummy hash
  let passwordMatch = false;
  if (user) {
    try {
      passwordMatch = await verifyPassword(password, user.password_hash);
    } catch (error) {
      // If bcrypt comparison fails, treat as invalid credentials
      passwordMatch = false;
    }
  } else {
    // Perform dummy bcrypt comparison to prevent timing attack
    try {
      await verifyPassword(password, '$2b$10$invalidhashfortimingattackprevention1234567890');
    } catch (error) {
      // Expected to fail, but maintains consistent timing
    }
  }

  if (!user || !passwordMatch) {
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
