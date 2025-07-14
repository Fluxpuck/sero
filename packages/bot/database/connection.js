const axios = require('axios');

const { NODE_ENV, PROD_API_URL } = process.env;
const instance = axios.create({
    baseURL: NODE_ENV === 'production' ? PROD_API_URL : "http://localhost:3336/api/",
    headers: {
        'Authorization': process.env.API_MASTER_KEY,
        "Content-type": "application/json"
    }
});

class ApiResponse {
    constructor({ status, code = 500, message = 'Bad Request', data, size }) {
        this.status = status;
        this.code = code;
        this.message = message;
        this.data = data;
        if (size !== undefined) {
            this.size = size;
        }
    }

    toJSON() {
        return {
            status: this.status,
            code: this.code,
            message: this.message,
            data: this.data,
            size: this.size
        };
    }
}

module.exports = {
    async getRequest(endpoint) {
        try {
            const response = await instance.get(endpoint)
            return new ApiResponse(response.data);
        
        } catch (error) {
            const status = error?.response?.status || 408;
            const errorData = error?.response?.data || {};
            const errorMessage = errorData?.error?.data?.message || error?.message || "An error occurred while fetching data";

            return new ApiResponse({ status: "error", code: status, message: errorMessage });
        }
    },

    async postRequest(endpoint, data) {
        try {
            const response = await instance.post(endpoint, data);
            return new ApiResponse(response.data);

        } catch (error) {
            const status = error?.response?.status || 408;
            const errorData = error?.response?.data || {};
            const errorMessage = errorData?.error?.data?.message || error?.message || "An error occurred while posting data";

            return new ApiResponse({ status: "error", code: status, message: errorMessage });
        }
    },

    async deleteRequest(endpoint) {
        try {
            const response = await instance.delete(endpoint);
            return new ApiResponse(response.data);

        } catch (error) {
            const status = error?.response?.status || 408;
            const errorData = error?.response?.data || {};
            const errorMessage = errorData?.error?.data?.message || error?.message || "An error occurred while deleting data";

            return new ApiResponse({ status: "error", code: status, message: errorMessage });
        }
    },
};
