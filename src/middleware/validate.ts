import { NextFunction, Request, RequestHandler, Response } from "express";
import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-error";

export function validate(req: Request, _res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((error) => {
      if (error.type === "field") {
        return { field: error.path, message: error.msg };
      }
      return { message: error.msg };
    });
    throw ApiError.badRequest("Validation failed", details);
  }
  next();
}

export const withValidate: RequestHandler = validate;
