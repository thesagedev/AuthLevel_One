import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../src/modules/auth/services/auth.service.js';

describe('AuthService', () => {
  const authRepository = {
    existsByEmail: vi.fn(),
    existsByUsername: vi.fn(),
    create: vi.fn(),
    findByEmail: vi.fn(),
    findByEmailWithPassword: vi.fn(),
    findByIdWithRefreshToken: vi.fn(),
    updateRefreshToken: vi.fn(),
    clearRefreshToken: vi.fn(),
    updatePasswordResetToken: vi.fn(),
    findByPasswordResetToken: vi.fn(),
    clearPasswordResetToken: vi.fn(),
    updateEmailVerificationToken: vi.fn(),
    findByEmailVerificationToken: vi.fn(),
    clearEmailVerificationToken: vi.fn(),
  };

  const tokenService = {
    generateAccessToken: vi.fn(),
    generateRefreshToken: vi.fn(),
    verifyAccessToken: vi.fn(),
    verifyRefreshToken: vi.fn(),
    generatePasswordResetToken: vi.fn(),
    hashPasswordResetToken: vi.fn(),
    generateEmailVerificationToken: vi.fn(),
    hashEmailVerificationToken: vi.fn(),
    hashToken: vi.fn(),
    compareToken: vi.fn(),
  };

  const emailService = {
    sendVerificationEmail: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
  };

  let authService: AuthService;

  const user = {
    id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    username: 'testuser',
    displayName: 'Test User',
    password: 'hashed-password',
    isEmailVerified: true,
    refreshToken: 'hashed-refresh-token',
    comparePassword: vi.fn(),
    save: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    authService = new AuthService(
      authRepository as unknown as ConstructorParameters<typeof AuthService>[0],
      tokenService as unknown as ConstructorParameters<typeof AuthService>[1],
      emailService as unknown as ConstructorParameters<typeof AuthService>[2],
    );
  });

  describe('register', () => {
    it('should register a new user and send a verification email', async () => {
      const input = {
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        password: 'Password123!',
      };

      authRepository.existsByEmail.mockResolvedValue(false);
      authRepository.existsByUsername.mockResolvedValue(false);
      authRepository.create.mockResolvedValue(user);
      tokenService.generateEmailVerificationToken.mockReturnValue('verification-token');
      tokenService.hashEmailVerificationToken.mockReturnValue('hashed-verification-token');
      emailService.sendVerificationEmail.mockResolvedValue(undefined);

      const result = await authService.register(input);

      expect(result).toBe(user);

      expect(authRepository.existsByEmail).toHaveBeenCalledWith(input.email);
      expect(authRepository.existsByUsername).toHaveBeenCalledWith(input.username);
      expect(authRepository.create).toHaveBeenCalledWith(input);

      expect(authRepository.updateEmailVerificationToken).toHaveBeenCalled();

      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          email: user.email,
          username: user.username,
          verificationToken: 'verification-token',
        }),
      );
    });

    it('should reject an existing email', async () => {
      authRepository.existsByEmail.mockResolvedValue(true);

      await expect(
        authService.register({
          email: 'test@example.com',
          username: 'testuser',
          displayName: 'Test User',
          password: 'Password123!',
        }),
      ).rejects.toMatchObject({
        statusCode: 409,
        code: 'CONFLICT',
        message: 'Email already exist',
      });

      expect(authRepository.create).not.toHaveBeenCalled();
    });

    it('should reject an existing username', async () => {
      authRepository.existsByEmail.mockResolvedValue(false);
      authRepository.existsByUsername.mockResolvedValue(true);

      await expect(
        authService.register({
          email: 'test@example.com',
          username: 'testuser',
          displayName: 'Test User',
          password: 'Password123!',
        }),
      ).rejects.toMatchObject({
        statusCode: 409,
        code: 'CONFLICT',
        message: 'Username already exist',
      });

      expect(authRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login a verified user and rotate the refresh token', async () => {
      const refreshToken = 'refresh-token';
      const accessToken = 'access-token';

      user.comparePassword.mockResolvedValue(true);

      authRepository.findByEmailWithPassword.mockResolvedValue(user);

      tokenService.generateAccessToken.mockReturnValue(accessToken);
      tokenService.generateRefreshToken.mockReturnValue(refreshToken);
      tokenService.hashToken.mockResolvedValue('hashed-refresh-token');

      const result = await authService.login({
        email: user.email,
        password: 'Password123!',
      });

      expect(result).toEqual({
        user,
        accessToken,
        refreshToken,
      });

      expect(tokenService.generateAccessToken).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
      });

      expect(tokenService.generateRefreshToken).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
      });

      expect(authRepository.updateRefreshToken).toHaveBeenCalledWith(
        user.id,
        'hashed-refresh-token',
      );
    });

    it('should reject an unknown email', async () => {
      authRepository.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'unknown@example.com',
          password: 'Password123!',
        }),
      ).rejects.toMatchObject({
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    });

    it('should reject an incorrect password', async () => {
      user.comparePassword.mockResolvedValue(false);
      authRepository.findByEmailWithPassword.mockResolvedValue(user);

      await expect(
        authService.login({
          email: user.email,
          password: 'WrongPassword!',
        }),
      ).rejects.toMatchObject({
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    });

    it('should reject an unverified email', async () => {
      user.comparePassword.mockResolvedValue(true);
      user.isEmailVerified = false;
      authRepository.findByEmailWithPassword.mockResolvedValue(user);

      await expect(
        authService.login({
          email: user.email,
          password: 'Password123!',
        }),
      ).rejects.toMatchObject({
        statusCode: 403,
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Email address is not verified',
      });

      user.isEmailVerified = true;
    });
  });

  describe('refresh', () => {
    it('should rotate a valid refresh token', async () => {
      const newAccessToken = 'new-access-token';
      const newRefreshToken = 'new-refresh-token';

      tokenService.verifyRefreshToken.mockReturnValue({
        sub: user.id,
        email: user.email,
      });

      authRepository.findByIdWithRefreshToken.mockResolvedValue(user);
      tokenService.compareToken.mockResolvedValue(true);

      tokenService.generateAccessToken.mockReturnValue(newAccessToken);
      tokenService.generateRefreshToken.mockReturnValue(newRefreshToken);
      tokenService.hashToken.mockResolvedValue('new-hashed-refresh-token');

      const result = await authService.refresh('old-refresh-token');

      expect(result).toEqual({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });

      expect(authRepository.updateRefreshToken).toHaveBeenCalledWith(
        user.id,
        'new-hashed-refresh-token',
      );
    });

    it('should reject a refresh token when no stored session exists', async () => {
      tokenService.verifyRefreshToken.mockReturnValue({
        sub: user.id,
        email: user.email,
      });

      authRepository.findByIdWithRefreshToken.mockResolvedValue({
        ...user,
        refreshToken: null,
      });

      await expect(authService.refresh('refresh-token')).rejects.toMatchObject({
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Invalid refresh token',
      });
    });

    it('should reject a refresh token that does not match the stored hash', async () => {
      tokenService.verifyRefreshToken.mockReturnValue({
        sub: user.id,
        email: user.email,
      });

      authRepository.findByIdWithRefreshToken.mockResolvedValue(user);
      tokenService.compareToken.mockResolvedValue(false);

      await expect(authService.refresh('wrong-refresh-token')).rejects.toMatchObject({
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Invalid refresh token',
      });
    });
  });

  describe('logout', () => {
    it('should clear a valid refresh session', async () => {
      tokenService.verifyRefreshToken.mockReturnValue({
        sub: user.id,
        email: user.email,
      });

      authRepository.findByIdWithRefreshToken.mockResolvedValue(user);
      tokenService.compareToken.mockResolvedValue(true);

      await authService.logout('refresh-token');

      expect(authRepository.clearRefreshToken).toHaveBeenCalledWith(user.id);
    });

    it('should silently ignore an invalid token', async () => {
      tokenService.verifyRefreshToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.logout('invalid-token')).resolves.toBeUndefined();

      expect(authRepository.findByIdWithRefreshToken).not.toHaveBeenCalled();

      expect(authRepository.clearRefreshToken).not.toHaveBeenCalled();
    });

    it('should silently ignore a refresh token that does not match the stored hash', async () => {
      tokenService.verifyRefreshToken.mockReturnValue({
        sub: user.id,
        email: user.email,
      });

      authRepository.findByIdWithRefreshToken.mockResolvedValue(user);
      tokenService.compareToken.mockResolvedValue(false);

      await expect(authService.logout('wrong-token')).resolves.toBeUndefined();

      expect(authRepository.clearRefreshToken).not.toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    it('should generate a reset token and send a reset email', async () => {
      authRepository.findByEmail.mockResolvedValue(user);
      tokenService.generatePasswordResetToken.mockReturnValue('reset-token');
      tokenService.hashPasswordResetToken.mockReturnValue('hashed-reset-token');
      emailService.sendPasswordResetEmail.mockResolvedValue(undefined);

      await authService.forgotPassword(user.email);

      expect(authRepository.updatePasswordResetToken).toHaveBeenCalledWith(
        user.id,
        'hashed-reset-token',
        expect.any(Date),
      );

      expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith({
        email: user.email,
        username: user.username,
        resetToken: 'reset-token',
      });
    });

    it('should not reveal whether an account exists', async () => {
      authRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.forgotPassword('unknown@example.com')).resolves.toBeUndefined();

      expect(tokenService.generatePasswordResetToken).not.toHaveBeenCalled();

      expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset the password and invalidate active sessions', async () => {
      const resetUser = {
        ...user,
        comparePassword: vi.fn().mockResolvedValue(false),
        password: 'old-password',
        save: vi.fn().mockResolvedValue(undefined),
      };

      tokenService.hashPasswordResetToken.mockReturnValue('hashed-reset-token');

      authRepository.findByPasswordResetToken.mockResolvedValue(resetUser);

      await authService.resetPassword('reset-token', 'NewPassword123!');

      expect(resetUser.password).toBe('NewPassword123!');
      expect(resetUser.save).toHaveBeenCalled();

      expect(authRepository.clearPasswordResetToken).toHaveBeenCalledWith(resetUser.id);

      expect(authRepository.clearRefreshToken).toHaveBeenCalledWith(resetUser.id);
    });

    it('should reject an invalid or expired reset token', async () => {
      tokenService.hashPasswordResetToken.mockReturnValue('hashed-reset-token');

      authRepository.findByPasswordResetToken.mockResolvedValue(null);

      await expect(
        authService.resetPassword('invalid-token', 'NewPassword123!'),
      ).rejects.toMatchObject({
        statusCode: 400,
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired password reset token',
      });
    });

    it('should reject password reuse', async () => {
      const resetUser = {
        ...user,
        comparePassword: vi.fn().mockResolvedValue(true),
      };

      tokenService.hashPasswordResetToken.mockReturnValue('hashed-reset-token');

      authRepository.findByPasswordResetToken.mockResolvedValue(resetUser);

      await expect(
        authService.resetPassword('reset-token', 'CurrentPassword123!'),
      ).rejects.toMatchObject({
        statusCode: 400,
        code: 'PASSWORD_REUSE',
        message: 'New password must be different from your current password',
      });

      expect(resetUser.save).not.toHaveBeenCalled();
    });
  });

  describe('verifyEmail', () => {
    it('should verify an unverified email', async () => {
      const unverifiedUser = {
        ...user,
        isEmailVerified: false,
        save: vi.fn().mockResolvedValue(undefined),
      };

      tokenService.hashEmailVerificationToken.mockReturnValue('hashed-verification-token');

      authRepository.findByEmailVerificationToken.mockResolvedValue(unverifiedUser);

      await authService.verifyEmail('verification-token');

      expect(unverifiedUser.isEmailVerified).toBe(true);
      expect(unverifiedUser.save).toHaveBeenCalled();

      expect(authRepository.clearEmailVerificationToken).toHaveBeenCalledWith(unverifiedUser.id);
    });

    it('should reject an invalid or expired verification token', async () => {
      tokenService.hashEmailVerificationToken.mockReturnValue('hashed-verification-token');

      authRepository.findByEmailVerificationToken.mockResolvedValue(null);

      await expect(authService.verifyEmail('invalid-token')).rejects.toMatchObject({
        statusCode: 400,
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired email verification token',
      });
    });

    it('should reject an already verified email', async () => {
      const verifiedUser = {
        ...user,
        isEmailVerified: true,
      };

      tokenService.hashEmailVerificationToken.mockReturnValue('hashed-verification-token');

      authRepository.findByEmailVerificationToken.mockResolvedValue(verifiedUser);

      await expect(authService.verifyEmail('verification-token')).rejects.toMatchObject({
        statusCode: 400,
        code: 'INVALID_TOKEN',
        message: 'Email is already verified',
      });

      expect(authRepository.clearEmailVerificationToken).toHaveBeenCalledWith(verifiedUser.id);
    });
  });
});
