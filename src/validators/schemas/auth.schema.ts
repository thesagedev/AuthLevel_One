import { z } from "zod";
import { VALIDATION } from "../../constants/validation.constants.js";

export const registerSchema = z.object({
  email: z.email().max(VALIDATION.EMAIL.MAX_LENGTH),
  username: z
    .string()
    .min(VALIDATION.USERNAME.MIN_LENGTH)
    .max(VALIDATION.USERNAME.MAX_LENGTH),
  displayName: z
    .string()
    .min(VALIDATION.DISPLAY_NAME.MIN_LENGTH)
    .max(VALIDATION.DISPLAY_NAME.MAX_LENGTH),
  password: z
    .string()
    .min(VALIDATION.PASSWORD.MIN_LENGTH)
    .max(VALIDATION.PASSWORD.MAX_LENGTH),
});

export const loginSchema = z.object({
  email: z.email().max(VALIDATION.EMAIL.MAX_LENGTH),
  password: z
    .string()
    .min(VALIDATION.PASSWORD.MIN_LENGTH)
    .max(VALIDATION.PASSWORD.MAX_LENGTH),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1),
  password: z
    .string()
    .min(VALIDATION.PASSWORD.MIN_LENGTH)
    .max(VALIDATION.PASSWORD.MAX_LENGTH),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});
