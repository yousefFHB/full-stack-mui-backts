/**
 * Allowed actions matching backend permission schema:
 * "create" | "read" | "update" | "delete" | "manage"
 */
export type PermissionAction = "create" | "read" | "update" | "delete" | "manage";

/**
 * Permission representation matching backend IPermission model
 */
export interface IPermission {
  _id: string;
  /** Auto-computed in backend as "{resource}:{action}" — e.g. "product:create" */
  name: string;
  /** Resource this permission applies to — e.g. "product", "user", "upload" */
  resource: string;
  /** The allowed action on that resource */
  action: PermissionAction;
  /** Human-readable description */
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}
