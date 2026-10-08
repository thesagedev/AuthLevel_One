/**
 * Email configuration
 *
 * Centralized email-related configuration so the
 * application does not access environment variables directly
 */

import { ENV } from './env.config.js';

export const emailConfig = {
  from: ENV.EMAIL_FROM,
  provider: ENV.EMAIL_PROVIDER,
  frontendUrl: ENV.FRONTEND_URL,

  smtp: {
    host: ENV.SMTP_HOST,
    port: ENV.SMTP_PORT,
    secure: ENV.SMTP_SECURE,
    user: ENV.SMTP_USER,
    password: ENV.SMTP_PASSWORD,
  },
} as const;
