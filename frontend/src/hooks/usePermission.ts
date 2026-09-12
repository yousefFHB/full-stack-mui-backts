import { useCallback } from "react";
import { useAppSelector, selectUserPermissions } from "../stores/store";

/**
 * Hook to evaluate whether the currently authenticated user possesses
 * specific permissions, based on dynamic permissions resolved from the backend.
 *
 * Does not check static role names or hardcode admin privileges.
 */
export const usePermission = () => {
  const permissions = useAppSelector(selectUserPermissions);

  /**
   * Check whether the user has a single permission (e.g. "product:create")
   */
  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!permission) return false;
      return permissions.includes(permission);
    },
    [permissions]
  );

  /**
   * Check whether the user has at least one of the provided permissions
   */
  const hasAnyPermission = useCallback(
    (requiredPermissions: string[]): boolean => {
      if (!requiredPermissions || requiredPermissions.length === 0) return true;
      return requiredPermissions.some((p) => permissions.includes(p));
    },
    [permissions]
  );

  /**
   * Check whether the user has all of the provided permissions
   */
  const hasAllPermissions = useCallback(
    (requiredPermissions: string[]): boolean => {
      if (!requiredPermissions || requiredPermissions.length === 0) return true;
      return requiredPermissions.every((p) => permissions.includes(p));
    },
    [permissions]
  );

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions,
  };
};

export default usePermission;
