import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import dotenv from 'dotenv';
// Load dotenv only once
dotenv.config();

export type ApiResponse<T = any> = {
    status: number;
    data: T | null;
    message?: string;
    error?: boolean;
}

/**
 * Extended request options for API calls
 */
export type ApiRequestOptions = {
    /** Whether to use cached response if available (default: true) */
    useCache?: boolean;
    /** Whether to automatically retry failed requests (default: true) */
    retry?: boolean;
    /** Maximum number of retry attempts (default: 2) */
    maxRetries?: number;
    /** Delay between retry attempts in milliseconds (default: 300) */
    retryDelay?: number;
} & AxiosRequestConfig

// Improved retry function with delay between retries, no initial delay
export async function retryApiCall<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    retryDelay = 1000
): Promise<T> {
    let retries = 0;

    while (true) {
        try {
            return await operation();
        } catch (error: any) {
            // Don't retry on client errors (except rate limiting)
            if (++retries > maxRetries ||
                (error.response?.status && error.response.status < 500 && error.response.status !== 429)) {
                throw error;
            }

            console.log(`Retry ${retries}/${maxRetries} in ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }
}

/**
 * API Service for handling HTTP requests with optimized performance
 */
export class ApiService {
    private instance: AxiosInstance;
    private cache: Map<string, { data: any, timestamp: number }> = new Map();
    private cacheLifetime: number = 60_000; // 60 seconds default cache lifetime

    constructor(
        baseURL?: string,
        headers?: Record<string, string>,
        cacheLifetime?: number
    ) {
        // Create and configure axios instance
        this.instance = axios.create({
            baseURL: baseURL || (process.env.NODE_ENV === 'production' ? process.env.PROD_API_URL : "http://localhost:3336/api/"),
            headers: headers || {
                'Authorization': process.env.API_MASTER_KEY,
                "Content-type": "application/json"
            },
            timeout: 10_000 // 10 second timeout
        });

        if (cacheLifetime !== undefined) {
            this.cacheLifetime = cacheLifetime;
        }
    }

    // Generate a cache key from request parameters
    private getCacheKey(method: string, url: string, data?: any): string {
        return `${method}:${url}:${data ? JSON.stringify(data) : ''}`;
    }

    // Check if response is in cache and valid
    private getFromCache<T>(cacheKey: string): ApiResponse<T> | null {
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheLifetime) {
            return cached.data;
        }
        return null;
    }

    // Store response in cache
    private addToCache(cacheKey: string, response: ApiResponse<any>): void {
        this.cache.set(cacheKey, {
            data: response,
            timestamp: Date.now()
        });
    }

    // Clear cache entirely or for a specific key
    public clearCache(cacheKey?: string): void {
        if (cacheKey) {
            this.cache.delete(cacheKey);
        } else {
            this.cache.clear();
        }
    }

    async get<T = any>(
        url: string,
        config?: ApiRequestOptions
    ): Promise<ApiResponse<T>> {
        const useCache = config?.useCache !== false;
        const shouldRetry = config?.retry !== false;
        const cacheKey = this.getCacheKey('GET', url);

        // Check cache first
        if (useCache) {
            const cachedResponse = this.getFromCache<T>(cacheKey);
            if (cachedResponse) return cachedResponse;
        }

        try {
            // Only retry if explicitly requested
            const operation = () => this.instance.get<T>(url, config);
            const response = shouldRetry ?
                await retryApiCall(
                    operation,
                    config?.maxRetries || 3,
                    config?.retryDelay || 1000
                ) :
                await operation();

            const apiResponse = {
                status: response.status,
                data: response.data,
                message: 'Success'
            };

            // Cache successful responses
            if (useCache) {
                this.addToCache(cacheKey, apiResponse);
            }

            return apiResponse;
        } catch (error: any) {
            return this.handleApiError<T>(error);
        }
    }

    async post<T = any>(
        url: string,
        data?: any,
        config?: ApiRequestOptions
    ): Promise<ApiResponse<T>> {
        const shouldRetry = config?.retry !== false;

        try {
            const operation = () => this.instance.post<T>(url, data, config);
            const response = shouldRetry ?
                await retryApiCall(
                    operation,
                    config?.maxRetries || 3,
                    config?.retryDelay || 1000
                ) :
                await operation();

            // Clear GET cache entries that might be affected
            this.clearCache(this.getCacheKey('GET', url));

            return {
                status: response.status,
                data: response.data,
                message: 'Success'
            };
        } catch (error: any) {
            return this.handleApiError<T>(error);
        }
    }

    async put<T = any>(
        url: string,
        data?: any,
        config?: ApiRequestOptions
    ): Promise<ApiResponse<T>> {
        const shouldRetry = config?.retry !== false;

        try {
            const operation = () => this.instance.put<T>(url, data, config);
            const response = shouldRetry ?
                await retryApiCall(operation, config?.maxRetries || 2) :
                await operation();

            // Clear GET cache entries that might be affected
            this.clearCache(this.getCacheKey('GET', url));

            return {
                status: response.status,
                data: response.data,
                message: 'Success'
            };
        } catch (error: any) {
            return this.handleApiError<T>(error);
        }
    }

    async delete<T = any>(
        url: string,
        config?: ApiRequestOptions
    ): Promise<ApiResponse<T>> {
        const shouldRetry = config?.retry !== false;

        try {
            const operation = () => this.instance.delete<T>(url, config);
            const response = shouldRetry ?
                await retryApiCall(operation, config?.maxRetries || 2) :
                await operation();

            // Clear GET cache entries that might be affected
            this.clearCache(this.getCacheKey('GET', url));

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
