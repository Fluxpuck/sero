const fs = require('fs');
const path = require('path');
const { authenticate } = require('./authentication');

function registerBaseRoutes(app, dirPath, baseRoute = '') {
    fs.readdirSync(dirPath).forEach(file => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Convert directory names in brackets (e.g., [guildId]) to route parameters (e.g., :guildId)
            const routeParam = file.startsWith('[') && file.endsWith(']')
                ? `:${file.slice(1, -1)}`
                : file;

            // Recursively call registerBaseRoutes for subdirectories
            registerBaseRoutes(app, filePath, `${baseRoute}/${routeParam}`);

        } else if (file.endsWith('.js') && file !== 'index.js') {
            const routePath = `${baseRoute}/${file.replace('.js', '')}`;
            // Resolve the absolute path to the route file
            const route = require(filePath);

            console.log(`[Route]: ${routePath}`);
            app.use(`/api${routePath}`, authenticate, route);

        } else if (file === 'index.js') {
            const routePath = baseRoute;
            // Resolve the absolute path to the index file
            const route = require(filePath);

            console.log(`[Route]: ${routePath}`);
            app.use(`/api${routePath}`, authenticate, route);
        }
    });
}

function run(app) {
    const routesDir = path.join(__dirname, '../routes');
    registerBaseRoutes(app, routesDir);

    // Catch all other routes
    app.use((req, res, next) => {
        const error = new Error('Sorry, that route does not exist.');
        error.status = 400;
        error.stack = req;
        next(error);
    });
}

module.exports = { run };
