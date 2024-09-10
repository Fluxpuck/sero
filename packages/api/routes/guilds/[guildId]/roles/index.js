const express = require("express");
const router = express.Router({ mergeParams: true });

const { sequelize } = require('../../../../database/sequelize');
const { TempRoles } = require("../../../../database/models");
const { findAllRecords, createUniqueRecord } = require("../../../../utils/RequestManager");
const { CreateError, RequestError } = require("../../../../utils/ClassManager");

/**
 * GET api/guilds/:guildId/roles
 * @description Get all temporary roles for a specific guild user
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 */
router.get("/:userId", async (req, res, next) => {
    const { guildId, userId } = req.params;
    const options = { where: { guildId: guildId, userId: userId } };

    try {
        const userRoles = await findAllRecords(TempRoles, options);
        if (!userRoles) {
            throw new CreateError(404, "No temporary roles were found for the user in the guild");
        } else {
            res.status(200).json(userRoles);
        }
    } catch (error) {
        next(error);
    }
});

/**
 * POST api/guilds/:guildId/roles/add
 * @description Create a new temporary role for a specific guild user
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 * @param {string} roleId - The id of the role
 * @param {number} duration - The duration in hours
 */
router.post("/add", async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { guildId } = req.params;
        const { userId, roleId, duration } = req.body;

        // Check if the required fields are provided
        if (!userId || !roleId) {
            throw new RequestError(400, "Invalid Request", {
                method: req.method, path: req.path
            });
        }

        // Create a new work snapshot
        const result = await createUniqueRecord(TempRoles, {
            guildId: guildId,
            userId: userId,
            roleId: roleId,
            duration: duration ?? 1,
        }, t);

        // Send the appropriate response
        res.status(201).json({ message: "User temporary role stored successfully", data: result });

        // Commit the transaction
        await t.commit();

    } catch (error) {
        t.rollback();
        next(error);
    }
});

module.exports = router;