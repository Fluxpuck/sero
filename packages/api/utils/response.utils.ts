import { Response } from 'express';
import { ApiResponse, ResponseCode, ResponseStatus } from './response.types';

/**
 * ResponseHandler - A class for standardized API responses
 * 
 * This class provides methods for creating and sending standardized API responses
 * following a consistent format across all endpoints.
 */
export class ResponseHandler {
    /**
     * Creates a standardized API success response
     * @param data The data to include in the response
     * @param message A custom success message
     * @param code HTTP status code
     * @returns ApiResponse object
     */
    static createSuccessResponse<T>(
        data?: T,
        message = 'Operation successful',
        code = ResponseCode.SUCCESS
    ): ApiResponse<T> {
        // Get the size of the data
        const size = data ? (Array.isArray(data) ? data.length : Object.keys(data).length) : 0;

        return {
            status: ResponseStatus.SUCCESS,
            code,
            message,
            size,
            data
        };
    }

    /**
     * Creates a standardized API error response
     * @param message Error message
     * @param code HTTP error status code
     * @param data Optional data to include with the error
     * @returns ApiResponse object
     */
    static createErrorResponse<T>(
        message = 'An error occurred',
        code = ResponseCode.INTERNAL_SERVER_ERROR,
        data?: T
    ): ApiResponse<T> {
        return {
            status: ResponseStatus.ERROR,
            code,
            message,
            data
        };
    }

    /**
     * Creates a standardized API validation failure response
     * @param message Validation error message
     * @param data Validation error details
     * @returns ApiResponse object
     */
    static createValidationFailResponse<T>(
        message = 'Validation failed',
        data?: T
    ): ApiResponse<T> {
        return {
            status: ResponseStatus.FAIL,
            code: ResponseCode.VALIDATION_ERROR,
            message,
            data
        };
    }

    /**
     * Send a standardized success response
     * @param res Express Response object
     * @param data Data to include in the response
     * @param message Success message
     * @param code HTTP status code
     */
    static sendSuccess<T>(
        res: Response,
        data?: T,
        message = 'Operation successful',
        code = ResponseCode.SUCCESS
    ): void {
        res.status(code).json(this.createSuccessResponse(data, message, code));
    }

    /**
     * Send a standardized error response
     * @param res Express Response object
     * @param message Error message
     * @param code HTTP error status code
     * @param data Optional data to include with the error
     */
    static sendError<T>(
        res: Response,
        message = 'An error occurred',
        code = ResponseCode.INTERNAL_SERVER_ERROR,
        data?: T
    ): void {
        res.status(code).json(this.createErrorResponse(message, code, data));
    }

    /**
     * Send a standardized validation failure response
     * @param res Express Response object
     * @param message Validation error message
     * @param data Validation error details
     */
    static sendValidationFail<T>(
        res: Response,
        message = 'Validation failed',
        data?: T
    ): void {
        res.status(ResponseCode.VALIDATION_ERROR).json(
            this.createValidationFailResponse(message, data)
        );
    }
}
