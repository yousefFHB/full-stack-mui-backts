/**
 * Standard application permissions matching backend resource:action convention.
 * The backend computes permission names as `${resource}:${action}`.
 */
export const PERMISSIONS = {
  PRODUCT: {
    CREATE: "product:create",
    READ: "product:read",
    UPDATE: "product:update",
    DELETE: "product:delete",
    MANAGE: "product:manage",
  },
  USER: {
    CREATE: "user:create",
    READ: "user:read",
    UPDATE: "user:update",
    DELETE: "user:delete",
    MANAGE: "user:manage",
  },
  ROLE: {
    CREATE: "role:create",
    READ: "role:read",
    UPDATE: "role:update",
    DELETE: "role:delete",
    MANAGE: "role:manage",
  },
  PERMISSION: {
    CREATE: "permission:create",
    READ: "permission:read",
    UPDATE: "permission:update",
    DELETE: "permission:delete",
    MANAGE: "permission:manage",
  },
  UPLOAD: {
    CREATE: "upload:create",
    READ: "upload:read",
    UPDATE: "upload:update",
    DELETE: "upload:delete",
    MANAGE: "upload:manage",
  },
} as const;

export type AppPermission =
  | typeof PERMISSIONS[keyof typeof PERMISSIONS][keyof typeof PERMISSIONS[keyof typeof PERMISSIONS]]
  | (string & {});
