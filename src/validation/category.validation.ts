import { body, param, query } from "express-validator";
import { CategoryStatus } from "../generated/prisma/enums";

export const createCategoryValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 100 })
    .withMessage("Name must be at most 100 characters"),
  body("slug")
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Slug must be lowercase alphanumeric with dashes"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description is too long"),
  body("parentId").optional().isUUID().withMessage("Invalid parent category id"),
  body("status")
    .optional()
    .isIn(Object.values(CategoryStatus))
    .withMessage(`Status must be one of: ${Object.values(CategoryStatus).join(", ")}`),
];

export const updateCategoryValidation = [
  param("id").isUUID().withMessage("Invalid category id"),
  body("name")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Name must be at most 100 characters"),
  body("slug")
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Slug must be lowercase alphanumeric with dashes"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description is too long"),
  body("parentId").optional().isUUID().withMessage("Invalid parent category id"),
  body("status")
    .optional()
    .isIn(Object.values(CategoryStatus))
    .withMessage(`Status must be one of: ${Object.values(CategoryStatus).join(", ")}`),
];

export const categoryParamsValidation = [
  param("id").isUUID().withMessage("Invalid category id"),
];

export const listCategoriesValidation = [
  query("parentId").optional().isUUID().withMessage("Invalid parent category id"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
];
