/**
 * Application route registry
 *
 * Registers every feature route in one place
 */

import { Router } from "express";
import { ENV } from "../config/env.config.js";
import { healthRouter } from "../modules/health/index.js";
import { authRouter } from "../modules/auth/index.js";
import { userRouter } from "../modules/users/index.js";

const router = Router();

// Health endpoints
router.use("/health", healthRouter);
// Authentication endpoints
router.use("/auth", authRouter);
// User endpoint
router.use("/users", userRouter);

// Export the application errors
export const appRouter: Router = Router();

/**
 * API versioning
 *
 * Example: /api/v1/
 */
const apiPath = `/${ENV.API_PREFIX}/${ENV.API_VERSION}`;

appRouter.use(apiPath, router);
