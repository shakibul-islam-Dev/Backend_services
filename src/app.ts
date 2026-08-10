import express from "express";
import bcrypt from "bcrypt";
import cors from "cors";
import productRouter from "./routes/productRoute";
import userRouter from "./routes/userRoute";
import orderRouter from "./routes/orderRoute";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", async (req, res) => {
  res.send({
    sucess: true,
    message: "Congratulations Serever is running",
  });
});
app.use(userRouter);
app.use(orderRouter);
app.use(productRouter);

export default app;
