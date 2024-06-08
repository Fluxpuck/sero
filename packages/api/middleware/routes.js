const fs = require('fs');
const path = require('path');

function loadRoutes(app, dirPath) {
    fs.readdirSync(dirPath).forEach(file => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Recursively load routes in subdirectories
            loadRoutes(app, filePath);
        } else if (file.endsWith('.js')) {
            const route = require(filePath);
            const routePath = filePath
                .replace(__dirname, '')
                .replace(/\\/g, '/')
                .replace('/routes', '')
                .replace('.js', '');

            console.log(`Loading route: ${routePath}`);

            app.use(routePath, route);
        }
    });
}

module.exports.run = (app) => {
    const routesDir = path.join(__dirname, '../routes');
    loadRoutes(app, routesDir);
};
