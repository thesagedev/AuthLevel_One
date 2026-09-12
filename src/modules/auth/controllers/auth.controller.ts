/**
 * Authentication controller
 *
 * Handles incoming HTTP requests related
 * to authentication
 */

import { RequestHandler } from "express";
import {
  AuthService,
  type LoginUserInput,
  type RegisterUserInput,
} from "../services/index.js";
import { asyncHandler } from "../../../middleware/async-handler.middleware.js";
import { APIResponse, AppError, ERROR_CODES } from "../../../core/index.js";
import { refreshCookieOptions } from "../auth.cookies.js";

export class AuthController {
  constructor(private readonly authService = new AuthService()) {}

  // Register a new user
  register: RequestHandler = asyncHandler(async (req, res) => {
    const user = await this.authService.register(req.body as RegisterUserInput);
    return APIResponse.created(res, {
      message: "User registered successfully",
      data: user,
    });
  });

  // Login user
  login: RequestHandler = asyncHandler(async (req, res) => {
    const result = await this.authService.login(req.body as LoginUserInput);

    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);

    return APIResponse.success(res, {
      message: "Login successfully",
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  });

  // Refresh token
  refresh: RequestHandler = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new AppError({
        statusCode: 401,
        code: ERROR_CODES.UNAUTHORIZED,
        message: "Refresh token missing",
      });
    }

    const result = await this.authService.refresh(refreshToken);

    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);

    return APIResponse.success(res, {
      message: "Token refreshed successfully",
      data: {
        accessToken: result.accessToken,
      },
    });
  });

  // logout
  logout: RequestHandler = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    res.clearCookie("refreshToken", refreshCookieOptions);

    return APIResponse.success(res, {
      message: "Logout successfully",
      data: null,
    });
  });

  // Forgot password
  forgotPassword: RequestHandler = asyncHandler(async (req, res) => {
    await this.authService.forgotPassword(req.body.email);

    return APIResponse.success(res, {
      message:
        "If an account exists with this email, a password reset link has been sent",
      data: null,
    });
  });

  // Reset password
  resetPassword: RequestHandler = asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    await this.authService.resetPassword(token, password);

    return APIResponse.success(res, {
      message: "Password reset successfully",
      data: null,
    });
  });

  // Verify email
  verifyEmail: RequestHandler = asyncHandler(async (req, res) => {
    const { token } = req.body;

    await this.authService.verifyEmail(token);

    return APIResponse.success(res, {
      message: "Email verified successfully",
      data: null,
    });
  });
}
