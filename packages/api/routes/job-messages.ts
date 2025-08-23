import { Request, Response, Router, NextFunction } from "express";
import { JobMessages } from "../models/job-messages.model";
import { ResponseHandler } from "../utils/response.utils";
import { ResponseCode } from "../utils/response.types";
import { sequelize } from "../database/sequelize";

const router = Router();

/**
 * @swagger
 * /job-messages:
 *   get:
 *     summary: Get all job messages
 *     tags:
 *       - Job Messages
 *     parameters:
 *       - name: jobId
 *         in: query
 *         required: false
 *         description: Filter by job ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *       500:
 *         description: Server error
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobId } = req.query;
    const where: any = {};

    if (jobId) {
      where.jobId = jobId;
    }

    const jobMessages = await JobMessages.findAll({
      where,
    });

    ResponseHandler.sendSuccess(
      res,
      jobMessages,
      "Job messages retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /job-messages/{id}:
 *   get:
 *     summary: Get a specific job message by ID
 *     tags:
 *       - Job Messages
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the job message
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful operation
 *       404:
 *         description: Job message not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const jobMessage = await JobMessages.findByPk(id);

    if (!jobMessage) {
      return ResponseHandler.sendError(
        res,
        "Job message not found",
        ResponseCode.NOT_FOUND
      );
    }

    ResponseHandler.sendSuccess(
      res,
      jobMessage,
      "Job message retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /job-messages/job/{jobId}:
 *   get:
 *     summary: Get job messages by job ID
 *     tags:
 *       - Job Messages
 *     parameters:
 *       - name: jobId
 *         in: path
 *         required: true
 *         description: Job ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *       404:
 *         description: Job messages not found
 *       500:
 *         description: Server error
 */
router.get(
  "/job/:jobId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { jobId } = req.params;

      const jobMessages = await JobMessages.findAll({
        where: {
          jobId,
        },
      });

      if (!jobMessages || jobMessages.length === 0) {
        return ResponseHandler.sendError(
          res,
          "No job messages found for this job ID",
          ResponseCode.NOT_FOUND
        );
      }

      ResponseHandler.sendSuccess(
        res,
        jobMessages,
        "Job messages retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /job-messages:
 *   post:
 *     summary: Create a new job message
 *     tags:
 *       - Job Messages
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jobId:
 *                 type: string
 *                 description: ID of the job
 *               message:
 *                 type: string
 *                 description: Message content
 *     responses:
 *       201:
 *         description: Job message created successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Server error
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const { jobId, message } = req.body;

    // Validate required fields
    if (!jobId || !message) {
      await transaction.rollback();
      return ResponseHandler.sendValidationFail(
        res,
        "Missing required fields",
        ["jobId and message are required fields"]
      );
    }

    // Create new job message
    const jobMessage = await JobMessages.create(
      {
        jobId,
        message,
      } as JobMessages,
      { transaction }
    );

    await transaction.commit();

    ResponseHandler.sendSuccess(
      res,
      jobMessage,
      "Job message created successfully",
      ResponseCode.CREATED
    );
  } catch (error) {
    console.error("Error creating job message:", error);
    await transaction.rollback();
    next(error);
  }
});

/**
 * @swagger
 * /job-messages/{id}:
 *   put:
 *     summary: Update a job message
 *     tags:
 *       - Job Messages
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the job message to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: Updated message content
 *     responses:
 *       200:
 *         description: Job message updated successfully
 *       404:
 *         description: Job message not found
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Server error
 */
router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { message } = req.body;

    // Validate required fields
    if (!message) {
      await transaction.rollback();
      return ResponseHandler.sendValidationFail(
        res,
        "Missing required fields",
        ["message is a required field"]
      );
    }

    // Find the job message
    const jobMessage = await JobMessages.findByPk(id, { transaction });

    if (!jobMessage) {
      await transaction.rollback();
      return ResponseHandler.sendError(
        res,
        "Job message not found",
        ResponseCode.NOT_FOUND
      );
    }

    // Update the job message
    jobMessage.message = message;
    await jobMessage.save({ transaction });

    await transaction.commit();

    ResponseHandler.sendSuccess(
      res,
      jobMessage,
      "Job message updated successfully"
    );
  } catch (error) {
    console.error("Error updating job message:", error);
    await transaction.rollback();
    next(error);
  }
});

/**
 * @swagger
 * /job-messages/{id}:
 *   delete:
 *     summary: Delete a job message
 *     tags:
 *       - Job Messages
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the job message to delete
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Job message deleted successfully
 *       404:
 *         description: Job message not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const jobMessage = await JobMessages.findByPk(id);

      if (!jobMessage) {
        return ResponseHandler.sendError(
          res,
          "Job message not found",
          ResponseCode.NOT_FOUND
        );
      }

      await jobMessage.destroy();

      ResponseHandler.sendSuccess(
        res,
        { id },
        "Job message deleted successfully"
      );
    } catch (error) {
      next(error);
    }
  }
);

export default router;
