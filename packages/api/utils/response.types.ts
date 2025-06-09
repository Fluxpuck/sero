
/**
 * Standard API response status codes
 */
export enum ResponseCode {
    // Success codes
    SUCCESS = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NO_CONTENT = 204,

    // Client error codes
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    CONFLICT = 409,
    VALIDATION_ERROR = 422,
    TOO_MANY_REQUESTS = 429,

    // Server error codes
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503
}

/**
 * Standard API response status text
 */
export enum ResponseStatus {
    SUCCESS = 'success',
    ERROR = 'error',
    FAIL = 'fail'
}

/**
 * Standard API response interface
 */
export interface ApiResponse<T = any> {
    status: ResponseStatus;
    code: ResponseCode;
    message: string;
    size?: number;
    data?: T;
}
