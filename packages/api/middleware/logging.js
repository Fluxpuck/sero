const morgan = require('morgan');
const { _Requests } = require("../database/models");

// Create custom tokens to extract data from the request object
morgan.token('body', (req) => JSON.stringify(req.body));

const logger = morgan(
    ':method :url :status :response-time ms :body',
    {
        stream: {
            write: async (message) => {
                // Extract log details from the message
                const [method, url, status, response, time] = message.trim().split(' ');

                // Use regex to capture the body part of the log
                const bodyMatch = message.match(/{\s*.*\s*}/);
                const body = bodyMatch ? JSON.parse(bodyMatch[0]) : null;

                try { // Log request details to the database
                    await _Requests.create({
                        method,
                        url,
                        status: parseInt(status),
                        responseTime: `${response} ${time}`,
                        body,
                    });
                } catch (error) {
                    console.error('Error logging request to the database:', error);
                }

                if (process.env.NODE_ENV === "development") {
                    console.log("\x1b[2m", `[LOG]: ${message}`);
                }

            },
        },
    }
);

// Export logger functionality
module.exports = logger