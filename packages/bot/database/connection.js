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
            const { status = 408, data = {} } = error?.response;
            const errorMessage = data?.error?.data?.message || error?.message || "An error occurred while fetching data";
            return new CreateError(status, errorMessage, false);
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
            const { status = 408, data = {} } = error?.response;
            const errorMessage = data?.error?.data?.message || error?.message || "An error occurred while posting data";
            return new CreateError(status, errorMessage, false);
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
            const { status = 408, data = {} } = error?.response;
            const errorMessage = data?.error?.data?.message || error?.message || "An error occurred while deleting data";
            return new CreateError(status, errorMessage, false);
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
            const status = error?.response?.status || 408;
            const errorMessage = "An error occurred";
            return new CreateError(status, errorMessage, false);
        }
    }

}; 