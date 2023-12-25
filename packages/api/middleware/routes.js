const { readdirSync, statSync } = require('fs');
const { join } = require('path');
const { authenticate } = require('./authentication');

function loadRoutes(app, basePath, currentPath = '') {
    const fullPath = join(basePath, currentPath);
    const files = readdirSync(fullPath);

    files.forEach((file) => {
        const filePath = join(currentPath, file);
        const fullFilePath = join(fullPath, file);
        const isDirectory = statSync(fullFilePath).isDirectory();

        if (isDirectory) {
            // Recursively load routes from nested folders
            loadRoutes(app, basePath, filePath);
        } else {
            const api = require(fullFilePath);
            const apiPath = `/api/${filePath.replace('.js', '')}`;
            app.use(apiPath, authenticate, api);
        }
    });
}

module.exports.run = (app) => {
    // Set directory path to routes and read files
    const basePath = join(__dirname, '..', 'routes');

    // Dynamically load routes
    loadRoutes(app, basePath);

    // Catch all other routes
    app.use((req, res, next) => {
        const error = new Error('Sorry, that route does not exist.');
        error.status = 404; // Use 404 for not found routes
        next(error);
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(err.status || 500).json({ error: err.message });
    });
};
