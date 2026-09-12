/**
 * Authentication repository
 *
 * Handles every database operation related
 * to authentication
 *
 * This layer must never contain business logic.
 */

import { UserDocument, UserModel } from "../models/user.model.js";

export class AuthRepository {
  // Find a user by email
  async findByEmail(email: string): Promise<UserDocument | null> {
    return UserModel.findByEmail(email);
  }

  // Find a user by username
  async findByUsername(username: string): Promise<UserDocument | null> {
    return UserModel.findByUsername(username);
  }

  // Create a new user
  async create(user: Partial<UserDocument>): Promise<UserDocument> {
    return UserModel.create(user);
  }

  // Check whether an email already exist
  async existsByEmail(email: string): Promise<boolean> {
    const user = await UserModel.exists({
      email: email.toLowerCase(),
    });

    return user !== null;
  }

  // Check whether a username already exist
  async existsByUsername(username: string): Promise<boolean> {
    const user = await UserModel.exists({
      username: username.toLowerCase(),
    });

    return user !== null;
  }

  // Find a user by ID
  async findById(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id).select("+refreshToken");
  }

  // Save refresh token hash
  async updateRefreshToken(
    userId: string,
    refreshTokenHash: string | null,
  ): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      refreshToken: refreshTokenHash,
    });
  }

  // Remove refresh token
  async clearRefreshToken(userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      refreshToken: null,
    });
  }

  // Update password reset token
  async updatePasswordResetToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      passwordResetToken: tokenHash,
      passwordResetExpires: expiresAt,
    });
  }

  // Find password reset token
  async findByPasswordResetToken(
    tokenHash: string,
  ): Promise<UserDocument | null> {
    return UserModel.findOne({
      passwordResetToken: tokenHash,
      passwordResetExpires: {
        $gt: new Date(),
      },
    }).select("+passwordResetToken +password");
  }

  // Clear password reset token
  async clearPasswordResetToken(userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      passwordResetToken: null,
      passwordResetExpires: null,
    });
  }

  // Update email verification token
  async updateEmailVerificationToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      emailVerificationToken: tokenHash,
      emailVerificationExpires: expiresAt,
    });
  }

  // Find user by email verification token
  async findByEmailVerificationToken(
    tokenHash: string,
  ): Promise<UserDocument | null> {
    return UserModel.findOne({
      emailVerificationToken: tokenHash,
      emailVerificationExpires: {
        $gt: new Date(),
      },
    }).select("+emailVerificationToken");
  }

  // Clear email verification token
  async clearEmailVerificationToken(userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      emailVerificationToken: null,
      emailVerificationExpires: null,
    });
  }
}
