import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export type ApiResponse<T = any> = {
    status: number;
    data: T | null;
    message?: string;
    error?: boolean;
}

// Utility function to retry API calls with exponential backoff
export async function retryApiCall<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    initialDelay = 1000,
    backoffFactor = 2
): Promise<T> {
    let retries = 0;
    let delay = initialDelay;

    while (true) {
        try {
            return await operation();
        } catch (error: any) {
            if (++retries >= maxRetries ||
                (error.response?.status && error.response.status < 500 && error.response.status !== 429)) {
                throw error;
            }

            console.log(`Retry ${retries}/${maxRetries} in ${delay}ms...`);

            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= backoffFactor;
        }
    }
}

/**
 * API Service for handling HTTP requests 
 * with retry capability
 */
export class ApiService {
    private instance: AxiosInstance;

    constructor(
        baseURL?: string,
        headers?: Record<string, string>
    ) {
        // Create and configure axios instance
        // Default to Sero API baseUrl and Headers
        this.instance = axios.create({
            baseURL: baseURL || (process.env.NODE_ENV === 'production' ? process.env.PROD_API_URL : "http://localhost:3336/api/"),
            headers: headers || {
                'Authorization': process.env.API_MASTER_KEY,
                "Content-type": "application/json"
            }
        });
    }

    async get<T = any>(url: string, config?: AxiosRequestConfig, maxRetries = 3, initialDelay = 1000, backoffFactor = 2): Promise<ApiResponse<T>> {
        try {
            const response = await retryApiCall(() => this.instance.get<T>(url, config), maxRetries, initialDelay, backoffFactor);
            return {
                status: response.status,
                data: response.data,
                message: 'Success'
            };
        } catch (error: any) {
            return this.handleApiError<T>(error);
        }
    }

    async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig, maxRetries = 3, initialDelay = 1000, backoffFactor = 2): Promise<ApiResponse<T>> {
        try {
            const response = await retryApiCall(() => this.instance.post<T>(url, data, config), maxRetries, initialDelay, backoffFactor);
            return {
                status: response.status,
                data: response.data,
                message: 'Success'
            };
        } catch (error: any) {
            return this.handleApiError<T>(error);
        }
    }

    async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig, maxRetries = 3, initialDelay = 1000, backoffFactor = 2): Promise<ApiResponse<T>> {
        try {
            const response = await retryApiCall(() => this.instance.put<T>(url, data, config), maxRetries, initialDelay, backoffFactor);
            return {
                status: response.status,
                data: response.data,
                message: 'Success'
            };
        } catch (error: any) {
            return this.handleApiError<T>(error);
        }
    }

    async delete<T = any>(url: string, config?: AxiosRequestConfig, maxRetries = 3, initialDelay = 1000, backoffFactor = 2): Promise<ApiResponse<T>> {
        try {
            const response = await retryApiCall(() => this.instance.delete<T>(url, config), maxRetries, initialDelay, backoffFactor);
            return {
                status: response.status,
                data: response.data,
                message: 'Success'
            };
        } catch (error: any) {
            return this.handleApiError<T>(error);
        }
    }

    private handleApiError<T>(error: any): ApiResponse<T> {
        if (error.response) {
            // Request was made and server responded with error status
            return {
                status: error.response.status,
                data: null,
                message: error.response.data?.message || error.message,
                error: true
            };
        } else if (error.request) {
            // Request was made but no response was received
            return {
                status: 503,
                data: null,
                message: 'No response received from server',
                error: true
            };
        } else {
            // Something happened in setting up the request
            return {
                status: 500,
                data: null,
                message: error.message || 'Unknown error occurred',
                error: true
            };
        }
    }
}
