import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../utils/response.utils";
import { ResponseCode } from "../utils/response.types";
import { logger } from "../utils/logger";

interface AppError extends Error {
  statusCode?: number;
}

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  ResponseHandler.sendError(res, "Resource not found", ResponseCode.NOT_FOUND);
};

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || ResponseCode.INTERNAL_SERVER_ERROR;

  // Split the stack trace into an array of lines for better readability
  if (!err.stack) {
    err.stack = "No stack trace available";
  }
  const stackTraceArray = err.stack.split("\n").map((line) => line.trim());

  // Log the error details
  logger.error(`Error occurred: ${err.message}`);
  if (process.env.NODE_ENV === "development") {
    logger.error("An error occurred:", {
      message: err.message,
      stackTrace: stackTraceArray,
    });
  }

  // Use ResponseHandler to send a standardized error response
  ResponseHandler.sendError(res, "Oops, something went wrong", statusCode);
};
