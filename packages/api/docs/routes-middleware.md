# Routes Middleware Documentation

## Overview
The routes middleware is a powerful utility that automatically loads and initializes Express routes based on your file system structure. It provides a clean and organized way to manage API endpoints while supporting dynamic route parameters and middleware composition.

## Features

- **Automatic Route Discovery**: Scans the file system for route handlers
- **Parameter Conversion**: Automatically converts `[param]` in directory names to Express route parameters (`:param`)
- **Nested Routes**: Supports deeply nested route structures
- **Middleware Support**: Per-route middleware configuration
- **Detailed Logging**: Provides clear logging of loaded routes and skipped files
- **TypeScript Support**: Fully typed for better developer experience

## Directory Structure

The middleware expects your routes to be organized in the following structure:

```
/routes
  /[guildId]           // Dynamic parameter
    /away             // Nested route
      index.ts        // Handles /[guildId]/away
      user.ts         // Handles /[guildId]/away/user
  /logs
    /[guildId]        // Another dynamic parameter
      economy.ts      // Handles /logs/[guildId]/economy
```

## Route File Structure

Each route file should export a default Express Router instance:

```typescript
import { Router } from 'express';

const router = Router({ mergeParams: true });  // Important for nested routes

router.get('/', (req, res) => {
  const { guildId } = req.params;  // Access route parameters
  // Your route handler
});

export default router;
```

## Parameter Handling

Dynamic parameters in route paths are defined using square brackets `[paramName]` in directory or file names. These are automatically converted to Express route parameters (`:paramName`).

### Example:

- **File Path**: `/routes/guild/[guildId]/away/index.ts`
- **Resulting Route**: `GET /guild/:guildId/away`
- **Access in Handler**: `req.params.guildId`

## Middleware Support

You can export middleware that will be applied to all routes in a file:

```typescript
import { Router, Request, Response, NextFunction } from 'express';

const router = Router({ mergeParams: true });

// Route-specific middleware
const validateUser = (req: Request, res: Response, next: NextFunction) => {
  // Your validation logic
  next();
};

router.get('/', validateUser, (req, res) => {
  // Your route handler
});

export default router;
```

## Error Handling

Each route should handle its own errors and either send a response or pass the error to the next middleware:

```typescript
router.get('/', async (req, res, next) => {
  try {
    // Your async code
  } catch (error) {
    next(error);  // Pass to error handling middleware
  }
});
```

## Logging

The middleware provides detailed logging of:
- Loaded routes with their paths
- Skipped files (test files, type definitions, etc.)
- Any errors that occur during route loading

## Best Practices

1. **Use `mergeParams: true`** for nested routers to access parent route parameters
2. **Keep route files focused** on a single resource or feature
3. **Use TypeScript** for better type safety and developer experience
4. **Document your routes** using JSDoc or OpenAPI/Swagger
5. **Handle errors** appropriately in each route handler

## Example Route File

```typescript
import { Request, Response, Router } from 'express';
import { ResponseHandler } from '../../utils/response.utils';
import { ResponseCode } from '../../utils/response.types';

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /guild/{guildId}/away:
 *   get:
 *     summary: Get all away statuses for a guild
 *     parameters:
 *       - $ref: '#/components/parameters/guildId'
 *     responses:
 *       200:
 *         description: List of away statuses
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { guildId } = req.params;
    // Your logic here
    ResponseHandler.sendSuccess(res, [], 'Success');
  } catch (error) {
    next(error);
  }
});

export default router;
```

## Troubleshooting

- **Routes not loading?** Ensure your files have the `.ts` extension and are in the correct directory
- **Parameters undefined?** Make sure to use `mergeParams: true` in your Router
- **Middleware not running?** Check the order of middleware registration in your main app file
