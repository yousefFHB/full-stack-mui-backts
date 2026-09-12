import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { IUser } from "../../types/user.types";
import type { RoleField } from "../../types/role.types";

/**
 * Extracts permission names from a user's role field.
 * Handles both populated IPopulatedRole (objects) and string identifiers.
 */
export const extractPermissionsFromRole = (role: RoleField | null | undefined): string[] => {
  if (!role || typeof role === "string") {
    return [];
  }
  if (!Array.isArray(role.permissions)) {
    return [];
  }
  return role.permissions
    .map((permission) => {
      if (typeof permission === "string") {
        return permission;
      }
      if (permission && typeof permission === "object" && "name" in permission) {
        return permission.name;
      }
      return "";
    })
    .filter((perm): perm is string => Boolean(perm));
};

export interface AuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  permissions: string[];
}

const getInitialToken = (): string | null => {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
};

const initialToken = getInitialToken();

const initialState: AuthState = {
  user: null,
  token: initialToken,
  isAuthenticated: Boolean(initialToken),
  permissions: [],
};

interface SetCredentialsPayload {
  user?: IUser | null;
  infoUser?: IUser | null;
  token?: string | null;
  permissions?: string[];
}

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
      const incomingUser = action.payload.user ?? action.payload.infoUser ?? null;
      if (incomingUser) {
        state.user = incomingUser;
        state.permissions = action.payload.permissions ?? extractPermissionsFromRole(incomingUser.role);
      } else if (action.payload.permissions) {
        state.permissions = action.payload.permissions;
      }

      if (action.payload.token !== undefined) {
        state.token = action.payload.token;
        state.isAuthenticated = Boolean(action.payload.token);
        try {
          if (action.payload.token) {
            localStorage.setItem("token", action.payload.token);
          } else {
            localStorage.removeItem("token");
          }
        } catch {
          // ignore local storage errors
        }
      }
    },
    setUser: (state, action: PayloadAction<IUser | null>) => {
      state.user = action.payload;
      if (action.payload) {
        state.permissions = extractPermissionsFromRole(action.payload.role);
      } else {
        state.permissions = [];
      }
    },
    setPermissions: (state, action: PayloadAction<string[]>) => {
      state.permissions = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.permissions = [];
      try {
        localStorage.removeItem("token");
      } catch {
        // ignore local storage errors
      }
    },
  },
});

export const { setCredentials, setUser, setPermissions, logout } = authSlice.actions;

export default authSlice.reducer;
