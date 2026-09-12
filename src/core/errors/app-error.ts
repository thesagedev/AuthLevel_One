/**
 * AppError - Custom error class for application-level error handling
 * 
 * Extends the native Error class to provide structured error information including
 * HTTP status codes, error codes, and optional details. Used throughout the application
 * for consistent error handling and responses.
 */

import { ErrorCode } from "./error-codes.js";

interface AppErrorOptions {
  statusCode: number;
  code: ErrorCode;
  message: string;
  details?: unknown;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: unknown;

  constructor(options: AppErrorOptions) {
    super(options.message);

    this.name = "AppError";
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.details = options.details;

    Error.captureStackTrace(this, this.constructor);
  }
}
