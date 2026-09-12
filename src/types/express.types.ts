// Extend Express Request interface

import { AuthUser } from "./auth.types.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
