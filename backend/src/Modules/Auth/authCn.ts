import { Request, Response, NextFunction } from "express";
import { catchAsync, HandleERROR } from "vanta-api";
import User from "../User/userMd.js";
import Role from "../Role/roleMd.js";
import jwt from "jsonwebtoken";
import { sendAuthCode, verifyCode } from "../../utils/smsHandler.js";
import bcrypt from "bcryptjs";
import { env } from "../../config/env.js";


export const auth = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { phoneNumber } = req.body;

    const user = await User.findOne({ phoneNumber });

    // Block inactive accounts
    if (user && !user.isActive) {
        return next(new HandleERROR("Your account is not active, contact support", 403));
    }

    // New user OR user without a password → send OTP
    if (!user || !user.password) {
        const smsResult = await sendAuthCode(phoneNumber);
        if (!smsResult.success) {
            return next(new HandleERROR("Failed to send auth code", 400));
        }
        return res.status(200).json({
            success: true,
            message: "OTP code sent successfully!",
            data: {
                userExist: !!user,
                hasPassword: !!user?.password,
            },
        });
    }

    // Existing user with password
    return res.status(200).json({
        success: true,
        message: "Please enter your password",
        data: {
            userExist: true,
            hasPassword: true,
        },
    });
});

export const resendCode = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { phoneNumber } = req.body;
    const smsResult = await sendAuthCode(phoneNumber)
    if (!smsResult.success) {
        return next(new HandleERROR("Failed to send auth code", 400));
    }
    return res.status(200).json({
        success: true,
        message: "OTP code sent successfully!",
    })

})

export const loginWithOtp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { phoneNumber, code } = req.body;
    const smsResult = await verifyCode(phoneNumber, code)
    if (!smsResult.success) {
        return next(new HandleERROR("Failed to verify code", 400));
    }
    let user = await User.findOne({ phoneNumber });
    if (!user) {
        let defaultRole = await Role.findOne({ name: "user" });
        if (!defaultRole) {
            defaultRole = await Role.create({
                name: "user",
                description: "Default standard user role",
                permissions: [],
            });
        }
        user = await User.create({
            phoneNumber,
            role: defaultRole._id,
        });
    }
    const token = jwt.sign({
        _id: user._id, role: user.role
    }, env.secretKey);

    const populatedUser = await User.findById(user._id)
        .select("-password")
        .populate({ path: "role", populate: "permissions" });

    res.status(200).json({
        success: true,
        token,
        message: "Login successful!",
        data: {
            user: populatedUser, token
        }
    });
});


export const loginWithPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { phoneNumber, password } = req.body;
    let user = await User.findOne({ phoneNumber })
    if (!user) {
        return next(new HandleERROR("User not found", 404));
    }
    if (!user.password) {
        return next(new HandleERROR("User not found", 404));
    }
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
        return next(new HandleERROR("Invalid password", 401));
    }
    const token = jwt.sign({
        _id: user._id, role: user.role
    }, env.secretKey);

    const infoUser = await User.findById(user._id)
        .select("-password")
        .populate({ path: "role", populate: "permissions" });

    res.status(200).json({
        success: true,
        token,
        message: "Login successful!",
        data: {
            infoUser, token
        }
    });

});


export const forgetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
const {phoneNumber,code,newPassword}=req.body
let user =await User.findOne({phoneNumber})
if (!user) {
    return next(new HandleERROR("User not found", 404));
}
const smsResult = await verifyCode(phoneNumber, code)
if (!smsResult.success) {
    return next(new HandleERROR("Failed to verify code", 400));
}
const passRegex=new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
if (!passRegex.test(newPassword)) {
    return next(new HandleERROR("رمز عبور باید حداقل 8 کاراکتر باشد و شامل حداقل یک حرف بزرگ، یک حرف کوچک، یک عدد و یک کاراکتر خاص باشد", 400));
}
const hashPassword=bcrypt.hashSync(newPassword, 10);
user.password =hashPassword;
await user.save();

res.status(200).json({
    success: true,
   message:"رمز عبور با موفقیت تغییر یافت"
})
});