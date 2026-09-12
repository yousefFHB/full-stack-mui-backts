import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Fade,
} from "@mui/material";
import { useAppDispatch } from "../../stores/store";
import { setCredentials } from "../../stores/auth/auth.slice";
import { authService } from "../../services/auth.service";
import { glassCardSx, glassInputSx } from "../../components/glassmorphism";
import {
  PhoneIcon,
  LockIcon,
  KeyIcon,
  ShieldIcon,
  ArrowBackIcon,
  VisibilityIcon,
  VisibilityOffIcon,
} from "../../components/Icons";

export interface AuthPageProps {
  onSuccess?: () => void;
  onNavigateHome?: () => void;
}

type AuthMode = "smart" | "password" | "reset";
type SmartStep = "phone" | "otp" | "password";

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess, onNavigateHome }) => {
  const dispatch = useAppDispatch();

  // Mode and Steps
  const [mode, setMode] = useState<AuthMode>("smart");
  const [smartStep, setSmartStep] = useState<SmartStep>("phone");

  // Form Fields
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Timer countdown
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  // Validation helpers
  const isValidPhone = (phone: string): boolean => {
    const cleaned = phone.trim();
    return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(cleaned);
  };

  const isValidPassword = (pwd: string): boolean => {
    // Backend rule: min 8 chars, 1 uppercase, 1 lowercase, 1 number
    return /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/.test(pwd);
  };

  // Reset errors on mode/step change
  const handleModeChange = (_: React.SyntheticEvent, newMode: AuthMode) => {
    setMode(newMode);
    setSmartStep("phone");
    setErrorMsg(null);
    setSuccessMsg(null);
    setOtpCode("");
    setPassword("");
  };

  // ── Step 1: Start Auth (Check phone existence & OTP dispatch) ──
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanPhone = phoneNumber.trim();
    if (!isValidPhone(cleanPhone)) {
      setErrorMsg("Please enter a valid phone number (e.g. 09121234567 or +1234567890)");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.checkAuth(cleanPhone);
      setSuccessMsg(res.message || "Request processed successfully.");

      // Check if user has an existing password
      if (res.data && "hasPassword" in res.data && res.data.hasPassword) {
        setSmartStep("password");
      } else {
        // OTP automatically sent by backend for new or password-less users
        setSmartStep("otp");
        setResendTimer(60);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to verify phone number";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Login with OTP ──
  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!otpCode || otpCode.length < 4) {
      setErrorMsg("Please enter the complete 4-6 digit OTP code");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.loginWithOtp(phoneNumber.trim(), otpCode.trim());
      const token = res.token || res.data?.token;
      const user = res.data?.user || res.data?.infoUser;

      if (!token) {
        throw new Error("No authentication token received from server");
      }

      dispatch(
        setCredentials({
          user: user ?? null,
          token,
        })
      );

      setSuccessMsg("Logged in successfully!");
      if (onSuccess) onSuccess();
      else if (onNavigateHome) onNavigateHome();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to verify OTP";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Login with Password ──
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!phoneNumber.trim() || !isValidPhone(phoneNumber)) {
      setErrorMsg("Please enter a valid phone number");
      return;
    }
    if (!password) {
      setErrorMsg("Password is required");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.loginWithPassword(phoneNumber.trim(), password);
      const token = res.token || res.data?.token;
      const user = res.data?.infoUser || res.data?.user;

      if (!token) {
        throw new Error("No authentication token received from server");
      }

      dispatch(
        setCredentials({
          user: user ?? null,
          token,
        })
      );

      setSuccessMsg("Login successful!");
      if (onSuccess) onSuccess();
      else if (onNavigateHome) onNavigateHome();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid phone number or password";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 4: Resend Code ──
  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await authService.resendOtp(phoneNumber.trim());
      setSuccessMsg(res.message || "New OTP code sent!");
      setResendTimer(60);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to resend OTP code";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 5: Reset / Forget Password ──
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!phoneNumber.trim() || !isValidPhone(phoneNumber)) {
      setErrorMsg("Please enter a valid phone number");
      return;
    }
    if (!otpCode || otpCode.length < 4) {
      setErrorMsg("Please enter the verification code received via SMS");
      return;
    }
    if (!isValidPassword(newPassword)) {
      setErrorMsg(
        "New password must contain at least 8 characters, with 1 uppercase, 1 lowercase, and 1 number"
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.forgetPassword(
        phoneNumber.trim(),
        otpCode.trim(),
        newPassword
      );
      setSuccessMsg(res.message || "Password successfully changed. You may now log in.");
      setPassword(newPassword);
      setMode("password");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reset password";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: { xs: 4, sm: 8 } }}>
      <Box sx={{ ...glassCardSx, p: { xs: 3, sm: 4.5 } }}>
        {/* Header Branding */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              mx: "auto",
              mb: 1.5,
              borderRadius: 3,
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 6px 16px rgba(37, 99, 235, 0.35)",
            }}
          >
            <ShieldIcon sx={{ fontSize: 26 }} />
          </Box>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700, color: "#0f172a" }}>
            Welcome Back
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            Minimalist & Secure Authentication
          </Typography>
        </Box>

        {/* Minimal Glass Mode Tabs */}
        <Tabs
          value={mode}
          onChange={handleModeChange}
          variant="fullWidth"
          sx={{
            minHeight: 40,
            mb: 3,
            background: "rgba(241, 245, 249, 0.7)",
            borderRadius: 2.5,
            p: 0.5,
            "& .MuiTabs-indicator": {
              backgroundColor: "#2563eb",
              borderRadius: 2,
              height: "100%",
              zIndex: 0,
            },
          }}
        >
          <Tab
            label="OTP Login"
            value="smart"
            sx={{
              textTransform: "none",
              fontSize: "0.85rem",
              fontWeight: 600,
              minHeight: 36,
              zIndex: 1,
              borderRadius: 2,
              color: mode === "smart" ? "#ffffff !important" : "#475569",
              transition: "color 0.2s",
            }}
          />
          <Tab
            label="Password"
            value="password"
            sx={{
              textTransform: "none",
              fontSize: "0.85rem",
              fontWeight: 600,
              minHeight: 36,
              zIndex: 1,
              borderRadius: 2,
              color: mode === "password" ? "#ffffff !important" : "#475569",
              transition: "color 0.2s",
            }}
          />
          <Tab
            label="Reset"
            value="reset"
            sx={{
              textTransform: "none",
              fontSize: "0.85rem",
              fontWeight: 600,
              minHeight: 36,
              zIndex: 1,
              borderRadius: 2,
              color: mode === "reset" ? "#ffffff !important" : "#475569",
              transition: "color 0.2s",
            }}
          />
        </Tabs>

        {/* Feedback Alerts */}
        {errorMsg && (
          <Fade in>
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2, fontSize: "0.85rem" }}>
              {errorMsg}
            </Alert>
          </Fade>
        )}
        {successMsg && (
          <Fade in>
            <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2, fontSize: "0.85rem" }}>
              {successMsg}
            </Alert>
          </Fade>
        )}

        {/* ── MODE: SMART / OTP LOGIN ── */}
        {mode === "smart" && (
          <Box>
            {smartStep === "phone" && (
              <form onSubmit={handlePhoneSubmit}>
                <Typography variant="body2" sx={{ color: "#334155", mb: 1, fontWeight: 500 }}>
                  Phone Number
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="09121234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={loading}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon sx={{ fontSize: 18, color: "#64748b" }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ ...glassInputSx, mb: 2.5 }}
                />
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    py: 1.2,
                    borderRadius: 2.5,
                    textTransform: "none",
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    boxShadow: "0 6px 16px rgba(37, 99, 235, 0.35)",
                  }}
                >
                  {loading ? <CircularProgress size={22} color="inherit" /> : "Continue with Phone"}
                </Button>
              </form>
            )}

            {smartStep === "otp" && (
              <form onSubmit={handleOtpLogin}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                  <IconButton
                    size="small"
                    onClick={() => setSmartStep("phone")}
                    sx={{ mr: 1, color: "#475569" }}
                  >
                    <ArrowBackIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <Typography variant="body2" sx={{ color: "#64748b" }}>
                    Sent to: <strong>{phoneNumber}</strong>
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ color: "#334155", mb: 1, fontWeight: 500 }}>
                  Enter Verification Code (OTP)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="5-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  disabled={loading}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <KeyIcon sx={{ fontSize: 18, color: "#64748b" }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ ...glassInputSx, mb: 2 }}
                />

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    py: 1.2,
                    borderRadius: 2.5,
                    textTransform: "none",
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    boxShadow: "0 6px 16px rgba(37, 99, 235, 0.35)",
                    mb: 1.5,
                  }}
                >
                  {loading ? <CircularProgress size={22} color="inherit" /> : "Verify & Sign In"}
                </Button>

                <Box sx={{ textAlign: "center" }}>
                  <Button
                    size="small"
                    onClick={handleResendCode}
                    disabled={loading || resendTimer > 0}
                    sx={{ textTransform: "none", fontSize: "0.8rem", color: "#2563eb" }}
                  >
                    {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend OTP Code"}
                  </Button>
                </Box>
              </form>
            )}

            {smartStep === "password" && (
              <form onSubmit={handlePasswordLogin}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                  <IconButton
                    size="small"
                    onClick={() => setSmartStep("phone")}
                    sx={{ mr: 1, color: "#475569" }}
                  >
                    <ArrowBackIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <Typography variant="body2" sx={{ color: "#64748b" }}>
                    Account: <strong>{phoneNumber}</strong>
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ color: "#334155", mb: 1, fontWeight: 500 }}>
                  Enter Password
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ fontSize: 18, color: "#64748b" }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? (
                              <VisibilityOffIcon sx={{ fontSize: 18 }} />
                            ) : (
                              <VisibilityIcon sx={{ fontSize: 18 }} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ ...glassInputSx, mb: 1.5 }}
                />

                <Box sx={{ textAlign: "right", mb: 2 }}>
                  <Button
                    size="small"
                    onClick={() => setMode("reset")}
                    sx={{ textTransform: "none", fontSize: "0.75rem", color: "#2563eb" }}
                  >
                    Forgot password?
                  </Button>
                </Box>

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    py: 1.2,
                    borderRadius: 2.5,
                    textTransform: "none",
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    boxShadow: "0 6px 16px rgba(37, 99, 235, 0.35)",
                  }}
                >
                  {loading ? <CircularProgress size={22} color="inherit" /> : "Sign In with Password"}
                </Button>
              </form>
            )}
          </Box>
        )}

        {/* ── MODE: DIRECT PASSWORD LOGIN ── */}
        {mode === "password" && (
          <form onSubmit={handlePasswordLogin}>
            <Typography variant="body2" sx={{ color: "#334155", mb: 1, fontWeight: 500 }}>
              Phone Number
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="09121234567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={loading}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ fontSize: 18, color: "#64748b" }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ ...glassInputSx, mb: 2 }}
            />

            <Typography variant="body2" sx={{ color: "#334155", mb: 1, fontWeight: 500 }}>
              Password
            </Typography>
            <TextField
              fullWidth
              size="small"
              type={showPassword ? "text" : "password"}
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ fontSize: 18, color: "#64748b" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOffIcon sx={{ fontSize: 18 }} />
                        ) : (
                          <VisibilityIcon sx={{ fontSize: 18 }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ ...glassInputSx, mb: 1.5 }}
            />

            <Box sx={{ textAlign: "right", mb: 2 }}>
              <Button
                size="small"
                onClick={() => setMode("reset")}
                sx={{ textTransform: "none", fontSize: "0.75rem", color: "#2563eb" }}
              >
                Forgot password?
              </Button>
            </Box>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.2,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 600,
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                boxShadow: "0 6px 16px rgba(37, 99, 235, 0.35)",
              }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : "Sign In"}
            </Button>
          </form>
        )}

        {/* ── MODE: RESET PASSWORD ── */}
        {mode === "reset" && (
          <form onSubmit={handleResetPassword}>
            <Typography variant="body2" sx={{ color: "#334155", mb: 1, fontWeight: 500 }}>
              Phone Number
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="09121234567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ fontSize: 18, color: "#64748b" }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ ...glassInputSx }}
              />
              <Button
                variant="outlined"
                onClick={handleResendCode}
                disabled={loading || !isValidPhone(phoneNumber) || resendTimer > 0}
                sx={{
                  borderRadius: 2.5,
                  textTransform: "none",
                  whiteSpace: "nowrap",
                  fontSize: "0.75rem",
                  px: 1.5,
                }}
              >
                {resendTimer > 0 ? `${resendTimer}s` : "Get OTP"}
              </Button>
            </Box>

            <Typography variant="body2" sx={{ color: "#334155", mb: 1, fontWeight: 500 }}>
              OTP Code
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Code from SMS"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              disabled={loading}
              sx={{ ...glassInputSx, mb: 2 }}
            />

            <Typography variant="body2" sx={{ color: "#334155", mb: 1, fontWeight: 500 }}>
              New Password
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="password"
              placeholder="Min 8 chars, 1 upper, 1 lower, 1 digit"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              sx={{ ...glassInputSx, mb: 2 }}
            />

            <Typography variant="body2" sx={{ color: "#334155", mb: 1, fontWeight: 500 }}>
              Confirm Password
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="password"
              placeholder="Repeat new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              sx={{ ...glassInputSx, mb: 2.5 }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.2,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 600,
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                boxShadow: "0 6px 16px rgba(37, 99, 235, 0.35)",
              }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : "Update Password"}
            </Button>
          </form>
        )}

        {/* Footer Navigation */}
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Button
            size="small"
            onClick={onNavigateHome}
            sx={{ textTransform: "none", color: "#64748b", fontSize: "0.85rem" }}
          >
            ← Back to Home
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default AuthPage;
