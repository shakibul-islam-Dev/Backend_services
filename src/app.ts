import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import router from "./routes/index";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.send({
    success: true,
    message: "Server is running",
    docs: "/api/docs",
  });
});

app.get("/api/health", (_req, res) => {
  res.send({ success: true, message: "API is healthy", data: { uptime: process.uptime() } });
});

app.use("/api", router);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
