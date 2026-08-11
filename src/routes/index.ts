import { Router } from "express";
import authRouter from "./auth.routes";
import userRouter from "./user.routes";
import categoryRouter from "./category.routes";
import productRouter from "./product.routes";
import reviewRouter from "./review.routes";
import orderRouter from "./order.routes";
import wishlistRouter from "./wishlist.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/categories", categoryRouter);
router.use("/products", productRouter);
router.use("/reviews", reviewRouter);
router.use("/orders", orderRouter);
router.use("/wishlist", wishlistRouter);

export default router;
