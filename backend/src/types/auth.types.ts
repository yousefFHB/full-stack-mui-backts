import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

/**
 * User roles defined in security-config
 */
export type UserRole = "guest" | "user" | "admin" | "superAdmin";

/**
 * JWT token payload shape
 */
export interface JwtAuthPayload extends JwtPayload {
  _id: string;
  role: UserRole;
  phone?: string;
  email?: string;
}

/**
 * DTO for User Registration
 */
export interface RegisterDTO {
  username?: string;
  phone: string;
  password?: string;
  email?: string;
  role?: UserRole;
}

/**
 * DTO for User Login (Password or Phone/Email)
 */
export interface LoginDTO {
  phone?: string;
  email?: string;
  username?: string;
  password?: string;
}

/**
 * DTO for Requesting an SMS OTP
 */
export interface SendOtpDTO {
  phone: string;
}

/**
 * DTO for Verifying an SMS OTP
 */
export interface VerifyOtpDTO {
  phone: string;
  code: string;
}

/**
 * Standard Auth Response payload
 */
export interface AuthResponse<T = unknown> {
  success: boolean;
  message: string;
  token?: string;
  refreshToken?: string;
  user?: T;
}

/**
 * Strongly typed Express Request for authenticated routes
 */
export interface AuthenticatedRequest<
  Params = Record<string, string>,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = Record<string, string | string[] | undefined>
> extends Request<Params, ResBody, ReqBody, ReqQuery> {
  userId?: string | null;
  role?: UserRole | string | null;
}
