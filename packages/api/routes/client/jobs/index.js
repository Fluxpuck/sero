const express = require("express");
const router = express.Router();

const { Jobs } = require("../../../database/models");
const { findAllRecords, findOneRecord, createOrUpdateRecord } = require("../../../utils/RequestManager");
const { CreateError, RequestError } = require("../../../utils/ClassManager");

/**
 * GET api/client/jobs
 * @description Get all client jobs
 * @param {string} limit - The number of jobs to return
 */
router.get("/", async (req, res, next) => {
    const { limit } = req.query;
    const options = {
        order: sequelize.literal('random()'),
        distinct: true,
        limit: limit || 100
    }

    try {
        const clientJobs = await findAllRecords(Jobs, options);
        if (!clientJobs) {
            throw new CreateError(404, "No client jobs found");
        } else {
            res.status(200).json(clientJobs);
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;