/**
 * Wraps asynchronous Express routes handlers
 *
 * Any rejected promise or thrown error is automatically
 * forwarded to the global error middleware
 */

import type { NextFunction, Request, RequestHandler, Response } from "express";

// Type representing an asynchronous Express handler

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

/**
 * Wrap an async controller and automatically
 * forward errors to Express
 *
 * @param handler Async Express route handler.
 * @returns Express request handler
 */

export const asyncHandler = (handler: AsyncHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};
