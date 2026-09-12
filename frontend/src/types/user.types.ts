import type { RoleField } from "./role.types";

/**
 * User representation matching backend IUser model
 */
export interface IUser {
  _id: string;
  phoneNumber: string;
  fullName: string;
  isActive: boolean;
  birthDate: string | null;
  gender: "male" | "female" | null;
  avatar: string[];
  /** Reference to user's assigned role or populated role */
  role: RoleField;
  createdAt?: string;
  updatedAt?: string;
}
