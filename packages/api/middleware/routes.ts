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
const pathToRoute = (filePath: string, targetPath: string): string => {
    // Get the relative path from the routes directory
    const routesDir = join(process.cwd(), targetPath);
    let relativePath = relative(routesDir, filePath);

    // Remove file extension
    relativePath = relativePath.replace(/\.(ts|js)$/, '');

    // Split into parts and process each part
    const parts = relativePath.split('/');
    const processedParts = [];

    for (const part of parts) {
        if (!part || part === 'index') continue;

        // Convert [param] to :param
        if (part.startsWith('[') && part.endsWith(']')) {
            processedParts.push(`:${part.slice(1, -1)}`);
        } else {
            processedParts.push(part);
        }
    }

    // Join parts and clean up
    const route = '/' + processedParts.join('/').replace(/\/+/g, '/');
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
                let routePath = pathToRoute(fullPath, '/routes');
                // Remove any leading relative path segments
                routePath = routePath.replace(/^(\/\.\.?)+/, '');

                // Apply middleware if any
                if (routeModule.middleware && routeModule.middleware.length > 0) {
                    app.use(routePath, ...routeModule.middleware, routeModule.default);
                } else {
                    app.use(routePath, routeModule.default);
                }

                // Log the loaded route with the base route if specified
                const displayPath = basePath ? `${basePath}${routePath}` : routePath;
                console.log(`${colors.green}${colors.bright}✓${colors.reset} Loaded route: ${displayPath}`);
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
 * @param app - Express application instance
 * @param options - Configuration options
 * @param options.baseRoute - Base route path (e.g., '/api')
 */
export const run = (app: Application, options: { baseRoute?: string } = {}): void => {
    const { baseRoute = '' } = options;
    const routeStats: RouteStats = {
        totalFiles: 0,
        loadedRoutes: 0,
        skippedRoutes: 0,
        routes: []
    };

    // Load all routes from the routes directory
    const routesDir = join(__dirname, '../routes');
    console.log(`${colors.blue}${colors.bright}\nStarting route initialization...${colors.reset}`);

    // Create a router for the base route if specified
    const router = Router();
    const targetApp = baseRoute ? router : app;
    loadRoutes(targetApp as Application, routesDir, baseRoute, routeStats);

    // Mount the router at the base route if specified
    if (baseRoute) {
        app.use(baseRoute, router);
    }

    // Log route loading summary
    console.log(`\n${colors.blue}${colors.bright}Route Loading Summary:${colors.reset}`);
    console.log(`${colors.green}${colors.bright}✓${colors.reset} Successfully loaded ${routeStats.loadedRoutes} route modules`);
    console.log(`${colors.red}${colors.dim}x${colors.blue} Skipped ${routeStats.skippedRoutes} files${colors.reset}`);
    console.log(`\n${colors.blue}${colors.bright}Total files processed: ${routeStats.totalFiles}\n${colors.reset}`);

    // Log all registered routes with base route
    logRegisteredRoutes(baseRoute ? router : (app._router as Router), baseRoute);
};