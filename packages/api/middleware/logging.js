/* RESTFUL API for Flux
 Intented for Private use only
 Copyright © 2023
*/

// → Require Packages & Modules
const morgan = require('morgan');
var path = require('path');
var rfs = require('rotating-file-stream');

// → create a rotating write stream
const logDirectory = path.join('./', 'logs');
var accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    path: logDirectory
})

// → setup logger details
const logger = morgan('combined',
    { stream: accessLogStream });

// → Export logger functionality
module.exports = logger