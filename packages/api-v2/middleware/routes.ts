import { Application } from 'express';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const loadRoutes = (app: Application, dir: string, basePath: string = '') => {
    const files = readdirSync(dir);

    for (const file of files) {
        const fullPath = join(dir, file);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
            loadRoutes(app, fullPath, `${basePath}/${file}`);
        } else if (file.endsWith('.ts') || file.endsWith('.js')) {
            const route = require(fullPath).default;
            const routePath = file === 'index.ts' || file === 'index.js' ? basePath || '/' : `${basePath}/${file.split('.')[0]}`;
            app.use(routePath, route);
            console.log(`- ${routePath}`);
        }
    }
};

export const run = (app: Application) => {
    const routesPath = join(__dirname, '../routes');
    console.log("Initializing routes:");
    loadRoutes(app, routesPath);
};