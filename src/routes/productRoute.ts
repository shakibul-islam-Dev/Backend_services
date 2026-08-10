import { Router } from "express";
import {
  getAllProduct,
  getOneProduct,
  postProduct,
  updateOneProduct,
  deleteProduct,
} from "../controllers/ProductController";
const productRouter = Router();
productRouter.get("/", getAllProduct);
export default productRouter;
