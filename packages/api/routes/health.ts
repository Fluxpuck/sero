import { Request, Response, Router } from "express";
import { testConnection } from "../utils/publisher";
import { sequelize } from "../database/sequelize";

const router = Router();

/**
 * Health check endpoint
 * Returns status of API, database, and Redis connections
 */
router.get("/", async (req: Request, res: Response) => {
  // Check database connection
  let dbStatus: boolean;
  try {
    await sequelize.authenticate();
    dbStatus = true;
  } catch (error) {
    dbStatus = false;
  }

  // Check Redis connection
  let redisStatus: boolean;
  try {
    await testConnection();
    redisStatus = true;
  } catch (error) {
    redisStatus = false;
  }

  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      api: true,
      database: dbStatus,
      redis: redisStatus,
    },
  });
});

export default router;
