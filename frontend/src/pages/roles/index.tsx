import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Alert,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  IconButton,
  Divider,
  Fade,
  Skeleton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { PermissionGuard } from "../../components/PermissionGuard";
import { PERMISSIONS } from "../../constants/permissions";
import { roleService } from "../../services/role.service";
import type { IPopulatedRole } from "../../types/role.types";
import type { IPermission } from "../../types/permission.types";
import { glassCardSx, glassInputSx } from "../../components/glassmorphism";
import { AddIcon, DeleteIcon, CloseIcon, ShieldIcon, KeyIcon } from "../../components/Icons";

export const RolesPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Roles state
  const [roles, setRoles] = useState<IPopulatedRole[]>([]);
  const [allPermissions, setAllPermissions] = useState<IPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Create Role Dialog state
  const [openCreate, setOpenCreate] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  // Load Roles and Permissions
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        roleService.getRoles(),
        roleService.getPermissions(),
      ]);
      setRoles(rolesRes.data || []);
      setAllPermissions(permsRes.data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load roles and permissions";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Group all permissions by resource (e.g. product, user, role)
  const permissionsByResource = allPermissions.reduce<Record<string, IPermission[]>>(
    (acc, perm) => {
      const res = perm.resource || "other";
      if (!acc[res]) acc[res] = [];
      acc[res].push(perm);
      return acc;
    },
    {}
  );

  // Toggle single permission selection
  const handleTogglePermission = (permId: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  // Select all permissions for a specific resource
  const handleSelectAllForResource = (resourcePerms: IPermission[]) => {
    const resIds = resourcePerms.map((p) => p._id);
    const allSelected = resIds.every((id) => selectedPermissionIds.includes(id));

    if (allSelected) {
      setSelectedPermissionIds((prev) => prev.filter((id) => !resIds.includes(id)));
    } else {
      setSelectedPermissionIds((prev) => Array.from(new Set([...prev, ...resIds])));
    }
  };

  // Submit Create Role
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDialogError(null);

    const cleanName = roleName.trim().toLowerCase();
    if (!cleanName) {
      setDialogError("Role name is required");
      return;
    }

    setCreating(true);
    try {
      await roleService.createRole({
        name: cleanName,
        description: roleDescription.trim(),
        permissions: selectedPermissionIds,
      });

      setSuccess(`Role "${cleanName}" created successfully!`);
      setOpenCreate(false);
      setRoleName("");
      setRoleDescription("");
      setSelectedPermissionIds([]);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create role";
      setDialogError(msg);
    } finally {
      setCreating(false);
    }
  };

  // Delete custom role
  const handleDeleteRole = async (roleId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the role "${name}"?`)) return;

    setDeletingRoleId(roleId);
    try {
      await roleService.deleteRole(roleId);
      setSuccess(`Role "${name}" deleted successfully.`);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete role";
      setError(msg);
    } finally {
      setDeletingRoleId(null);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2.5, sm: 4 }, px: { xs: 2, sm: 3 } }}>
      {/* Header & Create Button */}
      <Box
        sx={{
          mb: { xs: 3, sm: 4 },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
        }}
      >
        <div>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 800,
              color: "#0f172a",
              fontSize: { xs: "1.6rem", sm: "2.1rem" },
              letterSpacing: -0.5,
            }}
          >
            Roles & Dynamic RBAC
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: { xs: "0.85rem", sm: "0.95rem" } }}>
            Create and manage application roles with granular, permission-first access control.
          </Typography>
        </div>

        {/* Action protected by dynamic permission */}
        <PermissionGuard
          permission={PERMISSIONS.ROLE.CREATE}
          fallback={
            <Typography variant="caption" color="text.disabled" sx={{ display: "block", textAlign: { xs: "center", sm: "right" } }}>
              (Requires &quot;{PERMISSIONS.ROLE.CREATE}&quot; permission)
            </Typography>
          }
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setDialogError(null);
              setOpenCreate(true);
            }}
            sx={{
              borderRadius: 2.5,
              px: 3,
              py: { xs: 1.2, sm: 1.2 },
              width: { xs: "100%", sm: "auto" },
              textTransform: "none",
              fontWeight: 600,
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              boxShadow: "0 6px 16px rgba(37, 99, 235, 0.35)",
            }}
          >
            Create New Role
          </Button>
        </PermissionGuard>
      </Box>

      {/* Global Alerts */}
      {success && (
        <Fade in>
          <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 3, borderRadius: 2 }}>
            {success}
          </Alert>
        </Fade>
      )}
      {error && (
        <Fade in>
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        </Fade>
      )}

      {/* Main Roles List (Guarded by Read permission) */}
      <PermissionGuard
        permission={PERMISSIONS.ROLE.READ}
        fallback={
          <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
            You do not have permission (&quot;{PERMISSIONS.ROLE.READ}&quot;) to view roles.
          </Alert>
        }
      >
        {loading ? (
          /* Responsive Skeleton Loading Grid */
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {[1, 2, 3, 4].map((item) => (
              <Grid size={{ xs: 12, md: 6 }} key={item}>
                <Paper
                  elevation={0}
                  sx={{
                    ...glassCardSx,
                    p: { xs: 2.5, sm: 3 },
                    height: "100%",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                    <Skeleton variant="rounded" width={34} height={34} sx={{ borderRadius: 2 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Skeleton variant="text" width="50%" height={28} />
                      <Skeleton variant="text" width="30%" height={18} />
                    </Box>
                  </Box>
                  <Skeleton variant="text" width="90%" height={20} />
                  <Skeleton variant="text" width="70%" height={20} sx={{ mb: 2 }} />
                  <Divider sx={{ my: 1.5 }} />
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {[1, 2, 3, 4, 5].map((chip) => (
                      <Skeleton key={chip} variant="rounded" width={75} height={26} sx={{ borderRadius: 2 }} />
                    ))}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : roles.length === 0 ? (
          /* Empty State */
          <Paper elevation={0} sx={{ ...glassCardSx, p: { xs: 4, sm: 6 }, textAlign: "center" }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                mx: "auto",
                mb: 2,
                borderRadius: 3,
                background: "rgba(37, 99, 235, 0.1)",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldIcon sx={{ fontSize: 28 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              No Roles Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: "auto", mb: 3 }}>
              Your database currently has no defined roles. Click below to initialize your first role.
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
              Create Your First Role
            </Button>
          </Paper>
        ) : (
          /* Roles Grid */
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {roles.map((role) => {
              const isSystemRole = ["superadmin", "admin", "user"].includes(role.name.toLowerCase());
              const permissionCount = Array.isArray(role.permissions) ? role.permissions.length : 0;
              const isDeleting = deletingRoleId === role._id;

              return (
                <Grid size={{ xs: 12, md: 6 }} key={role._id}>
                  <Paper
                    elevation={0}
                    sx={{
                      ...glassCardSx,
                      p: { xs: 2.5, sm: 3 },
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        boxShadow: "0 20px 40px -12px rgba(15, 23, 42, 0.12)",
                      },
                    }}
                  >
                    <div>
                      {/* Top Role Header */}
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 2.5,
                              background: "rgba(37, 99, 235, 0.1)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#2563eb",
                            }}
                          >
                            <ShieldIcon sx={{ fontSize: 20 }} />
                          </Box>
                          <div>
                            <Typography variant="h6" sx={{ fontWeight: 700, textTransform: "capitalize", lineHeight: 1.2 }}>
                              {role.name}
                            </Typography>
                            {isSystemRole && (
                              <Chip
                                label="System Protected"
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: "0.65rem",
                                  fontWeight: 600,
                                  backgroundColor: "rgba(100, 116, 139, 0.1)",
                                  color: "#475569",
                                  mt: 0.3,
                                }}
                              />
                            )}
                          </div>
                        </Box>

                        {/* Delete Role Button */}
                        {!isSystemRole && (
                          <PermissionGuard permission={PERMISSIONS.ROLE.DELETE}>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={isDeleting}
                              onClick={() => handleDeleteRole(role._id, role.name)}
                              title="Delete Role"
                              sx={{
                                background: "rgba(239, 68, 68, 0.08)",
                                "&:hover": { background: "rgba(239, 68, 68, 0.16)" },
                              }}
                            >
                              {isDeleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon sx={{ fontSize: 18 }} />}
                            </IconButton>
                          </PermissionGuard>
                        )}
                      </Box>

                      {/* Description */}
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: { xs: "0.85rem", sm: "0.9rem" } }}>
                        {role.description || "No description provided."}
                      </Typography>

                      <Divider sx={{ my: 1.5, borderColor: "rgba(226, 232, 240, 0.8)" }} />

                      {/* Assigned Permissions */}
                      <Box sx={{ mb: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                          Granted Permissions
                        </Typography>
                        <Chip
                          label={`${permissionCount} active`}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            background: "rgba(37, 99, 235, 0.1)",
                            color: "#1d4ed8",
                          }}
                        />
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.8,
                          maxHeight: { xs: 130, sm: 170 },
                          overflowY: "auto",
                          pr: 0.5,
                        }}
                      >
                        {permissionCount > 0 ? (
                          role.permissions.map((perm) => (
                            <Chip
                              key={typeof perm === "string" ? perm : perm._id}
                              label={typeof perm === "string" ? perm : perm.name}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontSize: "0.72rem",
                                fontWeight: 500,
                                borderColor: "rgba(37, 99, 235, 0.25)",
                                background: "rgba(255, 255, 255, 0.7)",
                              }}
                            />
                          ))
                        ) : (
                          <Typography variant="caption" color="text.disabled">
                            No permissions assigned.
                          </Typography>
                        )}
                      </Box>
                    </div>

                    <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px solid rgba(226, 232, 240, 0.6)" }}>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.7rem", wordBreak: "break-all" }}>
                        ID: {role._id}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}
      </PermissionGuard>

      {/* ── CREATE ROLE DIALOG (Dynamic, Responsive Permission Selection) ── */}
      <Dialog
        open={openCreate}
        onClose={() => !creating && setOpenCreate(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        slotProps={{
          paper: {
            sx: {
              ...glassCardSx,
              borderRadius: { xs: 0, sm: 3 },
              m: { xs: 0, sm: 2 },
              maxHeight: { xs: "100vh", sm: "90vh" },
              display: "flex",
              flexDirection: "column",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: { xs: 2, sm: 3 },
            pb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <KeyIcon sx={{ fontSize: 20 }} />
            </Box>
            <div>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: "1.05rem", sm: "1.25rem" } }}>
                Create New Role
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
                Assign dynamic resource permissions to this custom role
              </Typography>
            </div>
          </Box>
          <IconButton size="small" onClick={() => setOpenCreate(false)} disabled={creating}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", flexGrow: 1, overflow: "hidden" }}>
          <DialogContent
            dividers
            sx={{
              p: { xs: 2, sm: 3 },
              borderColor: "rgba(226, 232, 240, 0.8)",
              overflowY: "auto",
              flexGrow: 1,
            }}
          >
            {dialogError && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                {dialogError}
              </Alert>
            )}

            {/* Role Name */}
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155", mb: 0.5 }}>
              Role Identifier / Name *
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. product_manager, auditor, support_lead"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              disabled={creating}
              sx={{ ...glassInputSx, mb: 2 }}
            />

            {/* Role Description */}
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155", mb: 0.5 }}>
              Description
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Explain the scope and responsibilities of this role"
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              disabled={creating}
              sx={{ ...glassInputSx, mb: 2.5 }}
            />

            <Divider sx={{ my: 2 }} />

            {/* Permissions Selection Header */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                gap: 1,
                mb: 2,
              }}
            >
              <div>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0f172a" }}>
                  Select Dynamic Permissions
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Permissions are granted per resource and atomic action
                </Typography>
              </div>
              <Chip
                label={`Selected: ${selectedPermissionIds.length} / ${allPermissions.length}`}
                color={selectedPermissionIds.length > 0 ? "primary" : "default"}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>

            {/* Permission Groups by Resource */}
            <Box sx={{ maxHeight: { xs: "none", sm: 380 }, overflowY: "auto", pr: { xs: 0, sm: 1 } }}>
              {Object.entries(permissionsByResource).map(([resource, perms]) => {
                const resIds = perms.map((p) => p._id);
                const allSelected = resIds.every((id) => selectedPermissionIds.includes(id));
                const countSelected = resIds.filter((id) => selectedPermissionIds.includes(id)).length;

                return (
                  <Paper
                    key={resource}
                    variant="outlined"
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      mb: 1.5,
                      borderRadius: 2.5,
                      background: "rgba(255, 255, 255, 0.5)",
                      borderColor: countSelected > 0 ? "rgba(37, 99, 235, 0.4)" : "rgba(226, 232, 240, 0.8)",
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: "#1e293b",
                          fontSize: { xs: "0.8rem", sm: "0.875rem" },
                        }}
                      >
                        📦 {resource} ({countSelected}/{perms.length})
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => handleSelectAllForResource(perms)}
                        sx={{ textTransform: "none", fontSize: "0.75rem", py: 0.2 }}
                      >
                        {allSelected ? "Deselect All" : "Select All"}
                      </Button>
                    </Box>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                      {perms.map((perm) => {
                        const isChecked = selectedPermissionIds.includes(perm._id);
                        return (
                          <Chip
                            key={perm._id}
                            label={perm.action}
                            clickable
                            onClick={() => handleTogglePermission(perm._id)}
                            color={isChecked ? "primary" : "default"}
                            variant={isChecked ? "filled" : "outlined"}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              textTransform: "capitalize",
                              borderRadius: 1.5,
                              px: 0.5,
                              fontSize: { xs: "0.75rem", sm: "0.8rem" },
                              "&:hover": {
                                boxShadow: "0 2px 8px rgba(37, 99, 235, 0.2)",
                              },
                            }}
                          />
                        );
                      })}
                    </Box>
                  </Paper>
                );
              })}
            </Box>

            {/* In-content Submit Bar right after permissions list */}
            <Box
              sx={{
                mt: 3,
                pt: 2.5,
                borderTop: "1px solid rgba(226, 232, 240, 0.9)",
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "stretch", sm: "center" },
                gap: 2,
                background: "rgba(248, 250, 252, 0.8)",
                p: 2,
                borderRadius: 2.5,
              }}
            >
              <div>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0f172a" }}>
                  Ready to submit?
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <strong>{selectedPermissionIds.length}</strong> dynamic permissions selected for role &quot;{roleName.trim() || "new_role"}&quot;.
                </Typography>
              </div>

              <Box sx={{ display: "flex", gap: 1.5, justifyContent: { xs: "stretch", sm: "flex-end" } }}>
                <Button
                  onClick={() => setOpenCreate(false)}
                  disabled={creating}
                  variant="outlined"
                  sx={{ textTransform: "none", borderRadius: 2 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={creating || !roleName.trim()}
                  size="large"
                  sx={{
                    px: 3.5,
                    py: 1.2,
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    boxShadow: "0 6px 18px rgba(37, 99, 235, 0.35)",
                  }}
                >
                  {creating ? <CircularProgress size={22} color="inherit" /> : "Submit — Create Role"}
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </form>
      </Dialog>
    </Container>
  );
};

export default RolesPage;
