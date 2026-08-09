import express from "express";
import cors from "cors";
import productRouter from "./services/product";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", async (req, res) => {
  res.send({
    sucess: true,
    message: "Congratulations Serever is running",
  });
});

app.use(productRouter);

export default app;
