/**
 * Rate limit configuration
 *
 * Defines request limit used to protect
 * authentication endpoints from abuse.
 */

import { rateLimit } from 'express-rate-limit';
import { ENV } from './env.config.js';
import { AppError, ERROR_CODES } from '../core/index.js';

export const authRateLimiter = rateLimit({
  windowMs: ENV.AUTH_RATE_LIMIT_WINDOW_MS,
  limit: ENV.AUTH_RATE_LIMIT_MAX,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(
      new AppError({
        statusCode: 429,
        code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
        message: 'Too many authentication attempts. Please try again later.',
      }),
    );
  },
});
