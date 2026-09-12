/**
 * HTTP request logger middleware
 *
 * Logs every incoming request and outgoing response
 * using the application's Pino logger.
 */

import pinoHttpModule from "pino-http";
import { logger } from "../config/logger.config.js";
import { IncomingMessage } from "http";
import { ServerResponse } from "http";

const pinoHttp = pinoHttpModule.default || pinoHttpModule;

// Shared HTTP logger.
export const requestLogger = pinoHttp({
  logger,
  autoLogging: true,
  customSuccessMessage(req: IncomingMessage, res: ServerResponse) {
    return `${req.method} ${req.url} completed with ${res.statusCode}`;
  },

  customErrorMessage(req: IncomingMessage, res: ServerResponse) {
    return `${req.method} ${req.url} failed with ${res.statusCode}`;
  },
});
