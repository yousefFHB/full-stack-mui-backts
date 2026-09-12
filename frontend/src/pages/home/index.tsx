import React from "react";
import { Box, Container, Typography, Button, Stack, Chip, Fade } from "@mui/material";
import { glassCardSx } from "../../components/glassmorphism";
import { useAppSelector, selectIsAuthenticated, selectCurrentUser, selectUserPermissions } from "../../stores/store";
import { ShieldIcon, KeyIcon } from "../../components/Icons";

export interface HomePageProps {
  onNavigate: (view: "home" | "auth" | "roles") => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);
  const permissions = useAppSelector(selectUserPermissions);

  const getRoleName = (): string => {
    if (!user || !user.role) return "None";
    if (typeof user.role === "string") return user.role;
    if ("name" in user.role) return user.role.name;
    return "User";
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 6, md: 8 }, px: { xs: 2, sm: 3 } }}>
      <Fade in timeout={400}>
        <Box
          sx={{
            ...glassCardSx,
            p: { xs: 3, sm: 5, md: 6 },
            textAlign: "center",
            position: "relative",
          }}
        >
          {/* Ambient Top Glow Accent */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "60%",
              height: "4px",
              background: "linear-gradient(90deg, transparent, #2563eb, transparent)",
            }}
          />

          {/* Minimal Badge */}
          <Box sx={{ display: "inline-flex", mb: { xs: 2, sm: 3 } }}>
            <Chip
              icon={<ShieldIcon sx={{ fontSize: 16 }} />}
              label="MERN RBAC Engine"
              size="small"
              sx={{
                background: "rgba(37, 99, 235, 0.08)",
                color: "#1d4ed8",
                fontWeight: 600,
                fontSize: "0.75rem",
                border: "1px solid rgba(37, 99, 235, 0.2)",
                py: 0.5,
                px: 1,
              }}
            />
          </Box>

          {/* Banner Headline */}
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 800,
              letterSpacing: { xs: -0.5, sm: -1 },
              color: "#0f172a",
              fontSize: { xs: "1.75rem", sm: "2.5rem", md: "3.25rem" },
              lineHeight: 1.15,
              mb: 2,
            }}
          >
            Secure Access Management
          </Typography>

          {/* Subtitle */}
          <Typography
            variant="body1"
            sx={{
              color: "#475569",
              maxWidth: 540,
              mx: "auto",
              mb: { xs: 3, sm: 4 },
              fontSize: { xs: "0.95rem", sm: "1.05rem" },
              lineHeight: 1.6,
            }}
          >
            A minimalist, permission-driven platform designed with dynamic RBAC,
            clean schemas, and glassmorphic aesthetics.
          </Typography>

          {/* Banner Action Buttons */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 1.5, sm: 2 }}
            sx={{ mb: { xs: 3, sm: 4 }, justifyContent: "center" }}
          >
            {isAuthenticated ? (
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={() => onNavigate("roles")}
                startIcon={<KeyIcon />}
                sx={{
                  borderRadius: 2.5,
                  px: 4,
                  py: { xs: 1.2, sm: 1.4 },
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  boxShadow: "0 8px 20px -4px rgba(37, 99, 235, 0.4)",
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                View Roles & Permissions
              </Button>
            ) : (
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={() => onNavigate("auth")}
                startIcon={<KeyIcon />}
                sx={{
                  borderRadius: 2.5,
                  px: 4,
                  py: { xs: 1.2, sm: 1.4 },
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  boxShadow: "0 8px 20px -4px rgba(37, 99, 235, 0.4)",
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                Sign In to Start
              </Button>
            )}
          </Stack>

          {/* Minimal Session Status Pill */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              px: { xs: 2, sm: 2.5 },
              py: { xs: 1, sm: 1 },
              borderRadius: 3,
              background: "rgba(255, 255, 255, 0.6)",
              border: "1px solid rgba(226, 232, 240, 0.8)",
              fontSize: { xs: "0.78rem", sm: "0.85rem" },
              color: "#64748b",
              maxWidth: "100%",
              textAlign: "left",
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                flexShrink: 0,
                backgroundColor: isAuthenticated ? "#10b981" : "#94a3b8",
                boxShadow: isAuthenticated ? "0 0 8px #10b981" : "none",
              }}
            />
            {isAuthenticated ? (
              <Typography variant="caption" sx={{ fontSize: "inherit", color: "inherit" }}>
                Active: <strong>{user?.phoneNumber}</strong> | Role:{" "}
                <strong>{getRoleName()}</strong> | Permissions:{" "}
                <strong>{permissions.length}</strong>
              </Typography>
            ) : (
              <Typography variant="caption" sx={{ fontSize: "inherit", color: "inherit" }}>
                Session: <strong>Guest Mode</strong> (Sign in to access protected actions)
              </Typography>
            )}
          </Box>
        </Box>
      </Fade>
    </Container>
  );
};

export default HomePage;
