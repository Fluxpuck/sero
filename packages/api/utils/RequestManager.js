const { sequelize } = require('../database/sequelize');
const { CreateError } = require('./ClassManager');

const DEFAULT_TIMEOUT_MS = 10_000;

// Timeout function for requests
const withTimeout = (promise, ms = DEFAULT_TIMEOUT_MS) => {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Request has timed out')), ms));
    return Promise.race([promise, timeout]);
};

/**
 * Execute a transaction
 * @param {*} callback 
 * @returns 
 */
const withTransaction = async (callback) => {
    const t = await sequelize.transaction();
    try {
        const result = await callback(t);
        await t.commit();
        return result;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

/**
 * Find all records in a model
 * @param {*} model 
 * @param {*} options 
 * @param {*} timeout
 * @returns 
 */
const findAllRecords = async (model, options, timeout = DEFAULT_TIMEOUT_MS) => {
    try {
        const result = await withTimeout(model.findAll(options), timeout);
        return result;
    } catch (error) {
        console.error(error, `findAllRecords`, model.name, options);
        return new CreateError(408, `Timeout request on findAllRecords ${model.name}`, false);
    }
};

/**
 * Find one record in a model
 * @param {*} model 
 * @param {*} options 
 * @param {*} timeout
 * @returns 
 */
const findOneRecord = async (model, options, timeout = DEFAULT_TIMEOUT_MS) => {
    try {
        const result = await withTimeout(model.findOne(options), timeout);
        return result;
    } catch (error) {
        console.error(error, `findOneRecord`, model.name, options);
        return new CreateError(408, `Timeout request on findOneRecord ${model.name}`, false);
    }
};

/**
 * Create or update a record in a model
 * @param {*} model 
 * @param {*} data 
 * @param {*} transaction 
 * @param {*} timeout
 * @returns 
 */
const createOrUpdateRecord = async (model, data, transaction, timeout = DEFAULT_TIMEOUT_MS) => {
    try {
        const result = await withTimeout(model.upsert(data, { transaction }), timeout);
        return result;
    } catch (error) {
        console.error(error, `createOrUpdateRecord`, model.name, data);
        return new CreateError(408, `Timeout request on createOrUpdateRecord ${model.name}`, false);
    }
};

/**
 * Create a unique record in a model
 * @param {*} model 
 * @param {*} data 
 * @param {*} transaction 
 * @param {*} timeout
 * @returns 
 */
const createUniqueRecord = async (model, data, transaction, timeout = DEFAULT_TIMEOUT_MS) => {
    try {
        const result = await withTimeout(model.create(data, { transaction }), timeout);
        return result;
    } catch (error) {
        console.error(error, `createUniqueRecord`, model.name, data);
        return new CreateError(408, `Timeout request on createUniqueRecord ${model.name}`, false);
    }
};

module.exports = {
    withTransaction,
    findAllRecords,
    findOneRecord,
    createOrUpdateRecord,
    createUniqueRecord
};
