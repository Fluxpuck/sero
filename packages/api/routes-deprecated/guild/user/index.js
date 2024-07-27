const express = require('express');
const router = express.Router();
const { User } = require("../../../database/models");
const { sequelize } = require('../../../database/sequelize');
const { CreateError } = require('../../../utils/ClassManager');

// ==================================================

const DEFAULT_LIMIT = 200_000; // Default limit for the query

/**     
 * Route to fetch all members from a param guild
 * @router GET api/users/:guildId 
 */
router.get("/:guildId", async (req, res, next) => {
    try {

        // Get the limit from the request query
        const limit = Math.round(parseInt(req.query.limit, 10)) || DEFAULT_LIMIT;

        // Get the guildId from the request params
        const { guildId } = req.params;

        // Find all Users related to the guildId
        await User.findAll({
            where: { guildId: guildId },
            limit: limit,
        }).then((result) => {

            // If no results found, trigger error
            if (!result) throw new CreateError(404, 'No users were found');

            // Return the results
            return res.status(200).json(result);

        });

    } catch (error) {
        next(error); // Pass the error to the next middleware
    }
});

/**
 * Route to Fetch a specific User from a param Guild
 * @router GET api/users/:guildId/:userId
 */
router.get("/:guildId/:userId", async (req, res, next) => {
    try {

        // Get the guildId and userId from the request params
        const { guildId, userId } = req.params;

        // Find the User related to the guildId and userId
        await User.findOne({
            where: { guildId: guildId, userId: userId }
        }).then((result) => {

            // If no results found, trigger error
            if (!result) throw new CreateError(404, 'User was not found');

            // Return the results
            return res.status(200).json(result);

        });

    } catch (error) {
        next(error); // Pass the error to the next middleware
    }
});

// ==================================================

/**
 * Route to create or update a user
 * @router POST api/users/:guildId/:userId
 */
router.post('/:guildId/:userId', async (req, res, next) => {
    const t = await sequelize.transaction(); // Start a transaction
    try {
        // Get the guildId and userId from the request params
        const { guildId, userId } = req.params;

        // Get the data from request body
        const { userName } = req.body;

        // Check if the request body contains trhe required properties
        if (!userName) {
            throw new CreateError(400, 'Invalid or missing data for this request');
        }

        // Prepare the data to be updated
        const requestData = { guildId, userId, userName };

        // Use upsert to either update or create the user
        const [user, created] = await User.upsert(requestData, { transaction: t });

        // Commit the transaction
        await t.commit();

        // Return the results
        const message = created
            ? `User ${userId} was created successfully for ${guildId}`
            : `User ${userId} was updated successfully for ${guildId}`;
        res.status(200).json({ message, data: user });

    } catch (error) {
        await t.rollback(); // Rollback the transaction
        next(error); // Pass the error to the next middleware
    }
});

// ==================================================

/**
 * Route to delete a user from a param guild
 * @router DELETE api/users/:guildId/:userId
 */
router.delete('/:guildId/:userId', async (req, res, next) => {
    try {

        // Get the guildId and userId from the request params
        const { guildId, userId } = req.params;

        await User.destroy({
            where: { guildId, userId },
            transaction: t
        }).then((result) => {

            // If no results found, trigger error
            if (!result) throw new CreateError(404, 'User was not found');

            // Return the results
            return res.status(200).json({
                message: `User ${userId} was deleted successfully`,
                data: result
            });

        });

    } catch (error) {
        next(error); // Pass the error to the next middleware
    }
});

module.exports = router; // Export the router