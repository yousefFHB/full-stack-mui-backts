import { Request, Response } from "express";
import { catchAsync } from "vanta-api";
import Permission from "./permissionMd.js";

export const getPermissions = catchAsync(async (_req: Request, res: Response) => {
    const permissions = await Permission.find().sort({ resource: 1, action: 1 });
    res.status(200).json({
        success: true,
        data: permissions,
    });
});
