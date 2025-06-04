import { Application, Router, Request, Response, NextFunction } from 'express';
import { readdirSync, statSync, existsSync } from 'fs';
import { join, parse, relative } from 'path';

// Console color codes
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

interface RouteModule {
    default: Router;
    path?: string;
    middleware?: Array<(req: Request, res: Response, next: NextFunction) => void>;
    disabled?: boolean;
}

interface RouteStats {
    totalFiles: number;
    loadedRoutes: number;
    skippedRoutes: number;
    routes: Array<{
        method: string;
        path: string;
        file: string;
    }>;
}

/**
 * Convert a file path to a route path
 * - Removes file extensions
 * - Converts [param] to :param
 * - Handles index.ts by using the directory name
 * - Preserves other filenames as part of the route
 */
const pathToRoute = (filePath: string, basePath: string): string => {
    // Get relative path from routes directory
    const relativePath = relative(basePath, filePath);
    const { dir, name, ext } = parse(relativePath);

    // Split directory into parts and filter out empty parts
    const dirParts = dir.split('/').filter(Boolean);
    
    // Process each directory part to handle parameters
    const routeParts = dirParts.map(part => {
        // Convert [param] to :param
        if (part.startsWith('[') && part.endsWith(']')) {
            return `:${part.slice(1, -1)}`;
        }
        return part;
    });

    // Only add the filename to the route if it's not index
    if (name !== 'index') {
        routeParts.push(name);
    }

    // Join parts and clean up any double slashes
    const route = '/' + routeParts.join('/').replace(/\/+/g, '/').replace(/\/$/, '');
    return route || '/';
};

/**
 * Log all registered routes for debugging
 */
const logRegisteredRoutes = (router: Router, basePath: string = '') => {
    const routes: Array<{ method: string; path: string }> = [];

    // @ts-ignore - _router is a private property
    const layerStack = router._router?.stack || [];

    layerStack.forEach((layer: any) => {
        if (layer.route) {
            // Regular route
            const methods = Object.keys(layer.route.methods).map(method => method.toUpperCase());
            methods.forEach(method => {
                routes.push({
                    method,
                    path: basePath + (layer.route?.path || '')
                });
            });
        } else if (layer.name === 'router') {
            // Router mounted on a path
            const routerPath = layer.regexp.toString()
                .replace('/^\\', '')
                .replace('\\/?(?=\\/|$)/i', '')
                .replace(/\\\//g, '/');

            // @ts-ignore - handle is the router
            logRegisteredRoutes(layer.handle, basePath + routerPath);
        }
    });

    // Log all routes
    if (routes.length > 0) {
        console.log(`${colors.blue}${colors.bright}\nRegistered Routes:${colors.reset}`);
        routes.forEach(route => {
            console.log(`${colors.cyan}[${route.method}]${colors.reset}`, route.path);
        });
        console.log();
    }
};

/**
 * Recursively loads all route files from a directory
 */
const loadRoutes = (app: Application, dir: string, basePath: string = '', routeStats: RouteStats): void => {
    if (!existsSync(dir)) {
        console.error(`${colors.red}Error: Directory not found: ${dir}${colors.reset}`);
        return;
    }

    const files = readdirSync(dir);
    routeStats.totalFiles += files.length;

    for (const file of files) {
        const fullPath = join(dir, file);
        const stat = statSync(fullPath);
        const isDirectory = stat.isDirectory();

        // Skip node_modules and other hidden directories
        if (file.startsWith('.') || file === 'node_modules') {
            routeStats.skippedRoutes++;
            continue;
        }

        if (isDirectory) {
            // Process subdirectory
            loadRoutes(app, fullPath, `${basePath}`, routeStats);
        } else if (file.endsWith('.ts') || file.endsWith('.js')) {
            try {
                // Skip test files and definition files
                if (file.includes('.test.') || file.includes('.spec.') || file.endsWith('.d.ts')) {
                    routeStats.skippedRoutes++;
                    console.log(`${colors.dim}- Skipped test/definition file: ${relative(process.cwd(), fullPath)}${colors.reset}`);
                    continue;
                }

                // Only process TypeScript files in route directories
                if (!file.endsWith('.ts')) {
                    routeStats.skippedRoutes++;
                    console.log(`${colors.dim}- Skipped non-TypeScript file: ${relative(process.cwd(), fullPath)}${colors.reset}`);
                    continue;
                }

                // Load the route module
                const routeModule: RouteModule = require(fullPath);

                // Skip if no default export or explicitly disabled
                if (!routeModule.default || routeModule.disabled) {
                    routeStats.skippedRoutes++;
                    console.log(`${colors.yellow}- Skipped (disabled or no default export): ${relative(process.cwd(), fullPath)}${colors.reset}`);
                    continue;
                }

                // Generate route path and clean it up for logging
                let routePath = pathToRoute(fullPath, join(process.cwd(), 'packages/api/routes'));
                // Remove any leading relative path segments
                routePath = routePath.replace(/^(\/\.\.?)+/, '');

                // Apply middleware if any
                if (routeModule.middleware && routeModule.middleware.length > 0) {
                    app.use(routePath, ...routeModule.middleware, routeModule.default);
                } else {
                    app.use(routePath, routeModule.default);
                }

                // Log the loaded route
                console.log(`${colors.green}${colors.bright}✓${colors.reset} Loaded route: ${routePath}`);
                routeStats.loadedRoutes++;

                // Track the route for logging
                routeStats.routes.push({
                    method: 'ALL',
                    path: routePath,
                    file: relative(process.cwd(), fullPath)
                });

            } catch (error) {
                console.error(`${colors.red}Error loading route ${file}:${colors.reset}`, error);
            }
        }
    }
};


/**
 * Initializes all routes for the application
 */
export const run = (app: Application): void => {
    const routeStats: RouteStats = {
        totalFiles: 0,
        loadedRoutes: 0,
        skippedRoutes: 0,
        routes: []
    };

    // Load all routes from the routes directory
    const routesDir = join(__dirname, '../routes');
    console.log(`${colors.blue}${colors.bright}\nStarting route initialization...${colors.reset}`);
    loadRoutes(app, routesDir, '', routeStats);

    // Log route loading summary
    console.log(`\n${colors.blue}${colors.bright}Route Loading Summary:${colors.reset}`);
    console.log(`${colors.green}${colors.bright}✓${colors.reset} Successfully loaded ${routeStats.loadedRoutes} route modules`);
    console.log(`${colors.yellow}- Skipped ${routeStats.skippedRoutes} files${colors.reset}`);
    console.log(`${colors.dim}Total files processed: ${routeStats.totalFiles}\n${colors.reset}`);

    // Log all registered routes
    logRegisteredRoutes(app._router);

    console.log(`${colors.green}${colors.bright}✓ Route initialization completed\n${colors.reset}`);
};