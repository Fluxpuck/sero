import { Request, Response, Router } from "express";
import { testPostgresConnection } from "../database/sequelize";
import { testRedisConnection } from "../redis/publisher";
import { ResponseStatus } from "../utils/response.types";

const router = Router();

/**
 * Health check endpoint
 * Returns status of API, database, and Redis connections
 */
router.get("/", async (req: Request, res: Response) => {
  // Check database connection
  const postgresStatus = await testPostgresConnection();
  const redisStatus = await testRedisConnection();

  res.status(200).json({
    status: ResponseStatus.SUCCESS,
    timestamp: new Date().toISOString(),
    services: {
      postgres: postgresStatus ? ResponseStatus.SUCCESS : ResponseStatus.FAIL,
      redis: redisStatus ? ResponseStatus.SUCCESS : ResponseStatus.FAIL,
    },
  });
});

export default router;
