/**
 * Email provider contract
 *
 * Defines the minimum functionality required by
 * any email provider used by the authentication system.
 */

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailProvider {
  sendEmail(options: SendEmailOptions): Promise<void>;
}
