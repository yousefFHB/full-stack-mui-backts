import { Request, Response, NextFunction } from "express";

export const isLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.role) {
    res.status(401).json({
      success: false,
      message: "You don't have permission to access this route",
    });
    return;
  }

  next();
};

export default isLogin;