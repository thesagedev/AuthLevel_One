/**
 * Email provided factory
 *
 * Creates the configured email provider for the applications
 */

import { emailConfig } from '../../../config/email.config.js';
import { ConsoleEmailProvider } from './console-email.provider.js';
import { EmailProvider } from './email.provider.js';
import { SmtpEmailProvider } from './smtp-email.provider.js';

export const createEmailProvider = (): EmailProvider => {
  switch (emailConfig.provider) {
    case 'console':
      return new ConsoleEmailProvider();
    case 'smtp':
      return new SmtpEmailProvider();
    default:
      throw new Error(`Unsupported email provider: ${emailConfig.provider}`);
  }
};
