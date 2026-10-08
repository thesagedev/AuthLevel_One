# Auth

A production-ready authentication backend starter built with **Node.js,
Express, TypeScript, MongoDB, and JWT**.

Auth gives you a reusable authentication foundation so you do
not have to rebuild registration, login, refresh tokens, password reset,
email verification, validation, security middleware, error handling,
Swagger documentation, testing, and Docker setup for every new project.

> **Authentication is intentionally focused.** Advanced features such as
> roles, permissions, audit logs, admin dashboards, device/session
> management, login history, and MFA are outside this version.

## Table of Contents

-   [1. Quick Start](#1-quick-start)
-   [2. What You Get](#2-what-you-get)
-   [3. Technology Stack](#3-technology-stack)
-   [4. How It Works](#4-how-it-works)
-   [5. Authentication Flows](#5-authentication-flows)
-   [6. Project Structure](#6-project-structure)
-   [7. Where to Change Things](#7-where-to-change-things)
-   [8. API Endpoints](#8-api-endpoints)
-   [9. Response Format](#9-response-format)
-   [10. Environment Variables](#10-environment-variables)
-   [11. Installation](#11-installation)
-   [12. MongoDB](#12-mongodb)
-   [13. Development and Production](#13-development-and-production)
-   [14. Swagger / API Docs](#14-swagger--api-docs)
-   [15. Testing](#15-testing)
-   [16. Linting and Build](#16-linting-and-build)
-   [17. Docker](#17-docker)
-   [18. Email System](#18-email-system)
-   [19. Security](#19-security)
-   [20. Configuration Map](#20-configuration-map)
-   [21. Customization Guide](#21-customization-guide)
-   [22. Production Checklist](#22-production-checklist)
-   [23. Troubleshooting](#23-troubleshooting)
-   [24. Authentication Scope](#24-scope)
-   [25. License](#25-license)

------------------------------------------------------------------------

# 1. Quick Start {#1-quick-start}

The normal buyer workflow is:

``` text
Install → Configure ENV → Connect MongoDB → Run → Build your app
```

``` bash
# Install dependencies
pnpm install

# Create your local environment file
cp .env.example .env

# Edit .env with your database and secrets

# Start MongoDB

# Start the API
pnpm dev
```

Then open:

``` text
http://localhost:5000/api/docs
```

The default API base URL is:

``` text
http://localhost:5000/api/v1
```

------------------------------------------------------------------------

# 2. What You Get {#2-what-you-get}

```
  Feature                         Included
  ------------------------------ ----------

  User registration                  ✅
  Login                              ✅
  JWT access tokens                  ✅
  Refresh token rotation             ✅
  HTTP-only refresh cookie           ✅
  Logout                             ✅
  bcrypt password hashing            ✅
  Forgot password                    ✅
  Password reset                     ✅
  Email verification                 ✅
  Resend verification                ✅
  Authenticated user profile         ✅
  Zod validation                     ✅
  Structured responses               ✅
  Global error handling              ✅
  Authentication rate limiting       ✅
  Helmet security headers            ✅
  CORS                               ✅
  Compression                        ✅
  Pino logging                       ✅
  Swagger/OpenAPI                    ✅
  Docker                             ✅
  MongoDB/Mongoose                   ✅
  TypeScript                         ✅
  Vitest tests                       ✅
  ESLint                             ✅

------------------------------------------------------------------------
```

# 3. Technology Stack {#3-technology-stack}

  Technology           Purpose
  -------------------- -----------------------------------
  Node.js 22+          Runtime
  TypeScript           Application language
  Express 5            HTTP server
  MongoDB              Database
  Mongoose             MongoDB ODM
  JWT                  Access and refresh authentication
  bcrypt               Password hashing
  Zod                  Request validation
  Nodemailer           Email delivery
  Helmet               Security headers
  CORS                 Cross-origin access control
  express-rate-limit   Authentication rate limiting
  Pino                 Logging
  Swagger UI           API documentation
  Vitest               Tests
  ESLint               Code quality
  pnpm                 Package manager
  Docker               Container deployment

See [`package.json`](./package.json) for the complete dependency list
and scripts.

------------------------------------------------------------------------

# 4. How It Works {#4-how-it-works}

The project follows a small layered architecture:

``` text
HTTP Request
     │
     ▼
   Route
     │
     ▼
Validation Middleware
     │
     ▼
 Controller
     │
     ▼
  Service
     │
     ├───────────────┐
     ▼               ▼
Repository      Token / Email Services
     │               │
     ▼               ▼
 MongoDB        JWT / Email Provider
```

### Simple rule

-   **Routes** decide which endpoint receives the request.
-   **Validation** checks incoming data.
-   **Controllers** handle HTTP requests and responses.
-   **Services** contain business logic.
-   **Repositories** handle database operations.
-   **Models** describe MongoDB data.
-   **Middleware** handles cross-cutting concerns such as auth, errors,
    logging, and security.
-   **Config** contains environment-driven application configuration.

## Full request wireframe

``` text
┌──────────────┐
│    Client    │
└──────┬───────┘
       │ HTTP
       ▼
┌──────────────┐
│   Express    │
│ Security     │
│ Logging      │
│ CORS/Cookies │
└──────┬───────┘
       ▼
┌──────────────┐
│    Route     │
└──────┬───────┘
       ▼
┌──────────────┐
│  Validation  │
│     Zod      │
└──────┬───────┘
       ▼
┌──────────────┐
│  Controller  │
└──────┬───────┘
       ▼
┌──────────────┐
│   Service    │
└──────┬───────┘
       ▼
┌──────────────┐
│  Repository  │
└──────┬───────┘
       ▼
┌──────────────┐
│   MongoDB    │
└──────────────┘
```

------------------------------------------------------------------------

# 5. Authentication Flows {#5-authentication-flows}

## 5.1 Registration {#51-registration}

``` text
Client
  │ POST /auth/register
  ▼
Validation
  ▼
AuthController
  ▼
AuthService
  ├─ check email
  ├─ check username
  ├─ hash password
  ├─ create user
  └─ create verification token
  ▼
MongoDB
  ▼
Email Service
  ▼
Verification email
```

Passwords are hashed before storage.

## 5.2 Login {#52-login}

``` text
Client
  │ email + password
  ▼
AuthService
  ├─ find user
  ├─ compare password
  ├─ check email verification
  ├─ create access token
  ├─ create refresh token
  └─ store refresh-token hash
       │
       ├───────────────┐
       ▼               ▼
 Access token     HTTP-only cookie
```

The access token is returned in the response. The refresh token is kept
in an HTTP-only cookie.

## 5.3 Refresh {#53-refresh}

``` text
Browser
   │ refresh cookie
   ▼
POST /auth/refresh
   ▼
Verify refresh JWT
   ▼
Find stored token hash
   ▼
Compare token
   ▼
Rotate refresh token
   ├─ new access token
   └─ new refresh cookie
```

## 5.4 Logout {#54-logout}

``` text
Client
   ▼
POST /auth/logout
   ▼
Clear stored refresh token
   ▼
Clear refresh cookie
   ▼
Success
```

Logout is intentionally idempotent.

## 5.5 Password reset {#55-password-reset}

``` text
Forgot password
       │
       ▼
Generate secure token
       │
       ├─ store token hash + expiry
       ▼
Send email
       │
       ▼
User opens link
       │
       ▼
Reset password
       │
       ├─ validate token
       ├─ hash new password
       ├─ clear reset token
       └─ invalidate old refresh session
```

The forgot-password response does not reveal whether an email exists.

## 5.6 Email verification {#56-email-verification}

``` text
Register
   ▼
Create verification token
   ▼
Store token hash + expiry
   ▼
Send email
   ▼
User opens link
   ▼
POST /auth/verify-email
   ▼
Validate token + expiry
   ▼
Mark email verified
   ▼
Clear verification token
```

------------------------------------------------------------------------

# 6. Project Structure {#6-project-structure}

``` text
authentication/
│
├── src/
│   ├── app.ts
│   ├── server.ts
│   │
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── email.config.ts
│   │   ├── env.config.ts
│   │   ├── logger.config.ts
│   │   ├── rate-limit.config.ts
│   │   ├── security.config.ts
│   │   └── swagger.config.ts
│   │
│   ├── constants/
│   │   ├── api.constants.ts
│   │   ├── app.constants.ts
│   │   ├── auth.constants.ts
│   │   ├── cookie.constants.ts
│   │   └── validation.constants.ts
│   │
│   ├── core/
│   │   ├── errors/
│   │   └── responses/
│   │
│   ├── middleware/
│   │   ├── async-handler.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── not-found.middleware.ts
│   │   └── request-logger.middleware.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.cookies.ts
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── models/
│   │   │   ├── repositories/
│   │   │   ├── routes/
│   │   │   └── services/
│   │   │
│   │   ├── health/
│   │   └── users/
│   │
│   ├── routes/
│   │   ├── routes.ts
│   │   └── swagger.ts
│   │
│   ├── types/
│   ├── validators/
│ 
│
├── tests/
│   ├── auth.service.test.ts
│   └── token.service.test.ts
│
├── .dockerignore
├── .env.example
├── .gitignore
├── Dockerfile
├── eslint.config.ts
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── tsconfig.json
```

`dist/`, `node_modules/`, `.env`, coverage output, and local development
artifacts are intentionally ignored.

------------------------------------------------------------------------

# 7. Where to Change Things {#7-where-to-change-things}

  Goal                         File / folder
  ---------------------------- ----------------------------------------------------------------------------------------------------------------
```

  Environment variables        [`.env.example`](./.env.example)
  Environment loading          [`src/config/env.config.ts`](./src/config/env.config.ts)
  Database connection          [`src/config/database.config.ts`](./src/config/database.config.ts)
  CORS/security                [`src/config/security.config.ts`](./src/config/security.config.ts)
  Rate limiting                [`src/config/rate-limit.config.ts`](./src/config/rate-limit.config.ts)
  Email configuration          [`src/config/email.config.ts`](./src/config/email.config.ts)
  Swagger                      [`src/config/swagger.config.ts`](./src/config/swagger.config.ts)
  Auth endpoints               [`src/modules/auth/routes/auth.route.ts`](./src/modules/auth/routes/auth.route.ts)
  Auth HTTP handling           [`src/modules/auth/controllers/auth.controller.ts`](./src/modules/auth/controllers/auth.controller.ts)
  Auth business logic          [`src/modules/auth/services/auth.service.ts`](./src/modules/auth/services/auth.service.ts)
  JWT logic                    [`src/modules/auth/services/token.service.ts`](./src/modules/auth/services/token.service.ts)
  Email abstraction            [`src/modules/auth/services/email.service.ts`](./src/modules/auth/services/email.service.ts)
  Console email                [`src/modules/auth/services/console-email.provider.ts`](./src/modules/auth/services/console-email.provider.ts)
  SMTP email                   [`src/modules/auth/services/smtp-email.provider.ts`](./src/modules/auth/services/smtp-email.provider.ts)
  User model                   [`src/modules/auth/models/user.model.ts`](./src/modules/auth/models/user.model.ts)
  Auth database access         [`src/modules/auth/repositories/auth.repository.ts`](./src/modules/auth/repositories/auth.repository.ts)
  Protected profile endpoint   [`src/modules/users/`](./src/modules/users/)
  Validation                   [`src/validators/`](./src/validators/)
  Error codes                  [`src/core/errors/error-codes.ts`](./src/core/errors/error-codes.ts)
  API response shape           [`src/core/responses/`](./src/core/responses/)
  Global middleware            [`src/middleware/`](./src/middleware/)
  App startup                  [`src/app.ts`](./src/app.ts), [`src/server.ts`](./src/server.ts)
  Tests                        [`tests/`](./tests/)
  TypeScript                   [`tsconfig.json`](./tsconfig.json)
  ESLint                       [`eslint.config.ts`](./eslint.config.ts)
  Docker image                 [`Dockerfile`](./Dockerfile)

------------------------------------------------------------------------

# 8. API Endpoints {#8-api-endpoints}

Default base URL:

``` text
http://localhost:5000/api/v1
```

## Health

  Method   Endpoint    Auth     Purpose
  -------- ----------- -------- -------------------------
  GET      `/health`   Public   API and database health

## Authentication

  Method   Endpoint                      Auth                      Purpose
  -------- ----------------------------- ------------------------- -------------------------
  POST     `/auth/register`              Public                    Register user
  POST     `/auth/login`                 Public                    Login
  POST     `/auth/refresh`               Refresh cookie            Get a new access token
  POST     `/auth/logout`                Optional refresh cookie   Logout
  POST     `/auth/forgot-password`       Public                    Request password reset
  POST     `/auth/reset-password`        Reset token               Set new password
  POST     `/auth/verify-email`          Verification token        Verify email
  POST     `/auth/resend-verification`   Public                    Send verification again

## Users

  Method   Endpoint      Auth                  Purpose
  -------- ------------- --------------------- ------------------
  GET      `/users/me`   Bearer access token   Get current user

Complete examples:

``` text
POST http://localhost:5000/api/v1/auth/register
POST http://localhost:5000/api/v1/auth/login
POST http://localhost:5000/api/v1/auth/refresh
POST http://localhost:5000/api/v1/auth/logout
POST http://localhost:5000/api/v1/auth/forgot-password
POST http://localhost:5000/api/v1/auth/reset-password
POST http://localhost:5000/api/v1/auth/verify-email
POST http://localhost:5000/api/v1/auth/resend-verification
GET  http://localhost:5000/api/v1/users/me
GET  http://localhost:5000/api/v1/health
```

Use Swagger for the exact request schemas and examples.

------------------------------------------------------------------------

# 9. Response Format {#9-response-format}

Successful responses use:

``` json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Errors use:

``` json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Readable error message",
    "details": {}
  }
}
```

The stable `code` makes frontend error handling easier than depending
only on human-readable messages.

------------------------------------------------------------------------

# 10. Environment Variables {#10-environment-variables}

Create the local file:

``` bash
cp .env.example .env
```

  Variable                      Example                                     Purpose
  ----------------------------- ------------------------------------------- -----------------------------





```
`NODE_ENV`                    `development`                               Environment
  `PORT`                        `5000`                                      API port
  `API_PREFIX`                  `api`                                       API prefix
  `API_VERSION`                 `v1`                                        API version
  `MONGODB_URI`                 `mongodb://localhost:27017/authentication`   Database
  `JWT_ACCESS_SECRET`           random 32+ characters                       Access token signing
  `JWT_REFRESH_SECRET`          random 32+ characters                       Refresh token signing
  `JWT_ACCESS_EXPIRES_IN`       `15m`                                       Access token lifetime
  `JWT_REFRESH_EXPIRES_IN`      `7d`                                        Refresh token lifetime
  `CORS_ORIGIN`                 `http://localhost:3000`                     Allowed frontend origin
  `AUTH_RATE_LIMIT_WINDOW_MS`   `900000`                                    Rate-limit window
  `AUTH_RATE_LIMIT_MAX`         `10`                                        Max auth requests in window
  `EMAIL_PROVIDER`              `console`                                   Email provider
  `EMAIL_FROM`                  `no-reply@example.com`                      Sender
  `FRONTEND_URL`                `http://localhost:3000`                     Frontend URL in email links
  ```
```
Never commit:

``` text
.env
.env.docker
real JWT secrets
SMTP passwords
API keys
production database credentials
```

------------------------------------------------------------------------

# 11. Installation {#11-installation}

## 11.1 Requirements {#111-requirements}

-   Node.js 22 or newer
-   pnpm 11
-   MongoDB

Check versions:

``` bash
node --version
pnpm --version
```

The repository is configured for pnpm 11.11.0.

## 11.2 Install {#112-install}

``` bash
pnpm install
```

## 11.3 Configure environment {#113-configure-environment}

``` bash
cp .env.example .env
```

At minimum configure:

``` env
MONGODB_URI=mongodb://localhost:27017/authentication
JWT_ACCESS_SECRET=your_random_access_secret
JWT_REFRESH_SECRET=your_random_refresh_secret
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

## 11.4 Start MongoDB {#114-start-mongodb}

Make sure MongoDB is running before starting the API.

## 11.5 Start API {#115-start-api}

``` bash
pnpm dev
```

------------------------------------------------------------------------

# 12. MongoDB {#12-mongodb}

The local default is:

``` text
mongodb://localhost:27017/authentication
```

You can use:

-   Local MongoDB
-   MongoDB Docker container
-   MongoDB Atlas
-   Another reachable MongoDB deployment

Change only the environment variable when moving databases:

``` env
MONGODB_URI=your_connection_string
```

Do not place database credentials in TypeScript files.

------------------------------------------------------------------------

# 13. Development and Production {#13-development-and-production}

## Development

``` bash
pnpm dev
```

The server runs with TypeScript watch mode.

## Build

``` bash
pnpm build
```

Compiled output is placed in `dist/`.

## Start compiled application

``` bash
pnpm start
```

## Clean build output

``` bash
pnpm clean
```

## Available scripts

  Command           Purpose
  ----------------- ------------------------------------
  `pnpm dev`        Development server with watch mode
  `pnpm start`      Run compiled production server
  `pnpm build`      Compile TypeScript
  `pnpm clean`      Remove `dist/`
  `pnpm test`       Vitest watch mode
  `pnpm test:run`   Run tests once
  `pnpm test:ui`    Open Vitest UI
  `pnpm lint`       Run ESLint

------------------------------------------------------------------------

# 14. Swagger / API Docs {#14-swagger--api-docs}

Swagger UI is available at:

``` text
http://localhost:5000/api/docs
```

Use it to inspect:

-   endpoints
-   request bodies
-   response examples
-   authentication requirements
-   Bearer token authorization

Typical workflow:

``` text
Start API
   ↓
Open /api/docs
   ↓
Register
   ↓
Verify email
   ↓
Login
   ↓
Authorize with access token
   ↓
Try protected endpoints
```

Swagger configuration lives in
[`src/config/swagger.config.ts`](./src/config/swagger.config.ts). The
Swagger route is in [`src/routes/swagger.ts`](./src/routes/swagger.ts).

------------------------------------------------------------------------

# 15. Testing {#15-testing}

Tests use Vitest.

``` bash
pnpm test
```

Run once:

``` bash
pnpm test:run
```

Open the UI:

``` bash
pnpm test:ui
```

Current core tests cover authentication and token behavior, including
registration, duplicate accounts, login failures, verification state,
refresh rotation, logout, password reset, password reuse, email
verification, and token verification.

Test files:

-   [`tests/auth.service.test.ts`](./tests/auth.service.test.ts)
-   [`tests/token.service.test.ts`](./tests/token.service.test.ts)

------------------------------------------------------------------------

# 16. Linting and Build {#16-linting-and-build}

Run lint:

``` bash
pnpm lint
```

Run the full local release check:

``` bash
pnpm clean && pnpm build && pnpm lint && pnpm test:run
```

This checks compilation, linting, and tests together.

------------------------------------------------------------------------

# 17. Docker {#17-docker}

The repository contains a multi-stage [`Dockerfile`](./Dockerfile).

``` text
Dependencies
     ↓
Build TypeScript
     ↓
Production image
     ↓
Run compiled server
```

The production image uses Node.js 22 Alpine and runs as the non-root
`node` user.

Build:

``` bash
docker build -t authentication .
```

Run:

``` bash
docker run --rm \
  -p 5000:5000 \
  --env-file .env.docker \
  authentication
```

### Important Docker note

Inside a container, `localhost` means the container itself. If MongoDB
is outside the API container, use a reachable MongoDB hostname rather
than `localhost`.

For production, use your real MongoDB host or managed MongoDB service.

------------------------------------------------------------------------

# 18. Email System {#18-email-system}

Email sending is separated from authentication business logic.

``` text
AuthService
    │
    ▼
EmailService
    │
    ▼
EmailProvider
    │
    ├── ConsoleEmailProvider
    └── SmtpEmailProvider
```

This makes local development simple and allows SMTP to be introduced
without rewriting authentication logic.

## Development

Use:

``` env
EMAIL_PROVIDER=console
```

The email content/link is printed to the application console.

## SMTP

Use:

``` env
EMAIL_PROVIDER=smtp
```

Then configure the SMTP settings supported by:

-   [`src/config/email.config.ts`](./src/config/email.config.ts)
-   [`src/modules/auth/services/email.service.ts`](./src/modules/auth/services/email.service.ts)
-   [`src/modules/auth/services/smtp-email.provider.ts`](./src/modules/auth/services/smtp-email.provider.ts)

------------------------------------------------------------------------

# 19. Security {#19-security}

### Passwords

Passwords are hashed with bcrypt and are not stored as plain text.

### Access tokens

Access tokens are short-lived JWTs.

### Refresh tokens

Refresh tokens are signed JWTs kept in an HTTP-only cookie. The stored
database value is a hash, and refresh operations rotate the token.

### Cookies

The refresh cookie uses HTTP-only behavior, `SameSite=Strict`, and
becomes secure in production.

### JWT verification

Access and refresh tokens use separate secrets and are verified with the
expected signing algorithm.

### Rate limiting

Authentication routes use a rate limiter to reduce repeated
authentication abuse.

### Security headers

Helmet is enabled.

### CORS

CORS is controlled by environment configuration.

### Password reset and verification tokens

Sensitive one-time tokens are generated securely, hashed before storage,
and expire.

### Error handling

Structured errors use stable application error codes and avoid
unnecessary account information disclosure.

------------------------------------------------------------------------

# 20. Configuration Map {#20-configuration-map}

``` text
.env
 │
 ▼
src/config/env.config.ts
 │
 ├── database ────────► database.config.ts
 ├── security ────────► security.config.ts
 ├── rate limits ─────► rate-limit.config.ts
 ├── email ───────────► email.config.ts
 ├── logger ──────────► logger.config.ts
 └── Swagger ─────────► swagger.config.ts
```

The application keeps environment-driven configuration outside business
logic.

------------------------------------------------------------------------

# 21. Customization Guide {#21-customization-guide}

The expected customization path is small.

  Need                Start here
  ------------------- -----------------------------------------------------------
  New MongoDB         `.env` → `MONGODB_URI`
  New JWT secrets     `.env` → `JWT_*_SECRET`
  New frontend        `.env` → `FRONTEND_URL` and `CORS_ORIGIN`
  Real email          `.env` → `EMAIL_PROVIDER=smtp` + email config/provider
  Auth behavior       `src/modules/auth/services/auth.service.ts`
  JWT behavior        `src/modules/auth/services/token.service.ts`
  Validation rules    `src/validators/schemas/auth.schema.ts`
  User data           `src/modules/auth/models/user.model.ts`
  User profile        `src/modules/users/`
  API routes          `src/modules/auth/routes/` or `src/modules/users/routes/`
  API docs            `src/config/swagger.config.ts`
  Error codes         `src/core/errors/error-codes.ts`
  Response format     `src/core/responses/`
  Global middleware   `src/middleware/`

------------------------------------------------------------------------

# 22. Production Checklist {#22-production-checklist}

Before deploying:

-   [ ] Use a production MongoDB deployment.
-   [ ] Generate strong unique JWT secrets.
-   [ ] Set `NODE_ENV=production`.
-   [ ] Set the real frontend origin.
-   [ ] Set the real frontend URL.
-   [ ] Configure real SMTP.
-   [ ] Use HTTPS.
-   [ ] Confirm secure refresh cookies.
-   [ ] Review authentication rate limits.
-   [ ] Review CORS.
-   [ ] Run tests.
-   [ ] Run TypeScript build.
-   [ ] Run ESLint.
-   [ ] Test the Docker image if using Docker.
-   [ ] Never commit `.env`.
-   [ ] Never expose JWT/SMTP secrets to frontend code.
-   [ ] Decide whether Swagger should be publicly accessible.

------------------------------------------------------------------------

# 23. Troubleshooting {#23-troubleshooting}

## Server does not start

Run:

``` bash
pnpm install
pnpm build
```

Fix the first reported error.

## MongoDB connection fails

Check `MONGODB_URI`, then confirm MongoDB is running and reachable from
the API process.

## Login fails

Check:

1.  User exists.
2.  Password is correct.
3.  Email is verified.
4.  MongoDB is connected.
5.  Request matches the validation schema.

## Refresh fails

Check:

1.  Refresh cookie is sent.
2.  Frontend credentials are enabled where required.
3.  CORS is correct.
4.  Refresh token is not expired.
5.  Stored refresh-token hash matches the token.

## Email is not sent

`EMAIL_PROVIDER=console` intentionally prints the email to the terminal.
Use `smtp` for real delivery.

## Protected endpoint returns 401

Send:

``` http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Example:

``` text
GET /api/v1/users/me
Authorization: Bearer eyJ...
```

------------------------------------------------------------------------

# 24. Authentication Scope {#24-scope}

Authentication focuses on the reusable authentication foundation.

  Feature                        Authentication
  ----------------------------- -----------
```
  Registration                      ✅
  Login                             ✅
  JWT access tokens                 ✅
  Refresh token rotation            ✅
  Password reset                    ✅
  Email verification                ✅
  User profile                      ✅
  Roles and permissions             ❌
  RBAC                              ❌
  Admin dashboard                   ❌
  Audit logs                        ❌
  Login history                     ❌
  Device/session management         ❌
  MFA                               ❌
  Social OAuth providers            ❌
  Advanced account management       ❌

Keeping these out of Authentication makes the starter easier to learn,
integrate, test, and maintain.
```

------------------------------------------------------------------------

# 25. License{#25-license}

Refer to the license and commercial terms supplied with your purchased
distribution.

This README documents the technical project. It does not replace the
commercial license terms.

------------------------------------------------------------------------

## Architecture at a Glance


         ┌──────────────────────┐
         │       Frontend       │
         └──────────┬───────────┘
                     │
               HTTP / Cookies
                     │
                     ▼
         ┌──────────────────────┐
         │       Express        │
         │ Security + Logging   │
         └──────────┬───────────┘
                     │
                     ▼
         ┌──────────────────────┐
         │        Routes        │
         └──────────┬───────────┘
                     │
                     ▼
         ┌──────────────────────┐
         │      Validation      │
         │         Zod          │
         └──────────┬───────────┘
                     │
                     ▼
         ┌──────────────────────┐
         │     Controllers      │
         └──────────┬───────────┘
                     │
                     ▼
         ┌──────────────────────┐
         │       Services       │
         │ Auth / Token / Email │
         └──────┬─────────┬─────┘
               │         │
               ▼         ▼
         ┌──────────┐  ┌──────────┐
         │Repository│  │  Email   │
         └────┬─────┘  └──────────┘
               │
               ▼
         ┌──────────┐
         │ MongoDB  │
         └──────────┘


**Install. Configure. Run. Build your application.**
