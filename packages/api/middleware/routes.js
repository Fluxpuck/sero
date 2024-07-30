const fs = require('fs');
const path = require('path');

function loadRoutes(app, dirPath, baseRoute = '') {
    fs.readdirSync(dirPath).forEach(file => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Load only the first-level directories, not the sub-directories
            const indexFilePath = path.join(filePath, 'index.js');
            if (fs.existsSync(indexFilePath)) {
                const route = require(indexFilePath);
                const routePath = `${baseRoute}/${file}`;

                console.log(`[Route]: /api${routePath}/`);

                app.use(routePath, route);
            }
        } else if (file.endsWith('.js') && file !== 'index.js') {
            const route = require(filePath);
            const routePath = `${baseRoute}/${file.replace('.js', '')}`;

            console.log(`[Route]: /api${routePath}/`);

            app.use(routePath, route);
        }
    });
}

module.exports.run = (app) => {
    const routesDir = path.join(__dirname, '../routes');
    loadRoutes(app, routesDir);
};

module.exports.loadRoutes = loadRoutes;
