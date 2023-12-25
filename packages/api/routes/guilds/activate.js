const express = require('express');
const router = express.Router();
const { Guild } = require("../../database/models");
const { sequelize } = require('../../database/sequelize');
const { CreateError } = require('../../utils/ClassManager');

/**
 * @router POST api/guild/activate/:guildId
 * @description Activate a Guild
 */
router.post('/activate/:guildId', async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { guildId } = req.params;

        // Check if the guild exists
        const request = await Guild.findByPk(guildId);
        if (!request) throw new CreateError(404, 'Guild was not found.');

        // Activate the guild
        await request.update({ active: true }, { transaction: t });
        res.status(200).send(`Guild ${guildId} activated succesfully`);

        // Commit and finish the transaction
        return t.commit();

    } catch (error) {
        await t.rollback();
        next(error);
    }
});

// → Export Router to App
module.exports = router;