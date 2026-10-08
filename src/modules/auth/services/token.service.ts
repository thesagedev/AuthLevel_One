/**
 * Token service
 *
 * Responsible for creating and verifying
 * authentications token
 */
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import type { AccessTokenPayload } from '../../../types/jwt.types.js';
import { ENV } from '../../../config/env.config.js';
import { AppError, ERROR_CODES } from '../../../core/index.js';
import { z } from 'zod';

const accessTokenPayloadSchema = z.object({
  sub: z.string().min(1),
  email: z.email(),
});

export class TokenService {
  /* === JWT === */

  // Generate Access Token
  generateAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, ENV.JWT_ACCESS_SECRET, {
      expiresIn: ENV.JWT_ACCESS_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  // Generate Refresh Token
  generateRefreshToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
      expiresIn: ENV.JWT_REFRESH_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  // Verify Access Token
  verifyAccessToken(token: string): AccessTokenPayload {
    const payload = jwt.verify(token, ENV.JWT_ACCESS_SECRET, {
      algorithms: ['HS256'],
    });
    return accessTokenPayloadSchema.parse(payload);
  }

  // Verify Refresh Token
  verifyRefreshToken(token: string): AccessTokenPayload {
    try {
      const payload = jwt.verify(token, ENV.JWT_REFRESH_SECRET, {
        algorithms: ['HS256'],
      });

      return accessTokenPayloadSchema.parse(payload);
    } catch {
      throw new AppError({
        statusCode: 401,
        code: ERROR_CODES.UNAUTHORIZED,
        message: 'Invalid or expired refresh token',
      });
    }
  }

  /* === Password reset === */

  // Generate password reset token
  generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Hash password reset token
  hashPasswordResetToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /* === Email verification === */

  // Generate email verification token
  generateEmailVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Hash email verification token
  hashEmailVerificationToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /* === Refresh token hashing === */

  // Hash token
  async hashToken(token: string): Promise<string> {
    return bcrypt.hash(token, 10);
  }

  // Compare token
  async compareToken(token: string, hash: string): Promise<boolean> {
    return bcrypt.compare(token, hash);
  }
}
