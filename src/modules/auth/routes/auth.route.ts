/**
 * Authenticate routes
 *
 * Defines every authentication endpoint
 */

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validate } from '../../../validators/validators.middleware.js';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../../../validators/index.js';
import { authRateLimiter } from '../../../config/rate-limit.config.js';

const authRouter: Router = Router();

authRouter.use(authRateLimiter);

const authController = new AuthController();

// POST /register
authRouter.post('/register', validate(registerSchema), authController.register);

// POST /login
authRouter.post('/login', validate(loginSchema), authController.login);

// POST /refresh
authRouter.post('/refresh', authController.refresh);

// POST /logout
authRouter.post('/logout', authController.logout);

// POST /forgot-password
authRouter.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);

// POST /resend-verification
authRouter.post(
  '/resend-verification',
  validate(resendVerificationSchema),
  authController.resendVerification,
);

// POST /reset-password
authRouter.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// POST /verify-email
authRouter.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);

export default authRouter;
