// filepath: c:\Users\mathi\Documents\GitHub\sero-bot\packages\api-v2\scripts\standardize-routes.md

# Route Standardization Guide

This document outlines the steps to standardize all API route responses in the application.

## Changes Made

1. Created a standardized response type system:
   - Added `response.types.ts` with `ApiResponse`, `ResponseCode`, and `ResponseStatus` definitions
   - Added `response.utils.ts` with utility functions for creating consistent responses

2. Updated error handling middleware to use the standardized format

3. Updated the message route as an example of standardization

## Guide for Standardizing Other Routes

For each route file, follow this pattern:

1. Import the utility functions:
```typescript
import { sendSuccess, sendError, sendValidationFail } from '../../../utils/response.utils';
```

2. For successful responses, replace:
```typescript
res.status(200).json({
    success: true,
    data: someData
});
```

With:
```typescript
sendSuccess(res, someData, 'Descriptive success message');
```

3. For error responses, replace:
```typescript
res.status(400).json({
    success: false,
    message: 'Error message'
});
```

With:
```typescript
sendError(res, 'Error message', ResponseCode.BAD_REQUEST);
```

4. For validation failures, use:
```typescript
sendValidationFail(res, 'Validation message', validationErrors);
```

5. Update Swagger documentation to reflect the new standardized response format:
```
* responses:
*   200:
*     description: Successful operation
*     content:
*       application/json:
*         schema:
*           type: object
*           properties:
*             status:
*               type: string
*               enum: [success]
*             code:
*               type: integer
*               example: 200
*             message:
*               type: string
*             data:
*               type: object
*   400:
*     description: Bad request
*     content:
*       application/json:
*         schema:
*           type: object
*           properties:
*             status:
*               type: string
*               enum: [error]
*             code:
*               type: integer
*               example: 400
*             message:
*               type: string
```

## Benefits of Standardization

1. Consistent response format across all API endpoints
2. Better error handling and messaging
3. Improved API documentation
4. Easier client-side integration and error handling
5. Follows REST API best practices
