import { Router } from "express";
import * as productController from "../controllers/product.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createProductValidation,
  listProductsValidation,
  productParamsValidation,
  updateProductValidation,
} from "../validation/product.validation";

const router = Router();

router.get(
  "/",
  listProductsValidation,
  validate,
  productController.getProducts
);
router.get(
  "/:id",
  productParamsValidation,
  validate,
  productController.getProductById
);

router.use(authenticate);

router.post(
  "/",
  createProductValidation,
  validate,
  productController.createProduct
);
router.put(
  "/:id",
  updateProductValidation,
  validate,
  productController.updateProduct
);
router.delete(
  "/:id",
  productParamsValidation,
  validate,
  productController.deleteProduct
);

export default router;
