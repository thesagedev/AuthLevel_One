// Validate the environment variables and export them as a configuration object.

import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables from .env file
dotenv.config();

// Define a schema for the expected environment variables
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().int().positive(),
  API_PREFIX: z.string().min(1),
  API_VERSION: z.string().min(1),
  MONGODB_URI: z.string().regex(/^mongodb(\+srv)?:\/\//, {
    message: "Invalid MongoDB connection string",
  }),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string(),
  JWT_REFRESH_EXPIRES_IN: z.string(),
});

const parsedEnv = envSchema.safeParse(process.env);

// src/config/env.config.ts
if (!parsedEnv.success) {
  console.error("Invalid environment variables");
  console.error(z.treeifyError(parsedEnv.error));
  process.exit(1);
}

export const ENV = parsedEnv.data;
