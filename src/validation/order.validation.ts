import { body, param, query } from "express-validator";
import { OrderStatus, PaymentStatus } from "../generated/prisma/enums";

export const createOrderValidation = [
  body("items")
    .isArray({ min: 1 })
    .withMessage("At least one order item is required"),
  body("items.*.productId")
    .isUUID()
    .withMessage("Each item must have a valid product id"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Each item quantity must be a positive integer"),
  body("shippingAddress")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Shipping address is too long"),
  body("paymentMethod")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Payment method is too long"),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Notes are too long"),
];

export const updateOrderValidation = [
  param("id").isUUID().withMessage("Invalid order id"),
  body("status")
    .optional()
    .isIn(Object.values(OrderStatus))
    .withMessage(`Status must be one of: ${Object.values(OrderStatus).join(", ")}`),
  body("paymentStatus")
    .optional()
    .isIn(Object.values(PaymentStatus))
    .withMessage(`Payment status must be one of: ${Object.values(PaymentStatus).join(", ")}`),
  body("shippingAddress")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Shipping address is too long"),
  body("paymentMethod")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Payment method is too long"),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Notes are too long"),
];

export const orderParamsValidation = [
  param("id").isUUID().withMessage("Invalid order id"),
];

export const listOrdersValidation = [
  query("status")
    .optional()
    .isIn(Object.values(OrderStatus))
    .withMessage(`Status must be one of: ${Object.values(OrderStatus).join(", ")}`),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
];
