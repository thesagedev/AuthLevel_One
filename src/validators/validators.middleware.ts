/**
 * Generic request validation middleware
 *
 * Validation incoming request data using zod
 * before reaching the controller
 */

import { RequestHandler } from "express";
import { AppError, ERROR_CODES } from "../core/index.js";
import { ZodError, ZodType } from "zod";

export const validate =
  (schema: ZodType): RequestHandler =>
  (req, _res, next) => {
    try {
      req.body = schema.parse(req.body);

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(
          new AppError({
            statusCode: 400,
            code: ERROR_CODES.VALIDATION_ERROR,
            message: "Validation failed",
            details: error.issues,
          }),
        );
      }
      next(error);
    }
  };
