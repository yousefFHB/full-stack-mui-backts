import mongoose, { Schema } from "mongoose";
import { IPermission, PermissionAction } from "../../types/permission.types.js";

const ALLOWED_ACTIONS: PermissionAction[] = [
    "create",
    "read",
    "update",
    "delete",
    "manage",
];

const permissionSchema = new Schema<IPermission>(
    {
        name: {
            type: String,
            required: [true, "Permission name is required"],
            unique: true,
            trim: true,
            // Auto-computed from resource:action — do not set manually
        },
        resource: {
            type: String,
            required: [true, "Resource is required"],
            trim: true,
            lowercase: true,
        },
        action: {
            type: String,
            required: [true, "Action is required"],
            trim: true,
            lowercase: true,
            enum: {
                values: ALLOWED_ACTIONS,
                message: `Action must be one of: ${ALLOWED_ACTIONS.join(", ")}`,
            },
        },
        description: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

// Compound index: ensures uniqueness at the DB level for resource + action pairs
permissionSchema.index({ resource: 1, action: 1 }, { unique: true });

// Auto-generate the "resource:action" name before every save.
// Mongoose v9: pre("save") hooks receive SaveOptions — use async, no next().
permissionSchema.pre("save", async function () {
    this.name = `${this.resource}:${this.action}`;
});


const Permission = mongoose.model<IPermission>("Permission", permissionSchema);
export default Permission;
