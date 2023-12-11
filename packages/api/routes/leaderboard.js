const express = require('express');
const router = express.Router();
const { Levels, User, Guild } = require("../database/models");
const { sequelize } = require('../database/sequelize');
const { createError } = require('../utils/ClassManager');
const { calculateXP } = require('../utils/levelManager');

/**
 * @router GET api/leaderboard/:guildId	
 * @description Get all Levels
 */
router.get("/:guildId	", async (req, res, next) => {
  try {
    const { guildId } = req.params;

    // Check for results related to the guildId
    const result = await Levels.findAll({
      where: { guildId: guildId },
    });

    // If no results found, trigger error
    if (!result || result.length === 0) {
      throw new createError(404, 'No levels found for this guild.');
    }

    // Return the results
    return res.status(200).json(result);

  } catch (error) {
    next(error);
  }
});

/**
 * @router GET api/leaderboard/:guildId/:userId
 * @description Get a specific Level
 */
router.get("/:guildId/:userId", async (req, res, next) => {
  try {
    const { guildId, userId } = req.params;

    // Check for results related to the guildId
    const result = await Levels.findAll({
      where: {
        guildId: guildId,
        userId: userId
      },
    });

    // If no results found, trigger error
    if (!result || result.length === 0) {
      throw new createError(404, 'No levels found for this user.');
    }

    // Return the results
    return res.status(200).json(result);

  } catch (error) {
    next(error);
  }
});


// Setup Attributes for this Route
const requiredProperties = ['userId', 'guildId'];

/**
 * @router POST api/leaderboard/:guildId/:userId
 * @description Create or update a Level
 */
router.post('/:guildId/:userId', async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { body, params } = req;
    const { guildId, userId } = params;

    // Check if the request body has all required properties
    if (!body || Object.keys(body).length === 0 || requiredProperties.some(prop => body[prop] === undefined)) {
      throw new createError(400, 'Invalid or missing data for this request');
    }

    // Check if the guild exists && If no guild found, trigger error
    const guild = await Guild.findByPk(guildId);
    if (!guild) { throw new createError(404, 'Guild not found.') };

    // Check if the user exists && If no user found, trigger error
    const user = await User.findOne({ where: { userId: userId, guildId: guildId } });
    if (!user) { throw new createError(404, 'User not found.') };

    // Create data object 
    const updateData = {
      guildId: guildId,
      userId: userId,
    }

    // Check if the user already has levels
    const levels = await Levels.findOne({
      where: {
        userKey: user.userKey,
        userId: userId,
        guildId: guildId,
      },
      transaction: t,
    });

    // Update or Create the request
    if (levels) {
      await levels.update(updateData, { transaction: t });
      res.status(200).send(`Levels information for ${guildId}/${userId} updated successfully`);
    } else {
      await Levels.create(updateData, { transaction: t });
      res.status(200).send(`Levels for ${guildId}/${userId} created successfully`);
    }

    // Commit and finish the transaction
    return t.commit();

  } catch (error) {
    await t.rollback();
    next(error);
  }
});



/**
 * @router POST api/leaderboard/gain/:guildId/:userId
 * @description Increase a User Experience/Levels
 */
router.post('/gain/:guildId/:userId', async (req, res, next) => {
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

    // Calculate the XP
    let personalModifier = 1; //TODO: add personal modifier, based on personal settings?
    let serverModifier = 1; //TODO: add server modifier, based on guild settings?
    const EXP_GAIN = calculateXP(personalModifier, serverModifier);

    // Add EXP to the user's experience
    level.experience += EXP_GAIN;

    // Update the level
    await levels.save({ transaction: t });
    res.status(200).send(`User ${guildId}/${userId} gained ${EXP_GAIN} experience points.`);

    //commit transaction
    return t.commit();

  } catch (error) {
    await t.rollback();
    next(error);
  }
});

/**
 * @router POST api/leaderboard/gain/:guildId/:userId
 * @description Increase a User Experience/Levels
 */
router.post('/reset/:guildId/:userId', async (req, res, next) => {
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



/**
 * @router DELETE api/leaderboard/:guildId/:userId
 * @description Delete a specific Level
 */
router.delete("/:guildId/:userId", async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { guildId, userId } = req.params;

    // Check if levels exists
    const request = await Levels.findOne({
      where: {
        guildId: guildId,
        userId: userId
      }
    });
    if (!request) throw new createError(404, 'Level was not found.');

    // Delete level data
    await request.destroy({ transaction: t });
    res.status(200).send(`Level ${guildId}/${userId} deleted succesfully`);

    // Commit and finish the transaction
    return t.commit();

  } catch (error) {
    await t.rollback();
    next(error);
  }
});


// → Export Router to App
module.exports = router;




