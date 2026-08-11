import { NextFunction, Request, RequestHandler, Response } from "express";
import { Role } from "../generated/prisma/enums";
import { ApiError } from "../utils/api-error";
import { asyncHandler } from "../utils/async-handler";
import { verifyAccessToken } from "../utils/token";

export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Access token is required");
    }
    const token = header.split(" ")[1];
    try {
      const payload = await verifyAccessToken(token);
      req.user = { id: payload.sub, role: payload.role };
      next();
    } catch {
      throw ApiError.unauthorized("Invalid or expired access token");
    }
  }
);

export const authorize = (...roles: Role[]): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw ApiError.forbidden(
        "You do not have permission to perform this action"
      );
    }
    next();
  };
};
