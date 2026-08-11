import { Router } from "express";
import * as categoryController from "../controllers/category.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { Role } from "../generated/prisma/enums";
import {
  categoryParamsValidation,
  createCategoryValidation,
  listCategoriesValidation,
  updateCategoryValidation,
} from "../validation/category.validation";

const router = Router();

router.get(
  "/",
  listCategoriesValidation,
  validate,
  categoryController.getCategories
);
router.get(
  "/:id",
  categoryParamsValidation,
  validate,
  categoryController.getCategoryById
);

router.use(authenticate);

router.post(
  "/",
  createCategoryValidation,
  validate,
  authorize(Role.ADMIN, Role.MODERATOR),
  categoryController.createCategory
);
router.put(
  "/:id",
  updateCategoryValidation,
  validate,
  authorize(Role.ADMIN, Role.MODERATOR),
  categoryController.updateCategory
);
router.delete(
  "/:id",
  categoryParamsValidation,
  validate,
  authorize(Role.ADMIN),
  categoryController.deleteCategory
);

export default router;
