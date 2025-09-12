import { Request, Response, Router, NextFunction } from "express";
import { ResponseHandler } from "../../../../utils/response.utils";
import { logUserExperience } from "../../../../utils/log.utils";
import { UserExperienceLogType } from "../../../../models/user-experience-logs.model";
import { sequelize } from "../../../../database/sequelize";
import { getOrCreateUserLevel } from "./index";

const router = Router({ mergeParams: true });



export default router;
