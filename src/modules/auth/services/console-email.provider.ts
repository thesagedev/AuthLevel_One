/**
 * Development email provider
 *
 * Logs outgoing emails to the console instead of
 * sending them through an external email service
 */

import type { EmailProvider, SendEmailOptions } from './email.provider.js';

export class ConsoleEmailProvider implements EmailProvider {
  async sendEmail(options: SendEmailOptions): Promise<void> {
    console.group('--- Email ---');
    console.info(`To: ${options.to}`);
    console.info(`Subject: ${options.subject}`);
    console.info(options.text ?? options.html);
    console.groupEnd();
  }
}
