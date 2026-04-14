import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { hashPassword, verifyPassword } from './crypto.js';

describe('crypto module', () => {
  describe('hashPassword', () => {
    it('returns a hash string', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('generates different hashes for the same password', async () => {
      const password = 'testPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('handles long passwords', async () => {
      const longPassword = 'a'.repeat(100);
      const hash = await hashPassword(longPassword);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });
  });

  describe('verifyPassword', () => {
    it('returns true for correct password', async () => {
      const password = 'correctPassword123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('returns false for incorrect password', async () => {
      const password = 'correctPassword123';
      const wrongPassword = 'wrongPassword456';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });

    it('returns false for empty password against non-empty hash', async () => {
      const password = 'correctPassword123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('', hash);

      expect(isValid).toBe(false);
    });

    it('is case sensitive', async () => {
      const password = 'TestPassword123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('testpassword123', hash);

      expect(isValid).toBe(false);
    });

    it('handles special characters', async () => {
      const password = 'P@ssw0rd!#$%&*()';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });
  });
});
