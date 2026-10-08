/**
 * SMTP email provider
 *
 * Sends emails through an SMTP server using Nodemailer
 */

import nodemailer from 'nodemailer';
import type { EmailProvider, SendEmailOptions } from './email.provider.js';
import { emailConfig } from '../../../config/email.config.js';

export class SmtpEmailProvider implements EmailProvider {
  private readonly transporter;

  constructor() {
    const { host, password, port, secure, user } = emailConfig.smtp;

    if (!host || port === undefined || secure === undefined || !user || !password) {
      throw new Error(
        'SMTP email configuration is incomplete. Set SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, and SMTP_PASSWORD when EMAIL_PROVIDER=smtp.',
      );
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass: password },
    });
  }
  async sendEmail(options: SendEmailOptions): Promise<void> {
    await this.transporter.sendMail({
      from: emailConfig.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  }
}
