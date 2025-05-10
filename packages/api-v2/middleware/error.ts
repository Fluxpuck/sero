import { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from '../utils/response.utils';
import { ResponseCode } from '../types/response.types';

interface AppError extends Error {
    statusCode?: number;
}

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
    ResponseHandler.sendError(res, 'Resource not found', ResponseCode.NOT_FOUND);
};

export const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const statusCode = err.statusCode || ResponseCode.INTERNAL_SERVER_ERROR;

    // Split the stack trace into an array of lines for better readability
    if (!err.stack) { err.stack = "No stack trace available"; }
    const stackTraceArray = err.stack.split("\n").map(line => line.trim());

    // Log the error details to the console
    console.error(`Error occurred: ${err.message}`);
    if (process.env.NODE_ENV === 'development') {
        console.error('Error stack trace:', stackTraceArray.join('\n'));
    }

    // Use ResponseHandler to send a standardized error response
    const errorData = process.env.NODE_ENV === 'development' ? { stack: stackTraceArray } : undefined;
    ResponseHandler.sendError(res, err.message || 'Internal Server Error', statusCode, errorData);

    // Pass to the next middleware if needed
    next();
};