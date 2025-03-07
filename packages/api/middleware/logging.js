const morgan = require('morgan');
const { _Requests } = require("../database/models");

// Create custom tokens to extract data from the request object
morgan.token('body', (req) => JSON.stringify(req.body));

const logger = morgan(
    ':method :url :status :response-time ms :body',
    {
        stream: {
            write: async (message) => {
                // Extract log details from the message and handle potential missing values
                const parts = message.trim().split(' ');
                const method = parts[0] || '';
                const url = parts[1] || '';
                const status = parseInt(parts[2]) || 500;
                const responseTime = parts[3] || '0';
                const time = parts[4] || 'ms';

                // Use regex to capture the body part of the log
                const bodyMatch = message.match(/{\s*.*\s*}/);
                const body = bodyMatch ? JSON.parse(bodyMatch[0]) : {};

                try {
                    // Log request details to the database
                    await _Requests.create({
                        method,
                        url,
                        status,
                        responseTime: `${responseTime} ${time}`,
                        body,
                    });
                } catch (error) {
                    console.error('Error logging request to the database:', error);
                    console.error('Message:', message);
                    console.error('Parsed values:', { method, url, status, responseTime, body });
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