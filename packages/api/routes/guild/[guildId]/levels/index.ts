import { Request, Response, Router, NextFunction } from 'express';
import { } from '../../../../models';

// Enable mergeParams to access parent route parameters
const router = Router({ mergeParams: true });

export default router;