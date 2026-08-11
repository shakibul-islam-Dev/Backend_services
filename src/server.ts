import app from "./app";
import { env } from "./config/env";

const server = app.listen(env.port, () => {
  console.log(`Server is running on http://localhost:${env.port}`);
  console.log(`Environment: ${env.nodeEnv}`);
});

const shutdown = (signal: string) => {
  console.log(`${signal} received, shutting down gracefully...`);
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
