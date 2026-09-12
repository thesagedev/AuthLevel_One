/**
 * User repository
 *
 * Handles database operation related to user profiles
 */

import { RequestHandler } from "express";
import { APIResponse } from "../../../core/index.js";
import { UserService } from "../services/user.service.js";

export class UserController {
  constructor(private readonly userService = new UserService()) {}
  me: RequestHandler = async (req, res) => {
    const user = await this.userService.getProfile(req.user!.id);
    return APIResponse.success(res, {
      message: "Authenticated user",
      data: {
        user,
      },
    });
  };
}
