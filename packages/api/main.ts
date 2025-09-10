import "reflect-metadata";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";

import { testPostgresConnection } from "./database/sequelize";
import { testRedisConnection } from "./redis/publisher";
import { initCronJobs } from "./cron";
import { logger } from "./utils/logger";

const log = logger("api");

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

  // → Test Database and Redis Connection
  const dbTest = await testPostgresConnection(true);
  const redisTest = await testRedisConnection(true);
  if (!dbTest || !redisTest) {
    log.error("Failed to connect to database or Redis. Exiting...");
    process.exit(1);
  }

  // → Start server
  app.listen(port, () => {
    console.log(`
    RESTFUL API - Startup details:
    > ${new Date().toUTCString()}
    > Running in ${process.env.NODE_ENV || "development"} mode
    > Ready on http://localhost:${port}
    `);

    // → Initialize cron jobs
    initCronJobs();
  });
})();
