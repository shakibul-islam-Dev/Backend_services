import router from "express";
import {
  getAllUser,
  getOneUser,
  postUser,
  updateOneUser,
  deleteUser,
} from "../controllers/UserController";
const userRouter = router();

export default userRouter;
