const express = require('express');
const router = express.Router();
const { Guild } = require("../database/models");
const { sequelize } = require('../database/sequelize');
const { CreateError } = require('../utils/ClassManager');

/**
 * @router GET api/guilds
 * @description Get all Guilds
 */
router.get("/", async (req, res, next) => {
  try {
    // Find all guilds
    const result = await Guild.findAll();

    // If no results found, trigger error
    if (!result || result.length === 0) {
      throw new CreateError(404, 'No guilds were found');
    }

    // Return the results
    return res.status(200).json(result);

  } catch (error) {
    next(error);
  }
});

/**
 * @router GET api/guilds/:guildId
 * @description Get a specific Guild
 */
router.get("/:guildId", async (req, res, next) => {
  try {
    const { guildId } = req.params;

    // Check for results related to the guildId
    const result = await Guild.findAll({
      where: { guildId: guildId },
    });

    // If no results found, trigger error
    if (!result || result.length === 0) {
      throw new CreateError(404, 'Guild was not found');
    }

    // Return the results
    return res.status(200).json(result);

  } catch (error) {
    next(error);
  }
});


// Setup Attributes for this Route
const guildProperties = ['guildId', 'guildName'];

/**
 * @router POST api/guild/:guildId
 * @description Create or update a Guild
 */
router.post('/:guildId', async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { body, params } = req;
    const { guildId } = params;

    // Check if the request body has all required properties
    if (!body || Object.keys(body).length === 0 || guildProperties.some(prop => body[prop] === undefined)) {
      throw new CreateError(400, 'Invalid or missing data for this request');
    }

    // Get the data from request body && create object
    const { guildName } = body;
    const updateData = {
      guildId: guildId,
      guildName: guildName
    }

    // Check if the guild already exists
    const request = await Guild.findOne({
      where: {
        guildId: guildId
      },
      transaction: t,
    });

    // Update or Create the request
    if (request) {
      await request.update(updateData, { transaction: t });
      res.status(200).send(`Guild ${guildId} was updated successfully`);
    } else {
      await Guild.create(updateData, { transaction: t });
      res.status(200).send(`Guild ${guildId} was created successfully`);
    }

    // Commit and finish the transaction
    return t.commit();

  } catch (error) {
    await t.rollback();
    next(error);
  }
});


// Setup Attributes for this Route
const boostProperties = ['modifier'];

/**
 * @router POST api/guild/:guildId
 * @description Create or update a Guild
 */
router.post('/boost/:guildId', async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { body, params } = req;
    const { guildId } = params;

    // Check if the request body has all required properties
    if (!body || Object.keys(body).length === 0 || boostProperties.some(prop => body[prop] === undefined)) {
      throw new CreateError(400, 'Invalid or missing data for this request');
    }

    // Check if the guild exists
    const request = await Guild.findByPk(guildId);
    if (!request) throw new CreateError(404, 'Guild was not found.');

    // Set duration based request body
    const duration = body.duration ?? 1;
    const { modifier } = body;

    // Set modifier the guild
    await request.update({ modifier: modifier, duration: duration }, { transaction: t });
    res.status(200).send(`Guild ${guildId} activated succesfully`);

    // Commit and finish the transaction
    return t.commit();

  } catch (error) {
    await t.rollback();
    next(error);
  }
});


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

/**
 * @router POST api/guild/deactivate/:guildId
 * @description Deactivate a Guild
 */
router.post('/deactivate/:guildId', async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { guildId } = req.params;

    // Check if the guild exists
    const request = await Guild.findByPk(guildId);
    if (!request) throw new CreateError(404, 'Guild was not found.');

    // Deactivate the guild
    await request.update({ active: false }, { transaction: t });
    res.status(200).send(`Guild ${guildId} deactivated succesfully`);

    // Commit and finish the transaction
    return t.commit();

  } catch (error) {
    await t.rollback();
    next(error);
  }
});


/**
 * @router DELETE api/guild/:guildId
 * @description Delete a specific Guild
 */
router.delete("/:guildId", async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { guildId } = req.params;

    // Check if the guild exists
    const request = await Guild.findOne({
      where: {
        guildId: guildId
      }
    });

    // If no results found, trigger error
    if (!request || request.length === 0) {
      throw new CreateError(404, 'Guild was not found');
    }

    // Delete the command
    await request.destroy();

    // Return the results
    return res.status(200).send(`The guild ${guildId} was deleted successfully`);

  } catch (error) {
    await t.rollback();
    next(error);
  }
});

// → Export Router to App
module.exports = router;