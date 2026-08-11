import { body, param } from "express-validator";
import { Role, UserStatus } from "../generated/prisma/enums";

export const updateProfileValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("username")
    .optional()
    .trim()
    .matches(/^[a-zA-Z0-9_]{3,20}$/)
    .withMessage("Username must be 3-20 chars (letters, numbers, underscore)"),
  body("avatar").optional().trim().isURL().withMessage("Avatar must be a valid URL"),
  body("phone").optional().trim().isLength({ max: 20 }).withMessage("Phone is too long"),
  body("address").optional().trim().isLength({ max: 500 }).withMessage("Address is too long"),
];

export const updateUserByAdminValidation = [
  param("id").isUUID().withMessage("Invalid user id"),
  body("role")
    .optional()
    .isIn(Object.values(Role))
    .withMessage(`Role must be one of: ${Object.values(Role).join(", ")}`),
  body("status")
    .optional()
    .isIn(Object.values(UserStatus))
    .withMessage(`Status must be one of: ${Object.values(UserStatus).join(", ")}`),
];

export const userParamsValidation = [
  param("id").isUUID().withMessage("Invalid user id"),
];
