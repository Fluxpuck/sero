import { Request, Response, Router, NextFunction } from "express";
import { User, UserBirthdays } from "../../../../models";
import { ResponseHandler } from "../../../../utils/response.utils";
import { ResponseCode } from "../../../../utils/response.types";
import { sequelize } from "../../../../database/sequelize";
import { Op } from "sequelize";
import { format, addDays, getMonth, getDate } from "date-fns";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /guild/{guildId}/birthday:
 *   get:
 *     summary: Get all birthdays for a guild
 *     tags:
 *       - Birthdays
 *     parameters:
 *       - name: guildId
 *         in: path
 *         required: true
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserBirthdays'
 *       500:
 *         description: Server error
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { guildId } = req.params;

    const birthdays = await UserBirthdays.findAll({
      where: { guildId: String(guildId) },
      include: [
        {
          model: User,
          attributes: ["username"],
          required: false,
        },
      ],
    });

    ResponseHandler.sendSuccess(
      res,
      birthdays,
      "Birthdays retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /guild/{guildId}/birthday/today:
 *   get:
 *     summary: Get all birthdays for today in a guild
 *     tags:
 *       - Birthdays
 *     parameters:
 *       - name: guildId
 *         in: path
 *         required: true
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserBirthdays'
 *       500:
 *         description: Server error
 */
router.get(
  "/today",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { guildId } = req.params;

      // Get current date using date-fns
      const today = new Date();
      const currentMonth = getMonth(today) + 1; // date-fns months are 0-indexed
      const currentDay = getDate(today);

      // Simple condition: match current month and day
      const dateConditions = {
        month: currentMonth,
        day: currentDay,
      };

      const birthdays = await UserBirthdays.findAll({
        where: {
          guildId: String(guildId),
          ...dateConditions,
        },
        include: [
          {
            model: User,
            attributes: ["username"],
            required: false,
          },
        ],
      });

      ResponseHandler.sendSuccess(
        res,
        birthdays,
        "Today's birthdays retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /guild/{guildId}/birthday/upcoming:
 *   get:
 *     summary: Get upcoming birthdays for a guild within a specified range of days
 *     tags:
 *       - Birthdays
 *     parameters:
 *       - name: guildId
 *         in: path
 *         required: true
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *       - name: range
 *         in: query
 *         required: false
 *         description: Number of days to look ahead (default: 1)
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful operation
 *       500:
 *         description: Server error
 */
router.get(
  "/upcoming",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { guildId } = req.params;
      const dayRange = parseInt(req.query.range as string) || 1;

      // Get the current date and the end date for the range
      const today = new Date();
      const currentYear = today.getFullYear();
      const endDate = addDays(today, dayRange);

      // Create date conditions for the query
      const dateConditions = [];

      // Loop through each day in the range
      let currentDate = today;
      while (currentDate <= endDate) {
        dateConditions.push({
          [Op.and]: [
            { month: getMonth(currentDate) + 1 }, // +1 because getMonth is 0-based
            { day: getDate(currentDate) },
          ],
        });
        currentDate = addDays(currentDate, 1);
      }

      // Find birthdays matching the date conditions
      const birthdays = await UserBirthdays.findAll({
        where: {
          guildId: String(guildId),
          [Op.or]: dateConditions,
        },
        include: [
          {
            model: User,
            attributes: ["username"],
            required: false,
          },
        ],
      });

      // Add the upcoming date information to each birthday
      const birthdaysWithDate = birthdays.map((birthday) => {
        // Create date for this year's birthday
        let upcomingDate = new Date(
          currentYear,
          birthday.month - 1,
          birthday.day
        );

        // If the birthday has already passed this year, use next year's date
        if (upcomingDate < today) {
          upcomingDate = new Date(
            currentYear + 1,
            birthday.month - 1,
            birthday.day
          );
        }

        // Calculate days until birthday
        const daysUntil = Math.ceil(
          (upcomingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          ...birthday.toJSON(),
          upcomingDate,
          daysUntil,
        };
      });

      ResponseHandler.sendSuccess(
        res,
        birthdaysWithDate,
        `Upcoming birthdays for the next ${dayRange} day${
          dayRange !== 1 ? "s" : ""
        } retrieved successfully`
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /guild/{guildId}/birthday/{userId}:
 *   get:
 *     summary: Get birthday for a specific user in a guild
 *     tags:
 *       - Birthdays
 *     parameters:
 *       - name: guildId
 *         in: path
 *         required: true
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *       - name: userId
 *         in: path
 *         required: true
 *         description: The Discord ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *       404:
 *         description: Birthday not found
 *       500:
 *         description: Server error
 */
router.get(
  "/:userId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { guildId, userId } = req.params;

      const birthday = await UserBirthdays.findOne({
        where: {
          guildId: String(guildId),
          userId: String(userId),
        },
        include: [
          {
            model: User,
            attributes: ["username"],
            required: false,
          },
        ],
      });

      if (!birthday) {
        return ResponseHandler.sendError(
          res,
          "Birthday not found for this user",
          ResponseCode.NOT_FOUND
        );
      }

      // Get current date
      const today = new Date();
      const currentYear = today.getFullYear();

      // Create date for this year's birthday
      let upcomingDate = new Date(
        currentYear,
        birthday.month - 1,
        birthday.day
      );

      // If the birthday has already passed this year, use next year's date
      if (upcomingDate < today) {
        upcomingDate = new Date(
          currentYear + 1,
          birthday.month - 1,
          birthday.day
        );
      }

      // Calculate days until birthday
      const daysUntil = Math.ceil(
        (upcomingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      ResponseHandler.sendSuccess(
        res,
        { ...birthday.toJSON(), upcomingDate, daysUntil },
        "Birthday retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /guild/{guildId}/birthday/{userId}:
 *   post:
 *     summary: Create or update a birthday for a user
 *     tags:
 *       - Birthdays
 *     parameters:
 *       - name: guildId
 *         in: path
 *         required: true
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *       - name: userId
 *         in: path
 *         required: true
 *         description: The Discord ID of the user
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               year:
 *                 type: integer
 *                 description: Birth year (optional)
 *               month:
 *                 type: integer
 *                 description: Birth month (1-12)
 *               day:
 *                 type: integer
 *                 description: Birth day (1-31)
 *     responses:
 *       200:
 *         description: Birthday updated successfully
 *       201:
 *         description: Birthday created successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Server error
 */
router.post(
  "/:userId",
  async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await sequelize.transaction();

    try {
      const { guildId, userId } = req.params;
      const { year, month, day } = req.body;

      // Validate required fields
      if (!month || !day) {
        await transaction.rollback();
        return ResponseHandler.sendValidationFail(
          res,
          "Missing required fields",
          ["month and day are required fields"]
        );
      }

      // Validate month and day
      if (month < 1 || month > 12) {
        await transaction.rollback();
        return ResponseHandler.sendValidationFail(res, "Invalid month", [
          "Month must be between 1 and 12",
        ]);
      }

      // Get the number of days in the specified month using date-fns
      // Use a leap year (2024) for February to allow Feb 29
      const yearToUse = month === 2 ? 2024 : year || 2000;
      const daysInMonth = new Date(yearToUse, month, 0).getDate();

      if (day < 1 || day > daysInMonth) {
        await transaction.rollback();
        return ResponseHandler.sendValidationFail(res, "Invalid day", [
          `Day must be between 1 and ${daysInMonth} for the specified month`,
        ]);
      }

      // Validate year if provided
      if (year && (year < 1900 || year > 2100)) {
        await transaction.rollback();
        return ResponseHandler.sendValidationFail(res, "Invalid year", [
          "Year must be between 1900 and 2100",
        ]);
      }

      // Check if the birthday already exists and has been updated before
      const existingBirthday = await UserBirthdays.findOne({
        where: { guildId: String(guildId), userId: String(userId) },
        transaction,
      });

      // If birthday exists and has been updated before (using the hasUpdatedBefore getter)
      if (existingBirthday && existingBirthday.locked) {
        await transaction.rollback();
        return ResponseHandler.sendError(
          res,
          "Birthday can only be updated once",
          ResponseCode.FORBIDDEN
        );
      }

      // Prepare birthday data for upsert
      const birthdayData = {
        guildId,
        userId,
        year: year || null,
        month,
        day,
      } as UserBirthdays;

      // Use upsert to create or update in a single operation
      const [birthday, created] = await UserBirthdays.upsert(birthdayData, {
        transaction,
      });

      await transaction.commit();

      ResponseHandler.sendSuccess(
        res,
        birthday,
        created
          ? "Birthday created successfully"
          : "Birthday updated successfully",
        created ? ResponseCode.CREATED : ResponseCode.SUCCESS
      );
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
);

/**
 * @swagger
 * /guild/{guildId}/birthday/{userId}:
 *   delete:
 *     summary: Delete a birthday for a user
 *     tags:
 *       - Birthdays
 *     parameters:
 *       - name: guildId
 *         in: path
 *         required: true
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *       - name: userId
 *         in: path
 *         required: true
 *         description: The Discord ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Birthday deleted successfully
 *       404:
 *         description: Birthday not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:userId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { guildId, userId } = req.params;

      const deleted = await UserBirthdays.destroy({
        where: {
          guildId: String(guildId),
          userId: String(userId),
        },
      });

      if (deleted === 0) {
        return ResponseHandler.sendError(
          res,
          "Birthday not found for this user",
          ResponseCode.NOT_FOUND
        );
      }

      ResponseHandler.sendSuccess(
        res,
        null,
        "Birthday deleted successfully",
        ResponseCode.NO_CONTENT
      );
    } catch (error) {
      next(error);
    }
  }
);

export default router;
