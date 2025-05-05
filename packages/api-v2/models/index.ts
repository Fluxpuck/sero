import { sequelize } from "../database/sequelize";
import { Circuits } from "../models/circuits.model";
import { LapTimes } from "../models/laptimes.model";
import { User } from "../models/users.model";

sequelize.addModels([Circuits, LapTimes, User]);

// Define associations
Circuits.associate();
LapTimes.associate();

export { sequelize, Circuits, LapTimes, User };