import { body } from "express-validator";
import { handleValidationError } from "../../utils/handleValidationError.js";

// ─── Reusable field rules ────────────────────────────────────────────────────

const phoneNumberRule = () =>
    body("phoneNumber")
        .notEmpty()
        .withMessage("Phone number is required")
        .matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
        .withMessage("Please provide a valid phone number");

const codeRule = () =>
    body("code")
        .notEmpty()
        .withMessage("OTP code is required")
        .isLength({ min: 4, max: 6 })
        .withMessage("OTP code must be 4 to 6 digits")
        .isNumeric()
        .withMessage("OTP code must contain only numbers");

const passwordRule = () =>
    body("password")
        .notEmpty()
        .withMessage("Password is required");

const newPasswordRule = () =>
    body("newPassword")
        .notEmpty()
        .withMessage("New password is required")
        .matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/)
        .withMessage(
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and be at least 8 characters long"
        );

// ─── Validator chains per endpoint ──────────────────────────────────────────

/** POST /api/auth — check phone, send OTP or prompt password */
export const validateAuth = [
    phoneNumberRule(),
    handleValidationError,
];

/** POST /api/auth/resend-code — resend OTP to phone */
export const validateResendCode = [
    phoneNumberRule(),
    handleValidationError,
];

/** POST /api/auth/login-with-otp — verify OTP and login */
export const validateLoginWithOtp = [
    phoneNumberRule(),
    codeRule(),
    handleValidationError,
];

/** POST /api/auth/login-with-password — login with existing password */
export const validateLoginWithPassword = [
    phoneNumberRule(),
    passwordRule(),
    handleValidationError,
];

/** POST /api/auth/forget-password — verify OTP then set new password */
export const validateForgetPassword = [
    phoneNumberRule(),
    codeRule(),
    newPasswordRule(),
    handleValidationError,
];
