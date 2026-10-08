/**
 * Centralized HTTP security middleware
 *
 * Every middleware exported from this file is
 * configured once and reused by the application
 */

import compression from 'compression';
import * as helmetModule from 'helmet';
import type { RequestHandler } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { ENV } from './env.config.js';

/**
 * Helmet middleware
 *
 * Adds common HTTP security headers
 */

export const helmetMiddleware = helmetModule.default();

/**
 * Compression middleware
 *
 * Compresses HTTP response automatically
 */
export const compressionMiddleware: RequestHandler = compression();

/**
 * Cookie parser middleware
 *
 * Parser cookies into req.cookies
 */
export const cookieParserMiddleware: RequestHandler = cookieParser();

export const corsMiddleware = cors({
  origin: ENV.CORS_ORIGIN,
  credentials: true,
});
