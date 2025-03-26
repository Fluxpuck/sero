// services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import dotenv from 'dotenv';
dotenv.config();

const { NODE_ENV, PROD_API_URL, API_MASTER_KEY } = process.env;

export type ApiResponse = {
    status: number;
    data: any;
    message?: string;
}

// Create and configure axios instance
const instance: AxiosInstance = axios.create({
    baseURL: NODE_ENV === 'production' ? PROD_API_URL : "http://localhost:3336/api/",
    headers: {
        'Authorization': API_MASTER_KEY,
        "Content-type": "application/json"
    }
});

// Request interceptor for API calls
instance.interceptors.request.use(
    (config) => {
        // You can add logging or modify requests here
        return config;
    },
    (error) => {
        if (process.env.NODE_ENV === 'development') console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for API calls
instance.interceptors.response.use(
    (response) => {
        // You can track response data/status here
        return response;
    },
    (error) => {
        if (process.env.NODE_ENV === 'development') console.error('API Response Error:', error?.response?.data || error.message);
        return Promise.reject(error);
    }
);

// Helper methods for API calls
export const ApiService = {
    /**
     * Make a GET request to the API
     * @param url - The endpoint to call
     * @param config - Optional axios config
     * @returns Promise with the response data
     */
    async get<AxiosResponse>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
        return await instance.get(url, config);
    },

    /**
     * Make a POST request to the API
     * @param url - The endpoint to call
     * @param data - The data to send
     * @param config - Optional axios config
     * @returns Promise with the response data
     */
    async post<AxiosResponse>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
        return await instance.post(url, data, config);
    },

    /**
     * Make a PUT request to the API
     * @param url - The endpoint to call
     * @param data - The data to send
     * @param config - Optional axios config
     * @returns Promise with the response data
     */
    async put<AxiosResponse>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
        return await instance.put(url, data, config);
    },

    /**
     * Make a DELETE request to the API
     * @param url - The endpoint to call
     * @param config - Optional axios config
     * @returns Promise with the response data
     */
    async delete<AxiosResponse>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
        return await instance.delete(url, config);
    }
};

export default ApiService;