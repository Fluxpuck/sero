module.exports = {

    errorHandler(err, req, res, next) {
        // Set default error status code to 500 (Internal Server Error)
        if (!err.status) err.status = 500;

        if (!err.stack) err.stack = "No stack trace available";
        const stackTraceString = err.stack.toString();
        const stackTraceArray = stackTraceString.split("\n");

        // Build the error response
        const ErrorResponse = {
            status: err.status,
            message: err.message,
            data: {
                url: req.originalUrl,
                method: req.method,
                timestamp: new Date()
            },
            request: {
                headers: req.headers,
                body: req.body,
                query: req.query
            },
            stack: Array.isArray(stackTraceArray) ? stackTraceArray : stackTraceString
        };

        // Log the error to the console → for debugging purposes only!
        if (process.env.NODE_ENV === "development") {
            console.error("[API ErrorHandler]: ", ErrorResponse);
        }

        // Send the error response to the client
        return res.status(err.status).json({
            error: {
                status: err.status,
                data: {
                    message: err.message,
                    url: req.originalUrl,
                    method: req.method,
                    timestamp: new Date()
                }
            }
        });

    }
}