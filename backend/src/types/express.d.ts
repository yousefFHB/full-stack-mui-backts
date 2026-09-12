import "express";
import { UserRole } from "./auth.types.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string | null;
      role?: UserRole | string | null;
    }
  }
}

export {};
