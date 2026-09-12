import React from "react";
import { Box, Button, Typography, Chip, Container } from "@mui/material";
import { useAppDispatch, useAppSelector, selectCurrentUser, selectIsAuthenticated } from "../stores/store";
import { logout } from "../stores/auth/auth.slice";
import { glassNavSx } from "./glassmorphism";
import { ShieldIcon, LogoutIcon, UserIcon } from "./Icons";

export interface NavbarProps {
  currentView: "home" | "auth" | "roles";
  onNavigate: (view: "home" | "auth" | "roles") => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);

  const getRoleDisplayName = (): string => {
    if (!user || !user.role) return "User";
    if (typeof user.role === "string") return "Assigned";
    if ("name" in user.role) return user.role.name;
    return "User";
  };

  const handleLogout = () => {
    dispatch(logout());
    onNavigate("home");
  };

  return (
    <Box sx={{ pt: 2.5, px: 2, pb: 1, position: "sticky", top: 0, zIndex: 1100 }}>
      <Container maxWidth="lg" disableGutters>
        <Box
          sx={{
            ...glassNavSx,
            px: { xs: 1.5, sm: 3 },
            py: { xs: 1, sm: 1.5 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo & Brand */}
          <Box
            onClick={() => onNavigate("home")}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, sm: 1.5 },
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <Box
              sx={{
                width: { xs: 32, sm: 38 },
                height: { xs: 32, sm: 38 },
                borderRadius: 2,
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.35)",
              }}
            >
              <ShieldIcon sx={{ fontSize: { xs: 18, sm: 22 } }} />
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  letterSpacing: -0.5,
                  color: "#0f172a",
                  lineHeight: 1.2,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                }}
              >
                RBAC Platform
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b", display: { xs: "none", sm: "block" } }}>
                Minimalist Full-Stack
              </Typography>
            </Box>
          </Box>

          {/* Navigation Links */}
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1 } }}>
            <Button
              size="small"
              onClick={() => onNavigate("home")}
              sx={{
                color: currentView === "home" ? "#1d4ed8" : "#475569",
                fontWeight: currentView === "home" ? 700 : 500,
                background: currentView === "home" ? "rgba(37, 99, 235, 0.08)" : "transparent",
                borderRadius: 2,
                px: { xs: 1.2, sm: 2 },
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
                textTransform: "none",
                "&:hover": {
                  background: "rgba(37, 99, 235, 0.12)",
                },
              }}
            >
              Home
            </Button>

            <Button
              size="small"
              onClick={() => onNavigate("roles")}
              sx={{
                color: currentView === "roles" ? "#1d4ed8" : "#475569",
                fontWeight: currentView === "roles" ? 700 : 500,
                background: currentView === "roles" ? "rgba(37, 99, 235, 0.08)" : "transparent",
                borderRadius: 2,
                px: { xs: 1.2, sm: 2 },
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
                textTransform: "none",
                "&:hover": {
                  background: "rgba(37, 99, 235, 0.12)",
                },
              }}
            >
              Roles
            </Button>

            {/* Auth Actions */}
            {isAuthenticated ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1 }, ml: { xs: 0.5, sm: 1 } }}>
                <Chip
                  icon={<UserIcon sx={{ fontSize: 16 }} />}
                  label={`${user?.phoneNumber || "User"} (${getRoleDisplayName()})`}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: "rgba(37, 99, 235, 0.25)",
                    background: "rgba(255, 255, 255, 0.5)",
                    fontWeight: 600,
                    color: "#1e293b",
                    display: { xs: "none", md: "inline-flex" },
                  }}
                />
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  startIcon={<LogoutIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                  onClick={handleLogout}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    borderColor: "rgba(239, 68, 68, 0.3)",
                    px: { xs: 1, sm: 1.5 },
                    fontSize: { xs: "0.78rem", sm: "0.85rem" },
                  }}
                >
                  Logout
                </Button>
              </Box>
            ) : (
              <Button
                size="small"
                variant="contained"
                onClick={() => onNavigate("auth")}
                sx={{
                  ml: { xs: 0.5, sm: 1 },
                  borderRadius: 2,
                  px: { xs: 1.5, sm: 2.5 },
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                  textTransform: "none",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)",
                }}
              >
                Sign In
              </Button>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Navbar;
