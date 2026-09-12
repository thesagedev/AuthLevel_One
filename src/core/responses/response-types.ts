/**
 * Shared responses types used by ApiResponse
 */

export interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T | null;
}

export interface ResponseOptions<T> {
  message: string;
  data: T | null;
}
