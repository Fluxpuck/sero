const { Sequelize } = require('sequelize');
const { join } = require('path');
require('dotenv').config({ path: join(__dirname, '..', 'config', '.env') });

// Function to create and return a Sequelize instance
function createSequelizeInstance() {

    // Setup the environment variables
    const postgres_host = process.env.NODE_ENV === 'production' ? process.env.POSTGRES_HOST : "localhost"
    const postgres_user = process.env.NODE_ENV === 'production' ? process.env.POSTGRES_USER : "postgres"
    const postgres_password = process.env.NODE_ENV === 'production' ? process.env.POSTGRES_PASSWORD : "postgres"
    const postgres_db = process.env.NODE_ENV === 'production' ? process.env.POSTGRES_DB : "postgres"
    const postgres_port = process.env.NODE_ENV === 'production' ? process.env.POSTGRES_PORT : 5432

    try {
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
                    max: 10,        // Maximum number of connections
                    min: 0,         // Minimum number of connections
                    acquire: 30_000, // Maximum time to get a connection
                    idle: 10_000     // Maximum idle time for a connection
                }
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
        await sequelize.authenticate().catch(error => {
            throw new Error(`Error connecting to the database: ${error.message}`);
        });

        // Synchronize the database schema with the models
        await sequelize.sync({ alter: true }).catch(error => {
            throw new Error(`Error synchronizing the database: ${error.message}`);
        });

    } catch (error) {
        console.error(error.message);
    }
}

// Create Sequelize instance && check connection
const sequelize = createSequelizeInstance();
checkDatabaseConnection(sequelize);

module.exports = { sequelize };