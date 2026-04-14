import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { registerUser, loginUser, getUserById } from './service.js';
import db from '../db.js';

describe('auth service module', () => {
  // Clean up database before each test
  beforeEach(() => {
    db.exec('DELETE FROM users');
  });

  afterEach(() => {
    db.exec('DELETE FROM users');
  });

  describe('registerUser', () => {
    it('successfully registers a user with valid inputs', async () => {
      const email = 'test@example.com';
      const password = 'validPassword123';

      const result = await registerUser(email, password);

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.id).toBeDefined();
      expect(result.user.email).toBe(email);
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
    });

    it('returns a valid JWT token', async () => {
      const email = 'test@example.com';
      const password = 'validPassword123';

      const result = await registerUser(email, password);
      const tokenParts = result.token.split('.');

      expect(tokenParts).toHaveLength(3);
    });

    it('stores user in database with hashed password', async () => {
      const email = 'test@example.com';
      const password = 'validPassword123';

      await registerUser(email, password);

      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      expect(user).toBeDefined();
      expect(user.email).toBe(email);
      expect(user.password_hash).toBeDefined();
      expect(user.password_hash).not.toBe(password);
    });

    it('normalizes email to lowercase', async () => {
      const email = 'Test@EXAMPLE.com';
      const password = 'validPassword123';

      const result = await registerUser(email, password);

      expect(result.user.email).toBe('test@example.com');
    });

    it('trims whitespace from email', async () => {
      const email = '  test@example.com  ';
      const password = 'validPassword123';

      const result = await registerUser(email, password);

      expect(result.user.email).toBe('test@example.com');
    });

    it('rejects duplicate email with 409 status', async () => {
      const email = 'test@example.com';
      const password = 'validPassword123';

      await registerUser(email, password);

      try {
        await registerUser(email, 'anotherPassword456');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.status).toBe(409);
        expect(error.message).toBe('Email already registered');
      }
    });

    it('rejects duplicate email regardless of case', async () => {
      const email = 'test@example.com';
      const password = 'validPassword123';

      await registerUser(email, password);

      try {
        await registerUser('TEST@EXAMPLE.COM', 'anotherPassword456');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.status).toBe(409);
        expect(error.message).toBe('Email already registered');
      }
    });

    it('rejects password shorter than 8 characters with 400 status', async () => {
      const email = 'test@example.com';
      const password = 'short1';

      try {
        await registerUser(email, password);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.status).toBe(400);
        expect(error.message).toContain('at least 8 characters');
      }
    });

    it('rejects exactly 7 character password', async () => {
      const email = 'test@example.com';
      const password = 'pass123';

      try {
        await registerUser(email, password);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.status).toBe(400);
      }
    });

    it('accepts exactly 8 character password', async () => {
      const email = 'test@example.com';
      const password = 'pass1234';

      const result = await registerUser(email, password);
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
    });

    it('rejects missing email with 400 status', async () => {
      const password = 'validPassword123';

      try {
        await registerUser('', password);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.status).toBe(400);
        expect(error.message).toContain('required');
      }
    });

    it('rejects missing password with 400 status', async () => {
      const email = 'test@example.com';

      try {
        await registerUser(email, '');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.status).toBe(400);
        expect(error.message).toContain('required');
      }
    });

    it('rejects invalid email format', async () => {
      const password = 'validPassword123';

      try {
        await registerUser('notanemail', password);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.status).toBe(400);
        expect(error.message).toContain('Invalid email format');
      }
    });

    it('rejects email without domain', async () => {
      const password = 'validPassword123';

      try {
        await registerUser('test@example', password);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.status).toBe(400);
      }
    });

    it('rejects email with spaces', async () => {
      const password = 'validPassword123';

      try {
        await registerUser('test @example.com', password);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.status).toBe(400);
      }
    });
  });

  describe('loginUser', () => {
    it('successfully logs in user with correct credentials', async () => {
      const email = 'test@example.com';
      const password = 'validPassword123';

      await registerUser(email, password);
      const result = await loginUser(email, password);

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.id).toBeDefined();
      expect(result.user.email).toBe(email);
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
    });

    it('returns a valid JWT token on successful login', async () => {
      const email = 'test@example.com';
      const password = 'validPassword123';

      await registerUser(email, password);
      const result = await loginUser(email, password);
      const tokenParts = result.token.split('.');

      expect(tokenParts).toHaveLength(3);
    });

    it('rejects login with wrong password (401 status)', async () => {
      const email = 'test@example.com';
      const password = 'validPassword123';

      await registerUser(email, password);

      try {
        await loginUser(email, 'wrongPassword456');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.status).toBe(401);
        expect(error.message).toContain('Invalid email or password');
      }
    });

    it('rejects login with non-existent email (401 status)', async () => {
      try {
        await loginUser('nonexistent@example.com', 'somePassword123');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.status).toBe(401);
        expect(error.message).toContain('Invalid email or password');
      }
    });

    it('normalizes email to lowercase', async () => {
      const email = 'test@example.com';
      const password = 'validPassword123';

      await registerUser(email, password);
      const result = await loginUser('TEST@EXAMPLE.COM', password);

      expect(result.user.email).toBe('test@example.com');
    });

    it('trims whitespace from email', async () => {
      const email = 'test@example.com';
      const password = 'validPassword123';

      await registerUser(email, password);
      const result = await loginUser('  test@example.com  ', password);

      expect(result.user.email).toBe('test@example.com');
    });

    it('rejects missing email with 400 status', async () => {
      const password = 'validPassword123';

      try {
        await loginUser('', password);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.status).toBe(400);
        expect(error.message).toContain('required');
      }
    });

    it('rejects missing password with 400 status', async () => {
      const email = 'test@example.com';

      try {
        await loginUser(email, '');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.status).toBe(400);
        expect(error.message).toContain('required');
      }
    });

    it('does not expose whether email exists to prevent user enumeration', async () => {
      const email = 'test@example.com';
      const password = 'validPassword123';

      await registerUser(email, password);

      try {
        await loginUser('nonexistent@example.com', password);
      } catch (error1) {
        try {
          await loginUser(email, 'wrongPassword');
        } catch (error2) {
          expect(error1.message).toBe(error2.message);
        }
      }
    });

    it('can login multiple times with same credentials', async () => {
      const email = 'test@example.com';
      const password = 'validPassword123';

      await registerUser(email, password);
      const result1 = await loginUser(email, password);
      const result2 = await loginUser(email, password);

      expect(result1.user.id).toBe(result2.user.id);
      // Tokens should be valid JWTs (structure-wise)
      expect(result1.token.split('.')).toHaveLength(3);
      expect(result2.token.split('.')).toHaveLength(3);
    });
  });

  describe('getUserById', () => {
    it('returns user by ID', async () => {
      const email = 'test@example.com';
      const password = 'validPassword123';

      const registered = await registerUser(email, password);
      const user = getUserById(registered.user.id);

      expect(user).toBeDefined();
      expect(user.id).toBe(registered.user.id);
      expect(user.email).toBe(email);
    });

    it('returns null for non-existent user ID', async () => {
      const user = getUserById(99999);

      expect(user).toBeUndefined();
    });

    it('includes created_at timestamp', async () => {
      const email = 'test@example.com';
      const password = 'validPassword123';

      const registered = await registerUser(email, password);
      const user = getUserById(registered.user.id);

      expect(user.created_at).toBeDefined();
      expect(typeof user.created_at).toBe('string');
    });

    it('does not include password_hash in result', async () => {
      const email = 'test@example.com';
      const password = 'validPassword123';

      const registered = await registerUser(email, password);
      const user = getUserById(registered.user.id);

      expect(user.password_hash).toBeUndefined();
    });
  });
});
