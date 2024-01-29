const { Sequelize } = require('sequelize');
const { join } = require('path');
require('dotenv').config({ path: join(__dirname, '..', 'config', '.env') });

// Function to create and return a Sequelize instance
function createSequelizeInstance() {

    // Development environment variables
    const { LOCAL_HOST, LOCAL_DB, LOCAL_USER, LOCAL_PASS, LOCAL_PORT } = process.env;
    // Production environment variables
    const { POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_PORT } = process.env;
    // General environment variables
    const { NODE_ENV } = process.env;

    try {
        const sequelize = new Sequelize(
            NODE_ENV === 'production' ? POSTGRES_DB : LOCAL_DB,
            NODE_ENV === 'production' ? POSTGRES_USER : LOCAL_USER,
            NODE_ENV === 'production' ? POSTGRES_PASSWORD : LOCAL_PASS,
            {
                host: NODE_ENV === 'production' ? POSTGRES_HOST : LOCAL_HOST,
                port: NODE_ENV === 'production' ? POSTGRES_PORT : LOCAL_PORT,
                dialect: 'postgres',
                logging: false,
            }
        );
        return sequelize;
    } catch (error) {
        throw new Error(`Error creating Sequelize instance: ${error.message}`);
    }
}

// Function to check the database connection
async function checkDatabaseConnection(sequelize) {
    try {
        // Connect to the database
        await sequelize.authenticate();

        // Synchronize the database schema with the models
        await sequelize.sync({ alter: true });

    } catch (error) {
        throw new Error(`Unable to connect to the database: ${error.message}`);
    }
}

// Create Sequelize instance && check connection
const sequelize = createSequelizeInstance();
checkDatabaseConnection(sequelize);

module.exports = { sequelize };