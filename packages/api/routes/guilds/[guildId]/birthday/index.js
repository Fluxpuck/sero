const express = require("express");
const router = express.Router({ mergeParams: true });

const { sequelize } = require("../../../../database/sequelize");
const { UserBirthday } = require("../../../../database/models");
const { findAllRecords, findOneRecord, createOrUpdateRecord } = require("../../../../utils/RequestManager");
const { CreateError, RequestError } = require("../../../../utils/ClassManager");

/**
 * GET api/guilds/:guildId/birthday
 * @description Get all user birthdays from the guild
 * @param {string} limit - The number of birthdays to return
 * @param {string} guildId - The id of the guild
 */
router.get("/", async (req, res, next) => {
    const { guildId } = req.params;
    const { limit } = req.query;
    const options = {
        limit: limit || 100,
        where: { guildId: guildId },
        order: [
            ["birthdayMonth", "ASC"],
            ["birthdayDay", "ASC"],
        ],
    };

    try {
        const userBirthdays = await findAllRecords(Away, options);
        if (!userBirthdays) {
            throw new CreateError(404, "No user with birthdays were found in the guild");
        } else {
            res.status(200).json(userBirthdays);
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
 * @returns {object} - The user's birthday
 */
router.get("/:userId", async (req, res, next) => {
    const { guildId, userId } = req.params;
    const options = {
        where: { guildId: guildId, userId: userId },
    };

    try {
        const userBirthday = await findOneRecord(UserBirthday, options);
        if (!userBirthday) {
            throw new CreateError(404, "No user with a birthday was found in the guild");
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
 * @param {string} birthdayMonth - The month of the user's birthday
 * @param {string} birthdayDay - The day of the user's birthday
 * @param {string|null} birthdayYear - The year of the user's birthday (optional)
 */
router.post("/:userId", async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { guildId, userId } = req.params;
        const { birthdayMonth, birthdayDay, birthdayYear = null } = req.body;

        // Check if the required fields are provided
        if (!birthdayMonth || !birthdayDay) {
            throw new RequestError(400, "Please provide the month and day of the user's birthday");
        }

        // Create the user's birthday
        const userBirthday = await createOrUpdateRecord(
            UserBirthday,
            {
                guildId: guildId,
                userId: userId,
                birthdayMonth: birthdayMonth,
                birthdayDay: birthdayDay,
                birthdayYear: birthdayYear,
            },
            t,
        );

        // Commit the transaction
        await t.commit();

        res.status(200).json(userBirthday);
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

/**
 * GET api/guilds/:guildId/birthday/today
 * @description Get all user birthdays that are today in the guild
 * @param {string} guildId - The id of the guild
 */
router.get("/today", async (req, res, next) => {
    const { guildId } = req.params;
    const options = {
        where: {
            guildId: guildId,
            birthdayMonth: new Date().getMonth() + 1, // Months are 0-indexed
            birthdayDay: new Date().getDate(),
        },
    };

    try {
        const userBirthdays = await findAllRecords(UserBirthday, options);
        if (!userBirthdays) {
            throw new CreateError(404, "No user with birthdays today were found in the guild");
        } else {
            res.status(200).json(userBirthdays);
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;
