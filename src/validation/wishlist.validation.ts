import { body, param } from "express-validator";

export const addWishlistValidation = [
  body("productId").isUUID().withMessage("A valid product id is required"),
];

export const wishlistParamsValidation = [
  param("id").isUUID().withMessage("Invalid wishlist item id"),
];
