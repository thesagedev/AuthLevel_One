// Server entry point
import app from "./app.js";
import {
  connectDatabase,
  disconnectDatabase,
} from "./config/database.config.js";
import { ENV } from "./config/env.config.js";
import { logger } from "./config/logger.config.js";

const SHUTDOWN_TIMEOUT_MS = 3000;

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    const server = app.listen(ENV.PORT, () => {
      logger.info(`Server running on port ${ENV.PORT}`);
    });

    // Graceful shutdown with proper promise handling
    const gracefulShutdown = async (signal: string) => {
      return new Promise<void>((resolve) => {
        logger.info(`\n${signal} received. Shutting down...`);

        // Stop accepting new connection 
        server.close(async () => {
          try {
            await disconnectDatabase();
            logger.info(`Server stopped`);
          } catch (err) {
            logger.error(err,"Error during database shutdown");
          }
          resolve();
        });

        // Hard kill after if graceful close doesn't finish
        const shutDownTimer = setTimeout(() => {
          logger.error("Graceful shutdown time exceeded. Force exiting");
          process.exit(1);
        }, SHUTDOWN_TIMEOUT_MS);

        server.on("close", () => {
          clearTimeout(shutDownTimer);
        });
      });
    };

    process.on("SIGINT", async () => {
      logger.warn("SIGINT received")
      await gracefulShutdown("SIGINT");
      process.exit(0);
    });
    process.on("SIGTERM", async () => {
      logger.warn("SIGTERM received")
      await gracefulShutdown("SIGTERM");
      process.exit(0);
    });
  } catch (err) {
    logger.fatal(err,`Failed to start server`);
    process.exit(1);
  }
};

startServer().catch((err) => {
  logger.error(err,"Unhanded error in starting the server");
  process.exit(1);
});
