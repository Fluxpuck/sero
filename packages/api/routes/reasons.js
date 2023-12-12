const express = require("express");
const router = express.Router();
const { Reasons } = require("../database/models");
const { sequelize } = require('../database/sequelize');
const { CreateError } = require('../utils/ClassManager');

/**
 * @router GET api/reasons
 * @description Get all Reasons
 */
router.get("/", async (req, res, next) => {
  try {
    //find all reasons
    const result = await Reasons.findAll({
      where: { guildId: null },
    });

    // If no results found, trigger error
    if (!result || result.length === 0) {
      throw new CreateError(404, 'No client reasons were found');
    }

    // Return the results
    return res.status(200).json(result);

  } catch (error) {
    next(error);
  }
});

/**
 * @router GET api/reasons/:guildId
 * @description Get all Reasons from a specific guild
 */
router.get("/:guildId", async (req, res, next) => {
  try {
    const { guildId } = req.params;

    //find all reasons
    const result = await Reasons.findAll({
      where: { guildId: guildId, },
    });

    // If no results found, trigger error
    if (!result || result.length === 0) {
      throw new CreateError(404, 'No reasons were found for this guild');
    }

    // Return the results
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @router GET api/reasons/:type
 * @description Get all Reasons from a specific type
 */
router.get("/:type", async (req, res, next) => {
  try {
    const { type } = req.params;

    //find all reasons
    const result = await Reasons.findAll({
      where: { type: type },
    });

    // If no results found, trigger error
    if (!result || result.length === 0) {
      throw new CreateError(404, 'No reasons were found for this type');
    }

    // Return the results
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @router GET api/reasons/:type/:guildId
 * @description Get all Reasons from a specific guild
 */
router.get("/:type/:guildId", async (req, res, next) => {
  try {
    const { type, guildId } = req.params;

    //find all reasons
    const result = await Reasons.findAll({
      where: {
        guildId: guildId,
        type: type
      },
    });

    // If no results found, trigger error
    if (!result || result.length === 0) {
      throw new CreateError(404, 'No client reasons were found');
    }

    // Return the results
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});


// Setup Attributes for this Route
const requiredProperties = ['reason', 'type'];

/**
 * @router POST api/reasons/:guildId
 * @description Create or update a Reason
 */
router.post('/:guildId/:name', async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { body, params } = req;
    const { guildId, name } = params;

    // Check if the request body has all required properties
    if (!body || Object.keys(body).length === 0 || requiredProperties.some(prop => body[prop] === undefined)) {
      throw new CreateError(400, 'Invalid or missing data for this request');
    }

    // Get the data from request body && create object
    const { reason, type } = body;
    const updateData = {
      guildId: guildId,
      name: name,
      reason: reason,
      type: type
    }

    // Check if the reason already exists
    const request = await Reasons.findOne({
      where: {
        guildId: guildId,
        name: name,
        type: type
      },
      transaction: t,
    });

    // Update or Create the request
    if (request) {
      await request.update(updateData, { transaction: t });
      res.status(200).send(`Reason ${name} was updated successfully for ${guildId}`);
    } else {
      await Reasons.create(updateData, { transaction: t });
      res.status(200).send(`Reason ${name} was created successfully for ${guildId}`);
    }

    // Commit and finish the transaction
    return t.commit();

  } catch (error) {
    await t.rollback();
    next(error);
  }
});

/**
 * @router DELETE api/reasons/:guildId/:name/:type
 * @description Delete a Reason
 */
router.delete("/:guildId/:type/:name", async (req, res, next) => {
  try {
    const { guildId, type, name } = req.params;

    // Check if the reason already exists
    const request = await Reasons.findOne({
      where: {
        guildId: guildId,
        name: name,
        type: type
      },
    });

    // If no reason found, trigger error
    if (!request) {
      throw new CreateError(404, 'Reason not found');
    }

    // Delete the reason
    await request.destroy();

    // Return the results
    return res.status(200).send(`Reason ${name} was deleted successfully for ${guildId}`);
  } catch (error) {
    next(error);
  }
});

// → Export Router to App
module.exports = router;