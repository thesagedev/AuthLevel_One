import type { OpenAPIV3 } from "openapi-types";

export const swaggerConfig: OpenAPIV3.Document = {
  openapi: "3.0.3",
  info: {
    title: "AuthLevel One API",
    version: "1.0.0",
    description:
      "Production ready-authenticaion API builts with Node.js, Express, Typescript, and MongoDB",
  },
  servers: [
    {
      url: "http://localhost:5000/api/v1",
      description: "Local development server",
    },
  ],
  tags: [
    {
      name: "Health",
      description: "API health and system status",
    },
    {
      name: "Authentication",
      description: "User authentication and account security",
    },
    {
      name: "Users",
      description: "Authenticated user operations",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter a valid access token.",
      },
    },
    schemas: {
      // Register
      RegisterRequest: {
        type: "object",
        required: ["email", "username", "displayName", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "ricky@example.com",
          },
          username: {
            type: "string",
            example: "ricky_lad",
          },
          displayName: {
            type: "string",
            example: "Ricky Lad",
          },
          password: {
            type: "string",
            format: "password",
            example: "StrongPassword123",
          },
        },
      },
      // Login
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "ricky@example.com",
          },
          password: {
            type: "string",
            format: "password",
            example: "StrongPassword123",
          },
        },
      },
      // ForgotPasswordRequest
      ForgotPasswordRequest: {
        type: "object",
        required: ["email"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "ricky@example.com",
          },
        },
      },
      // ResetPasswordRequest
      ResetPasswordRequest: {
        type: "object",
        required: ["token", "password"],
        properties: {
          token: {
            type: "string",
            example: "password-reset-password",
          },
          password: {
            type: "string",
            format: "password",
            example: "NewStrongPassword123",
          },
        },
      },
      // VerifyEmailRequest
      VerifyEmailRequest: {
        type: "object",
        required: ["token"],
        properties: {
          token: {
            type: "string",
            example: "email-verification-token",
          },
        },
      },
      // User
      User: {
        type: "object",
        properties: {
          id: {
            type: "string",
            example: "68b123456789abcdef123456",
          },
          email: {
            type: "string",
            format: "email",
            example: "ricky@example.com",
          },
          username: {
            type: "string",
            example: "ricky_lad",
          },
          displayName: {
            type: "string",
            example: "Ricky Lad",
          },
          isEmailVerified: {
            type: "boolean",
            example: true,
          },
        },
      },
      // APIResponse
      APIResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Operation Successfully",
          },
          data: {
            nullable: true,
          },
        },
      },
      // ErrorResponse
      ErrorResponse: {
        type: "object",
        required: ["success", "error"],
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          error: {
            type: "object",
            required: ["code", "message"],
            properties: {
              code: {
                type: "string",
                example: "UNAUTORIZED",
              },
              message: {
                type: "string",
                example: "Invalid or expired refresh token",
              },
              details: {
                nullable: true,
                example: null,
              },
            },
          },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Check API health",
        description:
          "Returns the current health status of the API and database connection.",
        operationId: "getHealth",
        responses: {
          "200": {
            description: "API is healthy",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/APIResponse",
                },
                example: {
                  success: true,
                  message: "Health check successful",
                  data: {
                    status: "ok",
                    database: "connected",
                  },
                },
              },
            },
          },
          "503": {
            description: "API or database is unavailable",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "Service unavailable",
                  code: "SERVICE_UNAVAILABLE",
                },
              },
            },
          },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a new user",
        description:
          "Creates a new user account and generates an email verification token.",
        operationId: "registerUser",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RegisterRequest",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User registered Succesefully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/APIResponse",
                },
                example: {
                  success: true,
                  message: "User registered Succesefully",
                  data: {
                    id: "68b123456789abcdef123456",
                    email: "ricky@example.com",
                    username: "ricky_lad",
                    displayName: "Ricky Lad",
                    isEmailVerified: false,
                  },
                },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "Validation failed",
                  code: "VALIDATION_ERROR",
                },
              },
            },
          },
          "409": {
            description: "Email or username already exists",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "Email already exists",
                  code: "EMAIL_ALREADY_EXISTS",
                },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login user",
        description:
          "Authenticates a user using their email and password. Returns an access token and sets a refresh token in an HTTP-only cookie.",
        operationId: "loginUser",

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LoginRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            headers: {
              "Set-Cookie": {
                description:
                  "HTTP-only refresh token cookie issued by the server.",
                schema: {
                  type: "string",
                },
              },
            },
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/APIResponse",
                },
                example: {
                  success: true,
                  message: "Login successful",
                  data: {
                    user: {
                      id: "68b123456789abcdef123456",
                      email: "ricky@example.com",
                      username: "ricky_lad",
                      displayName: "Ricky Lad",
                      isEmailVerified: true,
                    },
                    accessToken: "eyJhbGciOiJIUzI1NiIs...",
                  },
                },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "Validation failed",
                  code: "VALIDATION_ERROR",
                },
              },
            },
          },
          "401": {
            description: "Invalid email or password",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "Invalid credentials",
                  code: "INVALID_CREDENTIALS",
                },
              },
            },
          },
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Authentication"],
        summary: "Refresh access token",
        description:
          "Generates a new access token and rotates the refresh token using the HTTP-only refresh token cookie.",
        operationId: "refreshAccessToken",
        responses: {
          "200": {
            description: "Access token refreshed Succesefully",
            headers: {
              "Set-Cookie": {
                description:
                  "Rotated HTTP-only refresh token cookie issued by the server.",
                schema: {
                  type: "string",
                },
              },
            },
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/APIResponse",
                },
                example: {
                  success: true,
                  message: "Token refreshed Succesefully",
                  data: {
                    accessToken: "eyJhbGciOiJIUzI1NiIs...",
                  },
                },
              },
            },
          },
          "401": {
            description:
              "Refresh token is missing, invalid, expired, or does not match the stored token.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "Refreshed token is required",
                  code: "UNAUTHORIZED",
                },
              },
            },
          },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Logout user",
        description:
          "Logs out the authenticated session by invalidating the refresh token and clearing the HTTP-only refresh token cookie.",
        operationId: "logoutUser",
        responses: {
          "200": {
            description: "Logout Successfully",
            headers: {
              "Set-Cookie": {
                description: "Clears the HTTP-only refresh token cookie.",
                schema: {
                  type: "string",
                },
              },
            },
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/APIResponse",
                },
                example: {
                  success: true,
                  message: "Logout successful",
                  data: null,
                },
              },
            },
          },
          "401": {
            description: "Refresh token is missing or invalid.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "Invalid refresh token",
                  code: "INVALID_TOKEN",
                },
              },
            },
          },
        },
      },
    },
    "/auth/forgot-password": {
      post: {
        tags: ["Authentication"],
        summary: "Request password reset",
        description:
          "Sends a password reset request for the specified email address. The API returns a generic response whether or not the account exists to prevent user enumeration.",
        operationId: "forgotPassword",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ForgotPasswordRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Password reset request processed Succesefully.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/APIResponse",
                },
                example: {
                  success: true,
                  message:
                    "If an account exists with this email, a password reset link has been sent.",
                  data: null,
                },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "Validation failed",
                  code: "VALIDATION_ERROR",
                },
              },
            },
          },
        },
      },
    },
    "/auth/reset-password": {
      post: {
        tags: ["Authentication"],
        summary: "Reset user password",
        description:
          "Resets the user's password using a valid password reset token. The reset token is single-use, and existing refresh sessions are invalidated after a successful password reset.",
        operationId: "resetPassword",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ResetPasswordRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Password reset successful",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/APIResponse",
                },
                example: {
                  success: true,
                  message: "Password reset successful",
                  data: null,
                },
              },
            },
          },
          "400": {
            description:
              "Validation error or invalid, expired, or already-used reset token",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "Invalid or expired reset token",
                  code: "INVALID_TOKEN",
                },
              },
            },
          },
        },
      },
    },
    "/auth/verify-email": {
      post: {
        tags: ["Authentication"],
        summary: "Verify user email",
        description:
          "Verifies a user's email address using a valid email verification token. The verification token is single-use.",
        operationId: "verifyEmail",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/VerifyEmailRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Email verified Succesefully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/APIResponse",
                },
                example: {
                  success: true,
                  message: "Email verified Succesefully",
                  data: null,
                },
              },
            },
          },
          "400": {
            description:
              "Invalid, expired, or already-used email verification token",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "Invalid or expired verification token",
                  code: "INVALID_TOKEN",
                },
              },
            },
          },
        },
      },
    },
    "/users/me": {
      get: {
        tags: ["Users"],
        summary: "Get current user",
        description:
          "Returns the profile information of the currently authenticated user using a valid access token.",
        operationId: "getCurrentUser",
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          "200": {
            description: "Current user retrieved Succesefully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/APIResponse",
                },
                example: {
                  success: true,
                  message: "User profile retrieved successful",
                  data: {
                    id: "68b123456789abcdef123456",
                    email: "ricky@example.com",
                    username: "ricky_lad",
                    displayName: "Ricky Lad",
                    isEmailVerified: true,
                  },
                },
              },
            },
          },
          "401": {
            description: "Access token is missing, invalid, or expired",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "Unauthorized",
                  code: "UNAUTHORIZED",
                },
              },
            },
          },
          "404": {
            description: "Authenticated user not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  message: "User not found",
                  code: "USER_NOT_FOUND",
                },
              },
            },
          },
        },
      },
    },
  },
};
