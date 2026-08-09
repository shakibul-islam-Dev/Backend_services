import express from "express";
import cors from "cors";
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  res.send({
    sucess: true,
    message: "Congratulations Serever is running",
  });
});

export default app;
