import { body } from "express-validator";

export const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email").trim().isEmail().withMessage("A valid email is required"),
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .matches(/^[a-zA-Z0-9_]{3,20}$/)
    .withMessage("Username must be 3-20 chars (letters, numbers, underscore)"),
  body("password")
    .isLength({ min: 6, max: 128 })
    .withMessage("Password must be between 6 and 128 characters"),
  body("phone").optional().trim().isLength({ max: 20 }).withMessage("Phone is too long"),
  body("address").optional().trim().isLength({ max: 500 }).withMessage("Address is too long"),
];

export const loginValidation = [
  body("emailOrUsername")
    .trim()
    .notEmpty()
    .withMessage("Email or username is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const refreshTokenValidation = [
  body("refreshToken")
    .optional()
    .isString()
    .withMessage("Refresh token must be a string"),
];
