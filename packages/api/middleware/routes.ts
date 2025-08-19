import { Application, Router, Request, Response, NextFunction } from "express";
import { readdirSync, statSync, existsSync } from "fs";
import { join, relative } from "path";
import { logger } from "../utils/logger";

// Route types and interfaces
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
 * - Normalizes path separators for cross-platform compatibility
 * - Removes file extensions
 * - Converts [param] to :param
 * - Handles index.ts by using the directory name
 * - Preserves other filenames as part of the route
 */
const pathToRoute = (filePath: string, targetPath: string): string => {
  // Normalize path separators to forward slashes
  const normalizePath = (path: string) => path.replace(/\\/g, "/");

  // Get the relative path from the routes directory
  const routesDir = normalizePath(join(process.cwd(), targetPath));
  let relativePath = normalizePath(relative(routesDir, filePath));

  // Remove file extension
  relativePath = relativePath.replace(/\.(ts|js)$/, "");

  // Split into parts and process each part
  const parts = relativePath.split("/");
  const processedParts = [];

  for (const part of parts) {
    if (!part || part === "index") continue;

    // Convert [param] to :param
    if (part.startsWith("[") && part.endsWith("]")) {
      processedParts.push(`:${part.slice(1, -1)}`);
    } else {
      processedParts.push(part);
    }
  }

  // Join parts and clean up
  const route = "/" + processedParts.join("/").replace(/\/+/g, "/");
  return route || "/";
};

/**
 * Log all registered routes for debugging
 */
const logRegisteredRoutes = (router: Router, basePath: string = "") => {
  const routes: Array<{ method: string; path: string }> = [];

  // @ts-ignore - _router is a private property
  const layerStack = router._router?.stack || [];

  layerStack.forEach((layer: any) => {
    if (layer.route) {
      // Regular route
      const methods = Object.keys(layer.route.methods).map((method) =>
        method.toUpperCase()
      );
      methods.forEach((method) => {
        routes.push({
          method,
          path: basePath + (layer.route?.path || ""),
        });
      });
    } else if (layer.name === "router") {
      // Router mounted on a path
      const routerPath = layer.regexp
        .toString()
        .replace("/^\\", "")
        .replace("\\/?(?=\\/|$)/i", "")
        .replace(/\\\//g, "/");

      // @ts-ignore - handle is the router
      logRegisteredRoutes(layer.handle, basePath + routerPath);
    }
  });

  // Log all routes
  if (routes.length > 0) {
    logger.info("\nRegistered Routes:");
    routes.forEach((route) => {
      logger.info(`[${route.method}] ${route.path}`);
    });
    logger.info("");
  }
};

/**
 * Recursively loads all route files from a directory
 */
const loadRoutes = (
  app: Application,
  dir: string,
  basePath: string = "",
  routeStats: RouteStats
): void => {
  if (!existsSync(dir)) {
    logger.error(`Error: Directory not found: ${dir}`);
    return;
  }

  const files = readdirSync(dir);
  // Only count actual files, not directories
  routeStats.totalFiles += files.filter(
    (file) => !statSync(join(dir, file)).isDirectory()
  ).length;

  for (const file of files) {
    const fullPath = join(dir, file);
    const stat = statSync(fullPath);
    const isDirectory = stat.isDirectory();

    // Skip node_modules and other hidden directories
    if (file.startsWith(".") || file === "node_modules") {
      routeStats.skippedRoutes++;
      continue;
    }

    if (isDirectory) {
      // Process subdirectory
      loadRoutes(app, fullPath, `${basePath}`, routeStats);
    } else if (file.endsWith(".ts") || file.endsWith(".js")) {
      try {
        // Skip test files and definition files
        if (
          file.includes(".test.") ||
          file.includes(".spec.") ||
          file.endsWith(".d.ts")
        ) {
          routeStats.skippedRoutes++;
          logger.debug(
            `- Skipped test/definition file: ${relative(
              process.cwd(),
              fullPath
            )}`
          );
          continue;
        }

        // Only process TypeScript files in route directories
        if (!file.endsWith(".ts")) {
          routeStats.skippedRoutes++;
          logger.debug(
            `- Skipped non-TypeScript file: ${relative(
              process.cwd(),
              fullPath
            )}`
          );
          continue;
        }

        // Load the route module
        const routeModule: RouteModule = require(fullPath);

        // Skip if no default export or explicitly disabled
        if (!routeModule.default || routeModule.disabled) {
          routeStats.skippedRoutes++;
          logger.warn(
            `- Skipped (disabled or no default export): ${relative(
              process.cwd(),
              fullPath
            )}`
          );
          continue;
        }

        // Generate route path and clean it up for logging
        let routePath = pathToRoute(fullPath, "/routes");
        // Remove any leading relative path segments
        routePath = routePath.replace(/^(\/\.\.?)+/, "");

        // Apply middleware if any
        if (routeModule.middleware && routeModule.middleware.length > 0) {
          app.use(routePath, ...routeModule.middleware, routeModule.default);
        } else {
          app.use(routePath, routeModule.default);
        }

        // Log the loaded route with the base route if specified
        const displayPath = basePath ? `${basePath}${routePath}` : routePath;
        logger.success(`✓ Loaded route: ${displayPath}`);
        routeStats.loadedRoutes++;

        // Track the route for logging
        routeStats.routes.push({
          method: "ALL",
          path: routePath,
          file: relative(process.cwd(), fullPath),
        });
      } catch (error) {
        logger.error(`Error loading route ${file}:`, error);
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
export const run = (
  app: Application,
  options: { baseRoute?: string } = {}
): void => {
  const { baseRoute = "" } = options;
  const routeStats: RouteStats = {
    totalFiles: 0,
    loadedRoutes: 0,
    skippedRoutes: 0,
    routes: [],
  };

  // Load all routes from the routes directory
  const routesDir = join(__dirname, "../routes");
  logger.info("Starting route initialization...");

  // Create a router for the base route if specified
  const router = Router();
  const targetApp = baseRoute ? router : app;
  loadRoutes(targetApp as Application, routesDir, baseRoute, routeStats);

  // Mount the router at the base route if specified
  if (baseRoute) {
    app.use(baseRoute, router);
  }

  // Log route loading summary
  if (routeStats.loadedRoutes > 0) {
    logger.success(`✓ Loaded ${routeStats.loadedRoutes} routes`);
  }
  if (routeStats.skippedRoutes > 0) {
    logger.warn(`⚠ Skipped ${routeStats.skippedRoutes} routes`);
  }
  logger.info(`Total files processed: ${routeStats.totalFiles}`);

  // Log all registered routes with base route
  logRegisteredRoutes(baseRoute ? router : (app as any)._router, baseRoute);
};
