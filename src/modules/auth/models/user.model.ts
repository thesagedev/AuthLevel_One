/**
 * User model
 *
 * Represents an authenticated user within
 * the authentication system
 */

import { HydratedDocument, model, Model, QueryWithHelpers, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { VALIDATION } from '../../../constants/validation.constants.js';
import { AUTH_CONSTANTS } from '../../../constants/auth.constants.js';

export interface User {
  email: string;
  username: string;
  displayName: string;
  password: string;
  refreshToken: string | null;
  isEmailVerified: boolean;
  emailVerificationToken: string | null;
  emailVerificationExpires: Date | null;
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type UserDocument = HydratedDocument<User>;

// User schema
const userSchema = new Schema<User, UserModel, object, UserQueryHelpers>(
  {
    /**
     * User email address
     *
     * Used for authentication and communication
     */

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: VALIDATION.EMAIL.MAX_LENGTH,
    },

    // Public username
    username: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      minlength: VALIDATION.USERNAME.MIN_LENGTH,
      maxlength: VALIDATION.USERNAME.MAX_LENGTH,
      match: /^[a-z0-9_]+$/,
    },

    // Display name
    displayName: {
      type: String,
      required: true,
      trim: true,
      minlength: VALIDATION.DISPLAY_NAME.MIN_LENGTH,
      maxlength: VALIDATION.DISPLAY_NAME.MAX_LENGTH,
    },

    /**
     * Hashed user password
     *
     * Never stored in plain text
     */
    password: {
      type: String,
      required: true,
      select: false,
      minlength: VALIDATION.PASSWORD.MIN_LENGTH,
      maxlength: VALIDATION.PASSWORD.MAX_LENGTH,
    },

    /**
     * Current refresh token
     *
     * Stored as a hash
     */
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },

    /**
     * Whether the user's email has been verified
     */
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // Hashed email verification token
    emailVerificationToken: {
      type: String,
      default: null,
      select: false,
    },

    // Email verification expiration
    emailVerificationExpires: {
      type: Date,
      default: null,
    },

    /**
     * Hashed password reset token
     *
     * Used during the password reset flow
     */
    passwordResetToken: {
      type: String,
      default: null,
      select: false,
    },

    // Password reset expiration
    passwordResetExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        const safeRet = ret as Record<string, unknown>;
        // _id may be of unknown type; coerce to string safely
        if (safeRet._id != null) safeRet.id = String(safeRet._id);

        delete safeRet._id;
        delete safeRet.password;
        delete safeRet.refreshToken;
        delete safeRet.emailVerificationToken;
        delete safeRet.passwordResetToken;
        delete safeRet.emailVerificationExpires;
        delete safeRet.passwordResetExpires;
        return safeRet;
      },
    },
  },
);

/**
 * User initials
 *
 * Computed from the display name.
 * Not stored in MongoDB
 */
userSchema.virtual('initials').get(function (this: UserDocument) {
  return this.displayName
    .split(' ')
    .map((word: string) => word.charAt(0).toUpperCase())
    .join('');
});

// Hash the user's password before saving
userSchema.pre('save', async function (this: UserDocument) {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, AUTH_CONSTANTS.PASSWORD.SALT_ROUNDS);
});

// Compare a plain-text password with the stored hash.
userSchema.methods.comparePassword = async function (
  this: UserDocument,
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Find user by email
userSchema.statics.findByEmail = function (
  this: UserModel,
  email: string,
): Promise<UserDocument | null> {
  return this.findOne({
    email: email.toLowerCase(),
  }).select('+password');
};

// Find user by username
userSchema.statics.findByUsername = function (
  this: UserModel,
  username: string,
): Promise<UserDocument | null> {
  return this.findOne({
    username: username.toLowerCase(),
  });
};

// Return only verified user
userSchema.query.verified = function (
  this: QueryWithHelpers<UserDocument[], UserDocument, UserQueryHelpers>,
) {
  return this.where({
    isEmailVerified: true,
  });
};

// Return only unverified user
userSchema.query.unverified = function (
  this: QueryWithHelpers<UserDocument[], UserDocument, UserQueryHelpers>,
) {
  return this.where({
    isEmailVerified: false,
  });
};

/**
 * User model interface
 *
 * Defines reusable static query helpers
 */
export interface UserModel extends Model<User> {
  findByEmail(email: string): Promise<UserDocument | null>;

  findByUsername(username: string): Promise<UserDocument | null>;
}

/**
 * User query helper
 *
 * Reusable filters attached to queries
 */
export interface UserQueryHelpers {
  verified(): ReturnType<Model<User>['find']>;
  unverified(): ReturnType<Model<User>['find']>;
}
// Export model
export const UserModel = model<User, UserModel>('User', userSchema);
