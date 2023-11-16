const { readdirSync } = require('fs');
const { join } = require('path');
const { authenticate } = require('./authentication');

module.exports.run = (app) => {

    //set directory path to routes and read files
    const filePath = join(__dirname, '..', 'routes')
    const routeFiles = readdirSync(filePath);

    //go through all routes files and bind to App
    for (const route of routeFiles) {
        const api = require(`${filePath}/${route}`);
        const apiName = route.split('.').shift();
        app.use(`/api/${apiName}`, authenticate, api);
    }

    //catch all other routes
    app.use((req, res, next) => {
        const error = new Error('Sorry, that route does not exist.');
        error.status = 400;
        error.stack = req;
        next(error);
    });

}