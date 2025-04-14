import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export type ApiResponse = {
    status: number;
    data: any;
    message?: string;
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

    async get<T = any>(url: string, config?: AxiosRequestConfig, maxRetries = 3, initialDelay = 1000, backoffFactor = 2): Promise<AxiosResponse<T>> {
        return retryApiCall(() => this.instance.get<T>(url, config), maxRetries, initialDelay, backoffFactor);
    }

    async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig, maxRetries = 3, initialDelay = 1000, backoffFactor = 2): Promise<AxiosResponse<T>> {
        return retryApiCall(() => this.instance.post<T>(url, data, config), maxRetries, initialDelay, backoffFactor);
    }

    async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig, maxRetries = 3, initialDelay = 1000, backoffFactor = 2): Promise<AxiosResponse<T>> {
        return retryApiCall(() => this.instance.put<T>(url, data, config), maxRetries, initialDelay, backoffFactor);
    }

    async delete<T = any>(url: string, config?: AxiosRequestConfig, maxRetries = 3, initialDelay = 1000, backoffFactor = 2): Promise<AxiosResponse<T>> {
        return retryApiCall(() => this.instance.delete<T>(url, config), maxRetries, initialDelay, backoffFactor);
    }
}
