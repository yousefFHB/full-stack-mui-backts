import type { IPermission } from "./permission.types";

/**
 * Role representation matching backend IRole model
 */
export interface IRole {
  _id: string;
  name: string;
  description?: string;
  /** References to Permission IDs */
  permissions: string[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Populated version of Role matching backend IPopulatedRole interface
 * where permissions are resolved IPermission objects.
 */
export interface IPopulatedRole extends Omit<IRole, "permissions"> {
  permissions: IPermission[];
}

/**
 * Union type for role property in User document:
 * can be an unpopulated ObjectId string, an IRole, or an IPopulatedRole.
 */
export type RoleField = string | IRole | IPopulatedRole;
