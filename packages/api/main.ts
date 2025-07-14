import "reflect-metadata";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import { testConnection } from "./utils/publisher";

(async () => {
  // → Setup server
  const app = express();
  const port = process.env.PORT || 3336;

  // → Apply security middleware
  app.use(helmet());
  // → Enable CORS & Compression
  app.use(cors());
  app.use(compression());

  // → Parse request bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // → Mount routes to the server
  const routes = await require("./middleware/routes");
  routes.run(app, { baseRoute: "/api" });

  // → Use the custom 404 and error handlers
  const { notFoundHandler, errorHandler } = require("./middleware/error");
  app.use(notFoundHandler);
  app.use(errorHandler);

  // → Sync Database Connection
  const start = performance.now();
  const { sequelize } = require("./database/sequelize");
  await sequelize.sync();
  const end = performance.now();

  // → Test Redis Connection
  const redisTest = await testConnection();

  // → Start server
  app.listen(port, () => {
    return console.log(`
    RESTFUL API - Startup details:
    > ${new Date().toUTCString()}
    > Database Synced in ${Math.round(end - start)} milliseconds
    > Redis Publisher ${redisTest ? "Connected" : "Disconnected"}
    > Running in ${process.env.NODE_ENV || "development"} mode
    > Ready on http://localhost:${port}
    `);
  });
})();
