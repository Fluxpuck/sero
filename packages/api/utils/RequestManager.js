// → Functions to manage requests to the API

const withTimeout = (promise, ms) => {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms));
    return Promise.race([promise, timeout]);
};

/**
 * Find all records in a model
 * @param {*} model 
 * @param {*} options 
 * @param {*} timeout
 * @returns 
 */
const findAllRecords = async (model, options, timeout = 5000) => {
    try {
        const result = await withTimeout(model.findAll(options), timeout);
        return result;
    } catch (error) {
        console.error('Error executing findAll:', error);
        throw error;
    }
};

/**
 * Find one record in a model
 * @param {*} model 
 * @param {*} options 
 * @param {*} timeout
 * @returns 
 */
const findOneRecord = async (model, options, timeout = 5000) => {
    try {
        const result = await withTimeout(model.findOne(options), timeout);
        return result;
    } catch (error) {
        console.error('Error executing findOne:', error);
        throw error;
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
const createOrUpdateRecord = async (model, data, transaction, timeout = 5000) => {
    try {
        const result = await withTimeout(model.upsert(data, { transaction }), timeout);
        return result;
    } catch (error) {
        console.error('Error executing upsert:', error);
        throw error;
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
const createUniqueRecord = async (model, data, transaction, timeout = 5000) => {
    try {
        const result = await withTimeout(model.create(data, { transaction }), timeout);
        return result;
    } catch (error) {
        console.error('Error executing create:', error);
        throw error;
    }
};

module.exports = {
    findAllRecords,
    findOneRecord,
    createOrUpdateRecord,
    createUniqueRecord
};
