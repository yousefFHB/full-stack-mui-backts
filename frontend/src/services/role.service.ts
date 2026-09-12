import { api } from "./api";
import type { IPopulatedRole } from "../types/role.types";
import type { IPermission } from "../types/permission.types";

export interface CreateRoleDTO {
  name: string;
  description?: string;
  permissions: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const roleService = {
  /**
   * Fetch all roles with their populated permissions
   */
  getRoles: () => api.get<ApiResponse<IPopulatedRole[]>>("/roles"),

  /**
   * Fetch all available permissions in the system
   */
  getPermissions: () => api.get<ApiResponse<IPermission[]>>("/permissions"),

  /**
   * Create a new role with dynamically selected permissions
   */
  createRole: (data: CreateRoleDTO) =>
    api.post<ApiResponse<IPopulatedRole>>("/roles", data),

  /**
   * Delete a custom role by ID
   */
  deleteRole: (id: string) =>
    api.delete<ApiResponse<null>>(`/roles/${id}`),
};

export default roleService;
