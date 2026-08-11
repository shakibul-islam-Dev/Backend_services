import { Router } from "express";
import * as orderController from "../controllers/order.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { Role } from "../generated/prisma/enums";
import {
  createOrderValidation,
  listOrdersValidation,
  orderParamsValidation,
  updateOrderValidation,
} from "../validation/order.validation";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  createOrderValidation,
  validate,
  orderController.createOrder
);
router.get(
  "/",
  listOrdersValidation,
  validate,
  orderController.getOrders
);
router.get(
  "/:id",
  orderParamsValidation,
  validate,
  orderController.getOrderById
);
router.patch(
  "/:id",
  updateOrderValidation,
  validate,
  authorize(Role.ADMIN),
  orderController.updateOrder
);
router.post(
  "/:id/cancel",
  orderParamsValidation,
  validate,
  orderController.cancelOrder
);
router.delete(
  "/:id",
  orderParamsValidation,
  validate,
  authorize(Role.ADMIN),
  orderController.deleteOrder
);

export default router;
