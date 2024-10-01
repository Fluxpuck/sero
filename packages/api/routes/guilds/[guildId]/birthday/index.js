const express = require("express");
const router = express.Router({ mergeParams: true });

const { sequelize } = require("../../../../database/sequelize");
const { UserBirthday } = require("../../../../database/models");
const { findAllRecords, findOneRecord, createOrUpdateRecord } = require("../../../../utils/RequestManager");
const { CreateError, RequestError } = require("../../../../utils/ClassManager");

const { Op } = require("sequelize");
const { startOfToday, endOfToday } = require("date-fns");

/**
 * GET api/guilds/:guildId/birthday
 * @description Get all user birthdays from the guild for today
 * @param {string} guildId - The id of the guild
 */
router.get("/", async (req, res, next) => {
    // Get the start and end of the day
    const startOfDay = startOfToday();
    const endOfDay = endOfToday();
    const { guildId } = req.params;
    const options = {
        where: {
            guildId: guildId,
            birthdayAt: {
                [Op.between]: [todayStart, todayEnd],
            },
        },
    };

    try {
        const guildBirthdays = await findAllRecords(UserBirthday, options);
        if (!guildBirthdays) {
            throw new CreateError(404, "No user birthdays found in the guild");
        } else {
            res.status(200).json(guildBirthdays);
        }
    } catch (error) {
        next(error);
    }
});

/**
 * GET api/guilds/:guildId/birthday/:userId
 * @description Get a specific user birthday from the guild (likely for a profile or checking if the user has set a birthday)
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 */
router.get("/:userId", async (req, res, next) => {
    const { guildId, userId } = req.params;
    const options = {
        where: { guildId: guildId, userId: userId },
    };

    try {
        const userBirthday = await findOneRecord(UserBirthday, options);
        if (!userBirthday) {
            throw new CreateError(404, "No birthday found for this user in the guild");
        } else {
            res.status(200).json(userBirthday);
        }
    } catch (error) {
        next(error);
    }
});

/**
 * POST api/guilds/:guildId/birthday/:userId
 * @description Set a user's birthday in the guild
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 * @param {date} birthdayAt - The user's birthday
 */
router.post("/:userId", async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { guildId, userId } = req.params;
        const { birthdayAt } = req.body;

        // Check if the required fields are provided
        if (!birthdayAt) {
            throw new RequestError(400, "Missing required data. Please check and try again", {
                method: req.method,
                path: req.path,
            });
        }

        // Create the user's birthday
        const birthdayData = await createOrUpdateRecord(
            UserBirthday,
            {
                guildId: guildId,
                userId: userId,
                birthdayAt: birthdayAt,
            },
            t,
        );
        // Return message
        res.status(200).json(birthdayData);

        // Commit the transaction
        await t.commit();
    } catch (error) {
        await t.rollback();
        next(error);
    }
});

/**
 * DELETE api/guilds/:guildId/birthday/:userId
 * @description Delete a user's birthday in the guild
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 */
router.delete("/:userId", async (req, res, next) => {
    const { guildId, userId } = req.params;
    const options = { where: { guildId: guildId, userId: userId } };

    try {
        const userBirthday = await findOneRecord(UserBirthday, options);
        if (!userBirthday) {
            throw new CreateError(404, "No user with a birthday was found in the guild");
        } else {
            await userBirthday.destroy();
            res.status(200).json({ message: "User birthday deleted successfully" });
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;
