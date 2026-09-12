import type { IUser } from "./user.types";

/**
 * Standard Auth response shape from backend
 */
export interface AuthResponse<T = Record<string, unknown>> {
  success: boolean;
  message: string;
  token?: string;
  data?: {
    user?: IUser;
    infoUser?: IUser;
    token?: string;
    userExist?: boolean;
    hasPassword?: boolean;
  } & T;
}
