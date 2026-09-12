import React from "react";
import { Container, Typography, Box, Paper, Alert, Button } from "@mui/material";
import { PermissionGuard } from "../../components/PermissionGuard";
import { usePermission } from "../../hooks/usePermission";
import { PERMISSIONS } from "../../constants/permissions";

/**
 * Roles Page Foundation.
 * Prepared for dynamic role management once backend endpoints are available.
 * Does not invent API endpoints or inject mock data.
 */
export const RolesPage: React.FC = () => {
  const { hasPermission } = usePermission();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
            Roles & Permissions Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Manage application roles and assigned resource permissions dynamically.
          </Typography>
        </div>

        {/* Action protected by dynamic permission, not static role */}
        <PermissionGuard
          permission={PERMISSIONS.ROLE.CREATE}
          fallback={
            <Typography variant="caption" color="text.disabled">
              (Creation requires &quot;{PERMISSIONS.ROLE.CREATE}&quot; permission)
            </Typography>
          }
        >
          <Button variant="contained" color="primary">
            Create New Role
          </Button>
        </PermissionGuard>
      </Box>

      {/* Main content guarded by read permission */}
      <PermissionGuard
        permission={PERMISSIONS.ROLE.READ}
        fallback={
          <Alert severity="warning" sx={{ mt: 2 }}>
            You do not have permission (&quot;{PERMISSIONS.ROLE.READ}&quot;) to view role management.
          </Alert>
        }
      >
        <Paper elevation={1} sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6" color="text.primary" gutterBottom>
            Dynamic Role Management Foundation Ready
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 600, mx: "auto", mb: 2 }}>
            Role and permission listing will be connected to backend role endpoints when implemented.
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
            <Alert severity="info" sx={{ textAlign: "left" }}>
              <strong>RBAC Status:</strong> Currently evaluating permissions dynamically via{" "}
              <code>usePermission()</code>.
              <br />
              Can manage roles: <strong>{hasPermission(PERMISSIONS.ROLE.MANAGE) ? "Yes" : "No"}</strong>
            </Alert>
          </Box>
        </Paper>
      </PermissionGuard>
    </Container>
  );
};

export default RolesPage;
