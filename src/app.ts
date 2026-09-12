// App initialization
import express, { Express } from "express";
import { appRouter } from "./routes/routes.js";
import swaggerRoute from "./routes/swagger.js";
import {
  errorMiddleware,
  notFoundMiddleware,
  requestLogger,
} from "./middleware/index.js";
import {
  compressionMiddleware,
  cookieParserMiddleware,
  corsMiddleware,
  helmetMiddleware,
} from "./config/security.config.js";
// Create an instance of the Express application
const app: Express = express();

/**
 * HTTP request logging
 *
 * Registers before all middleware so every request
 * is measured
 */
app.use(requestLogger);

// Swagger docs
app.use("/api/docs", swaggerRoute);
/**
 * HTTP security middleware
 */
app.use(helmetMiddleware);
app.use(compressionMiddleware);
app.use(corsMiddleware);
app.use(cookieParserMiddleware);

// Parse JSON request bodies
app.use(express.json());

// Parse URL encoded form bodies
app.use(express.urlencoded({ extended: true }));

// Register all API routers
app.use(appRouter);

/**
 * Handle request for unknown routes.
 *
 * This must be registered after all routes
 */
app.use(notFoundMiddleware);

/**
 * Global error middleware
 *
 * This must always be the final middleware
 */

app.use(errorMiddleware);

export default app;
