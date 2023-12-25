const express = require('express');
const router = express.Router();
const { Levels } = require("../../database/models");
const { sequelize } = require('../../database/sequelize');
const { CreateError } = require('../../utils/ClassManager');

/**
 * @router POST api/levels/reset/:guildId/:userId
 * @description Reset a User Experience/Levels
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

        // Reset EXP of the user
        level.experience = 0;
        level.level = 0;
        level.currentLevelExp = 0;
        level.nextLevelExp = 0;
        level.remainingExp = 0;

        // Save the changes
        await levels.save({ transaction: t });
        res.status(200).send(`User ${guildId}/${userId} gained ${EXP_GAIN} experience points.`);

        //commit transaction
        return t.commit();

    } catch (error) {
        await t.rollback();
        next(error);
    }
});


// → Export Router to App
module.exports = router;