const express = require("express");
const router = express.Router();

const { Commands } = require("../../../database/models");
const { findAllRecords, findOneRecord, createOrUpdateRecord } = require("../../../utils/RequestManager");

/**
 * GET api/client/commands
 * @description Get all client commands
 */
router.get("/", async (req, res, next) => {
    const { limit } = req.query;
    const options = { limit: limit || 50 };

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
        } = req.body;

        // Check if the required fields are provided
        if (!commandName || !interactionType) {
            throw new RequestError(400, "Invalid Request", {
                method: req.method, path: req.path
            });
        }

        // Update or Create the record
        const [result, created] = await createOrUpdateRecord(Commands, {
            commandId,
            commandName,
            description,
            usage,
            interactionType,
            interactionOptions,
            defaultMemberPermissions
        }, t);

        // Commit the transaction
        await t.commit();

        // Send the appropriate response
        if (created) {
            res.status(201).json({ message: "Command created successfully", data: result });
        } else {
            res.status(200).json({ message: "Command updated successfully", data: result });
        };

    } catch (error) {
        t.rollback();
        next(error);
    }
});

/**
 * DELETE api/client/commands/:commandId
 * @description Delete a specific client command
 */
router.delete("/:commandId", async (req, res, next) => {
    const { commandId } = req.params;
    const options = { where: { id: commandId } };

    try {
        const clientCommand = await findOneRecord(Commands, options);
        if (!clientCommand) {
            throw new CreateError(404, "Client command not found");
        } else {
            await clientCommand.destroy();
            res.status(200).json({ message: "Client command deleted successfully" });
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;