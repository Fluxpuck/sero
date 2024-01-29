const axios = require('axios');
const { NODE_ENV, PROD_API_URL, DEV_API_URL } = process.env;
const instance = axios.create({
    baseURL: NODE_ENV === 'production' ? PROD_API_URL : DEV_API_URL,
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
            return error?.response?.data.error
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
            return error?.response?.data.error
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
            return error?.response?.data.error
        }
    }
};