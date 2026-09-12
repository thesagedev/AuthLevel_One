/**
 * User repository
 *
 * Handles database operations related to user profiles
 */

import { type UserDocument, UserModel } from "../../auth/index.js";

export class UserRepository {
  async findById(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id);
  }
}
