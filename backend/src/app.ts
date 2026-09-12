import path from "path";
import { fileURLToPath } from "node:url";
import express, { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import exportValidation from "./MiddleWare/exportValidation.js";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

const app = express();

// Security & utility middlewares
app.use(helmet());
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

// ==========================================
// Application Routes (Register module routes here)
// e.g., app.use("/api/auth", authRouter);
// ==========================================

// 404 Not Found Handler (Must be registered after all routes)
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

export default app;