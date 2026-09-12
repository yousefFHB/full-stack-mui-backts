import React from "react";
import type { ReactNode } from "react";
import { usePermission } from "../hooks/usePermission";

export interface PermissionGuardProps {
  /** The permission identifier required to render children (e.g. "product:create") */
  permission: string;
  /** Optional fallback node rendered if user lacks the permission */
  fallback?: ReactNode;
  /** Protected UI element(s) */
  children: ReactNode;
}

/**
 * Conditionally renders children if the authenticated user has the specified permission.
 * Strictly checks atomic permissions, not hardcoded role names.
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  fallback = null,
  children,
}) => {
  const { hasPermission } = usePermission();

  if (!hasPermission(permission)) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

export default PermissionGuard;
