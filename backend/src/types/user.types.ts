import { Document, Types } from "mongoose";

/**
 * Represents a User document in MongoDB.
 *
 * The RBAC relationship flows through the role field:
 *   User → Role → Permission[]
 */
export interface IUser extends Document {
    phoneNumber: string;
    password: string;
    fullName: string;
    isActive: boolean;
    birthDate: Date | null;
    gender: "male" | "female" | null;
    avatar: string[];
    /**
     * Reference to the user's assigned Role document.
     * Permissions are resolved via: user.role → role.permissions[]
     */
    role: Types.ObjectId;
}
