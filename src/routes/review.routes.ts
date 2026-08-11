import { Router } from "express";
import * as reviewController from "../controllers/review.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { Role } from "../generated/prisma/enums";
import {
  createReviewValidation,
  listReviewsValidation,
  reviewParamsValidation,
  reviewStatusValidation,
  updateReviewValidation,
} from "../validation/review.validation";

const router = Router();

router.get(
  "/",
  listReviewsValidation,
  validate,
  reviewController.getReviews
);
router.get(
  "/:id",
  reviewParamsValidation,
  validate,
  reviewController.getReviewById
);

router.use(authenticate);

router.post(
  "/",
  createReviewValidation,
  validate,
  reviewController.createReview
);
router.patch(
  "/:id/status",
  reviewStatusValidation,
  validate,
  authorize(Role.ADMIN, Role.MODERATOR),
  reviewController.updateReviewStatus
);
router.put(
  "/:id",
  updateReviewValidation,
  validate,
  reviewController.updateReview
);
router.delete(
  "/:id",
  reviewParamsValidation,
  validate,
  reviewController.deleteReview
);

export default router;
