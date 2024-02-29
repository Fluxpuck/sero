const express = require("express");
const router = express.Router();
const { UserCareers, Jobs } = require("../database/models");
const { sequelize } = require('../database/sequelize');
const { CreateError } = require('../utils/ClassManager');

/** 
 * @router GET api/career/:guildId/userId
 * @description Get the career from a specific user from a specific guild
 */
router.get("/:guildId/:userId", async (req, res, next) => {
    try {
        // Fetch career data related to the guildId and userId
        const result = await UserCareers.findOne({
            where: {
                guildId: req.params.guildId,
                userId: req.params.userId
            },
        });
        // If no results found, trigger error
        if (!result || result.length === 0) {
            throw new CreateError(404, 'No career for this userId in this of guildId');
        }
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});


/**
 * @router POST api/career/new/:guildId/userId
 * @description Set a new Job career for a specific user from a specific guild
 */
router.post("/new/:guildId/:userId", async (req, res, next) => {
    const t = await sequelize.transaction();

    // Fetch a random job from the database
    const randomJob = await Jobs.findOne({
        order: sequelize.literal('random()'),
        limit: 1
    });

    try {
        // Setup the default values
        const requestData = {
            userId: req.params.userId,
            guildId: req.params.guildId,
            jobId: randomJob.id,
        };

        // Create or Update the request
        const request = await UserCareers.upsert(requestData, {
            where: {
                userId: userInfo.userId,
                guildId: userInfo.guildId,
            },
        });

        // Return the results
        return res.status(200).json({
            message: `Career for ${guildId}/${userId} created successfully`,
            data: request,
            additional: randomJob
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @router POST api/career/level/:guildId/userId
 * @description Update the career level for a specific user from a specific guild
 */
router.post("/new/:guildId/:userId", async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        const { body, params } = req;
        const { guildId, userId } = params;

        // Setup the default values
        const requestData = {
            userId: req.params.userId,
            guildId: req.params.guildId,
            jobId: randomJob.id,
        };

        // Create or Update the request
        const request = await UserCareers.upsert(requestData, {
            where: {
                userId: userInfo.userId,
                guildId: userInfo.guildId,
            },
        });

        // Return the results
        return res.status(200).json({
            message: `Career for ${guildId}/${userId} created successfully`,
            data: request,
            additional: randomJob
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @router POST api/career/:guildId/userId
 * @description Save or Update the career for a specific user from a specific guild
 */
router.post("/:guildId/:userId", async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        const { body, params } = req;
        const { guildId, userId } = params;

        // Check if the request body has all required properties
        if (!body || Object.keys(body).length === 0 || requiredProperties.some(prop => body[prop] === undefined)) {
            throw new CreateError(400, 'Invalid or missing data for this request');
        }

        // Check if the user is already career
        const userCareers = await UserCareers.findOne({
            where: {
                guildId: guildId,
                userId: userId
            },
            transaction: t
        });

        // Get the data from the request body && create object
        const { amount } = body;
        const updateCareers = userCareers ? userCareers.career + amount : 0;
        const updateData = {
            userId: userId,
            guildId: guildId,
            career: updateCareers
        }

        // Update or Create the request
        if (userCareers) {
            await userCareers.update(updateData, { transaction: t });
            res.status(200).json({
                message: `UserCareers for ${guildId}/${userId} updated successfully`,
                data: userCareers
            });
        } else {
            const request = await UserCareers.create(updateData, { transaction: t });
            res.status(200).json({
                message: `UserCareers for ${guildId}/${userId} created successfully`,
                data: request
            });
        }

        // Commit and finish the transaction
        return t.commit();

    } catch (error) {
        await t.rollback();
        next(error);
    }
});


/**
 * @router DELETE api/career/:guildId/userId
 * @description Delete a specific career
 */
router.delete("/:guildId/:userId", async (req, res, next) => {
    try {
        const { guildId, userId } = req.params;

        // Check if the user is career
        const request = await UserCareers.findOne({
            where: {
                guildId: guildId,
                userId: userId
            },
        });

        // If no results found, trigger error
        if (!request || request.length === 0) {
            throw new CreateError(404, 'No career for this combination of guildId and userId found.');
        }

        // Delete the request
        await request.destroy();

        // Return the results
        return res.status(200).json(`The career for ${guildId}/${userId} was deleted successfully`);

    } catch (error) {
        next(error);
    }
});



// → Export Router to App
module.exports = router;