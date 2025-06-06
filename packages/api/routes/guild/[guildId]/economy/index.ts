import { Request, Response, Router, NextFunction } from 'express';
import { Op, Transaction } from 'sequelize';
import { UserBalances } from '../../../../models';
import { ResponseHandler } from '../../../../utils/response.utils';
import { ResponseCode } from '../../../../utils/response.types';

// Enable mergeParams to access parent route parameters
const router = Router({ mergeParams: true });


export default router;