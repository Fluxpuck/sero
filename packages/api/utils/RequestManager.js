// → Functions to manage requests to the API

/**
 * Find all records in a model
 * @param {*} model 
 * @param {*} options 
 * @returns 
 */
const findAllRecords = async (model, options) => {
    try {
        const result = await model.findAll(options);
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
 * @returns 
 */
const findOneRecord = async (model, options) => {
    try {
        const result = await model.findOne(options);
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
 * @returns 
 */
const createOrUpdateRecord = async (model, data, transaction) => {
    try {
        const result = await model.upsert(data, { transaction });
        return result;
    } catch (error) {
        console.error('Error executing upsert:', error);
        throw error;
    }
};

module.exports = {
    findAllRecords,
    findOneRecord,
    createOrUpdateRecord
};
