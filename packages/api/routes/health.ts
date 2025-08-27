import { Request, Response, Router } from "express";
import { testPostgresConnection } from "../database/sequelize";
import { testRedisConnection } from "../redis/publisher";

const router = Router();

/**
 * Health check endpoint
 * Returns status of API, database, and Redis connections
 */
router.get("/", async (req: Request, res: Response) => {
  // Check database connection
  const dbStatus = await testPostgresConnection();
  const redisStatus = await testRedisConnection();

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
