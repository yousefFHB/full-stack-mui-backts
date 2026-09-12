import mongoose, { Schema } from "mongoose";
import { IRole } from "../../types/role.types.js";
import "../Permission/permissionMd.js";

const roleSchema = new Schema<IRole>(
    {
        name: {
            type: String,
            required: [true, "Role name is required"],
            unique: true,
            trim: true,
            lowercase: true,
        },
        description: {
            type: String,
            default: "",
        },
        permissions: [
            {
                type: Schema.Types.ObjectId,
                ref: "Permission",
            },
        ],
    },
    { timestamps: true }
);

const Role = mongoose.model<IRole>("Role", roleSchema);
export default Role;
