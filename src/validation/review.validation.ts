import { body, param, query } from "express-validator";
import { ReviewStatus } from "../generated/prisma/enums";

export const createReviewValidation = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be an integer between 1 and 5"),
  body("title")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Title must be at most 200 characters"),
  body("comment")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Comment must be at most 2000 characters"),
  body("productId").isUUID().withMessage("A valid product id is required"),
];

export const updateReviewValidation = [
  param("id").isUUID().withMessage("Invalid review id"),
  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be an integer between 1 and 5"),
  body("title")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Title must be at most 200 characters"),
  body("comment")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Comment must be at most 2000 characters"),
];

export const reviewStatusValidation = [
  param("id").isUUID().withMessage("Invalid review id"),
  body("status")
    .isIn(Object.values(ReviewStatus))
    .withMessage(`Status must be one of: ${Object.values(ReviewStatus).join(", ")}`),
];

export const reviewParamsValidation = [
  param("id").isUUID().withMessage("Invalid review id"),
];

export const listReviewsValidation = [
  query("productId").optional().isUUID().withMessage("Invalid product id"),
  query("userId").optional().isUUID().withMessage("Invalid user id"),
  query("status")
    .optional()
    .isIn(Object.values(ReviewStatus))
    .withMessage(`Status must be one of: ${Object.values(ReviewStatus).join(", ")}`),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
];
