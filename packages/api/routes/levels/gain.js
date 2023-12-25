const express = require('express');
const router = express.Router();
const { Levels } = require("../../database/models");
const { sequelize } = require('../../database/sequelize');
const { CreateError } = require('../../utils/ClassManager');
const { calculateXP } = require('../../utils/levelManager');

/**
 * @router POST api/levels/gain/:guildId/:userId
 * @description Increase a User Experience/Levels
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

        // Calculate the XP
        let personalModifier = 1; //TODO: add personal modifier, based on personal settings?
        let serverModifier = 1; //TODO: add server modifier, based on guild settings?
        const EXP_GAIN = calculateXP(personalModifier, serverModifier);

        // Add EXP to the user's experience
        levels.experience = (levels.experience ?? 0) + EXP_GAIN;

        // Update the level
        const request = await levels.save({ transaction: t });
        res.status(200).json({
            message: `User ${guildId}/${userId} gained ${EXP_GAIN} experience points.`,
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