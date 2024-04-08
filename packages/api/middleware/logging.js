const morgan = require('morgan');
var path = require('path');
var rfs = require('rotating-file-stream');

// Create a rotating write stream
const logDirectory = path.join('./', 'logs');
var accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    path: logDirectory
})

// Setup logger details
const logger = morgan('combined',
    { stream: accessLogStream });

// Export logger functionality
module.exports = logger