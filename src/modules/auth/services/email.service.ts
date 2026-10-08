/**
 * Email service
 *
 * Handles authentication-related emails through
 * the configured email provider.
 */

import { emailConfig } from '../../../config/email.config.js';
import { createEmailProvider } from './email.provider.factory.js';
import { EmailProvider } from './email.provider.js';

export interface VerificationEmailData {
  email: string;
  username: string;
  verificationToken: string;
}

export interface PasswordResetEmailData {
  email: string;
  username: string;
  resetToken: string;
}

export class EmailService {
  constructor(private readonly emailProvider: EmailProvider = createEmailProvider()) {}

  async sendVerificationEmail(data: VerificationEmailData): Promise<void> {
    const verificationUrl = `${emailConfig.frontendUrl}/verify-email?token=${encodeURIComponent(data.verificationToken)}`;
    await this.emailProvider.sendEmail({
      to: data.email,
      subject: 'Verify your email address',
      html: `
        <h1>Verify your email address</h1>
        <p>Hello ${data.username},</p>
        <p>Please verify your email address to activate your account.</p>
        <p>
          <a href="${verificationUrl}">Verify your email address</a>
        </p>
        <p>If the button does not work, copy and paste this link into your browser:</p>
        <p>${verificationUrl}</p>
      `,
      text: `
      Hello ${data.username},

      Please verify your email address to activate your account

      Verify your email address:
      ${verificationUrl}
      `,
    });
  }

  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void> {
    const resetUrl = `${emailConfig.frontendUrl}/reset-password?token=${encodeURIComponent(data.resetToken)}`;
    await this.emailProvider.sendEmail({
      to: data.email,
      subject: 'Reset your password',
      html: `
        <h1>Reset your password</h1>
        <p>Hello ${data.username},</p>
        <p>We received a request to reset your password.</p>
        <p>
          <a href="${resetUrl}">Reset your password</a>
        </p>
        <p>If the button does not work, copy and past this link into your browser:</p>
        <p>${resetUrl}</p>
        <p>If you do not request a password reset, you can safely ignore this email.</p>
      `,
      text: `
      Hello ${data.username},

      We received a request to reset your password

      Reset your password
      ${resetUrl}

      If you did not request a password reset, you can safely ignore this email.
      `,
    });
  }
}
