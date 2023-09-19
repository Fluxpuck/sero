// Require the axios package
const axios = require('axios');

// Create an instance of axios with specified configuration
const instance = axios.create({
    // Set the base URL for the API
    baseURL: process.env.API_URL,
    // Set the default headers for requests
    headers: {
        'Authorization': process.env.API_MASTER_KEY,
        "Content-type": "application/json"
    }
});

module.exports = {

    /**
     * Makes a GET request to the API
     * @param {string} endpoint - The endpoint to make the request to
     */
    async getRequest(endpoint) {
        try {
            const response = await instance.get(endpoint);
            return response;
        } catch (error) {
            return error.response.data.error;
        }
    },

    /**
     * Makes a POST request to the API
     * @param {string} endpoint - The endpoint to make the request to
     * @param {object} data - The data to send with the request
     */
    async postRequest(endpoint, data) {
        try {
            const response = await instance.post(endpoint, data);
            return response;
        } catch (error) {
            return error.response.data.error;
        }
    },


    /**
     * Makes a DELETE request to the API
     * @param {string} endpoint - The endpoint to make the request to
     */
    async deleteRequest(endpoint) {
        try {
            const response = await instance.delete(endpoint);
            return response;
        } catch (error) {
            return error.response.data.error;
        }
    }


};