import { body, param, query } from "express-validator";
import { ProductStatus } from "../generated/prisma/enums";

export const createProductValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 200 })
    .withMessage("Title must be at most 200 characters"),
  body("slug")
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Slug must be lowercase alphanumeric with dashes"),
  body("description").optional().trim(),
  body("shortDescription")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Short description must be at most 500 characters"),
  body("quantity").optional().isInt({ min: 0 }).withMessage("Quantity must be a non-negative integer"),
  body("stock").optional().isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
  body("listPrice")
    .isNumeric()
    .withMessage("List price is required and must be numeric"),
  body("salePrice")
    .isNumeric()
    .withMessage("Sale price is required and must be numeric"),
  body("currency").optional().trim().isLength({ min: 3, max: 3 }).withMessage("Currency must be a 3-letter code"),
  body("discountPercent")
    .optional()
    .isNumeric()
    .withMessage("Discount percent must be numeric")
    .custom((value) => Number(value) >= 0 && Number(value) <= 100)
    .withMessage("Discount percent must be between 0 and 100"),
  body("categoryId").isUUID().withMessage("A valid category id is required"),
  body("status")
    .optional()
    .isIn(Object.values(ProductStatus))
    .withMessage(`Status must be one of: ${Object.values(ProductStatus).join(", ")}`),
];

export const updateProductValidation = [
  param("id").isUUID().withMessage("Invalid product id"),
  body("title")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Title must be at most 200 characters"),
  body("slug")
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Slug must be lowercase alphanumeric with dashes"),
  body("description").optional().trim(),
  body("shortDescription")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Short description must be at most 500 characters"),
  body("quantity").optional().isInt({ min: 0 }).withMessage("Quantity must be a non-negative integer"),
  body("stock").optional().isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
  body("listPrice").optional().isNumeric().withMessage("List price must be numeric"),
  body("salePrice").optional().isNumeric().withMessage("Sale price must be numeric"),
  body("currency").optional().trim().isLength({ min: 3, max: 3 }).withMessage("Currency must be a 3-letter code"),
  body("discountPercent")
    .optional()
    .isNumeric()
    .withMessage("Discount percent must be numeric")
    .custom((value) => Number(value) >= 0 && Number(value) <= 100)
    .withMessage("Discount percent must be between 0 and 100"),
  body("categoryId").optional().isUUID().withMessage("Invalid category id"),
  body("status")
    .optional()
    .isIn(Object.values(ProductStatus))
    .withMessage(`Status must be one of: ${Object.values(ProductStatus).join(", ")}`),
];

export const productParamsValidation = [
  param("id").isUUID().withMessage("Invalid product id"),
];

export const listProductsValidation = [
  query("categoryId").optional().isUUID().withMessage("Invalid category id"),
  query("sellerId").optional().isUUID().withMessage("Invalid seller id"),
  query("status")
    .optional()
    .isIn(Object.values(ProductStatus))
    .withMessage(`Status must be one of: ${Object.values(ProductStatus).join(", ")}`),
  query("search").optional().trim(),
  query("minPrice").optional().isNumeric().withMessage("minPrice must be numeric"),
  query("maxPrice").optional().isNumeric().withMessage("maxPrice must be numeric"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
];
