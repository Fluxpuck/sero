import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
    statusCode?: number;
}

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
    res.status(404).json({
        success: false,
        message: 'Resource not found'
    });
};

export const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const statusCode = err.statusCode || 500;

    // Split the stack trace into an array of lines for better readability
    // and to avoid sending the entire stack trace as a single string
    if (!err.stack) { err.stack = "No stack trace available"; }
    const stackTraceArray = err.stack.split("\n").map(line => line.trim());

    // Log the error details to the console
    console.error(`Error occurred: ${err.message}`);
    if (process.env.NODE_ENV === 'development') {
        console.error('Error stack trace:', stackTraceArray.join('\n'));
    }

    // Send a clear error response
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: stackTraceArray })
    });

    // Pass to the next middleware if needed
    next();
};