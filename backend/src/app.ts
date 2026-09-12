import path from "path";
import { fileURLToPath } from "node:url";
import express, { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import exportValidation from "./MiddleWare/exportValidation.js";
import { catchError } from "vanta-api";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./utils/Swagger.js";
import authRouter from "./Modules/Auth/auth.js";
import roleRouter from "./Modules/Role/role.js";
import permissionRouter from "./Modules/Permission/permission.js";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

const app = express();

// Swagger API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Security & utility middlewares
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from Public directory
app.use("/upload", express.static(path.join(__dirname, "../Public")));

// Custom token extraction & soft authentication
app.use(exportValidation);


app.use("/api/auth", authRouter);
app.use("/api/roles", roleRouter);
app.use("/api/permissions", permissionRouter);

// 404 Not Found Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// Global error handler — must be last
app.use(catchError);

export default app;