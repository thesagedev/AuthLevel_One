/**
 * User services
 *
 * Contains business logic related to user profiles
 */

import { AppError, ERROR_CODES } from "../../../core/index.js";
import { UserDocument } from "../../auth/index.js";
import { UserRepository } from "../repositories/user.repository.js";

export class UserService {
  constructor(private readonly userRepository = new UserRepository()) {}

  async getProfile(userId: string): Promise<UserDocument> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError({
        statusCode: 404,
        code: ERROR_CODES.RESOURCE_NOT_FOUND,
        message: "User not found",
      });
    }

    return user;
  }
}
