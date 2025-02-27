const { sequelize } = require('../database/sequelize');

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
 * Throw a detailed error
 * @param {*} error 
 * @param {*} method 
 * @param {*} model 
 * @param {*} options 
 */
const detailedError = (error, method, model, options) => {
    const enhancedError = new Error(`
        Error Details:
        Message: ${error.message}
        Error-Code: ${error.code}
        Error-Type: ${error.name}
        Stack: ${error.stack}
        Method: ${method}
        Model: ${model}
        Options: ${options}
        Timestamp: ${new Date().toISOString()}
    `);

    console.log(enhancedError);
    throw enhancedError;
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
        detailedError(error, `findAllRecords`, model.name, options);
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
        detailedError(error, `findOneRecord`, model.name, options);
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
        detailedError(error, `createOrUpdateRecord`, model.name, options);
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
        detailedError(error, `createUniqueRecord`, model.name, options);
    }
};

module.exports = {
    withTransaction,
    findAllRecords,
    findOneRecord,
    createOrUpdateRecord,
    createUniqueRecord
};
