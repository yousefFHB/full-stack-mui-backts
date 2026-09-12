import mongoose, { Schema } from "mongoose";
import { IUser } from "../../types/user.types.js";

const userSchema = new Schema<IUser>(
    {
        phoneNumber: {
            type: String,
            required: [true, "Phone number is required"],
            unique: true,
            trim: true,
            match: [/^[0-9+\-\s]+$/, "Invalid phone number format"],
        },
        password: {
            type: String,
        },
        fullName: {
            type: String,
            default: "",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        birthDate: {
            type: Date,
            default: null,
        },
        gender: {
            type: String,
            enum: ["male", "female"],
            default: null,
        },
        avatar: {
            type: [String],
            default: [],
        },

        // --- RBAC: User → Role → Permission[] ---
        /**
         * The role assigned to this user.
         * To resolve what a user can do, populate this field:
         *   User.findById(id).populate({ path: "role", populate: "permissions" })
         */
        role: {
            type: Schema.Types.ObjectId,
            ref: "Role",
            required: [true, "User must be assigned a role"],
        },
    },
    { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);
export default User;
