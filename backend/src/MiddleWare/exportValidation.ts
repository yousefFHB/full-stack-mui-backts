import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtAuthPayload } from "../types/auth.types.js";
import { env } from "../config/env.js";

export const exportValidation = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.userId = null;
      req.role = null;
      return next();
    }

    const token = authHeader.split(" ")[1];
    const secretKey = env.secretKey || process.env.SECRET_KEY;

    if (!token || !secretKey) {
      req.userId = null;
      req.role = null;
      return next();
    }

    const decoded = jwt.verify(token, secretKey) as JwtAuthPayload;

    req.userId = decoded._id ?? null;
    req.role = decoded.role ?? null;
  } catch (_error) {
    req.userId = null;
    req.role = null;
  }

  next();
};

export default exportValidation;