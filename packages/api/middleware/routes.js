const fs = require('fs');
const path = require('path');

function loadRoutes(app, dirPath, baseRoute = '') {
    fs.readdirSync(dirPath).forEach(file => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Recursively load routes in subdirectories
            const newBaseRoute = `${baseRoute}/${file}`;
            loadRoutes(app, filePath, newBaseRoute);
        } else if (file.endsWith('.js')) {
            const route = require(filePath);
            const routePath = `${baseRoute}/${file.replace('.js', '')}`;

            console.log(`Loading route: ${routePath}`);

            app.use(routePath, route);
        }
    });
}

module.exports.run = (app) => {
    const routesDir = path.join(__dirname, '../routes');
    loadRoutes(app, routesDir);
};
