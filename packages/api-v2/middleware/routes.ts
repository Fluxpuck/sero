import { Application, Router } from 'express';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

interface RouteModule {
    default: Router;
    path?: string;
    middleware?: any[];
    disabled?: boolean;
}

/**
 * Recursively loads all route files from a directory
 */
const loadRoutes = (app: Application, dir: string, basePath: string = '', routeStats: any = {}) => {
    const files = readdirSync(dir);
    routeStats.totalFiles = (routeStats.totalFiles || 0) + files.length;
    routeStats.loadedRoutes = routeStats.loadedRoutes || 0;
    routeStats.skippedRoutes = routeStats.skippedRoutes || 0;

    for (const file of files) {
        const fullPath = join(dir, file);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
            // Process subdirectory
            loadRoutes(app, fullPath, `${basePath}/${file}`, routeStats);
        } else if (file.endsWith('.ts') || file.endsWith('.js')) {
            try {
                // Skip test files and definition files
                if (file.includes('.test.') || file.includes('.spec.') || file.endsWith('.d.ts')) {
                    routeStats.skippedRoutes++;
                    continue;
                }

                const routeModule: RouteModule = require(fullPath);

                // Skip if no default export or explicitly disabled
                if (!routeModule.default || routeModule.disabled) {
                    routeStats.skippedRoutes++;
                    console.log(chalk.yellow(`- Skipped: ${fullPath}`));
                    continue;
                }

                // Determine route path (with several fallback strategies)
                let routePath = routeModule.path; // Use explicit path if provided

                if (!routePath) {
                    // Default path generation logic
                    routePath = file === 'index.ts' || file === 'index.js'
                        ? basePath || '/'
                        : `${basePath}/${file.split('.')[0]}`;
                }

                // Apply any route-specific middleware first
                if (routeModule.middleware && Array.isArray(routeModule.middleware)) {
                    app.use(routePath, ...routeModule.middleware);
                }

                // Mount the route
                app.use(routePath, routeModule.default);
                console.log(chalk.green(`- Mounted: ${routePath}`));
                routeStats.loadedRoutes++;
            } catch (error) {
                console.error(chalk.red(`- Error loading route ${fullPath}:`), error);
                routeStats.skippedRoutes++;
            }
        }
    }

    return routeStats;
};

/**
 * Initializes all routes for the application
 */
export const run = (app: Application) => {
    console.log(chalk.blue("🛣️  Initializing routes:"));
    const routesPath = join(__dirname, '../routes');
    const stats = loadRoutes(app, routesPath);

    console.log(chalk.blue(
        `✅ Route initialization complete: ${stats.loadedRoutes} routes loaded, ` +
        `${stats.skippedRoutes} skipped out of ${stats.totalFiles} files`
    ));
};