const express = require("express");
const router = express.Router();

const { sequelize } = require('../../../database/sequelize');
const { Commands } = require("../../../database/models");
const { findAllRecords, findOneRecord, createOrUpdateRecord } = require("../../../utils/RequestManager");
const { CreateError, RequestError } = require("../../../utils/ClassManager");

/**
 * GET api/client/commands
 * @description Get all client commands
 * @param {string} limit - The number of commands to return
 */
router.get("/", async (req, res, next) => {
    const { limit } = req.query;
    const options = { limit: limit || 100 };

    try {
        const clientCommands = await findAllRecords(Commands, options);
        if (!clientCommands) {
            throw new CreateError(404, "No client commands found");
        } else {
            res.status(200).json(clientCommands);
        }
    } catch (error) {
        next(error);
    }
});

/**
 * GET api/client/commands/:commandId
 * @description Get a specific client command
 * @param {string} commandId - The id of the command
 */
router.get("/:commandId", async (req, res, next) => {
    const { commandId } = req.params;
    const options = { where: { id: commandId } };

    try {
        const clientCommand = await findOneRecord(Commands, options);
        if (!clientCommand) {
            throw new CreateError(404, "Client command not found");
        } else {
            res.status(200).json(clientCommand);
        }
    } catch (error) {
        next(error);
    }
});

/**
 * POST api/client/commands
 * @description Create or update a client command
 * @param {string} commandName - The name of the command
 * @param {string} description - The description of the command
 * @param {string} usage - The usage of the command
 * @param {string} interactionType - The type of interaction the command is
 * @param {object} interactionOptions - The options for the interaction
 * @param {object} defaultMemberPermissions - The default permissions for the member
 * @param {string} cooldown - The cooldown for the command
 */
router.post("/", async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const {
            commandId = null,
            commandName,
            description = null,
            usage = null,
            interactionType,
            interactionOptions = null,
            defaultMemberPermissions = null,
            cooldown = null
        } = req.body;

        // Check if the required fields are provided
        if (!commandName) {
            throw new RequestError(400, "Invalid Request", {
                method: req.method, path: req.path
            });
        }

        // Create an object for the command data
        const commandData = {
            commandName,
            description,
            usage,
            interactionType,
            interactionOptions,
            defaultMemberPermissions,
            cooldown
        };

        // Conditionally add commandId if it's not null
        if (commandId !== null) {
            commandData.commandId = commandId;
        }

        // Update or Create the record
        const [result, created] = await createOrUpdateRecord(Commands, commandData, t);

        // Send the appropriate response
        if (created) {
            res.status(201).json({ message: `${commandName} created successfully`, data: result });
        } else {
            res.status(200).json({ message: `${commandName} updated successfully`, data: result });
        };

        // Commit the transaction
        await t.commit();

    } catch (error) {
        t.rollback();
        next(error);
    }
});

/**
 * DELETE api/client/commands/:commandId
 * @description Delete a specific client command
 */
router.delete("/:commandName", async (req, res, next) => {
    const { commandName } = req.params;
    const options = { where: { commandName: commandName } };

    try {
        const clientCommand = await findOneRecord(Commands, options);
        if (!clientCommand) {
            throw new CreateError(404, "Client command not found");
        } else {
            await clientCommand.destroy();
            res.status(200).json({ message: `${commandName} deleted successfully` });
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;