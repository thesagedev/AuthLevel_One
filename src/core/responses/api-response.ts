/**
 * Centralized API success response builder
 *
 * All success response should be returned
 * through the class to keep the API consistent
 *
 */

import type { Response } from "express";

import { ResponseOptions, SuccessResponse } from "./response-types.js";

export class APIResponse {
  // Return 200 HTTP
  static success<T>(
    res: Response,
    options: ResponseOptions<T>,
  ): Response<SuccessResponse<T>> {
    return res.status(200).json({
      success: true,
      message: options.message,
      data: options.data,
    });
  }

  // Return HTTP 201
  static created<T>(
    res: Response,
    options: ResponseOptions<T>,
  ): Response<SuccessResponse<T>> {
    return res.status(201).json({
      success: true,
      message: options.message,
      data: options.data,
    });
  }

  // Return HTTP 204
  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}
