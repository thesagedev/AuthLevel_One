/**
 * Authentication middleware
 *
 * Verifies the access token and attaches
 * the authenticated user payload to req.user
 */

import { RequestHandler } from "express";
import { TokenService } from "../services/token.service.js";
import { AppError, ERROR_CODES } from "../../../core/index.js";

const tokenService = new TokenService();

export const authenticate: RequestHandler = (req, _res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    throw new AppError({
      statusCode: 401,
      code: ERROR_CODES.UNAUTHORIZED,
      message: "Authentication required",
    });
  }

  const [schema, token] = authorization.split(" ");

  if (schema !== "Bearer" || !token) {
    throw new AppError({
      statusCode: 401,
      code: ERROR_CODES.UNAUTHORIZED,
      message: "Invalid authorization header",
    });
  }

  try {
    const payload = tokenService.verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
    };

    next();
  } catch {
    throw new AppError({
      statusCode: 401,
      code: ERROR_CODES.UNAUTHORIZED,
      message: "Invalid or expired access token",
    });
  }
};
