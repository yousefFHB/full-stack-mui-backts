import { Document, Types } from "mongoose";

/**
 * A Role is a named group of permissions.
 * Users are assigned one role; all permissions flow through that role.
 *
 * Example:
 *   {
 *     name: "product_manager",
 *     description: "Can manage product catalog",
 *     permissions: [ObjectId, ObjectId, ...]
 *   }
 */
export interface IRole extends Document {
    /** Unique role identifier — e.g. "admin", "product_manager" */
    name: string;
    /** Optional human-readable description */
    description: string;
    /** References to Permission documents this role grants */
    permissions: Types.ObjectId[];
}

/**
 * Populated version of a Role where permissions are resolved documents.
 * Used for type-safe permission checks after .populate("permissions").
 */
export interface IPopulatedRole extends Omit<IRole, "permissions"> {
    permissions: {
        _id: Types.ObjectId;
        name: string;
        resource: string;
        action: string;
    }[];
}
