import { Request, Response, Router, NextFunction } from "express";
import { UserBirthdays } from "../../../../models";
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
      where: { guildId },
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
          guildId,
          ...dateConditions,
        },
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
      const range = parseInt(req.query.range as string) || 1;

      // Get current date using date-fns
      const today = new Date();

      // Define interface for date entries
      interface DateEntry {
        month: number;
        day: number;
        date: Date;
      }

      // Create an array of dates for the specified range
      const dates: DateEntry[] = [];
      for (let i = 0; i < range; i++) {
        const date = addDays(today, i);
        dates.push({
          month: getMonth(date) + 1, // date-fns months are 0-indexed
          day: getDate(date),
          date: date, // Store the full date for later use
        });
      }

      // Create query conditions for the dates
      const dateConditions = dates.map((date) => ({
        [Op.and]: [{ month: date.month }, { day: date.day }],
      }));

      // Find birthdays matching the date conditions
      const birthdays = await UserBirthdays.findAll({
        where: {
          guildId,
          [Op.or]: dateConditions,
        },
      });

      // Add the upcoming date information to each birthday
      const birthdaysWithDate = birthdays.map((birthday) => {
        const birthdayData = birthday.toJSON();

        // Find which date this birthday matches
        const matchingDate = dates.find(
          (d) => d.month === birthday.month && d.day === birthday.day
        );

        return {
          ...birthdayData,
          upcomingDate: matchingDate
            ? format(matchingDate.date, "MMM d")
            : null,
          daysUntil: matchingDate
            ? Math.floor(
                (matchingDate.date.getTime() - today.getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : null,
        };
      });

      ResponseHandler.sendSuccess(
        res,
        birthdaysWithDate,
        `Upcoming birthdays for the next ${range} day${
          range !== 1 ? "s" : ""
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
          guildId,
          userId,
        },
      });

      if (!birthday) {
        return ResponseHandler.sendError(
          res,
          "Birthday not found for this user",
          ResponseCode.NOT_FOUND
        );
      }

      ResponseHandler.sendSuccess(
        res,
        birthday,
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
        where: { guildId, userId },
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
          guildId,
          userId,
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
