import { Request, Response, NextFunction } from "express";
import { catchAsync, HandleERROR } from "vanta-api";
import Role from "./roleMd.js";

export const getRoles = catchAsync(async (_req: Request, res: Response) => {
    const roles = await Role.find().populate("permissions").sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        data: roles,
    });
});

export const createRole = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { name, description, permissions } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
        return next(new HandleERROR("Role name is required", 400));
    }

    const normalizedName = name.trim().toLowerCase();
    const existingRole = await Role.findOne({ name: normalizedName });
    if (existingRole) {
        return next(new HandleERROR("A role with this name already exists", 400));
    }

    const newRole = await Role.create({
        name: normalizedName,
        description: description?.trim() || "",
        permissions: Array.isArray(permissions) ? permissions : [],
    });

    const populatedRole = await Role.findById(newRole._id).populate("permissions");

    res.status(201).json({
        success: true,
        message: "Role created successfully",
        data: populatedRole,
    });
});

export const deleteRole = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const role = await Role.findById(id);
    if (!role) {
        return next(new HandleERROR("Role not found", 404));
    }

    const protectedRoles = ["superadmin", "admin", "user"];
    if (protectedRoles.includes(role.name.toLowerCase())) {
        return next(new HandleERROR(`System role '${role.name}' cannot be deleted`, 403));
    }

    await Role.findByIdAndDelete(id);

    res.status(200).json({
        success: true,
        message: "Role deleted successfully",
    });
});
