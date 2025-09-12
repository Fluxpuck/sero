# Context Guidelines for Developing in packages/api

## Architecture Overview

The Sero API package is a backend service that provides RESTful endpoints, database management, and scheduled tasks for the Sero Discord bot ecosystem. It follows a modular architecture with clear separation of concerns.

## Core Development Principles

1. **Consistent Response Format**: Always use the standardized response utilities.

   - Import and utilize `response.types.ts` and `response.utils.ts` for all API responses.
   - Use `ResponseHandler` class methods like `sendSuccess()`, `sendError()`, or `sendPaginatedSuccess()` for consistent responses.

2. **Input Validation**:

   - Use `validate.types.ts` and `validate.utils.ts` for input validation when necessary.
   - Create specific validation functions for new data types following existing patterns.

3. **Route Structure**:

   - Follow the established endpoint structure in `packages/api/routes`.
   - Routes are dynamically loaded, so file organization matters.
   - Use descriptive filenames that reflect the endpoint's purpose.
   - Implement RESTful principles for CRUD operations.

4. **Documentation**:

   - Add Swagger documentation for all new endpoints.
   - Include detailed descriptions, parameter information, and response examples.

5. **Caching Strategy**:

   - Utilize `cache.ts` from `packages/api/middleware` for endpoints that benefit from caching.
   - Configure appropriate TTL values based on data volatility.
   - Consider cache invalidation for related endpoints when data changes.

6. **Route Registration**:

   - No need to import submodules in the main route file, as this is dynamically handled in `routes.ts`.
   - Export a default router from each route file.

7. **Date Handling**:
   - Always use `date-fns` library for date/time functions, calculations, and manipulation.
   - Maintain consistent timezone handling across the application.

## Code Structure Guidelines

1. **File Organization**:

   - Place new endpoints in the appropriate subdirectory under `/routes`.
   - Group related functionality together.
   - Use index.ts files for route aggregation when needed.

2. **Middleware Usage**:

   - Apply appropriate middleware for authentication, validation, and error handling.
   - Chain middleware in a logical order.

3. **Error Handling**:

   - Use try/catch blocks for async operations.
   - Return appropriate error codes and messages using `ResponseHandler.sendError()`.
   - Log errors with proper context for debugging.

4. **Database Operations**:

   - Use Sequelize models for database interactions.
   - Implement transactions for operations that modify multiple tables.
   - Follow the established patterns for model relationships.

5. **Redis Integration**:
   - Use the Redis client for caching and pub/sub messaging.
   - Follow established patterns for cache keys and TTL values.

## Testing & Quality Assurance

1. **Endpoint Testing**:

   - Test all endpoints with various input scenarios.
   - Verify response formats match the expected structure.
   - Test error handling and edge cases.

2. **Performance Considerations**:
   - Optimize database queries for performance.
   - Use appropriate indexing strategies.
   - Consider pagination for endpoints returning large datasets.

## Security Best Practices

1. **Input Sanitization**:

   - Validate and sanitize all user inputs.
   - Use parameterized queries to prevent SQL injection.

2. **Authentication & Authorization**:

   - Implement proper authentication checks.
   - Verify permissions before performing sensitive operations.

3. **Rate Limiting**:
   - Apply rate limiting to prevent abuse.
   - Consider different limits for different types of endpoints.
