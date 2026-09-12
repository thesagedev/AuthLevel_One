// Database configuration.
import mongoose from "mongoose";
import { ENV } from "./env.config.js";
import { logger } from "./logger.config.js";

/**
 * Connect to MongoDB
 * Throw an error if the connection fails
 */

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(ENV.MONGODB_URI);

    logger.info("Connected to MongoDB");
  } catch (err) {
    logger.error(err, "Error connecting to MongoDB");
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 */

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info("Disconnected from MongoDB");
  } catch (err) {
    logger.error(err, "Error disconnecting from MongoDB:");
  }
};
