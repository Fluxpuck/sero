const express = require('express');
const router = express.Router();
const { Levels, User, Guild } = require("../database/models");
const { sequelize } = require('../database/sequelize');
const { CreateError } = require('../utils/ClassManager');
const { calculateXP } = require('../utils/levelManager');

/**
 * @router GET api/levels/:guildId	
 * @description Get all Guild Levels
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
      throw new CreateError(404, 'No levels found for this guild.');
    }

    // Return the results
    return res.status(200).json(result);

  } catch (error) {
    next(error);
  }
});

/**
 * @router GET api/levels/:guildId/:userId
 * @description Get a specific User Level
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
      throw new CreateError(404, 'No levels found for this user');
    }

    // Return the results
    return res.status(200).json(result);

  } catch (error) {
    next(error);
  }
});


/**
 * @router POST api/levels/:guildId/:userId
 * @description Register or update a User Levels
 */
router.post('/:guildId/:userId', async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { params } = req;
    const { guildId, userId } = params;

    // Check if the guild exists && If no guild found, trigger error
    const guild = await Guild.findByPk(guildId);
    if (!guild) { throw new CreateError(404, `Guild (${guildId}) not found`) };

    // Check if the user exists && If no user found, trigger error
    const user = await User.findOne({ where: { userId: userId, guildId: guildId } });
    if (!user) { throw new CreateError(404, `User (${userId}) not found`) };

    // Create data object 
    const updateData = {
      guildId: guildId,
      userId: userId,
    }

    // Check if the user already has levels
    const levels = await Levels.findOne({
      where: {
        userId: userId,
        guildId: guildId,
      },
      transaction: t,
    });

    // Update or Create the request
    if (levels) {
      await levels.update(updateData, { transaction: t });
      res.status(200).json({
        message: `Levels information for ${guildId}/${userId} updated successfully`,
        data: levels
      });
    } else {
      const request = await Levels.create(updateData, { transaction: t });
      res.status(200).json({
        message: `Levels for ${guildId} / ${userId} created successfully`,
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
 * @router POST api/levels/add/:guildId/:userId
 * @description Add experience to a User
 */
router.post('/add/:guildId/:userId', async (req, res, next) => {
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

/**
 * @router POST api/levels/gain/:guildId/:userId
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

/**
 * @router POST api/levels/reset/:guildId/:userId
 * @description Reset a User Experience/Levels
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
    levels.experience = 0;
    levels.level = 0;
    levels.currentLevelExp = 0;
    levels.nextLevelExp = 0;
    levels.remainingExp = 0;

    // Save the changes
    await levels.save({ transaction: t });
    res.status(200).send(`User ${guildId}/${userId} experience points are reset`);

    //commit transaction
    return t.commit();

  } catch (error) {
    await t.rollback();
    next(error);
  }
});

/**
 * @router DELETE api/levels/:guildId/:userId
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
    if (!request) throw new CreateError(404, 'Level was not found.');

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