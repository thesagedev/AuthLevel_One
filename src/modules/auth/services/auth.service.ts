/**
 * Authentication service
 *
 * Contains all business logic related
 * to authentication
 */

import { AUTH } from '../../../constants/auth.constants.js';
import { AppError, ERROR_CODES } from '../../../core/index.js';
import { AccessTokenPayload } from '../../../types/jwt.types.js';
import type { UserDocument } from '../models/user.model.js';
import { AuthRepository } from '../repositories/auth.repository.js';
import { EmailService } from './email.service.js';
import { TokenService } from './token.service.js';

export interface RegisterUserInput {
  email: string;
  username: string;
  displayName: string;
  password: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserDocument;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  constructor(
    private readonly authRepository = new AuthRepository(),
    private readonly tokenService = new TokenService(),
    private readonly emailService = new EmailService(),
  ) {}

  async register(data: RegisterUserInput): Promise<UserDocument> {
    const emailExists = await this.authRepository.existsByEmail(data.email);

    if (emailExists) {
      throw new AppError({
        statusCode: 409,
        code: ERROR_CODES.CONFLICT,
        message: 'Email already exist',
      });
    }

    const usernameExists = await this.authRepository.existsByUsername(data.username);

    if (usernameExists) {
      throw new AppError({
        statusCode: 409,
        code: ERROR_CODES.CONFLICT,
        message: 'Username already exist',
      });
    }

    const user = await this.authRepository.create(data);

    const verificationToken = this.tokenService.generateEmailVerificationToken();

    const tokenHash = this.tokenService.hashEmailVerificationToken(verificationToken);

    const expiresAt = new Date(Date.now() + AUTH.EMAIL_VERIFICATION_TOKEN_EXPIRES_IN);

    await this.authRepository.updateEmailVerificationToken(user.id, tokenHash, expiresAt);

    await this.emailService.sendVerificationEmail({
      email: user.email,
      username: user.username,
      verificationToken,
    });
    return user;
  }

  async resendVerification(email: string): Promise<void> {
    const user = await this.authRepository.findByEmail(email);

    // Always return successfully if the account does not exist
    // This prevent email/account enumeration

    if (!user) {
      return;
    }

    // No verfication email is needed for an already verified account.
    if (user.isEmailVerified) {
      return;
    }

    // Generate a new cryptographically secure verification token.
    const verificationToken = this.tokenService.generateEmailVerificationToken();

    // Stored only the token hash in MongoDB
    const tokenHash = this.tokenService.hashEmailVerificationToken(verificationToken);

    // Replace the previous token with a new 24-hour expiry.
    const expireAt = new Date(Date.now() + AUTH.EMAIL_VERIFICATION_TOKEN_EXPIRES_IN);

    await this.authRepository.updateEmailVerificationToken(user.id, tokenHash, expireAt);

    // Send the raw token only through the email provider.
    await this.emailService.sendVerificationEmail({
      email: user.email,
      username: user.username,
      verificationToken,
    });
  }

  async login(data: LoginUserInput): Promise<LoginResponse> {
    const user = await this.authRepository.findByEmailWithPassword(data.email);

    if (!user) {
      throw new AppError({
        statusCode: 401,
        code: ERROR_CODES.INVALID_CREDENTIALS,
        message: 'Invalid email or password',
      });
    }

    const passwordMatch = await user.comparePassword(data.password);

    if (!passwordMatch) {
      throw new AppError({
        statusCode: 401,
        code: ERROR_CODES.INVALID_CREDENTIALS,
        message: 'Invalid email or password',
      });
    }

    if (!user.isEmailVerified) {
      throw new AppError({
        statusCode: 403,
        code: ERROR_CODES.EMAIL_NOT_VERIFIED,
        message: 'Email address is not verified',
      });
    }

    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken(payload);

    const hashRefreshToken = await this.tokenService.hashToken(refreshToken);

    await this.authRepository.updateRefreshToken(user.id, hashRefreshToken);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    const payload = this.tokenService.verifyRefreshToken(refreshToken);

    const user = await this.authRepository.findByIdWithRefreshToken(payload.sub);

    if (!user?.refreshToken) {
      throw new AppError({
        statusCode: 401,
        code: ERROR_CODES.UNAUTHORIZED,
        message: 'Invalid refresh token',
      });
    }

    const isValid = await this.tokenService.compareToken(refreshToken, user.refreshToken);

    if (!isValid) {
      throw new AppError({
        statusCode: 401,
        code: ERROR_CODES.UNAUTHORIZED,
        message: 'Invalid refresh token',
      });
    }

    const accessToken = this.tokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
    });
    const newRefreshToken = this.tokenService.generateRefreshToken({
      sub: user.id,
      email: user.email,
    });

    const hashedRefreshToken = await this.tokenService.hashToken(newRefreshToken);

    await this.authRepository.updateRefreshToken(user.id, hashedRefreshToken);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    // Verify JWT signature
    let payload: AccessTokenPayload;

    try {
      payload = this.tokenService.verifyRefreshToken(refreshToken);
    } catch {
      return;
    }

    const user = await this.authRepository.findByIdWithRefreshToken(payload.sub);

    if (!user?.refreshToken) {
      return;
    }

    const isValid = await this.tokenService.compareToken(refreshToken, user.refreshToken);

    if (!isValid) {
      return;
    }

    await this.authRepository.clearRefreshToken(user.id);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.authRepository.findByEmail(email);

    // Always return successfully even if the user doesn't exist
    // This prevents email/account enumeration
    if (!user) {
      return;
    }

    // Generate a cryptographically secure random token
    const resetToken = this.tokenService.generatePasswordResetToken();

    // Store only the hash in MongoDB
    const tokenHash = this.tokenService.hashPasswordResetToken(resetToken);

    const expiresAt = new Date(Date.now() + AUTH.PASSWORD_RESET_TOKEN_EXPIRES_IN);

    await this.authRepository.updatePasswordResetToken(user.id, tokenHash, expiresAt);

    await this.emailService.sendPasswordResetEmail({
      email: user.email,
      username: user.username,
      resetToken,
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Hash the raw token received from the client
    const tokenHash = this.tokenService.hashPasswordResetToken(token);

    // Find a matching token that has not expired
    const user = await this.authRepository.findByPasswordResetToken(tokenHash);

    if (!user) {
      throw new AppError({
        statusCode: 400,
        code: ERROR_CODES.INVALID_TOKEN,
        message: 'Invalid or expired password reset token',
      });
    }

    // Prevent password reuse
    const isSamePassword = await user.comparePassword(newPassword);

    if (isSamePassword) {
      throw new AppError({
        statusCode: 400,
        code: ERROR_CODES.PASSWORD_REUSE,
        message: 'New password must be different from your current password',
      });
    }

    // Update the password
    // The User model pre-save hook will hash it.
    user.password = newPassword;

    await user.save();

    // Password reset tokens are single-use
    await this.authRepository.clearPasswordResetToken(user.id);

    // Invalidate the current refresh session.
    await this.authRepository.clearRefreshToken(user.id);
  }

  // Verify email
  async verifyEmail(token: string): Promise<void> {
    const tokenHash = this.tokenService.hashEmailVerificationToken(token);

    const user = await this.authRepository.findByEmailVerificationToken(tokenHash);

    if (!user) {
      throw new AppError({
        statusCode: 400,
        code: ERROR_CODES.INVALID_TOKEN,
        message: 'Invalid or expired email verification token',
      });
    }

    if (user.isEmailVerified) {
      await this.authRepository.clearEmailVerificationToken(user.id);

      throw new AppError({
        statusCode: 400,
        code: ERROR_CODES.INVALID_TOKEN,
        message: 'Email is already verified',
      });
    }

    user.isEmailVerified = true;

    await user.save();

    await this.authRepository.clearEmailVerificationToken(user.id);
  }
}
