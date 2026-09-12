# Full-Stack MUI + TypeScript Project

A full-stack application built with **React + MUI** on the frontend and **Node.js + Express + MongoDB** on the backend, written entirely in TypeScript.

---

## Project Structure

```
full-stack-mui-backts/
├── frontend/          # React + MUI client
└── backend/           # Express + Mongoose API server
```

---

## Backend

### Tech Stack

- **Runtime**: Node.js (ESM — `"type": "module"`)
- **Framework**: Express 5
- **Database**: MongoDB via Mongoose 9
- **Language**: TypeScript (`moduleResolution: nodenext`)
- **Auth**: JSON Web Tokens (`jsonwebtoken`)
- **Validation**: `express-validator`
- **Security**: `helmet`, `cors`

---

## Manual Patches & Known Workarounds

### `vanta-api` — Missing TypeScript Declarations

**Package version:** `vanta-api@1.5.2`

**Problem:**
`vanta-api` is a pure JavaScript ESM package with no bundled TypeScript declarations (`.d.ts` files) and no entry on `@types/` on npm. Using it in a TypeScript project with `moduleResolution: nodenext` causes:

```
error TS7016: Could not find a declaration file for module 'vanta-api'.
```

**Fix applied:**
A `index.d.ts` file was manually created inside the package directory:

```
backend/node_modules/vanta-api/index.d.ts
```

> ⚠️ **This file is NOT committed to git** — `node_modules/` is gitignored.
> It will be **lost on every `npm install`** and must be re-applied manually.

**Permanent workaround:**
A backup of the declarations is kept at:

```
backend/src/types/vanta-api.d.ts
```

After any `npm install`, re-apply the patch by running:

```bash
cp backend/src/types/vanta-api.d.ts backend/node_modules/vanta-api/index.d.ts
```

Or on Windows (PowerShell):

```powershell
Copy-Item backend\src\types\vanta-api.d.ts backend\node_modules\vanta-api\index.d.ts
```

**What the declaration file adds:**

```ts
import { catchAsync, HandleERROR, catchError } from "vanta-api";
import ApiFeatures from "vanta-api";
```

| Export | Type | Description |
|--------|------|-------------|
| `catchAsync(fn)` | Function wrapper | Wraps an async Express handler; auto-forwards errors to `next(err)` |
| `HandleERROR` | `class extends Error` | Operational HTTP error with `statusCode`, `status`, `isOperational` |
| `catchError` | Express error middleware | Global 4-argument error handler for `app.use()` |
| `ApiFeatures` | Class (default export) | Mongoose query builder — filter, sort, paginate, limitFields |

**Usage example:**

```ts
import { catchAsync, HandleERROR } from "vanta-api";

export const myHandler = catchAsync(async (req, res, next) => {
  const item = await SomeModel.findById(req.params.id);
  if (!item) {
    return next(new HandleERROR("Not found", 404));
  }
  res.status(200).json({ success: true, data: item });
});
```

**Register the global error handler in `app.ts`:**

```ts
import { catchError } from "vanta-api";

// Must be the last middleware
app.use(catchError);
```

---

## RBAC Permission System

The backend uses a **dynamic Role-Based Access Control (RBAC)** system. Permissions are stored in the database — no hardcoded role strings.

### Relationship

```
User
 │
 │ role: ObjectId
 ▼
Role
 │
 │ permissions: ObjectId[]
 ▼
Permission
 { resource: "product", action: "create", name: "product:create" }
```

### Models

| Model | File | Description |
|-------|------|-------------|
| `Permission` | `src/Modules/Permission/permissionMd.ts` | Atomic action on a resource |
| `Role` | `src/Modules/Role/roleMd.ts` | Named group of permissions |
| `User` | `src/Modules/User/userMd.ts` | References one Role |

### Types

All RBAC interfaces are in `src/types/`:

| File | Exports |
|------|---------|
| `permission.types.ts` | `IPermission`, `PermissionAction` |
| `role.types.ts` | `IRole`, `IPopulatedRole` |
| `user.types.ts` | `IUser` |

### Example permission names

```
user:read       user:create     user:update     user:delete
product:read    product:create  product:update  product:delete
upload:create
```

---

## Getting Started

### Install dependencies

```bash
cd backend
npm install
```

> ⚠️ After `npm install`, re-apply the `vanta-api` type patch:
> ```powershell
> Copy-Item src\types\vanta-api.d.ts node_modules\vanta-api\index.d.ts
> ```

### Run in development

```bash
npm run dev
```

### Type-check

```bash
npm run build
```
