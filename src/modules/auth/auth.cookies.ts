import type { CookieOptions } from "express";
import { ENV } from "../../config/env.config.js";
import { AUTH_CONSTANTS } from "../../constants/auth.constants.js";

export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: ENV.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
  maxAge: AUTH_CONSTANTS.REFRESH_COOKIE_MAX_AGE, // 7 days
};
