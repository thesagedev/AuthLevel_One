/**
 * Global error handling middleware
 *
 * This middleware catches every error passed to express
 * and convert it into consistent JSON response.
 *
 * It understand our custom AppError class while also
 * safely handling unexpected runtime errors.
 */

import type { ErrorRequestHandler } from "express";
import { AppError, ERROR_CODES } from "../core/index.js";
import { logger } from "../config/logger.config.js";
import { ENV } from "../config/env.config.js";

// Express global error middleware
export const errorMiddleware: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  // Handle application errors
  if (error instanceof AppError) {
    logger.warn({error}, error.message);

    res.status(error.statusCode).json({
      success: false,

      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
    return;
  }

  // Handle unexpected runtime errors

  logger.error(error, "Unhandled server error");

  return res.status(500).json({
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message:
        ENV.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    },
  });
};
