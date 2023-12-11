module.exports = {

    errorHandler(err, req, res, next) {
        // Set default error status code to 500 (Internal Server Error)
        if (!err.status) err.status = 500;

        // Build the error response
        const ErrorResponse = {
            status: err.status,
            message: err.message,
            data: {
                url: req.originalUrl,
                method: req.method,
                timestamp: new Date()
            }
        };

        // Log the error to the console → for debugging purposes only!
        console.error("[API ErrorHandler]: ", ErrorResponse);

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