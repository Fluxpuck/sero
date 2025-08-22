import axios, { AxiosError, AxiosResponse } from "axios";
import {
  ApiResponse,
  ResponseCode,
  ResponseStatus,
} from "../types/response.types";

const baseURL =
  process.env.NODE_ENV === "production"
    ? "http://api:3336/api/"
    : "http://localhost:3336/api/";

const instance = axios.create({
  baseURL,
  headers: {
    Authorization: process.env.MASTER_KEY,
    "Content-type": "application/json",
  },
});

/**
 * Make a GET request to the specified endpoint
 * @param endpoint API endpoint to call
 * @returns Promise with the API response
 */
export async function getRequest<T = any>(
  endpoint: string
): Promise<ApiResponse<T>> {
  try {
    const response: AxiosResponse<ApiResponse<T>> = await instance.get(
      endpoint
    );
    return response.data;
  } catch (error) {
    return handleRequestError(error);
  }
}

/**
 * Make a POST request to the specified endpoint with data
 * @param endpoint API endpoint to call
 * @param data Data to send in the request body
 * @returns Promise with the API response
 */
export async function postRequest<T = any, D = any>(
  endpoint: string,
  data: D
): Promise<ApiResponse<T>> {
  try {
    const response: AxiosResponse<ApiResponse<T>> = await instance.post(
      endpoint,
      data
    );
    return response.data;
  } catch (error) {
    return handleRequestError(error);
  }
}

/**
 * Make a DELETE request to the specified endpoint
 * @param endpoint API endpoint to call
 * @returns Promise with the API response
 */
export async function deleteRequest<T = any>(
  endpoint: string
): Promise<ApiResponse<T>> {
  try {
    const response: AxiosResponse<ApiResponse<T>> = await instance.delete(
      endpoint
    );
    return response.data;
  } catch (error) {
    return handleRequestError(error);
  }
}

/**
 * Handle request errors and return a standardized API response
 * @param error Axios error object
 * @returns Standardized API error response
 */
function handleRequestError(error: unknown): ApiResponse {
  const axiosError = error as AxiosError;
  if (axiosError.response) {
    // The request was made and the server responded with an error status
    return axiosError.response.data as ApiResponse;
  } else {
    // The request was made but no response was received or another error occurred
    return {
      status: ResponseStatus.ERROR,
      code: ResponseCode.INTERNAL_SERVER_ERROR,
      message: axiosError.message || "An unexpected error occurred",
    };
  }
}

export default instance;
