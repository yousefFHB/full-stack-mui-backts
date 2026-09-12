import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Permission from "../Modules/Permission/permissionMd.js";
import Role from "../Modules/Role/roleMd.js";
import User from "../Modules/User/userMd.js";
import { PermissionAction } from "../types/permission.types.js";

dotenv.config();

const MONGO_URI = process.env.DATA_BASE || "mongodb://localhost:27017/mui-back";

const RESOURCES = ["product", "user", "role", "permission", "upload"] as const;
const ACTIONS: PermissionAction[] = ["create", "read", "update", "delete", "manage"];

export async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB for seeding...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB successfully.");

    // ── 1. Seed Permissions ──────────────────────────────────────────
    console.log("Seeding permissions...");
    const permissionMap = new Map<string, mongoose.Types.ObjectId>();

    for (const resource of RESOURCES) {
      for (const action of ACTIONS) {
        const permName = `${resource}:${action}`;
        let perm = await Permission.findOne({ resource, action });

        if (!perm) {
          perm = await Permission.create({
            name: permName,
            resource,
            action,
            description: `Allows to ${action} ${resource} resources`,
          });
          console.log(` Created permission: ${permName}`);
        } else {
          console.log(` Existing permission: ${permName}`);
        }

        permissionMap.set(permName, perm._id as mongoose.Types.ObjectId);
      }
    }

    const allPermissionIds = Array.from(permissionMap.values());

    // ── 2. Seed Roles ────────────────────────────────────────────────
    console.log("\nSeeding roles...");

    // Role: superAdmin (All permissions)
    let superAdminRole = await Role.findOne({ name: "superadmin" });
    if (!superAdminRole) {
      superAdminRole = await Role.create({
        name: "superadmin",
        description: "Super Administrator with full unrestricted access",
        permissions: allPermissionIds,
      });
      console.log(" Created role: superadmin");
    } else {
      superAdminRole.permissions = allPermissionIds;
      await superAdminRole.save();
      console.log(" Updated role: superadmin");
    }

    // Role: admin (All permissions)
    let adminRole = await Role.findOne({ name: "admin" });
    if (!adminRole) {
      adminRole = await Role.create({
        name: "admin",
        description: "System Administrator with administrative management permissions",
        permissions: allPermissionIds,
      });
      console.log(" Created role: admin");
    } else {
      adminRole.permissions = allPermissionIds;
      await adminRole.save();
      console.log(" Updated role: admin");
    }

    // Role: user (Read permissions & file upload)
    const userPermissionNames = [
      "product:read",
      "upload:create",
      "upload:read",
    ];
    const userPermissionIds = userPermissionNames
      .map((name) => permissionMap.get(name))
      .filter((id): id is mongoose.Types.ObjectId => Boolean(id));

    let userRole = await Role.findOne({ name: "user" });
    if (!userRole) {
      userRole = await Role.create({
        name: "user",
        description: "Default standard application user with view access",
        permissions: userPermissionIds,
      });
      console.log(" Created role: user");
    } else {
      userRole.permissions = userPermissionIds;
      await userRole.save();
      console.log(" Updated role: user");
    }

    // ── 3. Seed Initial Admin User ──────────────────────────────────
    console.log("\nChecking initial administrator user...");
    const adminPhone = process.env.ADMIN_PHONE;
    const adminRawPassword = process.env.ADMIN_PASSWORD;

    if (!adminPhone || !adminRawPassword) {
      console.warn("⚠️  ADMIN_PHONE or ADMIN_PASSWORD not configured in .env. Skipping admin user creation.");
    } else {
      let adminUser = await User.findOne({ phoneNumber: adminPhone });

      if (!adminUser) {
        const hashedPassword = bcrypt.hashSync(adminRawPassword, 10);
        adminUser = await User.create({
          phoneNumber: adminPhone,
          password: hashedPassword,
          fullName: "System Administrator",
          isActive: true,
          gender: "male",
          avatar: [],
          role: adminRole._id,
        });
        console.log("✅ Created initial Admin user from environment variables:");
        console.log(`   Phone: ${adminPhone}`);
        console.log("   Role:  admin");
      } else {
        // Idempotent safety: do NOT overwrite the admin's password if they already exist
        console.log(`ℹ️  Admin user (${adminPhone}) already exists in database. Existing credentials preserved.`);
      }
    }

    console.log("\n Database seeding completed successfully!");
  } catch (error) {
    console.error(" Error seeding database:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

// Auto-run if executed directly
seedDatabase();
