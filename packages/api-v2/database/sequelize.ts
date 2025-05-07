import { Sequelize } from "sequelize-typescript";
import { Guilds, Users } from '../models';
import { initModels } from '../models';

import { config } from 'dotenv';
import * as path from 'path';
config({ path: path.resolve(__dirname, '../config/.env') });

// Setup the environment variables
const postgres_host: string = process.env.POSTGRES_HOST || "localhost";
const postgres_user: string = process.env.POSTGRES_USER || "postgres";
const postgres_password: string = process.env.POSTGRES_PASSWORD || "postgres";
const postgres_db: string = process.env.POSTGRES_DB || "postgres";
const postgres_port: number = parseInt(process.env.POSTGRES_PORT || "5432", 10);

const sequelize = new Sequelize(
    postgres_db,
    postgres_user,
    postgres_password,
    {
        host: postgres_host,
        port: postgres_port,
        dialect: 'postgres',
        logging: false,
        pool: {
            max: 20,
            min: 2,
            acquire: 60000,
            idle: 20000,
            evict: 30000
        },
        retry: {
            max: 3,
            match: [/Deadlock/i, /Connection acquired timeout/i]
        },
        models: [
            Guilds,
            Users,
        ]
    }
);

initModels(sequelize); // Initialize model relationships

export { sequelize };