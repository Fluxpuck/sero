import { Sequelize } from "sequelize-typescript";

import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables from config folder
config({ path: path.resolve(__dirname, '../config/.env') });

// Setup the environment variables
const postgres_host: string = process.env.POSTGRES_HOST || "localhost";
const postgres_user: string = process.env.POSTGRES_USER || "postgres";
const postgres_password: string = process.env.POSTGRES_PASSWORD || "postgres";
const postgres_db: string = process.env.POSTGRES_DB || "postgres";
const postgres_port: number = parseInt(process.env.POSTGRES_PORT || "5432", 10);

console.log("postgress", {
    postgres_host,
    postgres_user,
    postgres_password,
    postgres_db,
    postgres_port
})

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
        }
    }
);

export { sequelize };