import { Router } from "express";
import { auth, forgetPassword, loginWithOtp, loginWithPassword, resendCode } from "./authCn.js";
import {
    validateAuth,
    validateResendCode,
    validateLoginWithOtp,
    validateLoginWithPassword,
    validateForgetPassword,
} from "./authValidatoin.js";

const authRouter = Router();

authRouter.route("/").post(validateAuth, auth);
authRouter.route("/resend-code").post(validateResendCode, resendCode);
authRouter.route("/login-with-otp").post(validateLoginWithOtp, loginWithOtp);
authRouter.route("/login-with-password").post(validateLoginWithPassword, loginWithPassword);
authRouter.route("/forget-password").post(validateForgetPassword, forgetPassword);

export default authRouter;