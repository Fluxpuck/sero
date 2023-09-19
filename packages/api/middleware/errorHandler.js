/* RESTFUL API for Flux
 Intented for Private use only
 Copyright © 2023
*/

// → Export module's function
module.exports = {

    errorHandler(err, req, res, next) {
        //set default error status code to 500 (Internal Server Error)
        if (!err.status) err.status = 500;

        //log the error to the console → for debugging purposes only!
        console.error("[API ErrorHandler]:", err);

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