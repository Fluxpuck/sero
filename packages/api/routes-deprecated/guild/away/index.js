const express = require("express");
const router = express.Router();
const { Away } = require("../../../database/models");
const { sequelize } = require('../../../database/sequelize');
const { CreateError } = require('../../../utils/ClassManager');

/**
 * @router GET api/away/:guildId
 * @description Get all Away statusses for a specific guild
 */
router.get("/:guildId", async (req, res, next) => {
  try {
    const { guildId } = req.params;

    // Check for results related to the guildId
    const result = await Away.findAll({
      where: { guildId: guildId },
    });

    // If no results found, trigger error
    if (!result) {
      throw new CreateError(404, 'No Away status for this guildId found.');
    }

    // Return the results
    return res.status(200).json(result);

  } catch (error) {
    next(error);
  }
});

/**
 * @router GET api/away/:guildId/userId
 * @description Get the Away status from a specific user from a specific guild
 */
router.get("/:guildId/:userId", async (req, res, next) => {
  try {
    const { guildId, userId } = req.params;

    // Check for results related to the guildId and userId
    const result = await Away.findOne({
      where: {
        guildId: guildId,
        userId: userId
      },
    });

    // If no results found, trigger error
    if (!result) {
      throw new CreateError(404, 'No Away status for this combination of guildId and userId found.');
    }

    // Return the results
    return res.status(200).json(result);

  } catch (error) {
    next(error);
  }
});


// Setup Attributes for this Route
const requiredProperties = ['duration'];

/**
 * @router POST api/away/:guildId/userId
 * @description Save the Away status from a specific user from a specific guild
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

    // Get the data from the request body && create object
    const { duration } = body;
    const updateData = {
      userId: userId,
      guildId: guildId,
      duration: duration,
      message: body?.message || null
    }

    // Check if the user is already away
    const levels = await Away.findOne({
      where: {
        guildId: guildId,
        userId: userId
      },
      transaction: t
    });

    // Update or Create the request
    if (levels) {
      await levels.update(updateData, { transaction: t });
      res.status(200).json({
        message: `Away status for ${guildId}/${userId} updated successfully`,
        data: levels
      });
    } else {
      const request = await Away.create(updateData, { transaction: t });
      res.status(200).json({
        message: `Away status for ${guildId}/${userId} created successfully`,
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
 * @router DELETE api/away/:guildId/userId
 * @description Delete the Away status from a specific user from a specific guild
 */
router.delete("/:guildId/:userId", async (req, res, next) => {
  try {
    const { guildId, userId } = req.params;

    // Check if the user is away
    const request = await Away.findOne({
      where: {
        guildId: guildId,
        userId: userId
      },
    });

    // If no results found, trigger error
    if (!request || request.length === 0) {
      throw new CreateError(404, 'No Away status for this combination of guildId and userId found.');
    }

    // Delete the request
    await request.destroy();

    // Return the results
    return res.status(200).json(`The Away status for ${guildId}/${userId} was deleted successfully`);

  } catch (error) {
    next(error);
  }
});



// → Export Router to App
module.exports = router;