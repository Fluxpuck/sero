const express = require("express");
const router = express.Router();
const { UserCareers, Jobs, Work_snapshot, User } = require("../database/models");
const { sequelize } = require('../database/sequelize');
const { CreateError } = require('../utils/ClassManager');


/** 
 * @router GET api/career/:guildId
 * @description Get all career info from a specific guild
 */
router.get("/:guildId", async (req, res, next) => {
    try {
        const { guildId } = req.params;
        const limit = req.query.limit || 100;
    
        // Check for results related to the guildId
        const result = await UserCareers.findAll({
          where: { guildId: guildId },
          include: [{
            model: User,
            where: { guildId: guildId }
          }],
          order: [['level', 'DESC']],
          limit: limit
        });
          // If no results found, trigger error
    if (!result) {
        throw new CreateError(404, 'No balances for this guildId found.');
      }
  
      // Return the results
      return res.status(200).json(result);
  
    } catch (error) {
      next(error);
    }
});

/** 
 * @router GET api/career/:guildId/userId
 * @description Get the career from a specific user from a specific guild
 */
router.get("/:guildId/:userId", async (req, res, next) => {
    try {

        // Fetch career data related to the guildId and userId
        const result = await UserCareers.findOne({
            where: {
                guildId: req.params.guildId,
                userId: req.params.userId
            },
            include: Jobs
        });

        // If no results found, trigger error
        if (!result) {
            throw new CreateError(404, 'No career for this userId in this guildId');
        }

        return res.status(200).json(result);

    } catch (error) {
        next(error);
    }
});

/**
 * @router GET api/career/jobs?limit=3
 * @description Get (a) random job(s) from the database
 */
router.get("/jobs", async (req, res, next) => {
    try {

        // Setup the default options
        let queryOptions = {
            order: sequelize.literal('random()'),
            distinct: true
        };

        // Check if the request has a limit query
        if (req.query.limit) {
            queryOptions.limit = parseInt(req.query.limit);
        }

        // Fetch a random job from the database
        const result = await Jobs.findAll(queryOptions);

        // If no results found, trigger error
        if (!result) {
            throw new CreateError(404, 'No career for this userId in this guildId');
        }

        return res.status(200).json(result);

    } catch (error) {
        next(error);
    }
});

// Setup Attributes for this Route
const jobProperties = ['jobId'];

/**
 * @router POST api/career/:guildId/:userId
 * @description Create or Update the career for a specific user from a specific guild
 */
router.post("/:guildId/:userId", async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        // Get the data from the request body && create object
        const { body, params } = req;
        const { guildId, userId } = params;
        const { jobId } = body;

        // Check if the request body has all required properties
        if (!body || Object.keys(body).length === 0 || jobProperties.some(prop => body[prop] === undefined)) {
            throw new CreateError(400, 'Invalid or missing data for this request');
        }

        // Setup default career values
        const careerInfo = {
            userId: userId,
            guildId: guildId,
            jobId: jobId,
            level: 1,
        }

        // Create or Update the request
        const request = await UserCareers.upsert(careerInfo, {
            where: {
                userId: userId,
                guildId: guildId,
            },
        });

        // Return the results
        res.status(200).json({
            message: `A job for ${guildId}/${userId} was set successfully`,
            data: request,
        });

        // Commit and finish the transaction
        return t.commit();

    } catch (error) {
        next(error);
    }
});

/**
 * @router POST api/career/add/:guildId/:userId
 * @description Update the career level of a specific user from a specific guild
 */
router.post("/add/:guildId/:userId", async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        const { guildId, userId } = req.params;

        // Fetch the user career
        const userCareer = await UserCareers.findOne({
            where: {
                guildId,
                userId
            },
            transaction: t
        });

        // If no results found, trigger error
        if (!userCareer) {
            throw new CreateError(404, 'No career found for this userId in this guildId');
        }

        // Increment the career level by 1
        userCareer.level += 1;

        // Update the user career
        await userCareer.save({ transaction: t });

        // Return the updated record
        res.status(200).json({
            message: `User career level for ${guildId}/${userId} increased with 1 successfully`,
            data: userCareer
        });

        // Commit and finish the transaction
        return await t.commit();

    } catch (error) {
        await t.rollback();
        next(error);
    }
});

/**
 * @router DELETE api/career/:guildId/:userId
 * @description Delete a specific career
 */
router.delete("/:guildId/:userId", async (req, res, next) => {
    try {
        const { guildId, userId } = req.params;

        // Check if the user is career
        const request = await UserCareers.create({
            guildId: guildId,
            userId: userId,
            jobId: jobId
        });

        // If no results found, trigger error
        if (!request || request.length === 0) {
            throw new CreateError(404, 'No career for this combination of guildId and userId found.');
        }

        // Delete the request
        await request.destroy();

        // Return the results
        return res.status(200).json(`The career for ${guildId}/${userId} was deleted successfully`);

    } catch (error) {
        next(error);
    }
});

/**
 * @router GET api/career/snap/income/:guildId/:userId
 * @description Get the total career income from specific user from a specific guild
 */
router.get("/income/:guildId/:userId", async (req, res, next) => {
    try {
        const { guildId, userId } = req.params;

        // Fetch career data related to the guildId and userId
        const result = await Work_snapshot.findAll({
            where: {
                guildId: guildId,
                userId: userId
            },
            order: [['createdAt', 'DESC']],
        });

        // If no results found, trigger error
        if (!result) {
            throw new CreateError(404, 'No career snapshot for this userId in this of guildId');
        }

        // Calculate total income
        let careerIncome = 0;
        result.forEach(snap => {
            careerIncome += snap.income;
        });

        // Return the total income
        return res.status(200).json({ careerIncome: careerIncome });

    } catch (error) {
        next(error);
    }
});

/**
 * @router GET api/career/snap/:guildId/:userId
 * @description Get the last career snapshot from a specific user from a specific guild
 */
router.get("/snap/:guildId/:userId", async (req, res, next) => {
    try {
        const { guildId, userId } = req.params;

        // Fetch career data related to the guildId and userId
        const result = await Work_snapshot.findOne({
            where: {
                guildId: guildId,
                userId: userId
            },
            order: [['createdAt', 'DESC']],
        });

        // If no results found, trigger error
        if (!result) {
            throw new CreateError(404, 'No career snapshot for this userId in this of guildId');
        }

        return res.status(200).json(result);

    } catch (error) {
        next(error);
    }
});

// Setup Attributes for this Route
const snapProperties = ['jobId', 'income'];

/**
 * @router POST api/career/snap/:guildId/:userId/:jobId
 * @description Creates a snapshot every time a user works
 */
router.post("/snap/:guildId/:userId", async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        const { body, params } = req;
        const { guildId, userId, } = params;
        const { jobId, income } = body;

        // Check if the request body has all required properties
        if (!body || Object.keys(body).length === 0 || snapProperties.some(prop => body[prop] === undefined)) {
            throw new CreateError(400, 'Invalid or missing data for this request');
        }

        // Setup default career values
        const snapInfo = {
            userId: userId,
            guildId: guildId,
            jobId: jobId,
            income: income
        }

        // Create or Update the request
        const request = await Work_snapshot.upsert(snapInfo, {
            where: {
                userId: userId,
                guildId: guildId,
            },
        });

        // Return the updated record
        res.status(200).json({
            message: `A career snapshot for ${guildId}/${userId} is saved`,
            data: request
        });

        // Commit and finish the transaction
        return t.commit();

    } catch (error) {
        await t.rollback();
        next(error);
    }
});


// → Export Router to App
module.exports = router;