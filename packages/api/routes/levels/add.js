const express = require('express');
const router = express.Router();
const { Levels } = require("../../database/models");
const { sequelize } = require('../../database/sequelize');
const { CreateError } = require('../../utils/ClassManager');

/**
 * @router POST api/levels/add/:guildId/:userId
 * @description Add experience to a User
 */
router.post('/:guildId/:userId', async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { body, params } = req;
        const { guildId, userId } = params;

        // Get levels from the user
        const levels = await Levels.findOne({
            where: {
                userId: userId,
                guildId: guildId,
            },
            transaction: t,
        });

        if (!levels) {
            throw new CreateError(404, 'No levels found for this user');
        };

        // Get the experience from the request body
        const { experience } = body
        if (experience === undefined || typeof experience !== 'number') {
            throw new CreateError(400, 'Invalid or missing data for this request');
        }

        // Add EXP to the user's experience
        levels.experience = (levels.experience ?? 0) + experience;

        // Update the level
        const request = await levels.save({ transaction: t });
        res.status(200).json({
            message: `${experience} experience points was added to ${guildId}/${userId}.`,
            data: request
        });

        //commit transaction
        return t.commit();

    } catch (error) {
        await t.rollback();
        next(error);
    }
});


// → Export Router to App
module.exports = router;