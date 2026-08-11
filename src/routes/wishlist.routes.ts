import { Router } from "express";
import * as wishlistController from "../controllers/wishlist.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  addWishlistValidation,
  wishlistParamsValidation,
} from "../validation/wishlist.validation";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  addWishlistValidation,
  validate,
  wishlistController.addToWishlist
);
router.get("/", wishlistController.getWishlist);
router.delete(
  "/:id",
  wishlistParamsValidation,
  validate,
  wishlistController.removeFromWishlist
);

export default router;
