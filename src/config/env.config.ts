// Validate the environment variables and export them as a configuration object.

import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

// Define a schema for the expected environment variables
const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']),
    PORT: z.coerce.number().int().positive().default(5000),

    API_PREFIX: z.string().min(1),
    API_VERSION: z.string().min(1),

    MONGODB_URI: z.string().regex(/^mongodb(\+srv)?:\/\//, {
      message: 'Invalid MongoDB connection string',
    }),

    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_ACCESS_EXPIRES_IN: z.string(),
    JWT_REFRESH_EXPIRES_IN: z.string(),

    CORS_ORIGIN: z.string().min(1),

    FRONTEND_URL: z.string().url(),

    AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive(),
    AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive(),

    EMAIL_PROVIDER: z.enum(['console', 'smtp']).default('console'),
    EMAIL_FROM: z.string().email(),

    SMTP_HOST: z.string().min(1).optional(),
    SMTP_PORT: z.coerce.number().int().positive().optional(),
    SMTP_SECURE: z.coerce.boolean().optional(),
    SMTP_USER: z.string().min(1).optional(),
    SMTP_PASSWORD: z.string().min(1).optional(),
  })
  .superRefine((env, ctx) => {
    if (env.EMAIL_PROVIDER !== 'smtp') {
      return;
    }

    if (!env.SMTP_HOST) {
      ctx.addIssue({
        code: 'custom',
        path: ['SMTP_HOST'],
        message: 'SMTP_HOST is required when EMAIL_PROVIDER=smtp',
      });
    }

    if (env.SMTP_PORT === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['SMTP_PORT'],
        message: 'SMTP_PORT is required when EMAIL_PROVIDER=smtp',
      });
    }

    if (env.SMTP_SECURE === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['SMTP_SECURE'],
        message: 'SMTP_SECURE is required when EMAIL_PROVIDER=smtp',
      });
    }

    if (!env.SMTP_USER) {
      ctx.addIssue({
        code: 'custom',
        path: ['SMTP_USER'],
        message: 'SMTP_USER is required when EMAIL_PROVIDER=smtp',
      });
    }

    if (!env.SMTP_PASSWORD) {
      ctx.addIssue({
        code: 'custom',
        path: ['SMTP_PASSWORD'],
        message: 'SMTP_PASSWORD is required when EMAIL_PROVIDER=smtp',
      });
    }
  });

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables');
  console.error(z.treeifyError(parsedEnv.error));
  process.exit(1);
}

export const ENV = parsedEnv.data;
