import { ResponseCode, ResponseStatus, ApiResponse } from '../types/api.types';

/**
 * Handles API requests to the backend server
 */
export class ApiService {
    private baseUrl: string;

    constructor(baseUrl?: string) {
        this.baseUrl = baseUrl
            || process.env.PROD_API_URL
            || "http://localhost:3336";
    }

    /**
     * Creates a standardized error response
     * @param message - The error message
     * @param code - The HTTP status code
     * @returns An ApiResponse object with error status
     */
    private createErrorResponse<T>(message: string, code: ResponseCode = ResponseCode.INTERNAL_SERVER_ERROR): ApiResponse<T> {
        return {
            status: ResponseStatus.ERROR,
            code: code,
            message: message,
        };
    }    /**
     * Makes a GET request to the API
     * @param endpoint - The API endpoint to request
     * @returns Promise with the typed API response
     */
    async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`);

            if (!response.ok) {
                return this.createErrorResponse<T>(
                    `API request failed with status ${response.status}`,
                    response.status as ResponseCode
                );
            }

            return await response.json() as ApiResponse<T>;
        } catch (error) {
            console.error(`Error fetching from ${this.baseUrl}${endpoint}:`, error);
            return this.createErrorResponse<T>(
                error instanceof Error ? error.message : 'Unknown error occurred'
            );
        }
    }    /**
     * Makes a POST request to the API
     * @param endpoint - The API endpoint to request
     * @param data - The data to send with the request
     * @returns Promise with the typed API response
     */
    async post<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                return this.createErrorResponse<T>(
                    `API request failed with status ${response.status}`,
                    response.status as ResponseCode
                );
            }

            return await response.json() as ApiResponse<T>;
        } catch (error) {
            console.error(`Error posting to ${this.baseUrl}${endpoint}:`, error);
            return this.createErrorResponse<T>(
                error instanceof Error ? error.message : 'Unknown error occurred'
            );
        }
    }    /**
     * Makes a DELETE request to the API
     * @param endpoint - The API endpoint to request
     * @returns Promise with the typed API response
     */
    async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                return this.createErrorResponse<T>(
                    `API request failed with status ${response.status}`,
                    response.status as ResponseCode
                );
            }

            return await response.json() as ApiResponse<T>;
        } catch (error) {
            console.error(`Error deleting from ${this.baseUrl}${endpoint}:`, error);
            return this.createErrorResponse<T>(
                error instanceof Error ? error.message : 'Unknown error occurred'
            );
        }
    }

    /**
     * Makes a PUT request to the API
     * @param endpoint - The API endpoint to request
     * @param data - The data to send with the request
     * @returns Promise with the typed API response
     */
    async put<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                return this.createErrorResponse<T>(
                    `API request failed with status ${response.status}`,
                    response.status as ResponseCode
                );
            }

            return await response.json() as ApiResponse<T>;
        } catch (error) {
            console.error(`Error putting to ${this.baseUrl}${endpoint}:`, error);
            return this.createErrorResponse<T>(
                error instanceof Error ? error.message : 'Unknown error occurred'
            );
        }
    }
}

// Export a default instance for simpler imports
const useApi = (baseUrl?: string): ApiService => {
    return new ApiService(baseUrl);
};

export default useApi;
