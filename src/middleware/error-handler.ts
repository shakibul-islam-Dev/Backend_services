import { NextFunction, Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";
import { ApiError } from "../utils/api-error";

export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ApiError) {
    const body: Record<string, unknown> = {
      success: false,
      message: err.message,
    };
    if (err.errors !== undefined) body.errors = err.errors;
    res.status(err.statusCode).json(body);
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({
        success: false,
        message: "A record with this value already exists",
      });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({
        success: false,
        message: "The requested record does not exist",
      });
      return;
    }
  }

  console.error(err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
