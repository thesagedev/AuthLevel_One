import { describe, expect, it } from 'vitest';
import { TokenService } from '../src/modules/auth/services/token.service';

describe('TokenService', () => {
  const tokenService = new TokenService();

  const payload = {
    sub: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
  };

  describe('access token', () => {
    it('should generate and verify an access token', () => {
      const token = tokenService.generateAccessToken(payload);
      const decoded = tokenService.verifyAccessToken(token);

      expect(decoded.sub).toBe(payload.sub);
      expect(decoded.email).toBe(payload.email);
    });

    it('should reject a token signed with the wrong secret', () => {
      const token = tokenService.generateRefreshToken(payload);
      expect(() => tokenService.verifyAccessToken(token)).toThrow();
    });
  });

  describe('secure tokens', () => {
    it('should generate a password reset token', () => {
      const token = tokenService.generatePasswordResetToken();

      expect(token).toHaveLength(64);
      expect(token).toMatch(/^[a-f0-9]+$/);
    });

    it('should generate an email verification token', () => {
      const token = tokenService.generateEmailVerificationToken();

      expect(token).toHaveLength(64);
      expect(token).toMatch(/^[a-f0-9]+$/);
    });
    it('should hash password reset token consistently', () => {
      const token = 'test-reset-token';

      const firstHash = tokenService.hashPasswordResetToken(token);
      const secondHash = tokenService.hashPasswordResetToken(token);

      expect(firstHash).toBe(secondHash);
      expect(firstHash).not.toBe(token);
      expect(firstHash).toHaveLength(64);
    });

    it('should hash email verification token consistently', () => {
      const token = 'test-verification-token';

      const firstHash = tokenService.hashEmailVerificationToken(token);
      const secondHash = tokenService.hashEmailVerificationToken(token);

      expect(firstHash).toBe(secondHash);
      expect(firstHash).not.toBe(token);
      expect(firstHash).toHaveLength(64);
    });
  });

  describe('refresh token hashing', () => {
    it('should hash and compare a refresh token', async () => {
      const token = tokenService.generateRefreshToken(payload);
      const hash = await tokenService.hashToken(token);

      await expect(tokenService.compareToken(token, hash)).resolves.toBe(true);
      await expect(tokenService.compareToken('different-token', hash)).resolves.toBe(false);
    });
  });
});
