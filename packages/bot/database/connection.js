const axios = require('axios');
const { CreateError } = require('../utils/ClassManager');

const { NODE_ENV, PROD_API_URL } = process.env;
const instance = axios.create({
    baseURL: NODE_ENV === 'production' ? PROD_API_URL : "http://localhost:3336/api/",
    headers: {
        'Authorization': process.env.API_MASTER_KEY,
        "Content-type": "application/json"
    }
});

module.exports = {
    /**
     * GET request to the API
     * @param {string} endpoint - The endpoint to make the request to
     */
    async getRequest(endpoint) {
        try {
            const response = await instance.get(endpoint);
            return response;
        } catch (error) {
            return new CreateError(408, error?.response?.data.error, false);
        }
    },

    /**
     * POST request to the API
     * @param {string} endpoint - The endpoint to make the request to
     * @param {object} data - The data to send with the request
     */
    async postRequest(endpoint, data) {
        try {
            const response = await instance.post(endpoint, data);
            return response;
        } catch (error) {
            return new CreateError(408, error?.response?.data.error, false);
        }
    },

    /**
     * DELETE request to the API
     * @param {string} endpoint - The endpoint to make the request to
     */
    async deleteRequest(endpoint) {
        try {
            const response = await instance.delete(endpoint);
            return response;
        } catch (error) {
            return new CreateError(408, error?.response?.data.error, false);
        }
    },

    /**
     * Check the connection to the API
     */
    async baseRequest() {
        try {
            const response = await instance.get('/');
            return response
        } catch (error) {
            return new CreateError(408, error?.response?.data.error, false);
        }
    }

};