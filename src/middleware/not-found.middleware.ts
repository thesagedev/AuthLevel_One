/**
 * Handles request for routes that do not exist
 *
 * This middleware should be registered after all routes
 * and before the global error middleware
 */

import type { RequestHandler } from "express";
import { AppError, ERROR_CODES } from "../core/index.js";

// Express middleware for unmatched routes

export const notFoundMiddleware: RequestHandler = (req, _res, next) => {
  next(
    new AppError({
      statusCode: 404,
      code: ERROR_CODES.RESOURCE_NOT_FOUND,
      message: `Route '${req.originalUrl}' was not found.`,
    }),
  );
};
