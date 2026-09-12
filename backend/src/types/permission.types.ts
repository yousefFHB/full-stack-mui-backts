import { Document, Types } from "mongoose";

/**
 * The allowed actions a permission can represent.
 * Extend this union as your application grows.
 */
export type PermissionAction = "create" | "read" | "update" | "delete" | "manage";

/**
 * Represents a single atomic action on a resource.
 *
 * Example:
 *   { resource: "product", action: "create", name: "product:create" }
 */
export interface IPermission extends Document {
    /** Auto-generated unique key: "{resource}:{action}" — e.g. "product:create" */
    name: string;
    /** The resource this permission applies to — e.g. "product", "user", "upload" */
    resource: string;
    /** The allowed action on that resource */
    action: PermissionAction;
    /** Optional human-readable description */
    description: string;
}

/**
 * Populated version of a permission (for use in type-safe populate calls).
 * Identical to IPermission but without Document overhead — useful as a plain object.
 */
export interface IPermissionObject {
    _id: Types.ObjectId;
    name: string;
    resource: string;
    action: PermissionAction;
    description: string;
}
