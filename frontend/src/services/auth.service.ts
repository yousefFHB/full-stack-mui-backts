import { api } from "./api";
import type { AuthResponse } from "../types/auth.types";
import type { IUser } from "../types/user.types";

export interface CheckAuthResult {
  userExist: boolean;
  hasPassword: boolean;
}

export interface LoginResponseData {
  user?: IUser;
  infoUser?: IUser;
  token?: string;
}

export const authService = {
  /**
   * Check whether phone number exists and whether account has a password.
   * If new user or no password, backend automatically dispatches an OTP.
   */
  checkAuth: (phoneNumber: string) =>
    api.post<AuthResponse<CheckAuthResult>>("/auth", { phoneNumber }),

  /**
   * Verify OTP and log in. Creates account if user does not exist.
   */
  loginWithOtp: (phoneNumber: string, code: string) =>
    api.post<AuthResponse<IUser>>("/auth/login-with-otp", { phoneNumber, code }),

  /**
   * Log in with phone number and existing password.
   */
  loginWithPassword: (phoneNumber: string, password: string) =>
    api.post<AuthResponse<IUser>>("/auth/login-with-password", { phoneNumber, password }),

  /**
   * Request a new OTP code.
   */
  resendOtp: (phoneNumber: string) =>
    api.post<AuthResponse>("/auth/resend-code", { phoneNumber }),

  /**
   * Verify OTP and reset to new password.
   */
  forgetPassword: (phoneNumber: string, code: string, newPassword: string) =>
    api.post<AuthResponse>("/auth/forget-password", { phoneNumber, code, newPassword }),
};

export default authService;
