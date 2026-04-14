import { describe, it, expect, beforeAll } from 'vitest';
import { signToken, verifyToken, extractToken } from './jwt.js';

describe('jwt module', () => {
  describe('signToken', () => {
    it('returns a string token', () => {
      const payload = { id: 1, email: 'test@example.com' };
      const token = signToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('creates valid JWT with three parts (header.payload.signature)', () => {
      const payload = { id: 1, email: 'test@example.com' };
      const token = signToken(payload);
      const parts = token.split('.');

      expect(parts).toHaveLength(3);
      expect(parts[0]).toBeDefined(); // header
      expect(parts[1]).toBeDefined(); // payload
      expect(parts[2]).toBeDefined(); // signature
    });

    it('encodes different payloads differently', () => {
      const payload1 = { id: 1, email: 'test1@example.com' };
      const payload2 = { id: 2, email: 'test2@example.com' };
      const token1 = signToken(payload1);
      const token2 = signToken(payload2);

      expect(token1).not.toBe(token2);
    });

    it('includes payload data in token', () => {
      const payload = { id: 123, email: 'test@example.com' };
      const token = signToken(payload);
      const decoded = verifyToken(token);

      expect(decoded).toMatchObject(payload);
    });
  });

  describe('verifyToken', () => {
    it('decodes a valid token', () => {
      const payload = { id: 1, email: 'test@example.com' };
      const token = signToken(payload);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(1);
      expect(decoded.email).toBe('test@example.com');
    });

    it('returns null for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const decoded = verifyToken(invalidToken);

      expect(decoded).toBeNull();
    });

    it('returns null for malformed token', () => {
      const malformedToken = 'notavalidjwt';
      const decoded = verifyToken(malformedToken);

      expect(decoded).toBeNull();
    });

    it('returns null for empty string', () => {
      const decoded = verifyToken('');

      expect(decoded).toBeNull();
    });

    it('returns null for tampered token', () => {
      const payload = { id: 1, email: 'test@example.com' };
      const token = signToken(payload);
      const tamperedToken = token.slice(0, -5) + 'XXXXX';
      const decoded = verifyToken(tamperedToken);

      expect(decoded).toBeNull();
    });

    it('includes exp (expiration) in decoded payload', () => {
      const payload = { id: 1, email: 'test@example.com' };
      const token = signToken(payload);
      const decoded = verifyToken(token);

      expect(decoded).toHaveProperty('exp');
      expect(typeof decoded.exp).toBe('number');
    });

    it('includes iat (issued at) in decoded payload', () => {
      const payload = { id: 1, email: 'test@example.com' };
      const token = signToken(payload);
      const decoded = verifyToken(token);

      expect(decoded).toHaveProperty('iat');
      expect(typeof decoded.iat).toBe('number');
    });
  });

  describe('extractToken', () => {
    it('extracts token from valid Bearer header', () => {
      const token = 'mytoken123';
      const authHeader = `Bearer ${token}`;
      const extracted = extractToken(authHeader);

      expect(extracted).toBe(token);
    });

    it('returns null for missing Bearer prefix', () => {
      const token = 'mytoken123';
      const authHeader = token;
      const extracted = extractToken(authHeader);

      expect(extracted).toBeNull();
    });

    it('returns null for null/undefined header', () => {
      expect(extractToken(null)).toBeNull();
      expect(extractToken(undefined)).toBeNull();
    });

    it('returns null for empty header', () => {
      const extracted = extractToken('');

      expect(extracted).toBeNull();
    });

    it('returns null for header with wrong prefix', () => {
      const token = 'mytoken123';
      const authHeader = `Basic ${token}`;
      const extracted = extractToken(authHeader);

      expect(extracted).toBeNull();
    });

    it('returns null for header with extra spaces', () => {
      const token = 'mytoken123';
      const authHeader = `Bearer  ${token}`;
      const extracted = extractToken(authHeader);

      expect(extracted).toBeNull();
    });

    it('returns null for header with too many parts', () => {
      const token = 'mytoken123';
      const authHeader = `Bearer ${token} extra`;
      const extracted = extractToken(authHeader);

      expect(extracted).toBeNull();
    });

    it('is case sensitive for Bearer prefix', () => {
      const token = 'mytoken123';
      const authHeader = `bearer ${token}`;
      const extracted = extractToken(authHeader);

      expect(extracted).toBeNull();
    });
  });
});
