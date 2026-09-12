# Full-Stack MUI + TypeScript RBAC Platform

A modern, production-grade full-stack web application built with **React 19 + Material-UI (MUI v6/v9)** on the frontend and **Node.js (ESM) + Express 5 + MongoDB / Mongoose 9** on the backend, written completely in **TypeScript**.

The project features a **dynamic Role-Based Access Control (RBAC)** architecture, an aesthetic **minimalist glassmorphism** design system, secure authentication, and production-ready operational error handling using **`vanta-api`**.

---

## Table of Contents

- [Project Architecture](#project-architecture)
- [Tech Stack](#tech-stack)
- [Quickstart & Project Setup](#quickstart--project-setup)
  - [Prerequisites](#prerequisites)
  - [1. Environment Configuration](#1-environment-configuration)
  - [2. Backend Setup & Seeding](#2-backend-setup--seeding)
  - [3. Frontend Setup](#3-frontend-setup)
  - [4. First-Time Login Walkthrough](#4-first-time-login-walkthrough)
- [Using `vanta-api` in TypeScript Projects](#using-vanta-api-in-typescript-projects)
  - [What is `vanta-api`?](#what-is-vanta-api)
  - [The TypeScript Issue (`TS7016`) & Why It Happens](#the-typescript-issue-ts7016--why-it-happens)
  - [The Permanent Solution (Declaration File & Automation)](#the-permanent-solution-declaration-file--automation)
  - [Core Utilities & TypeScript Usage Examples](#core-utilities--typescript-usage-examples)
- [Deep Dive: Dynamic Permission & RBAC System](#deep-dive-dynamic-permission--rbac-system)
  - [Why Dynamic Permissions?](#why-dynamic-permissions)
  - [Data Model & Schema Relationships](#data-model--schema-relationships)
  - [Database Seeding Engine](#database-seeding-engine)
  - [Backend Route Protection](#backend-route-protection)
  - [Frontend Dynamic Authorization & UI Guards](#frontend-dynamic-authorization--ui-guards)
- [API Reference](#api-reference)
- [Available Scripts](#available-scripts)
- [Security & Production Readiness](#security--production-readiness)

---

## Project Architecture

```
full-stack-mui-backts/
├── backend/                        # Express 5 + Mongoose + TypeScript API
│   ├── src/
│   │   ├── config/                 # Environment variables & DB connection
│   │   ├── MiddleWare/             # Auth (exportValidation, isLogin), error handling
│   │   ├── Modules/
│   │   │   ├── Auth/               # Auth controllers, routes, OTP & password logic
│   │   │   ├── Permission/         # Dynamic permission model, controller, routes
│   │   │   ├── Role/               # Dynamic role model, controller, routes
│   │   │   ├── User/               # User schema & profile handling
│   │   │   └── Product/            # Product catalog & file uploads
│   │   ├── types/
│   │   │   ├── vanta-api.d.ts      # TypeScript ambient declarations for vanta-api
│   │   │   ├── auth.types.ts       # JWT payload & auth interfaces
│   │   │   ├── role.types.ts       # Role model interfaces
│   │   │   └── permission.types.ts # Granular permission interfaces
│   │   ├── utils/
│   │   │   └── seed.ts             # Production-safe idempotent DB seeder
│   │   ├── app.ts                  # Express application setup & middleware stack
│   │   └── server.ts               # HTTP server bootstrap
│   ├── .env.example                # Example environment variables
│   ├── package.json                # Backend scripts & dependencies
│   ├── security-config.js          # Vanta-API security configuration
│   └── tsconfig.json               # NodeNext ESM TypeScript configuration
│
└── frontend/                       # React 19 + Vite + MUI v6/v9 Client
    ├── src/
    │   ├── components/
    │   │   ├── glassmorphism.ts    # Reusable glassmorphic styling tokens & sx props
    │   │   ├── Icons.tsx           # Custom minimalist SVG icons
    │   │   ├── Navbar.tsx          # Responsive navigation bar with role badge
    │   │   └── PermissionGuard.tsx # Declarative permission-based component guard
    │   ├── constants/
    │   │   └── permissions.ts      # Standard permission identifier definitions
    │   ├── hooks/
    │   │   └── usePermission.ts    # Custom RBAC hook (hasPermission, hasAnyPermission)
    │   ├── pages/
    │   │   ├── home/               # Minimalist landing banner & feature showcase
    │   │   ├── auth/               # Glassmorphic OTP & Password login/register
    │   │   └── roles/              # Dynamic role management, matrix & creation dialog
    │   ├── services/
    │   │   ├── api.ts              # Fetch wrapper with Bearer token injection
    │   │   ├── auth.service.ts     # Auth API integration
    │   │   └── role.service.ts     # Role & permission API integration
    │   ├── stores/
    │   │   ├── auth/auth.slice.ts  # Redux auth slice storing token, user & permissions
    │   │   └── store.ts            # Redux store & typed selector hooks
    │   ├── App.tsx                 # Root application router
    │   └── main.tsx                # Client entry point
    ├── package.json                # Frontend scripts & dependencies
    └── vite.config.ts              # Vite config with API proxy to localhost:5000
```

---

## Tech Stack

| Layer | Technologies | Key Highlights |
|---|---|---|
| **Frontend** | React 19, TypeScript, Vite 8, Material-UI (MUI v6/v9), Emotion, Redux Toolkit | Pure glassmorphism, responsive drawers/dialogs, declarative permission guards, zero mock data |
| **Backend** | Node.js (ESM), Express 5, TypeScript (NodeNext), MongoDB, Mongoose 9 | Dynamic RBAC, Bcrypt, JWT authentication, `vanta-api` query builder & error handling |
| **Security** | Helmet, CORS, Express-Validator, Idempotent Seeder | Production credential isolation, no secrets committed to version control |

---

## Quickstart & Project Setup

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.0.0` or later (`v20.x` / `v22.x` recommended)
- **npm**: `v9.0.0` or later
- **MongoDB**: Local MongoDB instance running at `mongodb://localhost:27017` or a remote MongoDB Atlas connection URI

---

### 1. Environment Configuration

Navigate to the `backend/` directory and create your `.env` file from the provided `.env.example`:

```bash
cd backend
cp .env.example .env
```

On Windows (PowerShell):
```powershell
cd backend
Copy-Item .env.example .env
```

Configure the environment variables in `backend/.env`:

| Variable | Description | Example / Default |
|---|---|---|
| `PORT` | Port for the Express backend API server | `5000` |
| `DATA_BASE` | MongoDB connection string URI | `mongodb://localhost:27017/mui-back` |
| `SECRET_KEY` | Secret key for signing and verifying JSON Web Tokens | `your-super-secret-jwt-key` |
| `SMS_KEY` | SMS gateway API key (optional for development) | `your-sms-api-key` |
| `ADMIN_PHONE` | Initial SuperAdmin phone number for first-time login | `09120000000` |
| `ADMIN_PASSWORD` | Initial SuperAdmin password for first-time login | `Admin12345!` |

> [!IMPORTANT]
> The database seeder (`npm run seed`) strictly reads `ADMIN_PHONE` and `ADMIN_PASSWORD` from `.env`. No admin passwords or phone numbers are hardcoded in the source code.

---

### 2. Backend Setup & Seeding

Install backend dependencies:

```bash
cd backend
npm install
```

> [!NOTE]
> The backend `package.json` includes an automated `postinstall` hook that automatically copies `src/types/vanta-api.d.ts` into `node_modules/vanta-api/index.d.ts`, guaranteeing flawless TypeScript compilation right out of the box!

#### Run the Database Seeder

Seed the database with atomic permissions, default roles, and the initial Administrator account:

```bash
npm run seed
```

Output preview:
```
Connecting to MongoDB for seeding...
Connected to MongoDB successfully.
Seeding permissions...
  Created permission: product:create
  Created permission: product:read
  ... (25 atomic permissions created)
Seeding roles...
  Created role: superadmin
  Created role: admin
  Created role: user
Checking initial administrator user...
  Created initial Admin user from environment variables:
   Phone: 09120000000
   Role:  admin
 Database seeding completed successfully!
```

#### Start the Backend API Server

```bash
npm run dev
```

The backend server will run at: **`http://localhost:5000`**

---

### 3. Frontend Setup

In a new terminal window, navigate to the `frontend/` directory and install dependencies:

```bash
cd frontend
npm install
```

#### Start the Frontend Development Server

```bash
npm run dev
```

The frontend will run at: **`http://localhost:5173`**

The Vite dev server automatically proxies any `/api/*` requests directly to `http://localhost:5000/api/*`, eliminating CORS friction during local development.

---

### 4. First-Time Login Walkthrough

1. Open your browser and navigate to **`http://localhost:5173`**.
2. Click **"Sign In"** in the top navigation bar or go directly to **`http://localhost:5173/auth`**.
3. Select the **"Password Login"** tab.
4. Enter the credentials configured in your `backend/.env`:
   - **Phone Number**: `09120000000` (or your configured `ADMIN_PHONE`)
   - **Password**: `Admin12345!` (or your configured `ADMIN_PASSWORD`)
5. Click **"Sign In with Password"**.
6. Once authenticated:
   - Your user role badge (**"ADMIN"**) will appear in the top-right corner of the Navbar.
   - Click **"Roles"** in the navigation bar to navigate to `/roles`.
   - You can view all existing roles, examine their assigned permissions, and click **"Create New Role"** to dynamically generate custom roles with custom permission combinations.

---

## Using `vanta-api` in TypeScript Projects

### What is `vanta-api`?

[`vanta-api`](https://www.npmjs.com/package/vanta-api) is a backend productivity package designed for Node.js, Express, and MongoDB/Mongoose. It streamlines API architecture by providing:

1. **`catchAsync`**: An asynchronous wrapper function that eliminates repetitive `try / catch` blocks in Express route controllers.
2. **`HandleERROR`**: An operational error class extending JavaScript's native `Error`, carrying an HTTP `statusCode` and automatic operational status (`"fail"` for 4xx, `"error"` for 5xx).
3. **`catchError`**: A centralized Express error-handling middleware that formats and outputs clean, consistent JSON error responses.
4. **`ApiFeatures`**: A fluent Mongoose query builder supporting filtering, sorting, field selection, and pagination.
5. **Security Configuration**: Automatically creates a `security-config.js` with production-grade security headers.

---

### The TypeScript Issue (`TS7016`) & Why It Happens

`vanta-api` (version `1.5.2`) is published as a pure JavaScript ECMAScript Module (`"type": "module"`) without built-in TypeScript `.d.ts` declaration files. Furthermore, there is no `@types/vanta-api` package published on npm.

When using TypeScript with modern ECMAScript module resolution (`"moduleResolution": "nodenext"` or `"node16"`), TypeScript strictly inspects package entry points according to Node.js ESM standards. Because `vanta-api` contains no declaration files, TypeScript fails with:

```text
error TS7016: Could not find a declaration file for module 'vanta-api'.
'node_modules/vanta-api/index.js' implicitly has an 'any' type.
```

---

### The Permanent Solution (Declaration File & Automation)

To make `vanta-api` first-class in TypeScript, we provide a complete ambient module declaration file:

#### 1. Declaration File: `backend/src/types/vanta-api.d.ts`

```typescript
import { Request, Response, NextFunction } from "express";

declare module "vanta-api" {
    /**
     * Wraps an async Express route handler.
     * Automatically forwards any thrown errors or unhandled rejections to next(err).
     */
    export function catchAsync(
        fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>
    ): (req: Request, res: Response, next: NextFunction) => void;

    /**
     * Operational HTTP error.
     * Marks errors as expected operational failures with an HTTP status code.
     */
    export class HandleERROR extends Error {
        statusCode: number;
        /** "fail" for 4xx, "error" for 5xx */
        status: string;
        /** Always true — distinguishes operational errors from programming bugs */
        isOperational: boolean;
        constructor(message: string, statusCode: number);
    }

    /**
     * Express global error-handling middleware.
     * Register as the final middleware in app.ts: app.use(catchError);
     */
    export function catchError(
        err: HandleERROR & { statusCode?: number },
        req: Request,
        res: Response,
        next: NextFunction
    ): void;

    /**
     * Mongoose query builder for filtering, sorting, pagination, and field selection.
     */
    export default class ApiFeatures {
        constructor(query: any, queryString: Record<string, any>);
        filter(): this;
        sort(): this;
        limitFields(): this;
        paginate(): this;
    }
}
```

#### 2. Automated Postinstall Hook in `backend/package.json`

Under `"moduleResolution": "nodenext"`, TypeScript expects `index.d.ts` to live adjacent to `node_modules/vanta-api/index.js`. Because `node_modules/` is gitignored, any fresh `npm install` would erase manual edits.

To make this completely hands-free for all developers and CI/CD pipelines, we added a cross-platform `postinstall` script to `backend/package.json`:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "seed": "tsx src/utils/seed.ts",
    "postinstall": "node -e \"import fs from 'node:fs'; if (fs.existsSync('src/types/vanta-api.d.ts') && fs.existsSync('node_modules/vanta-api')) { fs.copyFileSync('src/types/vanta-api.d.ts', 'node_modules/vanta-api/index.d.ts'); console.log('vanta-api TypeScript declaration patched successfully.'); }\"",
    "start": "node dist/server.js"
  }
}
```

Now, whenever you or your CI system runs `npm install`, TypeScript declarations for `vanta-api` are placed automatically!

---

### Core Utilities & TypeScript Usage Examples

#### 1. Controller with `catchAsync` and `HandleERROR`

No `try / catch` blocks required. Any rejected Promise automatically reaches `next(err)`:

```typescript
import { Request, Response, NextFunction } from "express";
import { catchAsync, HandleERROR } from "vanta-api";
import Role from "./roleMd.js";

// Clean, strongly-typed asynchronous controller
export const createRole = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { name, permissions } = req.body;

    if (!name || typeof name !== "string") {
        // Operational 400 Bad Request
        return next(new HandleERROR("Role name is required", 400));
    }

    const existingRole = await Role.findOne({ name: name.trim().toLowerCase() });
    if (existingRole) {
        return next(new HandleERROR("A role with this name already exists", 400));
    }

    const role = await Role.create({
        name: name.trim().toLowerCase(),
        permissions: permissions || [],
    });

    res.status(201).json({
        success: true,
        data: role,
    });
});
```

#### 2. Query Filtering, Sorting & Pagination with `ApiFeatures`

```typescript
import { Request, Response } from "express";
import { catchAsync } from "vanta-api";
import ApiFeatures from "vanta-api";
import Product from "./productMd.js";

export const getAllProducts = catchAsync(async (req: Request, res: Response) => {
    // Chain filtering, sorting, field limiting, and pagination
    const features = new ApiFeatures(Product.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const products = await features.query;

    res.status(200).json({
        success: true,
        results: products.length,
        data: products,
    });
});
```

#### 3. Mounting Central Error Middleware in `app.ts`

```typescript
import express from "express";
import { catchError } from "vanta-api";
import roleRouter from "./Modules/Role/role.js";

const app = express();

app.use(express.json());
app.use("/api/roles", roleRouter);

// Register catchError as the VERY LAST middleware
app.use(catchError);

export default app;
```

---

## Deep Dive: Dynamic Permission & RBAC System

### Why Dynamic Permissions?

Most web applications start with rigid, hardcoded role checks:

```typescript
// Anti-pattern: Hardcoded role checking
if (user.role === "admin") {
  // Allow edit
}
```

This anti-pattern quickly breaks down:
- **Permission Creep**: You soon need "Supervisors", "Editors", "Finance Managers", or "Auditors" who each need overlapping subsets of features.
- **Rigid Releases**: Adding or revoking a single capability requires modifying code and redeploying the application.
- **No Multi-Tenancy**: Cannot allow organizations to define their own custom roles.

#### The Modern Solution: Dynamic Resource-Action RBAC

Our platform decouples **Roles** from **Capabilities**:
1. **Permissions** are granular, atomic primitives formatted as `resource:action` (e.g., `product:create`, `role:delete`, `user:update`).
2. **Roles** are flexible named collections of permissions stored in MongoDB.
3. **Users** belong to a Role.
4. Authorization is evaluated against **Permissions**, not role names:

```typescript
// Best Practice: Capability checking
if (hasPermission("product:create")) {
  // Allow creation
}
```

---

### Data Model & Schema Relationships

```
┌────────────────────────────────┐
│             User               │
├────────────────────────────────┤
│  _id: ObjectId                 │
│  phoneNumber: "09120000000"    │
│  password: "<bcrypt-hash>"     │
│  role: ObjectId ───────────────┼──────────────┐
└────────────────────────────────┘              │
                                                ▼
                               ┌────────────────────────────────┐
                               │             Role               │
                               ├────────────────────────────────┤
                               │  _id: ObjectId                 │
                               │  name: "custom_editor"         │
                               │  description: "Product Editor" │
                               │  permissions: [ObjectId] ──────┼──────────────┐
                               └────────────────────────────────┘              │
                                                                               ▼
                               ┌────────────────────────────────────────────────────────┐
                               │                       Permission                       │
                               ├────────────────────────────────────────────────────────┤
                               │  _id: ObjectId                                         │
                               │  name: "product:create"                                │
                               │  resource: "product"                                   │
                               │  action: "create"                                      │
                               │  description: "Allows to create product resources"     │
                               └────────────────────────────────────────────────────────┘
```

#### 1. Permission Schema (`backend/src/Modules/Permission/permissionMd.ts`)

```typescript
const permissionSchema = new Schema({
  name: { type: String, required: true, unique: true }, // e.g., "product:create"
  resource: { type: String, required: true },           // "product" | "user" | "role" | "permission" | "upload"
  action: { type: String, required: true },             // "create" | "read" | "update" | "delete" | "manage"
  description: { type: String, default: "" },
});
```

#### 2. Role Schema (`backend/src/Modules/Role/roleMd.ts`)

```typescript
const roleSchema = new Schema({
  name: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, default: "" },
  permissions: [{ type: Schema.Types.ObjectId, ref: "Permission" }],
}, { timestamps: true });
```

#### 3. Protected System Roles

To prevent accidental platform lockout, core system roles are protected against deletion in `backend/src/Modules/Role/roleCn.ts`:

```typescript
const protectedRoles = ["superadmin", "admin", "user"];
if (protectedRoles.includes(role.name.toLowerCase())) {
    return next(new HandleERROR(`System role '${role.name}' cannot be deleted`, 403));
}
```

---

### Database Seeding Engine

The database seeder (`backend/src/utils/seed.ts`) is **completely idempotent** (safe to run repeatedly without creating duplicates or overwriting user data).

It automatically constructs:
1. **25 Atomic Permissions**: Across 5 resources (`product`, `user`, `role`, `permission`, `upload`) multiplied by 5 actions (`create`, `read`, `update`, `delete`, `manage`).
2. **Default Roles**:
   - `superadmin`: Granted all 25 permissions.
   - `admin`: Granted all 25 permissions.
   - `user`: Granted read and upload capabilities (`product:read`, `upload:create`, `upload:read`).
3. **SuperAdmin User**: Created with hashed password and assigned the `admin` role using `.env` credentials.

---

### Backend Route Protection

1. **`exportValidation` Middleware**: Extracts and verifies the Bearer JWT token from `Authorization: Bearer <token>`, attaching `req.userId` and `req.role` to Express's `Request` object.
2. **`isLogin` Middleware**: Ensures requests have a valid authenticated session:

```typescript
roleRouter.route("/")
    .get(isLogin, getRoles)
    .post(isLogin, createRole);

roleRouter.route("/:id")
    .delete(isLogin, deleteRole);
```

---

### Frontend Dynamic Authorization & UI Guards

When a user logs in, the backend populates their role and permissions:

```json
{
  "_id": "60d0fe4f5311236168a109ca",
  "phoneNumber": "09120000000",
  "role": {
    "name": "admin",
    "permissions": [
      { "name": "role:create", "resource": "role", "action": "create" },
      { "name": "product:create", "resource": "product", "action": "create" }
    ]
  }
}
```

The frontend Redux store normalizes these permissions into a flat `string[]` (`["role:create", "product:create", ...]`).

#### 1. Custom Hook: `usePermission` (`frontend/src/hooks/usePermission.ts`)

```typescript
import { usePermission } from "../../hooks/usePermission";
import { PERMISSIONS } from "../../constants/permissions";

const ProductManager = () => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();

  const canCreate = hasPermission(PERMISSIONS.PRODUCT.CREATE);
  const canDelete = hasPermission(PERMISSIONS.PRODUCT.DELETE);

  return (
    <div>
      {canCreate && <button onClick={handleCreate}>New Product</button>}
      {canDelete && <button onClick={handleDelete}>Delete Product</button>}
    </div>
  );
};
```

#### 2. Declarative Component: `<PermissionGuard>` (`frontend/src/components/PermissionGuard.tsx`)

Render UI elements conditionally without manual boolean conditions:

```tsx
import { PermissionGuard } from "../../components/PermissionGuard";
import { PERMISSIONS } from "../../constants/permissions";

<PermissionGuard 
  permission={PERMISSIONS.ROLE.CREATE} 
  fallback={<p>You do not have permission to create roles.</p>}
>
  <Button variant="contained" onClick={() => setOpenCreateDialog(true)}>
    Create Role
  </Button>
</PermissionGuard>
```

#### 3. Dynamic Roles Management Page (`frontend/src/pages/roles/index.tsx`)

The Roles page provides a glassmorphic dashboard:
- **Matrix View**: Visualizes all roles, description, and chips representing assigned permissions.
- **Resource Grouping**: Permissions in the creation dialog are grouped by resource (`Role Management`, `Product Catalog`, `User Management`, etc.).
- **Quick Selection**: Offers "Select All" and "Deselect All" shortcuts per resource category.
- **Responsive Drawer / FullScreen Dialog**: Flawless experience on both desktop screens and mobile viewports.
- **System Protection Indicators**: System roles (`superadmin`, `admin`, `user`) display a lock shield icon and cannot be deleted.

---

## API Reference

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth` | Check if phone number exists & returns auth method | No |
| `POST` | `/api/auth/sendOtp` | Generate and dispatch SMS OTP code | No |
| `POST` | `/api/auth/loginWithOtp` | Authenticate or register via SMS OTP | No |
| `POST` | `/api/auth/loginWithPassword` | Authenticate using phone number and password | No |
| `POST` | `/api/auth/resetPassword` | Reset password using verified OTP code | No |

### Role Management (`/api/roles`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/roles` | Retrieve all roles with populated permissions | Yes (`Bearer Token`) |
| `POST` | `/api/roles` | Create a new custom dynamic role | Yes (`Bearer Token`) |
| `DELETE` | `/api/roles/:id` | Delete a role (system roles protected) | Yes (`Bearer Token`) |

### Permissions (`/api/permissions`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/permissions` | Retrieve all 25 atomic permissions | Yes (`Bearer Token`) |

---

## Available Scripts

### Backend (`/backend`)

| Command | Action |
|---|---|
| `npm run dev` | Starts backend with hot-reloading via `tsx watch src/server.ts` |
| `npm run build` | Compiles TypeScript into JavaScript inside `dist/` |
| `npm run seed` | Idempotently seeds permissions, base roles, and initial SuperAdmin |
| `npm run postinstall` | Automatically copies `src/types/vanta-api.d.ts` into `node_modules/vanta-api/` |
| `npm run start` | Runs production build via `node dist/server.js` |

### Frontend (`/frontend`)

| Command | Action |
|---|---|
| `npm run dev` | Starts Vite development server at `http://localhost:5173` |
| `npm run build` | Type-checks with `tsc -b` and builds optimized production bundle |
| `npm run preview` | Locally previews the production build |
| `npm run lint` | Runs ESLint analysis across frontend source code |

---

## Security & Production Readiness

- **Zero Hardcoded Secrets**: All JWT secrets, database connection strings, and admin credentials are read strictly from `.env`.
- **Bcrypt Password Hashing**: Passwords are encrypted with 10 salt rounds prior to persistence.
- **Protected System Roles**: System roles cannot be deleted via the API.
- **Centralized Error Handling**: `HandleERROR` and `catchError` ensure internal server stack traces are not leaked to API clients.
- **Glassmorphic UI Design**: Minimalist translucent layers, subtle borders (`rgba(226, 232, 240, 0.8)`), and responsive layouts built with Material-UI v6 / v9 tokens.

---

### Author & License
- **Author**: Yousef Farahbakhsh
- **License**: ISC
