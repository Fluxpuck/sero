const fs = require('fs');
const path = require('path');

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
            const route = require(filePath);
            const routePath = `${baseRoute}/${file.replace('.js', '')}`;

            console.log(`[Route]: /api${routePath}/`);

            app.use(routePath, route);

        } else if (file === 'index.js') {
            const route = require(filePath);
            console.log(`[Route]: /api${baseRoute}/`);

            app.use(baseRoute, route);
        }
    });
}

function run(app) {
    const routesDir = path.join(__dirname, '../routes');
    registerBaseRoutes(app, routesDir);
}

module.exports = { run };
