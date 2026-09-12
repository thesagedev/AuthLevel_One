/**
 * Centralized HTTP security middleware
 *
 * Every middleware exported from this file is
 * configured once and reused by the application
 */

import compression from "compression";
import helmet from "helmet";
import type { RequestHandler } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

/**
 * Helmet middleware
 *
 * Adds common HTTP security headers
 */

export const helmetMiddleware = helmet();

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

/**
 * CORS middleware
 *
 * During development we allow localhost frontend.
 * Later we'll move the allowed origin the ENV.
 */
export const corsMiddleware = cors({
  origin: true,
  credentials: true,
});
