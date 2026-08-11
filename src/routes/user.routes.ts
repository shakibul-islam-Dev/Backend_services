import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { Role } from "../generated/prisma/enums";
import {
  updateProfileValidation,
  updateUserByAdminValidation,
  userParamsValidation,
} from "../validation/user.validation";

const router = Router();

router.use(authenticate);

router.get("/", authorize(Role.ADMIN), userController.getUsers);
router.get(
  "/:id",
  userParamsValidation,
  validate,
  userController.getUserById
);
router.put(
  "/:id",
  userParamsValidation,
  updateProfileValidation,
  validate,
  userController.updateProfile
);
router.patch(
  "/:id/admin",
  updateUserByAdminValidation,
  validate,
  authorize(Role.ADMIN),
  userController.updateUserByAdmin
);
router.delete(
  "/:id",
  userParamsValidation,
  validate,
  userController.deleteUser
);

export default router;
