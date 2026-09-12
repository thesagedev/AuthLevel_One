/**
 * Authentication constants.
 */

export const AUTH_CONSTANTS = {
  BEARER_PREFIX: "Bearer",

  ACCESS_TOKEN_NAME: "accessToken",

  REFRESH_TOKEN_NAME: "refreshToken",

  PASSWORD: {
    MAX_LENGTH: 128,
    MIN_LENGTH: 8,
    SALT_ROUNDS: 10,
  },
  REFRESH_COOKIE_MAX_AGE: 1000 * 60 * 60 * 24 * 7, // 7days
} as const;

export const AUTH = {
  PASSWORD_RESET_TOKEN_EXPIRES_IN: 15 * 60 * 1000,
  EMAIL_VERIFICATION_TOKEN_EXPIRES_IN: 24 * 60 * 60 * 1000,
} as const;
